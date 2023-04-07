'use client';

import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';

import type { ChatResponse, Message } from '@/utils/api';
import { fetchApiChat, isMessage, Model, Role } from '@/utils/api';
import { getCache, setCache } from '@/utils/cache';
import { scrollToBottom } from '@/utils/scroll';
import { sleep } from '@/utils/sleep';

export interface HistoryItem {
  messages: (Message | ChatResponse)[];
}

export const ChatContext = createContext<{
  isMenuShow: boolean;
  setIsMenuShow: (isMenuShow: boolean) => void;
  currentMenu: 'InboxStack' | 'AdjustmentsHorizontal' | undefined;
  setCurrentMenu: (currentMenu: 'InboxStack' | 'AdjustmentsHorizontal' | undefined) => void;
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  messages: (Message | ChatResponse)[];
  history: HistoryItem[] | undefined;
  historyIndex: number | 'empty' | 'current';
  loadHistory: (historyIndex: number) => void;
  clearHistory: () => void;
  startNewChat: () => void;
} | null>(null);

export const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isMenuShow, setStateIsMenuShow] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<'InboxStack' | 'AdjustmentsHorizontal' | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<(Message | ChatResponse)[]>([]);
  const [history, setHistory] = useState<HistoryItem[] | undefined>(undefined);
  // 当前选中的对话在 history 中的 index，empty 表示未选中，current 表示选中的是当前对话
  const [historyIndex, setHistoryIndex] = useState<number | 'empty' | 'current'>('empty');

  useEffect(() => {
    let history = getCache<HistoryItem[]>('history');
    const messages = getCache<(Message | ChatResponse)[]>('messages');

    // 如果检测到缓存中有上次还未存储到 cache 的 message，则加入到 history 中
    if (messages && messages.length > 0) {
      history = [{ messages }, ...(history ?? [])];
      setHistory(history);
      setCache('history', history);
      setMessages([]);
      setCache('messages', []);
    }

    // 根据 history 是否存在决定当前 menu tab 是什么
    if (history === undefined) {
      setHistory([]);
      setCurrentMenu('AdjustmentsHorizontal');
    } else {
      setHistory(history);
      setCurrentMenu('InboxStack');
    }
  }, []);

  const setIsMenuShow = useCallback((isMenuShow: boolean) => {
    if (!isMenuShow) {
      document.documentElement.classList.remove('show-menu');
      setStateIsMenuShow(isMenuShow);
      return;
    }

    setStateIsMenuShow(isMenuShow);
    // 由于 transform 的 fixed 定位失效问题，这里需要手动设置和取消 form-container 的 top
    const formContainer = document.getElementById('form-container');
    if (formContainer) {
      formContainer.style.top = `${formContainer.offsetTop}px`;
    }
    document.documentElement.classList.add('show-menu');
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      // 如果当前是在浏览历史消息，则激活历史消息
      if (typeof historyIndex === 'number') {
        const newHistory = [...(history ?? [])];
        const newMessages = newHistory.splice(historyIndex, 1)[0].messages;
        setHistory(newHistory);
        setCache('history', newHistory);
        setMessages(newMessages);
        setCache('messages', newMessages);
      }

      // 先插入一条用户消息
      let newMessages: (Message | ChatResponse)[] = [...messages, { role: Role.user, content }];
      setMessages(newMessages);
      setCache('messages', newMessages);
      setIsLoading(true);
      setHistoryIndex('current');
      await sleep(16);
      scrollToBottom();

      try {
        let fullContent = '';
        await fetchApiChat({
          model: Model['gpt-3.5-turbo-0301'],
          messages: newMessages.map((message) => {
            if (isMessage(message)) {
              return message;
            }
            return message.choices[0].message;
          }),
          stream: true,
          onMessage: (content) => {
            fullContent += content;
            setMessages([...newMessages, { role: Role.assistant, content: fullContent }]);
          },
        });
      } catch (e) {
        setIsLoading(false);
        setMessages([...newMessages, { isError: true, role: Role.assistant, content: (e as Error).message }]);
      }
    },
    [messages, history, historyIndex],
  );

  /** 加载历史消息 */
  const loadHistory = useCallback(
    (index: number) => {
      if (historyIndex === 'empty') {
        setHistoryIndex(index);
        setIsMenuShow(false);
        return;
      }

      if (typeof historyIndex === 'number') {
        setHistoryIndex(index);
        setIsMenuShow(false);
        return;
      }

      // 如果当前有正在进行的聊天，则将正在进行的聊天归档到 history 中
      if (historyIndex === 'current') {
        const newHistory = [{ messages }, ...(history ?? [])];
        setHistory(newHistory);
        setCache('history', newHistory);
        setMessages([]);
        setCache('messages', []);
        setHistoryIndex(index);
        setIsMenuShow(false);
      }
    },
    [setIsMenuShow, historyIndex, messages, history],
  );

  /** 清空聊天记录 */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCache('history', []);
    setMessages([]);
    setCache('messages', []);
    setHistoryIndex('empty');
  }, []);

  /** 开启新对话 */
  const startNewChat = useCallback(() => {
    let newHistory = [...(history ?? [])];
    if (messages.length > 0) {
      newHistory = [{ messages }, ...newHistory];
    }
    setHistory(newHistory);
    setCache('history', newHistory);
    setMessages([]);
    setCache('messages', []);
    setCurrentMenu('InboxStack');
    setHistoryIndex('empty');
  }, [messages, history]);

  return (
    <ChatContext.Provider
      value={{
        isMenuShow,
        setIsMenuShow,
        currentMenu,
        setCurrentMenu,
        sendMessage,
        isLoading,
        messages,
        history,
        historyIndex,
        loadHistory,
        clearHistory,
        startNewChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
