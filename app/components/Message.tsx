'use client';

import type { ChatMessage } from 'chatgpt';
import classNames from 'classnames';
import Image from 'next/image';
import type { FC, ReactNode } from 'react';

import { formatMessage, FormatMessageMode } from '@/app/utils/formatMessage';

export interface MessageProps {
  avatar?: 'ChatGPT' | 'user' | string;
  chatMessage?: Partial<ChatMessage>;
  error?: Error;
}

/** 单个消息气泡 */
export const Message: FC<MessageProps> = ({ avatar = 'ChatGPT', chatMessage, error }) => {
  return (
    <div
      className={classNames('relative px-3 my-4 flex', {
        'flex-row-reverse': avatar !== 'ChatGPT',
      })}
    >
      <Image
        className={classNames('rounded w-10 h-10', {
          'p-1.5': avatar === 'user',
          'bg-white': avatar === 'user',
        })}
        src={avatar === 'ChatGPT' ? '/chatgpt-green-icon.png' : avatar === 'user' ? '/heroicons-user.svg' : avatar}
        alt={`${avatar} avatar`}
        width={40}
        height={40}
      />
      <div
        className={classNames('mx-3 px-3 py-2 max-w-[calc(100%-6rem)] rounded break-words', {
          'chatgpt-message': avatar === 'ChatGPT',
          'text-red-500': error,
          'bg-white': avatar === 'ChatGPT',
          'bg-[#abe987]': avatar !== 'ChatGPT',
        })}
        dangerouslySetInnerHTML={{
          __html:
            error?.message ??
            formatMessage(chatMessage?.text, avatar === 'ChatGPT' ? FormatMessageMode.partial : FormatMessageMode.zero),
        }}
      />
      {/* 三角箭头 */}
      <div
        className={classNames('absolute mx-2.5 my-3.5 border-solid border-y-transparent border-y-[6px]', {
          'right-12': avatar !== 'ChatGPT',
          'left-12': avatar === 'ChatGPT',
          'border-r-0': avatar !== 'ChatGPT',
          'border-l-0': avatar === 'ChatGPT',
          'border-l-[6px]': avatar !== 'ChatGPT',
          'border-r-[6px]': avatar === 'ChatGPT',
          'border-l-[#abe987]': avatar !== 'ChatGPT',
          'border-r-white': avatar === 'ChatGPT',
        })}
      />
    </div>
  );
};

interface SystemMessageProps {
  children: ReactNode;
}

/** 系统消息 */
export const SystemMessage: FC<SystemMessageProps> = ({ children }) => {
  return <div className="px-14 my-4 text-center text-gray-400 text-sm">{children}</div>;
};
