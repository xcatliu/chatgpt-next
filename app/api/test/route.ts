// app/api/route.ts
// import { Configuration, OpenAIApi } from 'openai';

import { sleep } from '@/app/utils/sleep';

export const runtime = 'nodejs';
// This is required to enable streaming
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // const { searchParams } = new URL(request.url);
  // const apiKey = searchParams.get('apiKey') ?? '';

  // const configuration = new Configuration({
  //   apiKey,
  // });
  // const openai = new OpenAIApi(configuration);

  let responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  writer.write(encoder.encode('data: Vercel is a platform for....\n\n'));

  (async () => {
    let i = 0;
    while (i < 10) {
      i += 1;
      writer.write(encoder.encode(`data: i = ${i}\n\n`));
      await sleep(1000);
    }
    writer.write(encoder.encode(`event: close\ndata: i = ${i}\n\n`));
    writer.close();
  })();

  // try {
  //   const openaiRes = await openai.createChatCompletion(
  //     {
  //       model: 'gpt-3.5-turbo-0301',
  //       messages: [
  //         {
  //           role: 'user',
  //           content: 'Vercel is a platform for',
  //         },
  //       ],
  //       max_tokens: 100,
  //       temperature: 0,
  //       stream: true,
  //     },
  //     {
  //       responseType: 'stream',
  //     },
  //   );

  //   // @ts-ignore
  //   openaiRes.data.on('data', async (data: Buffer) => {
  //     const lines = data
  //       .toString()
  //       .split('\n')
  //       .filter((line: string) => line.trim() !== '');
  //     for (const line of lines) {
  //       const message = line.replace(/^data: /, '');
  //       if (message === '[DONE]') {
  //         console.log('Stream completed');
  //         writer.close();
  //         return;
  //       }
  //       try {
  //         const parsed = JSON.parse(message);
  //         await writer.write(encoder.encode(`${parsed.choices[0].text}`));
  //       } catch (error) {
  //         console.error('Could not JSON parse stream message', message, error);
  //       }
  //     }
  //   });
  // } catch (error) {
  //   console.error('An error occurred during OpenAI request', error);
  //   writer.write(encoder.encode('An error occurred during OpenAI request'));
  //   writer.close();
  // }

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
