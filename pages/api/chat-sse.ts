import { env } from 'process';

import type { ChatMessage, SendMessageOptions } from 'chatgpt';
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod, HttpStatusCode } from '@/utils/constants';
import { getSseTask } from '@/utils/sseTask';

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

  const id = req.query.id as string;

  if (!id) {
    res.status(HttpStatusCode.BadRequest).send({ code: HttpStatusCode.BadRequest, message: 'sse id 未设置' });
    return;
  }

  const sseTask = getSseTask(id);

  if (!sseTask) {
    res.status(HttpStatusCode.BadRequest).send({ code: HttpStatusCode.BadRequest, message: '不存在此 id 的 sse' });
    return;
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');

  for await (const partialText of sseTask?.streamTextGenerator()) {
    res.write(`data: ${partialText}\n\n`);
  }

  res.write(`data: ${JSON.stringify(sseTask.chatMessage)}\n\n`);
  res.end('data: [DONE]\n');
  return;
}
