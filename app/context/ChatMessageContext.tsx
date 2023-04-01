'use client';

import type { ChatMessage } from 'chatgpt';
import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';

import type { ChatStreamRes } from '@/app/api/chat/route';
import type { MessageProps } from '@/app/components/Message';
import { fetchChat } from '@/app/utils/api';
import { getCache, removeCache, setCache } from '@/app/utils/cache';
import type { CompletionParams } from '@/app/utils/completionParams';
import { last } from '@/app/utils/last';
import { scrollToBottom } from '@/app/utils/scroll';
import { sleep } from '@/app/utils/sleep';

export interface HistoryItem {
  topic?: string;
  messages: MessageProps[];
}

export const ChatMessageContext = createContext<{
  isMenuShow: boolean;
  setIsMenuShow: (isMenuShow: boolean) => void;
  currentMenu: 'InboxStack' | 'AdjustmentsHorizontal' | undefined;
  setCurrentMenu: (currentMenu: 'InboxStack' | 'AdjustmentsHorizontal' | undefined) => void;
  completionParams: CompletionParams;
  setCompletionParams: (completionParams: CompletionParams) => void;
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  messages: MessageProps[];
  history: HistoryItem[] | undefined;
  historyIndex: number | 'empty' | 'current';
  loadHistory: (historyIndex: number) => void;
  clearHistory: () => void;
  startNewChat: () => void;
} | null>(null);

export const ChatMessageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isMenuShow, setStateIsMenuShow] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<'InboxStack' | 'AdjustmentsHorizontal' | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [history, setHistory] = useState<HistoryItem[] | undefined>(undefined);
  const [completionParams, setCompletionParams] = useState<CompletionParams>({
    stream: true,
  });
  // 当前选中的对话在 history 中的 index，empty 表示未选中，current 表示选中的是当前对话
  const [historyIndex, setHistoryIndex] = useState<number | 'empty' | 'current'>('empty');

  useEffect(() => {
    let history = getCache<HistoryItem[]>('history');
    const messages = getCache<MessageProps[]>('messages');

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
    async (text: string) => {
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
      let newMessages = [...messages, { avatar: 'user', chatMessage: { text } }];
      setMessages(newMessages);
      setCache('messages', newMessages);
      setIsLoading(true);
      setHistoryIndex('current');
      await sleep(16);
      scrollToBottom();
      try {
        const parentMessageId = last(messages)?.chatMessage?.id;
        if (completionParams.stream) {
          const chatRes = (await fetchChat({ text, parentMessageId, completionParams })) as ChatStreamRes;
          const chatSseRes = new EventSource(`/api/chat-sse?taskId=${chatRes.taskId}`);
          let message = '';
          chatSseRes.addEventListener('message', (e) => {
            if (message === '') {
              setIsLoading(false);
            }
            message += e.data.replace(/==BREAK=PLACEHOLDER==/g, '\n');
            setMessages([...newMessages, { chatMessage: { text: message } }]);
          });
          chatSseRes.addEventListener('finish', (e) => {
            chatSseRes.close();
            newMessages = [...newMessages, { chatMessage: JSON.parse(e.data) }];
            setMessages(newMessages);
            setCache('messages', newMessages);
          });
        } else {
          // 请求 /api/chat 接口获取回复
          const chatRes = (await fetchChat({ text, parentMessageId, completionParams })) as ChatMessage;
          setIsLoading(false);
          newMessages = [...newMessages, { chatMessage: chatRes }];
          setMessages(newMessages);
          setCache('messages', newMessages);
          await sleep(16);
          scrollToBottom();
        }
      } catch (e: any) {
        setIsLoading(false);
        newMessages = [...newMessages, { error: e }];
        setMessages(newMessages);
        setCache('messages', newMessages);
        await sleep(16);
        scrollToBottom();
      }
    },
    [completionParams, messages, history, historyIndex],
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
    <ChatMessageContext.Provider
      value={{
        isMenuShow,
        setIsMenuShow,
        currentMenu,
        setCurrentMenu,
        completionParams,
        setCompletionParams,
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
    </ChatMessageContext.Provider>
  );
};
