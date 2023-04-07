import { createParser } from 'eventsource-parser';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

import { getApiKey } from '@/utils/getApiKey';

async function createStream(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const content = searchParams.get('content');

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const apiKey = cookies().get('apiKey')?.value;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getApiKey(apiKey!)}`,
    },
    method: 'POST',
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content }],
      stream: true,
    }),
  });

  const contentType = res.headers.get('Content-Type') ?? '';
  if (!contentType.includes('stream')) {
    const content = await (await res.text()).replace(/provided:.*. You/, 'provided: ***. You');
    console.log('[Stream] error ', content);
    return '```json\n' + content + '```';
  }

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
      for await (const chunk of res.body as any) {
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
