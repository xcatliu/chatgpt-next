import { env } from 'process';

import type { ChatMessage, SendMessageOptions } from 'chatgpt';
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod, HttpStatusCode } from '@/utils/constants';
import { getTask } from '@/utils/task';

export type ChatReq = SendMessageOptions & {
  text: string;
};

export type ChatRes = ChatMessage;

interface ErrorResponse {
  code: HttpStatusCode;
  message: string;
}

/**
 * https://github.com/vercel/next.js/issues/9965#issuecomment-587355489
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ChatRes | ErrorResponse>) {
  if (req.method !== HttpMethod.GET) {
    res
      .status(HttpStatusCode.MethodNotAllowed)
      .send({ code: HttpStatusCode.MethodNotAllowed, message: '仅支持 GET 请求' });
    return;
  }

  const taskId = req.query.taskId as string;

  if (!taskId) {
    res.status(HttpStatusCode.BadRequest).send({ code: HttpStatusCode.BadRequest, message: 'taskId 未设置' });
    return;
  }

  const task = getTask(taskId);

  if (!task) {
    res.status(HttpStatusCode.BadRequest).send({ code: HttpStatusCode.BadRequest, message: '不存在此 task' });
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');

  // 删除下一行开头的 // 可以注释整个 if 判断
  // /**
  if (env.NODE_ENV === 'development') {
    res.write(
      `event: finish\ndata: ${JSON.stringify({
        id: `dev${Math.random()}`,
        role: 'assistant',
        text: '中国地区直接请求 OpenAI 接口可能导致封号，所以 dev 环境下跳过了请求。如需发送请求，请将 pages/api/chat.ts 文件中的相关代码注释掉。',
      })}\n\n`,
    );

    return;
  }
  // */

  const chatMessage = await task.run((partialResponse: ChatMessage) => {
    if (partialResponse.delta !== undefined) {
      res.write(`data: ${partialResponse.delta.replace(/\n/g, '==BREAK=PLACEHOLDER==')}\n\n`);
    }
  });

  res.write(`event: finish\ndata: ${JSON.stringify(chatMessage)}\n\n`);
  return;
}
