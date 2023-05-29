/**
 * 由于变更了数据格式，所以这个文件做了兼容
 */

import { Role } from './constants';
import type { Message } from './constants';

export interface MessageOld {
  avatar: 'user' | 'ChatGPT';
  chatMessage: {
    text: string;
    role: Role;
    id: string;
    parentMessageId: string;
    detail: {
      id: string;
      object: string;
      created: number;
      model: string;
      choices: {
        delta: {};
        index: number;
        finish_reason: string;
      }[];
    };
  };
}

export function isOldMessage(message: any): message is MessageOld {
  if (message === undefined) {
    return false;
  }
  if (message.chatMessage) {
    return true;
  }
  return false;
}

export function upgradeMessage(message: any): Message {
  if (isOldMessage(message)) {
    return {
      role: message.avatar === 'user' ? Role.user : Role.assistant,
      content: message.chatMessage.text,
    };
  }
  return message;
}
