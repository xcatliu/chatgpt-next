import { cookies } from 'next/headers';

import { getApiKey } from '@/app/utils/getApiKey';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const content = searchParams.get('content');

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  (async () => {
    const apiKey = cookies().get('apiKey')?.value;
    const decoder = new TextDecoder();
    console.log('before fetch');

    const fetchResult = await fetch('https://api.openai.com/v1/chat/completions', {
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

    console.log('after fetch');

    for await (const chunkUint8Array of fetchResult.body as any) {
      const chunkString = decoder.decode(chunkUint8Array);
      console.log(chunkString);
      // writer.write(encoder.encode(`data: ${chunkString}\n\n`));
    }
  })();

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}

export const config = {
  runtime: 'edge',
};
