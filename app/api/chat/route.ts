import { createParser } from 'eventsource-parser';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import type { ChatResponseChunk, ChatResponseError } from '@/utils/constants';
import { HttpStatus } from '@/utils/constants';
import { env } from '@/utils/env';
import { getApiKey } from '@/utils/getApiKey';

export const config = {
  runtime: 'edge',
};

export async function POST(req: NextRequest) {
  if (env.NODE_ENV === 'development') {
    return NextResponse.json(
      {
        code: HttpStatus.BadRequest,
        message:
          '中国地区直接请求 OpenAI 接口可能导致封号，所以 dev 环境下跳过了请求。如需发送请求，请将 app/api/chat/route.ts 文件中的相关代码注释掉。',
      },
      { status: HttpStatus.BadRequest },
    );
  }

  const apiKey = getApiKey(cookies().get('apiKey')?.value);

  if (!apiKey) {
    return NextResponse.json(
      {
        code: HttpStatus.BadRequest,
        message: '密钥不存在',
      },
      { status: HttpStatus.BadRequest },
    );
  }

  const fetchResult = await fetch(`https://${env.CHATGPT_NEXT_API_HOST}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    // 直接透传，组装逻辑完全由前端实现
    body: req.body,
  });

  // 如果 fetch 返回错误
  if (!fetchResult.ok) {
    const fetchResultJSON: ChatResponseError = await fetchResult.json();

    return NextResponse.json(
      {
        // 设置兜底的 code 和 message
        code: HttpStatus.BadRequest,
        message: 'fetch /v1/chat/completions 错误',
        // 如果有 error，则展开 error 中的属性，覆盖前面的 code 和 message
        ...fetchResultJSON.error,
        // 其他字段也需要带到前端
        ...fetchResultJSON,
      },
      { status: HttpStatus.BadRequest },
    );
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
