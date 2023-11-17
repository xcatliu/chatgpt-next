'use client';

import { UserIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import Image from 'next/image';
import type { FC, ReactNode } from 'react';
import { useCallback, useContext, useState } from 'react';

import { MessageDetailContext } from '@/context/MessageDetailContext';
import { SettingsContext } from '@/context/SettingsContext';
import { MessageContentType, Model, Role } from '@/utils/constants';
import type {
  ChatResponse,
  MessageContentItemImageUrl,
  MessageContentItemText,
  Message as MessageType,
  StructuredMessageContentItem,
} from '@/utils/constants';
import { formatMessage, FormatMessageMode } from '@/utils/formatMessage';
import { getContent, getRole } from '@/utils/message';
import { disableScroll, scrollToTop } from '@/utils/scroll';

import { ChatGPTIcon } from './icons/ChatGPTIcon';

/**
 * 单个消息气泡
 */
export const Message: FC<MessageType | ChatResponse> = (props) => {
  const role = getRole(props);
  const content = getContent(props);
  const isError = !!(props as MessageType).isError;

  const isUser = role === Role.user;
  const isAssistant = role === Role.assistant;

  let structuredMessageContent: StructuredMessageContentItem[] = [];

  if (typeof content === 'string') {
    structuredMessageContent.push({
      type: MessageContentType.text,
      text: content,
    });
  } else {
    structuredMessageContent = content;
  }

  return (
    <>
      {structuredMessageContent.map((messageContent, index) => {
        if (messageContent.type === MessageContentType.text) {
          return (
            <MessageContentItemTextComp
              key={index}
              {...messageContent}
              isAssistant={isAssistant}
              isUser={isUser}
              isError={isError}
            />
          );
        }
        if (messageContent.type === MessageContentType.image_url) {
          return (
            <MessageContentItemImageUrlComp key={index} {...messageContent} isAssistant={isAssistant} isUser={isUser} />
          );
        }
        return null;
      })}
    </>
  );
};

/**
 * 文本消息
 */
export const MessageContentItemTextComp: FC<
  MessageContentItemText & {
    isAssistant: boolean;
    isUser: boolean;
    isError: boolean;
  }
> = (props) => {
  const { text, isAssistant, isUser, isError } = props;

  const { settings } = useContext(SettingsContext)!;
  const { setMessageDetail, setFormatMessageMode } = useContext(MessageDetailContext)!;

  const [lastTapTime, setLastTapTime] = useState(0);

  const handleTap = useCallback(() => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;

    if (tapLength < 500 && tapLength > 0) {
      scrollToTop();
      disableScroll();
      setMessageDetail(text);
      setFormatMessageMode(isAssistant ? FormatMessageMode.partial : FormatMessageMode.zero);
      // 处理双击事件
    } else {
      // 处理单击事件
    }

    setLastTapTime(currentTime);
  }, [lastTapTime, setLastTapTime, text, setMessageDetail, isAssistant, setFormatMessageMode]);

  return (
    <div
      className={classNames('relative px-3 my-4 flex', {
        'flex-row-reverse': isUser,
      })}
    >
      {isAssistant ? (
        <ChatGPTIcon
          className={classNames('rounded w-10 h-10 p-1  text-white', {
            'bg-[#1aa181]': [Model['gpt-3.5-turbo']].includes(settings.model),
            'bg-[#a969f8]': [Model['gpt-4'], Model['gpt-4-32k'], Model['gpt-4-vision-preview']].includes(
              settings.model,
            ),
          })}
        />
      ) : (
        <UserIcon className="rounded w-10 h-10 p-1.5 text-black bg-white dark:bg-gray-200" />
      )}
      <div
        className={classNames('relative mx-3 px-3 py-2 max-w-[calc(100%-6rem)] rounded break-words', {
          'message-chatgpt bg-chat-bubble dark:bg-chat-bubble-dark': isAssistant,
          'text-gray-900 bg-chat-bubble-green dark:bg-chat-bubble-green-dark': isUser,
          'text-red-500': isError,
        })}
        dangerouslySetInnerHTML={{
          __html: formatMessage(text, isAssistant ? FormatMessageMode.partial : FormatMessageMode.zero),
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
 * 图片消息
 */
export const MessageContentItemImageUrlComp: FC<
  MessageContentItemImageUrl & {
    isAssistant: boolean;
    isUser: boolean;
  }
> = (props) => {
  const { image_url, isAssistant, isUser } = props;

  const { settings } = useContext(SettingsContext)!;

  return (
    <div
      className={classNames('relative px-3 my-4 flex', {
        'flex-row-reverse': isUser,
      })}
    >
      {isAssistant ? (
        <ChatGPTIcon
          className={classNames('rounded w-10 h-10 p-1  text-white', {
            'bg-[#1aa181]': [Model['gpt-3.5-turbo']].includes(settings.model),
            'bg-[#a969f8]': [Model['gpt-4'], Model['gpt-4-32k'], Model['gpt-4-vision-preview']].includes(
              settings.model,
            ),
          })}
        />
      ) : (
        <UserIcon className="rounded w-10 h-10 p-1.5 text-black bg-white dark:bg-gray-200" />
      )}
      <Image
        src={image_url.url}
        alt="图片"
        className="mx-3 max-w-[calc(100%-6rem)]"
        width={image_url.width / 4 ?? 192}
        height={image_url.height / 4 ?? 192}
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
