import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { exampleModelsResponse, HttpStatus } from '@/utils/constants';
import { env } from '@/utils/env';
import { getApiKey } from '@/utils/getApiKey';

export const config = {
  runtime: 'edge',
};

/**
 * 获取可用的 models
 */
export async function GET(req: NextRequest) {
  // 测试环境返回 example
  if (env.NODE_ENV === 'development') {
    return NextResponse.json(exampleModelsResponse, { status: HttpStatus.OK });
  }

  // 正式环境透传即可
  const apiKey = getApiKey(cookies().get('apiKey')?.value);
  return fetch(`https://${env.CHATGPT_NEXT_API_HOST}/v1/models`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  });
}
