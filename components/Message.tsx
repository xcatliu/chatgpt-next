import { ChatMessage } from 'chatgpt';
import classNames from 'classnames';
import Image from 'next/image';
import { FC } from 'react';

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
      className={classNames('relative px-2.5 my-4 flex', {
        'flex-row-reverse': align === 'right',
      })}
    >
      {avatar ? (
        <Image
          className="rounded w-10 h-10"
          src={avatar === 'ChatGPT' ? '/chatgpt-green-icon.png' : avatar}
          alt="avatar"
          width={48}
          height={48}
        />
      ) : (
        <Image
          className="rounded p-1.5 w-10 h-10 bg-white"
          src="/heroicons-user.svg"
          alt="avatar"
          width={48}
          height={48}
        />
      )}
      <p
        className={classNames('mx-3 px-3 py-2 rounded text-red', {
          'text-red-600': error,
        })}
        style={{
          backgroundColor: align === 'right' ? '#abe987' : 'white',
        }}
        dangerouslySetInnerHTML={{ __html: error?.message ?? chatMessage?.text?.replace(/\n/g, '<br />') ?? '' }}
      />
      <div className="flex-none w-8" />
      {/* 三角箭头 */}
      {align === 'right' ? (
        <div
          className="absolute mx-2 my-3 right-12 border-solid border-l-8 border-y-transparent border-y-8 border-r-0"
          style={{ borderLeftColor: '#abe987' }}
        />
      ) : (
        <div className="absolute mx-2 my-3 left-12 border-solid border-r-white border-r-8 border-y-transparent border-y-8 border-l-0" />
      )}
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
