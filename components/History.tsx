import classNames from 'classnames';
import dayjs from 'dayjs';
import type { FC } from 'react';
import { useContext } from 'react';

import { ChatMessageContext } from '@/context/ChatMessageContext';
import { exportJSON } from '@/utils/export';
import { last } from '@/utils/last';

export const History: FC = () => {
  let { messages, history, clearHistory, historyIndex, loadHistory } = useContext(ChatMessageContext)!;

  history = history ?? [];
  if (messages.length > 0) {
    history = [{ messages }, ...history];
  }

  let activeHistoryIndex: number;

  if (historyIndex === 'current') {
    activeHistoryIndex = 0;
  } else if (typeof historyIndex === 'number') {
    activeHistoryIndex = historyIndex;
  }

  return (
    <>
      <ul>
        {history.map((historyItem, index) => (
          <li
            className={classNames('p-4 border-b-[0.5px] cursor-pointer border-gray-300 md:-mx-4 md:px-8', {
              'bg-gray-300': activeHistoryIndex === index,
            })}
            key={index}
            onClick={() => loadHistory(index)}
          >
            <h3 className="overflow-hidden whitespace-nowrap truncate">{historyItem.messages[0].chatMessage?.text}</h3>
            <p className="mt-1 text-gray-500 text-[15px] overflow-hidden whitespace-nowrap truncate">
              {last(historyItem.messages)?.chatMessage?.text}
            </p>
          </li>
        ))}
      </ul>
      {history.length === 0 && <div className="my-4 text-center text-gray-400 text-sm">暂无聊天记录</div>}
      {history.length > 0 && (
        <>
          <div className="my-4 text-center text-gray-400 text-sm">
            聊天记录仅会保存在浏览器缓存
            <br />
            为避免丢失，请尽快
            <a
              className="text-link-gray"
              onClick={() => {
                let newHistory = [...(history ?? [])];
                if (historyIndex === 'current') {
                  newHistory = [{ messages }, ...newHistory];
                }
                exportJSON(newHistory, `ChatGPT-Next-${dayjs().format('YYYYMMDD-HHmmss')}.json`);
              }}
            >
              导出聊天记录
            </a>
          </div>
          <div className="my-4 text-center text-sm">
            <a
              className="text-link-gray"
              onClick={() => {
                if (window.confirm('确定要清空聊天记录吗？')) {
                  clearHistory();
                }
              }}
            >
              清空聊天记录
            </a>
          </div>
        </>
      )}
    </>
  );
};
