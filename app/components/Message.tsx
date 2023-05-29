'use client';

import classNames from 'classnames';
import type { FC, ReactNode } from 'react';
import { useContext } from 'react';

import { SettingsContext } from '@/context/SettingsContext';
import { Model, Role } from '@/utils/constants';
import type { ChatResponse, Message as MessageType } from '@/utils/constants';
import { formatMessage, FormatMessageMode } from '@/utils/formatMessage';
import { getContent, getRole } from '@/utils/message';

import { ChatGPTIcon } from './icons/ChatGPTIcon';
import { HeroiconsUser } from './icons/HeroiconsUser';

/**
 * 单个消息气泡
 */
export const Message: FC<MessageType | ChatResponse> = (props) => {
  let { settings } = useContext(SettingsContext)!;

  const role = getRole(props);
  const content = getContent(props);
  const isError = !!(props as MessageType).isError;

  const isUser = role === Role.user;
  const isAssistant = role === Role.assistant;

  return (
    <div
      className={classNames('relative px-3 my-4 flex', {
        'flex-row-reverse': isUser,
      })}
    >
      {isAssistant ? (
        <ChatGPTIcon
          className={classNames('rounded w-10 h-10 p-1  text-white', {
            'bg-[#1aa181]': [Model['gpt-3.5-turbo'], Model['gpt-3.5-turbo-0301']].includes(settings.model),
            'bg-[#a969f8]': [Model['gpt-4'], Model['gpt-4-0314'], Model['gpt-4-32k'], Model['gpt-4-32k-0314']].includes(
              settings.model,
            ),
          })}
        />
      ) : (
        <HeroiconsUser className="rounded w-10 h-10 p-1.5 bg-white dark:bg-gray-200" />
      )}
      <div
        className={classNames('relative mx-3 px-3 py-2 max-w-[calc(100%-6rem)] rounded break-words', {
          'message-chatgpt bg-chat-bubble dark:bg-chat-bubble-dark': isAssistant,
          'text-gray-900 bg-chat-bubble-green dark:bg-chat-bubble-green-dark': isUser,
          'text-red-500': isError,
        })}
        dangerouslySetInnerHTML={{
          __html: formatMessage(content, isAssistant ? FormatMessageMode.partial : FormatMessageMode.zero),
        }}
      />
      {/* 三角箭头 */}
      <div
        className={classNames('absolute mx-2.5 my-3.5 border-solid border-y-transparent border-y-[6px]', {
          'right-12 border-r-0 border-l-[6px] border-l-chat-bubble-green dark:border-l-chat-bubble-green-dark': isUser,
          'left-12 border-l-0 border-r-[6px] border-r-chat-bubble dark:border-r-chat-bubble-dark': isAssistant,
        })}
      />
    </div>
  );
};

/**
 * 系统消息
 */
export const SystemMessage: FC<{ children: ReactNode }> = ({ children }) => {
  return <div className="px-14 my-4 text-center text-gray text-sm">{children}</div>;
};
