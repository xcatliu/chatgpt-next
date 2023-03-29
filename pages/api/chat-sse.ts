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

  const chatMessage = await task.run((partialResponse: ChatMessage) => {
    res.write(`data: ${partialResponse.delta}\n\n`);
  });

  res.write(`data: ${JSON.stringify(chatMessage)}\n\n`);
  res.end('data: [DONE]\n');
  return;
}
