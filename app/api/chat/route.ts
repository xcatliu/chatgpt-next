import { env } from 'process';

import type { ChatMessage, SendMessageOptions } from 'chatgpt';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { CompletionParams } from '@/app/utils/completionParams';
import { HttpMethod, HttpStatusCode } from '@/app/utils/constants';
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

  const task = createTask(() => {
    // 删除下一行开头的 // 可以注释整个 if 判断
    /**
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

    return fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      method: HttpMethod.POST,
      body: request.body,
    });
  });

  return NextResponse.json({ taskId: task.id }, { status: HttpStatusCode.OK });
}
