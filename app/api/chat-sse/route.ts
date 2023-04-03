import { createParser } from 'eventsource-parser';
import { NextResponse } from 'next/server';

import { HttpStatusCode } from '@/app/utils/constants';
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

  const parser = createParser((event) => {
    if (event.type === 'event') {
      writer.write(
        encoder.encode(
          `${event.data
            .split('\n')
            .map((trunk) => `data: ${trunk}`)
            .join('\n')}\n\n`,
        ),
      );
    }
    writer.write(encoder.encode(`event: finish\ndata: 已读取完毕\n\n`));
  });

  const fetchResult: Response = await task.run();

  (async () => {
    for await (const chunkUint8Array of streamAsyncIterable(fetchResult.body!)) {
      const chunkString = decoder.decode(chunkUint8Array);
      parser.feed(chunkString);
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
