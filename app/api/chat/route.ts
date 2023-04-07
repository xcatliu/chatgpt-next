import { createParser } from 'eventsource-parser';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import type { ChatResponseChunk, ChatResponseError } from '@/utils/api';
import { HttpStatusCode } from '@/utils/constants';
import { getApiKey } from '@/utils/getApiKey';

export async function POST(req: NextRequest) {
  const apiKey = getApiKey(cookies().get('apiKey')?.value ?? '');

  const fetchResult = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    // 直接透传，组装逻辑完全由前端实现
    body: req.body,
  });

  if (!fetchResult.ok) {
    const fetchResultJSON: ChatResponseError = await fetchResult.json();

    return NextResponse.json(
      {
        code: HttpStatusCode.BadRequest,
        message: 'fetch /v1/chat/completions 错误',
        ...fetchResultJSON.error,
        ...fetchResultJSON,
      },
      {
        status: HttpStatusCode.BadRequest,
      },
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const parser = createParser((event) => {
        if (event.type === 'event') {
          const data = event.data;
          if (data === '[DONE]') {
            controller.close();
            return;
          }
          try {
            const json: ChatResponseChunk = JSON.parse(data);
            // 获取 delta.content
            const content = (json.choices[0].delta as { content: string }).content;
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

export const config = {
  runtime: 'edge',
};
