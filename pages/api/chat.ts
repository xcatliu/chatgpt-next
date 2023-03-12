import { ChatGPTError, ChatMessage, SendMessageOptions } from 'chatgpt';
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import { HttpMethod, HttpStatusCode } from '@/utils/constants';
import { getAPIInstance } from '@/utils/getApiInstance';

export type ChatReq = SendMessageOptions & {
  text: string;
};

export type ChatRes = ChatMessage;

interface ErrorResponse {
  code: HttpStatusCode;
  message: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ChatRes | ErrorResponse>) {
  // https://stackoverflow.com/a/66740097/2777142
  if (req.method !== HttpMethod.POST) {
    res
      .status(HttpStatusCode.MethodNotAllowed)
      .send({ code: HttpStatusCode.MethodNotAllowed, message: '仅支持 POST 请求' });
    return;
  }

  if (!req.cookies.OPENAI_API_KEY) {
    res.status(HttpStatusCode.BadRequest).send({ code: HttpStatusCode.BadRequest, message: '密钥未设置' });
    return;
  }

  const { OPENAI_API_KEY } = req.cookies;
  const { text, parentMessageId } = req.body as ChatReq;

  if (!text) {
    res.status(HttpStatusCode.BadRequest).send({ code: HttpStatusCode.BadRequest, message: '缺少 text 参数' });
    return;
  }

  const api = getAPIInstance(OPENAI_API_KEY);

  try {
    const chatGptRes = await api.sendMessage(text, {
      parentMessageId,
    });

    res.status(HttpStatusCode.OK).json(chatGptRes);
  } catch (e: any) {
    // 如果不是 ChatGPTError，则返回通用错误
    if (!(e instanceof ChatGPTError)) {
      res.status(HttpStatusCode.BadRequest).json({
        code: HttpStatusCode.BadRequest,
        message: e.message,
      });
      return;
    }

    // 如果是 ChatGPTError，则提取 json 返回错误信息
    const code = e.statusCode ?? HttpStatusCode.BadRequest;
    res.status(code);

    // 如果不是 } 结尾，则直接返回错误
    if (!e.message.trim().endsWith('}')) {
      res.json({ code, message: e.message });
      return;
    }

    try {
      // 如果是 } 结尾，则认为是字符串 json
      let errorJSON = JSON.parse(e.message.trim().replace(/^.*?{/, '{'));
      // 尝试提取 error 字段
      if (errorJSON.error) {
        errorJSON = errorJSON.error;
      }
      // 保证 errorJSON 中包含 code 和 message 字段
      errorJSON = {
        code,
        message: e.message,
        ...errorJSON,
      };
      res.json(errorJSON);
      return;
    } catch (JSONParseError) {
      res.json({ code, message: e.message });
      return;
    }
  }
}
