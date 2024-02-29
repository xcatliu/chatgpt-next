import { createParser } from 'eventsource-parser';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import type { ChatResponseChunk } from '@/utils/constants';
import { HttpHeaderJson, HttpMethod, HttpStatus } from '@/utils/constants';
import { env } from '@/utils/env';
import { getApiKey } from '@/utils/getApiKey';

export const config = {
  runtime: 'edge',
};

export async function POST(req: NextRequest) {
  if (env.NODE_ENV === 'development') {
    return NextResponse.json(
      {
        error: {
          code: HttpStatus.BadRequest,
          message:
            '中国地区直接请求 OpenAI 接口可能导致封号，所以 dev 环境下跳过了请求。如需发送请求，请将 app/api/chat/route.ts 文件中的相关代码注释掉。',
        },
      },
      { status: HttpStatus.BadRequest },
    );
  }

  const apiKey = getApiKey(cookies().get('apiKey')?.value);

  let apiURL = '';
  switch (env.CHATGPT_NEXT_API_PROVIDER) {
    case 'openai':
      apiURL = `https://${env.CHATGPT_NEXT_API_HOST}/v1/chat/completions`;
      break;
    case 'azure':
      apiURL = `${env.CHATGPT_NEXT_API_AzureAPIURL}/${env.CHATGPT_NEXT_API_AzureAPIURLPath}`;
      break;
    default:
      apiURL = 'unknown';
  }

  const fetchResult = await fetch(apiURL, {
    method: HttpMethod.POST,
    headers: {
      ...HttpHeaderJson,
      Authorization: `Bearer ${apiKey}`,
      'api-key': apiKey ?? '',
    },
    // 直接透传，组装逻辑完全由前端实现
    body: req.body,
  });

  // 如果 fetch 返回错误
  if (!fetchResult.ok) {
    // https://stackoverflow.com/a/29082416/2777142
    // 当状态码为 401 且响应头包含 Www-Authenticate 时，浏览器会弹一个框要求输入用户名和密码，故这里需要过滤此 header
    if (fetchResult.status === HttpStatus.Unauthorized && fetchResult.headers.get('Www-Authenticate')) {
      const wwwAuthenticateValue = fetchResult.headers.get('Www-Authenticate') ?? '';
      fetchResult.headers.delete('Www-Authenticate');
      fetchResult.headers.set('X-Www-Authenticate', wwwAuthenticateValue);
    }

    return fetchResult;
  }

  // 生成一个 ReadableStream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      // 使用 eventsource-parser 库来解析 fetchResult.body
      const parser = createParser((event) => {
        if (event.type === 'event') {
          // 如果接收到的消息是 [DONE] 则表示流式响应结束了
          // https://platform.openai.com/docs/api-reference/chat/create#chat/create-stream
          if (event.data === '[DONE]') {
            controller.close();
            return;
          }
          try {
            // 每个 event.data 都是 JSON 字符串
            const chunkJSON: ChatResponseChunk = JSON.parse(event.data);
            // 获取 delta.content
            const content = (chunkJSON.choices[0].delta as { content: string }).content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          } catch (e) {
            controller.error(e);
          }
        }
      });

      for await (const chunk of fetchResult.body as any as IterableIterator<Uint8Array>) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return new Response(stream);
}
