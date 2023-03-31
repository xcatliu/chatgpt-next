import { env } from 'process';

import type { ChatMessage } from 'chatgpt';
import { NextResponse } from 'next/server';

import { HttpStatusCode } from '@/app/utils/constants';
import { getTask } from '@/app/utils/task';

/**
 * https://github.com/vercel/next.js/issues/9965#issuecomment-587355489
 */
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

  // https://github.com/vercel/next.js/issues/9965#issuecomment-1489481795
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  // 删除下一行开头的 // 可以注释整个 if 判断
  // /**
  if (env.NODE_ENV === 'development') {
    writer.write(
      encoder.encode(
        JSON.stringify({
          id: `dev${Math.random()}`,
          role: 'assistant',
          text: '中国地区直接请求 OpenAI 接口可能导致封号，所以 dev 环境下跳过了请求。如需发送请求，请将 pages/api/chat.ts 文件中的相关代码注释掉。',
        }),
      ),
    );
    writer.close();

    return new Response(responseStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  }
  // */

  // const chatMessage = await task.run((partialResponse: ChatMessage) => {
  //   if (partialResponse.delta !== undefined) {
  //     writer.write(encoder.encode(partialResponse.delta.replace(/\n/g, '==BREAK=PLACEHOLDER==')));
  //   }
  // });

  // writer.write(encoder.encode(JSON.stringify(chatMessage)));
  // writer.close();

  // return new Response(responseStream.readable, {
  //   headers: {
  //     'Content-Type': 'text/event-stream',
  //     Connection: 'keep-alive',
  //     'Cache-Control': 'no-cache, no-transform',
  //   },
  // });
}
