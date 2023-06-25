'use client';

import classNames from 'classnames';
import type { FC, ReactNode } from 'react';
import { useCallback, useContext, useState } from 'react';

import { MessageDetailContext } from '@/context/MessageDetailContext';
import { SettingsContext } from '@/context/SettingsContext';
import { Model, Role } from '@/utils/constants';
import type { ChatResponse, Message as MessageType } from '@/utils/constants';
import { formatMessage, FormatMessageMode } from '@/utils/formatMessage';
import { getContent, getRole } from '@/utils/message';
import { disableScroll, scrollToTop } from '@/utils/scroll';

import { ChatGPTIcon } from './icons/ChatGPTIcon';
import { HeroiconsUser } from './icons/HeroiconsUser';

/**
 * 单个消息气泡
 */
export const Message: FC<MessageType | ChatResponse> = (props) => {
  const { settings } = useContext(SettingsContext)!;
  const { setMessageDetail, setFormatMessageMode } = useContext(MessageDetailContext)!;

  const role = getRole(props);
  const content = getContent(props);
  const isError = !!(props as MessageType).isError;

  const isUser = role === Role.user;
  const isAssistant = role === Role.assistant;

  const [lastTapTime, setLastTapTime] = useState(0);
  const handleTap = useCallback(() => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;

    if (tapLength < 500 && tapLength > 0) {
      scrollToTop();
      disableScroll();
      setMessageDetail(content);
      setFormatMessageMode(isAssistant ? FormatMessageMode.partial : FormatMessageMode.zero);
      // 处理双击事件
    } else {
      // 处理单击事件
    }

    setLastTapTime(currentTime);
  }, [lastTapTime, setLastTapTime, content, setMessageDetail, isAssistant, setFormatMessageMode]);

  return (
    <div
      className={classNames('relative px-3 my-4 flex', {
        'flex-row-reverse': isUser,
      })}
    >
      {isAssistant ? (
        <ChatGPTIcon
          className={classNames('rounded w-10 h-10 p-1  text-white', {
            'bg-[#1aa181]': [Model['gpt-3.5-turbo'], Model['gpt-3.5-turbo-0613']].includes(settings.model),
            'bg-[#a969f8]': [Model['gpt-4'], Model['gpt-4-0613'], Model['gpt-4-32k'], Model['gpt-4-32k-0613']].includes(
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
        onTouchEnd={handleTap}
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
