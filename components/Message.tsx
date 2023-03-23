import { ChatMessage } from 'chatgpt';
import classNames from 'classnames';
import Image from 'next/image';
import { FC } from 'react';

import { formatMessage, formatMessageMode } from '@/utils/formatMessage';

export interface MessageProps {
  avatar?: 'ChatGPT' | string;
  chatMessage?: Partial<ChatMessage>;
  align?: 'left' | 'right';
  error?: Error;
}

/** 单个消息气泡 */
export const Message: FC<MessageProps> = ({ avatar, chatMessage, align = 'left', error }) => {
  return (
    <div
      className={classNames('relative px-3 my-4 flex', {
        'flex-row-reverse': align === 'right',
      })}
    >
      {avatar ? (
        <Image
          className="rounded w-10 h-10"
          src={avatar === 'ChatGPT' ? '/chatgpt-green-icon.png' : avatar}
          alt="avatar"
          width={40}
          height={40}
        />
      ) : (
        <Image
          className="rounded p-1.5 w-10 h-10 bg-white"
          src="/heroicons-user.svg"
          alt="avatar"
          width={40}
          height={40}
        />
      )}
      <div
        className={classNames('mx-3 px-3 py-2 max-w-[calc(100%-6rem)] rounded break-words text-red', {
          'chatgpt-message': avatar === 'ChatGPT',
          'text-red-500': error,
          'bg-[#abe987]': align === 'right',
          'bg-white': align !== 'right',
        })}
        dangerouslySetInnerHTML={{
          __html:
            error?.message ??
            formatMessage(chatMessage?.text, avatar === 'ChatGPT' ? formatMessageMode.partial : formatMessageMode.zero),
        }}
      />
      {/* 三角箭头 */}
      <div
        className={classNames('absolute mx-2.5 my-3.5 border-solid border-y-transparent border-y-[6px]', {
          'right-12': align === 'right',
          'left-12': align === 'left',
          'border-r-0': align === 'right',
          'border-l-0': align === 'left',
          'border-l-[6px]': align === 'right',
          'border-r-[6px]': align === 'left',
          'border-l-[#abe987]': align === 'right',
          'border-r-white': align === 'left',
        })}
      />
    </div>
  );
};

interface SystemMessageProps {
  text: string;
}

/** 系统消息 */
export const SystemMessage: FC<SystemMessageProps> = ({ text }) => {
  return (
    <div
      className="px-16 my-4 text-center text-gray-400 text-sm"
      dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }}
    />
  );
};
