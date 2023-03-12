import { getCookie } from 'cookies-next';
import { NextPageContext } from 'next';
import Head from 'next/head';
import { useCallback, useState } from 'react';

import { Header } from '@/components/Header';
import { Message, MessageProps, SystemMessage } from '@/components/Message';
import { TextareaForm } from '@/components/TextareaForm';
import { fetchChat } from '@/utils/api';

interface HomeProps {
  OPENAI_API_KEY?: string;
}

export default function Home({ OPENAI_API_KEY }: HomeProps) {
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([
    { avatar: 'ChatGPT', chatMessage: { text: '你好，有什么需要帮助的吗？' } },
  ]);

  /** 提交回调 */
  const onSubmit = useCallback(
    async (text: string) => {
      let newMessages: MessageProps[] = [];
      newMessages.push({ align: 'right', chatMessage: { text } });
      setMessages([...messages, ...newMessages]);
      setChatLoading(true);
      try {
        const parentMessageId = messages[messages.length]?.chatMessage?.id;
        const chatRes = await fetchChat({ text, parentMessageId });
        newMessages.push({ avatar: 'ChatGPT', chatMessage: chatRes });
        setChatLoading(false);
        setMessages([...messages, ...newMessages]);
      } catch (e: any) {
        setChatLoading(false);
        newMessages.push({ avatar: 'ChatGPT', error: e });
        setMessages([...messages, ...newMessages]);
      }
    },
    [messages],
  );

  return (
    <>
      <Head>
        <title>ChatGPT</title>
        <meta name="description" content="A Personal ChatGPT Client" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/chatgpt-green-icon.png" />
      </Head>
      <main className="min-h-screen flex flex-col">
        <Header OPENAI_API_KEY={OPENAI_API_KEY} />
        <div
          style={{
            display: 'flow-root',
          }}
          className="flex-grow pt-1"
        >
          <SystemMessage text="本页面会将数据发送给 OpenAI\n请注意隐私风险，禁止发送违法内容" />
          {/* <SystemMessage text="Tips: [Shift+回车]换行" /> */}
          {messages.map((messageProps, index) => (
            <Message key={index} {...messageProps} />
          ))}
          {chatLoading && <Message avatar="ChatGPT" chatMessage={{ text: '正在努力思考...' }} />}
        </div>
        <div className="sticky bottom-0 z-10 bg-gray-100 w-full p-2.5">
          <TextareaForm onSubmit={onSubmit} />
        </div>
      </main>
    </>
  );
}

// This gets called on every request
export async function getServerSideProps(ctx: NextPageContext) {
  const OPENAI_API_KEY = getCookie('OPENAI_API_KEY', ctx);

  return {
    props: OPENAI_API_KEY ? { OPENAI_API_KEY } : {},
  };
}
