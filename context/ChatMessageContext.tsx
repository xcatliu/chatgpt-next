import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useState } from 'react';

import type { MessageProps } from '@/components/Message';
import { fetchChat } from '@/utils/api';
import type { CompletionParams } from '@/utils/completionParams';
import { scrollToBottom } from '@/utils/scroll';
import { sleep } from '@/utils/sleep';

export const ChatMessageContext = createContext<{
  completionParams: CompletionParams;
  setCompletionParams: (completionParams: CompletionParams) => void;
  sendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  messages: MessageProps[];
} | null>(null);

export const ChatMessageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [completionParams, setCompletionParams] = useState<CompletionParams>({});

  const sendMessage = useCallback(
    async (text: string) => {
      // 先插入一条用户消息
      setMessages((messages) => [...messages, { avatar: 'user', chatMessage: { text } }]);
      setIsLoading(true);
      await sleep(16);
      scrollToBottom();
      try {
        // 再请求 /api/chat 接口获取回复
        const parentMessageId = messages[messages.length - 1]?.chatMessage?.id;
        const chatRes = await fetchChat({ text, parentMessageId, completionParams });
        setIsLoading(false);
        setMessages((messages) => [...messages, { chatMessage: chatRes }]);
        await sleep(16);
        scrollToBottom();
      } catch (e: any) {
        setIsLoading(false);
        setMessages((messages) => [...messages, { error: e }]);
        await sleep(16);
        scrollToBottom();
      }
    },
    [completionParams, messages],
  );

  return (
    <ChatMessageContext.Provider value={{ completionParams, setCompletionParams, sendMessage, isLoading, messages }}>
      {children}
    </ChatMessageContext.Provider>
  );
};
