'use client';

import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { fetchApiChat } from '@/utils/api';
import { getCache, setCache } from '@/utils/cache';
import type { ChatResponse, Message } from '@/utils/constants';
import { Model, Role } from '@/utils/constants';
import { isMessage } from '@/utils/message';
import { isOldMessage, upgradeMessage } from '@/utils/messageUpgrade';
import { scrollToBottom } from '@/utils/scroll';
import { sleep } from '@/utils/sleep';

import { MenuContext, MenuKey } from './MenuContext';

/**
 * 聊天记录
 */
export interface HistoryItem {
  messages: (Message | ChatResponse)[];
}

/**
 * 对话相关的 Context
 */
export const ChatContext = createContext<{
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  messages: (Message | ChatResponse)[];
  history: HistoryItem[] | undefined;
  historyIndex: number | 'empty' | 'current';
  loadHistory: (historyIndex: number) => void;
  clearHistory: () => void;
  deleteHistory: (historyIndex: number) => void;
  startNewChat: () => void;
} | null>(null);

export const ChatProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { setIsMenuShow, setCurrentMenu } = useContext(MenuContext)!;
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<(Message | ChatResponse)[]>([]);
  const [history, setHistory] = useState<HistoryItem[] | undefined>(undefined);
  // 当前选中的对话在 history 中的 index，empty 表示未选中，current 表示选中的是当前对话
  const [historyIndex, setHistoryIndex] = useState<number | 'empty' | 'current'>('empty');

  // 页面加载后从 cache 中读取 history 和 messages
  // 如果 messages 不为空，则将最近的一条消息写入 history
  useEffect(() => {
    let history = getCache<HistoryItem[]>('history');
    // 读取的 history 有可能是旧版的格式，这里做一个转换
    if (history !== undefined && isOldMessage(history[0].messages[0])) {
      history = history.map((historyItem) => ({
        messages: historyItem.messages.map(upgradeMessage),
      }));
    }
    // 读取的 messages 有可能是旧版的格式，这里做一个转换
    let messages = getCache<(Message | ChatResponse)[]>('messages');
    if (messages !== undefined && isOldMessage(messages)) {
      messages = messages.map(upgradeMessage);
    }

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
      // 如果不存在 history，则当前 menu 是参数配置 tab
      setHistory([]);
      setCurrentMenu(MenuKey.AdjustmentsHorizontal);
    } else {
      // 如果存在 history，则当前 menu 是聊天记录 tab
      setHistory(history);
      setCurrentMenu(MenuKey.InboxStack);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 发送消息
   */
  const sendMessage = useCallback(
    async (content: string) => {
      // 先获取旧的 messages 的备份
      let newMessages = [...messages];
      // 如果当前是在浏览聊天记录，则激活历史消息
      if (typeof historyIndex === 'number') {
        const newHistory = [...(history ?? [])];
        newMessages = [...newHistory.splice(historyIndex, 1)[0].messages];
        setHistory(newHistory);
        setCache('history', newHistory);
        setMessages(newMessages);
        setCache('messages', newMessages);
      }

      // 先插入一条用户消息
      newMessages = [...newMessages, { role: Role.user, content }];
      setMessages(newMessages);
      setCache('messages', newMessages);
      setIsLoading(true);
      setHistoryIndex('current');
      await sleep(16);
      scrollToBottom();

      try {
        // stream 模式下，由前端组装消息
        let fullContent = '';
        // TODO 收到完整消息后，写入 cache 中
        await fetchApiChat({
          model: Model['gpt-3.5-turbo-0301'],
          messages: newMessages.map((message) => {
            return isMessage(message) ? message : message.choices[0].message;
          }),
          stream: true,
          onMessage: (content) => {
            // stream 模式下，由前端组装消息
            fullContent += content;
            setIsLoading(false);
            setMessages([...newMessages, { role: Role.assistant, content: fullContent }]);
          },
        });
      } catch (e) {
        // 发生错误时，展示错误消息
        setIsLoading(false);
        setMessages([...newMessages, { isError: true, role: Role.assistant, content: (e as Error).message }]);
      }
    },
    [messages, history, historyIndex],
  );

  /**
   * 加载聊天记录
   */
  const loadHistory = useCallback(
    (index: number) => {
      if (historyIndex === 'empty') {
        setHistoryIndex(index);
        setIsMenuShow(false);
        return;
      }

      if (historyIndex === index) {
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

  /** 删除当前单条聊天记录 */
  const deleteHistory = useCallback(
    (chatIndex: number) => {
      const newHistory = [...(history ?? [])];
      const currHistory = newHistory.filter((_, index) => index !== chatIndex) ?? [];

      setHistory(currHistory);
      setCache('history', currHistory);

      // 选择最近的一条聊天记录展示
      setHistoryIndex(currHistory.length === 0 ? 'empty' : chatIndex > 0 ? chatIndex - 1 : 0);
    },
    [history],
  );

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
    setCurrentMenu(MenuKey.InboxStack);
    setHistoryIndex('empty');
  }, [messages, history, setCurrentMenu]);

  return (
    <ChatContext.Provider
      value={{
        sendMessage,
        isLoading,
        messages,
        history,
        historyIndex,
        loadHistory,
        clearHistory,
        deleteHistory,
        startNewChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
