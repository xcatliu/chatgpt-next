import type { ChatRequest } from './constants';
import { ResError } from './error';
import { stream2string } from './stream';

/**
 * 请求 /api/chat 接口
 * 参数和 OpenAI 官方的接口参数一致，apiKey 在服务端自动添加
 * 可以传入 onMessage 来流式的获取响应
 */
export const fetchApiChat = async ({
  onMessage,
  ...chatRequest
}: {
  /**
   * 接受 stream 消息的回调函数
   */
  onMessage?: (content: string) => void;
} & Partial<ChatRequest>) => {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(chatRequest),
  });

  // 如果返回错误，则直接抛出错误
  // res.json() 应该是形如 { code: string | number; message: string; } 的形式
  if (!res.ok) {
    const error = new ResError({
      code: res.status,
      message: res.statusText,
    });
    try {
      Object.assign(error, await res.json());
    } catch (e) {}
    throw error;
  }

  // 如果 res.ok 为 true，则使用 stream2string 来读取内容
  await stream2string(res.body, onMessage);
};
