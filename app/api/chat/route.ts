import { env } from 'process';

import type { ChatMessage, SendMessageOptions } from 'chatgpt';
import { ChatGPTError } from 'chatgpt';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { CompletionParams } from '@/app/utils/completionParams';
import { HttpStatusCode } from '@/app/utils/constants';
import { getAPIInstance } from '@/app/utils/getApiInstance';
import { createTask } from '@/app/utils/task';

export type ChatReq = SendMessageOptions & {
  text: string;
  completionParams?: CompletionParams;
};

export type ChatRes = ChatMessage | ChatStreamRes;

export type ChatStreamRes = {
  taskId: string;
};

export async function POST(request: Request) {
  const apiKey = cookies().get('apiKey')?.value;

  if (!apiKey) {
    return NextResponse.json(
      { code: HttpStatusCode.BadRequest, message: '密钥未设置' },
      { status: HttpStatusCode.BadRequest },
    );
  }

  const { text, parentMessageId, completionParams } = (await request.json()) as ChatReq;

  if (!text) {
    return NextResponse.json(
      { code: HttpStatusCode.BadRequest, message: '缺少 text 参数' },
      { status: HttpStatusCode.BadRequest },
    );
  }

  const api = getAPIInstance(apiKey, completionParams);

  try {
    if (completionParams?.stream) {
      const task = createTask((onProgress) => {
        // return api.sendMessage(text, {
        //   parentMessageId,
        //   onProgress,
        // });
      });

      return NextResponse.json({ taskId: task.id }, { status: HttpStatusCode.OK });
    }

    // 删除下一行开头的 // 可以注释整个 if 判断
    // /**
    if (env.NODE_ENV === 'development') {
      return NextResponse.json(
        {
          id: `dev${Math.random()}`,
          role: 'assistant',
          text: '中国地区直接请求 OpenAI 接口可能导致封号，所以 dev 环境下跳过了请求。如需发送请求，请将 pages/api/chat.ts 文件中的相关代码注释掉。',
        },
        { status: HttpStatusCode.OK },
      );
    }
    // */

    const chatGptRes = await api.sendMessage(text, {
      parentMessageId,
    });

    return NextResponse.json(chatGptRes, { status: HttpStatusCode.OK });
  } catch (e: any) {
    // 如果不是 ChatGPTError，则返回通用错误
    if (!(e instanceof ChatGPTError)) {
      return NextResponse.json(
        {
          code: HttpStatusCode.BadRequest,
          message: e.message,
        },
        { status: HttpStatusCode.BadRequest },
      );
    }

    // 如果是 ChatGPTError，则提取 json 返回错误信息
    const status = e.statusCode ?? HttpStatusCode.BadRequest;

    // 如果不是 } 结尾，则直接返回错误
    if (!e.message.trim().endsWith('}')) {
      return NextResponse.json({ code: status, message: e.message }, { status });
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
        code: status,
        message: e.message,
        ...errorJSON,
      };
      return NextResponse.json(errorJSON, { status });
    } catch (JSONParseError) {
      // 如果 JSON.parse 解析失败了，则直接返回错误
      return NextResponse.json({ code: status, message: e.message }, { status });
    }
  }
}
