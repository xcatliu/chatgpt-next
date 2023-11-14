import { MessageContentType } from './constants';
import type { ChatResponse, Message, MessageContentItemText, StructuredMessageContentItem } from './constants';

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
export function getContent(message: Message | ChatResponse): string | StructuredMessageContentItem[] {
  return isMessage(message) ? message.content : message.choices[0].message.content;
}

/**
 * 从 message 中提取供侧边栏展示的 contentText
 */
export function getContentText(message: Message | ChatResponse): string {
  const content = getContent(message);
  if (typeof content === 'string') {
    return content;
  }

  const isFirstContentItemImageUrl = content[0].type === MessageContentType.image_url;
  const firstTextContentItem = content.find(({ type }) => type === MessageContentType.text) as
    | MessageContentItemText
    | undefined;

  const textList = [];
  if (isFirstContentItemImageUrl) {
    textList.push('[图片]');
  }
  if (firstTextContentItem) {
    textList.push(firstTextContentItem.text);
  }

  return textList.join(' ');
}

/**
 * 从 message 中提取 role
 */
export function getRole(message: Message | ChatResponse) {
  return isMessage(message) ? message.role : message.choices[0].message.role;
}
