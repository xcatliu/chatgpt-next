'use client';

import type { FC } from 'react';
import { useContext } from 'react';

import { ChatMessageContext } from '@/app/context/ChatMessageContext';
// import { exampleChatMessage, htmlMessage, regexpNumberMessage, userMessage } from '@/app/utils/exampleChatMessage';

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

export const Messages: FC = () => {
  let { isLoading, messages, history, historyIndex, startNewChat } = useContext(ChatMessageContext)!;

  if (history && typeof historyIndex === 'number') {
    messages = history[historyIndex].messages;
  }

  return (
    <div className="md:grow" style={{ display: 'flow-root' }}>
      <SystemMessage>{SYSTEM_MESSAGE}</SystemMessage>
      <Message chatMessage={{ text: WELCOME_MESSAGE }} />
      {/* <Message avatar="user" chatMessage={userMessage} />
      <Message chatMessage={regexpNumberMessage} />
      <Message avatar="user" chatMessage={userMessage} />
      <Message chatMessage={htmlMessage} /> */}
      {messages.map((messageProps, index) => (
        <Message key={index} {...messageProps} />
      ))}
      {isLoading && <Message chatMessage={{ text: LOADING_MESSAGE }} />}
      {messages.length > 1 && (
        <SystemMessage>
          连续对话会加倍消耗 tokens，
          <a className="text-link-gray" onClick={startNewChat}>
            开启新对话
          </a>
        </SystemMessage>
      )}
    </div>
  );
};
