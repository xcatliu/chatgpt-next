'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useContext } from 'react';

import type { HistoryItem } from '@/context/ChatContext';
import { ChatContext } from '@/context/ChatContext';
import { SettingsContext } from '@/context/SettingsContext';
import type { Model } from '@/utils/constants';
import { AllModels, FULL_SPACE } from '@/utils/constants';
import { exportJSON } from '@/utils/export';
import { last } from '@/utils/last';
import { getContentText } from '@/utils/message';

import { DeleteHistoryButton } from './buttons/DeleteHistoryButton';

/**
 * 聊天记录
 */
export const History = () => {
  const { messages, history, historyIndex, abortSendMessage, startNewChat } = useContext(ChatContext)!;
  const { settings, setSettings } = useContext(SettingsContext)!;

  if (messages.length === 0 && (history === undefined || history.length === 0)) {
    return <div className="my-4 text-center text-gray text-sm">暂无聊天记录</div>;
  }

  return (
    <>
      <div
        className={classNames('history-item-new justify-between hidden md:flex', {
          'bg-gray-300 dark:bg-gray-700': historyIndex === 'empty',
        })}
      >
        <div className="leading-[3.5rem]">
          模型：
          <select
            value={settings.newChatModel}
            onChange={(e) =>
              setSettings({
                newChatModel: e.target.value as Model,
                ...(historyIndex === 'empty'
                  ? {
                      model: e.target.value as Model,
                    }
                  : {}),
              })
            }
          >
            {AllModels.map((model) => (
              <option key={model} disabled={!settings.availableModels.includes(model)}>
                {model}
              </option>
            ))}
          </select>
        </div>
        <button
          className={classNames('ml-0', {
            hidden: historyIndex === 'empty',
          })}
          onClick={() => {
            abortSendMessage();
            startNewChat();
          }}
        >
          <PlusIcon />
        </button>
      </div>
      <ul>
        {historyIndex === 'current' && <HistoryItemComp historyIndex={historyIndex} isActive={true} />}
        {history?.map((_, index) => (
          <HistoryItemComp key={index} historyIndex={index} isActive={historyIndex === index} />
        ))}
      </ul>
      <ExportHistory />
    </>
  );
};

/**
 * 单条聊天记录
 */
export const HistoryItemComp: FC<{ historyIndex: 'current' | number; isActive: boolean }> = ({
  historyIndex,
  isActive,
}) => {
  const { messages, history, loadHistory, abortSendMessage } = useContext(ChatContext)!;
  const { settings } = useContext(SettingsContext)!;

  let historyItem: HistoryItem;

  if (historyIndex === 'current') {
    historyItem = { model: settings.model, messages };
  } else if (history === undefined) {
    return null;
  } else {
    historyItem = history[historyIndex];
  }

  return (
    <li
      className={classNames('history-item', {
        'hover:bg-gray-200 dark:hover:bg-gray-800': !isActive,
        'bg-gray-300 dark:bg-gray-700': isActive,
      })}
      onClick={() => {
        if (historyIndex !== 'current') {
          abortSendMessage();
          loadHistory(historyIndex);
        }
      }}
    >
      <h3 className="overflow-hidden whitespace-nowrap truncate">{getContentText(historyItem.messages[0])}</h3>
      <p
        className={classNames('mt-1 text-gray text-[15px] overflow-hidden whitespace-nowrap truncate', {
          'pr-8 md:pr-0': isActive,
        })}
      >
        {historyItem.messages.length > 1 ? getContentText(last(historyItem.messages)) : FULL_SPACE}
      </p>
      <DeleteHistoryButton
        className={classNames('md:hidden', {
          hidden: !isActive,
          'bg-gray-300 dark:bg-gray-700': isActive,
          'bg-gray-200 dark:bg-gray-800': !isActive,
        })}
        historyIndex={historyIndex}
      />
    </li>
  );
};

/**
 * 导出聊天记录
 */
export const ExportHistory = () => {
  const { messages, history } = useContext(ChatContext)!;
  const { settings } = useContext(SettingsContext)!;

  let historyWithCurrentMessages = history ?? [];
  // 如果当前有消息，则将当前消息放入聊天记录中
  if (messages.length > 0) {
    historyWithCurrentMessages = [{ model: settings.model, messages }, ...historyWithCurrentMessages];
  }

  return (
    <div className="my-4 text-center text-gray text-sm">
      聊天记录仅会保存在浏览器缓存
      <br />
      为避免丢失，请尽快
      <a
        className="text-gray-link"
        onClick={() => {
          exportJSON(historyWithCurrentMessages, `ChatGPT-Next-${dayjs().format('YYYYMMDD-HHmmss')}.json`);
        }}
      >
        导出聊天记录
      </a>
    </div>
  );
};
