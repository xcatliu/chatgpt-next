import { createParser } from 'eventsource-parser';
import { NextResponse } from 'next/server';

import { HttpStatusCode } from '@/app/utils/constants';
import { sleep } from '@/app/utils/sleep';
import { getTask } from '@/app/utils/task';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json(
      { code: HttpStatusCode.BadRequest, message: 'taskId 未设置' },
      { status: HttpStatusCode.BadRequest },
    );
  }

  const task = getTask(taskId);

  if (!task) {
    return NextResponse.json(
      { code: HttpStatusCode.BadRequest, message: '不存在此 task' },
      { status: HttpStatusCode.BadRequest },
    );
  }

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  (async () => {
    for (let i = 0; i < 8; i++) {
      writer.write(encoder.encode(`data: hello ${i}\n\n`));
      await sleep(100);
    }
  })();

  const parser = createParser((event) => {
    // const demoData = {
    //   id: 'chatcmpl-715ELjGRoZ7XNzdUQSjoy5L9lB3iP',
    //   object: 'chat.completion.chunk',
    //   created: 1680492789,
    //   model: 'gpt-3.5-turbo-0301',
    //   choices: [{ delta: { content: '去' }, index: 0, finish_reason: null }],
    // };

    if (event.type === 'event') {
      if (event.data === '[DONE]') {
        writer.write(encoder.encode(`event: done\ndata: 完成\n\n`));
        return;
      }

      const partialData = JSON.parse(event.data);
      const delta = partialData.choices[0].delta.content;

      writer.write(encoder.encode(`data: ${delta}\n\n`));

      // writer.write(
      //   encoder.encode(
      //     `${event.data
      //       .split('\n')
      //       .map((trunk) => `data: ${trunk}`)
      //       .join('\n')}\n\n`,
      //   ),
      // );
    }
  });

  (async () => {
    writer.write(encoder.encode(`data: before await task.run()\n\n`));
    const fetchResult: Response = await task.run();
    writer.write(encoder.encode(`data: after await task.run()\n\n`));
    // for await (const chunkUint8Array of streamAsyncIterable(fetchResult.body!)) {
    //   const chunkString = decoder.decode(chunkUint8Array);
    //   parser.feed(chunkString);
    // }
  })();

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}

export async function* streamAsyncIterable<T>(stream: ReadableStream<T>) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}
