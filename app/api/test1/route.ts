import { createParser } from 'eventsource-parser';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

import { getApiKey } from '@/utils/getApiKey';

async function createStream(req: NextRequest) {
  const apiKey = getApiKey(cookies().get('apiKey')?.value ?? '');

  const reqJSON = await req.json();
  console.log(reqJSON);

  const reqText = await req.text();
  console.log(reqText);

  const fetchResult = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    // 直接透传，组装逻辑完全由前端实现
    body: reqText,
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: any) {
        if (event.type === 'event') {
          const data = event.data;
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === '[DONE]') {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      }

      const parser = createParser(onParse);
      for await (const chunk of fetchResult.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });
  return stream;
}

export async function POST(req: NextRequest) {
  try {
    const stream = await createStream(req);
    return new Response(stream);
  } catch (error) {
    console.error('[Chat Stream]', error);
  }
}

export const config = {
  runtime: 'edge',
};
