import type { ChatResponse, Message } from './constants';

/**
 * 判断传入的 message 是简单的 Message 还是完整的 ChatResponse
 */
export function isMessage(message: Message | ChatResponse): message is Message {
  if ((message as Message).content !== undefined) {
    return true;
  }
  return false;
}

/**
 * 从 message 中提取 content
 */
export function getContent(message: Message | ChatResponse) {
  return isMessage(message) ? message.content : message.choices[0].message.content;
}

/**
 * 从 message 中提取 role
 */
export function getRole(message: Message | ChatResponse) {
  return isMessage(message) ? message.role : message.choices[0].message.role;
}
