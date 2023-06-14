'use client';

import type { FC, ReactNode } from 'react';
import { createContext, useState } from 'react';

import { FormatMessageMode } from '@/utils/formatMessage';

/**
 * 双击展开消息详情的 Context
 */
export const MessageDetailContext = createContext<{
  messageDetail: string | undefined;
  setMessageDetail: (messageDetail: string | undefined) => void;
  formatMessageMode: FormatMessageMode;
  setFormatMessageMode: (formatMessageMode: FormatMessageMode) => void;
} | null>(null);

export const MessageDetailProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [messageDetail, setMessageDetail] = useState<string | undefined>(undefined);
  const [formatMessageMode, setFormatMessageMode] = useState<FormatMessageMode>(FormatMessageMode.partial);

  return (
    <MessageDetailContext.Provider
      value={{
        messageDetail,
        setMessageDetail,
        formatMessageMode,
        setFormatMessageMode,
      }}
    >
      {children}
    </MessageDetailContext.Provider>
  );
};
