'use client';

import { useContext, useEffect } from 'react';

import { ChatContext } from '@/context/ChatContext';
import { SettingsContext } from '@/context/SettingsContext';
import { Role } from '@/utils/constants';
// import { exampleMessages } from '@/utils/exampleMessages';
import { initEventListenerScroll } from '@/utils/scroll';

import { Message, SystemMessage } from './Message';

const SYSTEM_MESSAGE = (
  <>
    本页面会将数据发送给 OpenAI
    <br />
    请注意隐私风险，禁止发送违法内容
  </>
);
const WELCOME_MESSAGE = '你好！有什么我可以帮助你的吗？';
const LOADING_MESSAGE = '正在努力思考...';

export const Messages = () => {
  const { settings } = useContext(SettingsContext)!;
  let { isLoading, messages, history, historyIndex, startNewChat } = useContext(ChatContext)!;

  // 初始化滚动事件
  useEffect(initEventListenerScroll, []);

  // 如果当前在浏览聊天记录，则展示该聊天记录的 messages
  if (history && typeof historyIndex === 'number') {
    messages = history[historyIndex].messages;
  }

  // messages = exampleMessages;

  return (
    <div className="md:grow" style={{ display: 'flow-root' }}>
      <SystemMessage>{SYSTEM_MESSAGE}</SystemMessage>
      <Message role={Role.assistant} content={WELCOME_MESSAGE} />
      {[...(settings.systemMessage ? [settings.systemMessage] : []), ...(settings.prefixMessages ?? [])].map(
        (message, index) => (
          <SystemMessage key={index}>
            {message.role}: {message.content}
          </SystemMessage>
        ),
      )}
      {messages.map((message, index) => (
        <Message key={index} {...message} />
      ))}
      {isLoading && <Message role={Role.assistant} content={LOADING_MESSAGE} />}
      {messages.length > 1 && (
        <SystemMessage>
          连续对话会加倍消耗 tokens，
          <a className="text-gray-link" onClick={startNewChat}>
            开启新对话
          </a>
        </SystemMessage>
      )}
    </div>
  );
};
