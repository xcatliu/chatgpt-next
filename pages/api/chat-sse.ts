import { env } from 'process';

import { ChatGPTError, ChatMessage, SendMessageOptions } from 'chatgpt';
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod, HttpStatusCode } from '@/utils/constants';
import { getAPIInstance } from '@/utils/getApiInstance';
import { sleep } from '@/utils/sleep';

export type ChatReq = SendMessageOptions & {
  text: string;
};

export type ChatRes = ChatMessage;

interface ErrorResponse {
  code: HttpStatusCode;
  message: string;
}

/**
 * @TODO 参考这个实现 Server-Sent Events
 * https://github.com/vercel/next.js/issues/9965#issuecomment-587355489
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ChatRes | ErrorResponse>) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');

  for (let i = 0; i < 5; i++) {
    res.write(`data: Hello seq ${i}\n\n`);
    await sleep(1000);
  }
  res.end('done\n');
  return;
}
