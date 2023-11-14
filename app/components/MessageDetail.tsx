'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import React, { useContext } from 'react';

import { DeviceContext } from '@/context/DeviceContext';
import { MessageDetailContext } from '@/context/MessageDetailContext';
import { formatMessage, FormatMessageMode } from '@/utils/formatMessage';
import { enableScroll } from '@/utils/scroll';

export const MessageDetail = () => {
  const { messageDetail, setMessageDetail, formatMessageMode, setFormatMessageMode } =
    useContext(MessageDetailContext)!;
  const { windowWidth, windowHeight } = useContext(DeviceContext)!;

  if (messageDetail === undefined) {
    return null;
  }

  return (
    <div
      className="fixed z-30 top-0 left-0 pt-0 pb-4 bg-chat-bubble dark:bg-chat-bubble-dark overflow-auto"
      style={{
        width: windowWidth,
        height: windowHeight,
      }}
    >
      <div className="flex">
        <div className="flex-grow" />
        <button
          className="button-icon flex"
          onClick={() => {
            const revertFormatMessageMode = {
              [FormatMessageMode.zero]: FormatMessageMode.partial,
              [FormatMessageMode.partial]: FormatMessageMode.zero,
            };
            setFormatMessageMode(revertFormatMessageMode[formatMessageMode]);
          }}
        >
          <span
            className={classNames('px-0.5 -mx-[3px] -my-[1px] border rounded text-sm', {
              'border-gray-300 text-gray-300': formatMessageMode === FormatMessageMode.zero,
              'border-green-600 text-green-600': formatMessageMode === FormatMessageMode.partial,
            })}
          >
            md
          </span>
        </button>
        <button
          className="button-icon text-gray-700 dark:text-gray-200"
          onClick={() => {
            setMessageDetail(undefined);
            enableScroll();
          }}
        >
          <XMarkIcon />
        </button>
      </div>
      <div
        className="px-3 py-2 message-chatgpt"
        dangerouslySetInnerHTML={{
          __html: formatMessage(messageDetail, formatMessageMode),
        }}
      />
    </div>
  );
};
