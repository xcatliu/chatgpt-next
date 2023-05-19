import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { HttpStatus } from '@/utils/constants';
import { env } from '@/utils/env';
import { getApiKey } from '@/utils/getApiKey';

export const config = {
  runtime: 'edge',
};

/**
 * 获取可用的 models
 */
export async function GET(req: NextRequest) {
  if (env.NODE_ENV === 'development') {
    return NextResponse.json(
      {
        data: [
          {
            id: 'model-id-0',
            object: 'model',
          },
          {
            id: 'model-id-1',
            object: 'model',
          },
          {
            id: 'model-id-2',
            object: 'model',
          },
        ],
        object: 'list',
      },
      { status: HttpStatus.OK },
    );
  }

  const apiKey = getApiKey(cookies().get('apiKey')?.value);

  if (!apiKey) {
    return NextResponse.json(
      {
        code: HttpStatus.BadRequest,
        message: '密钥不存在',
      },
      { status: HttpStatus.BadRequest },
    );
  }

  const fetchResult = await fetch(`https://${env.CHATGPT_NEXT_API_HOST}/v1/models`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return fetchResult;
}
