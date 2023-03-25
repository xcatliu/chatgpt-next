import classNames from 'classnames';
import { getCookies } from 'cookies-next';
import type { NextPageContext } from 'next';
import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';

import { Menu } from '@/components/Menu';
import type { MessageProps } from '@/components/Message';
import { Message, SystemMessage } from '@/components/Message';
import { TextareaForm } from '@/components/TextareaForm';
import { fetchChat } from '@/utils/api';
import type { CompletionParams } from '@/utils/completionParams';
import { isMobile, isWeChat } from '@/utils/device';
// import { exampleChatMessage, htmlMessage, regexpNumberMessage, userMessage } from '@/utils/exampleChatMessage';
import { scrollToBottom } from '@/utils/scroll';
import { sleep } from '@/utils/sleep';

const WELCOME_MESSAGE = '你好！有什么我可以帮助你的吗？';
const LOADING_MESSAGE = '正在努力思考...';

interface HomeProps {
  isLogged: boolean;
  isWeChat: boolean;
}

// This gets called on every request
export async function getServerSideProps(ctx: NextPageContext): Promise<{ props: HomeProps }> {
  const cookies = getCookies(ctx);
  const userAgent = ctx.req?.headers['user-agent'];

  return {
    props: {
      isLogged: !!cookies?.apiKey,
      isWeChat: isWeChat(userAgent),
    },
  };
}

export default function Home(props: HomeProps) {
  const [isLogged, setIsLogged] = useState(props.isLogged);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [completionParams, setCompletionParams] = useState<CompletionParams>({});
  // 由于移动端的 height:100vh 不靠谱，故需要精确的 windowHeight 用于设置高度
  const [windowHeight, setWindowHeight] = useState<string | number>('100vh');

  useEffect(() => {
    // 仅在 mobile 场景下通过计算获取高度
    // https://stackoverflow.com/a/52936500/2777142
    if (!isMobile()) {
      return;
    }
    setWindowHeight(window.innerHeight);
    document.body.style.minHeight = `${window.innerHeight}px`;
    window.addEventListener('resize', () => setWindowHeight(window.innerHeight));
  }, []);

  /** 提交回调 */
  const onSubmit = useCallback(
    async (text: string) => {
      let newMessages: MessageProps[] = [];
      // 先插入一条用户消息
      newMessages.push({ avatar: 'user', chatMessage: { text } });
      setMessages([...messages, ...newMessages]);
      setIsLoading(true);
      await sleep(16);
      scrollToBottom();
      try {
        // 再请求 /api/chat 接口获取回复
        const parentMessageId = messages[messages.length - 1]?.chatMessage?.id;
        const chatRes = await fetchChat({ text, parentMessageId, completionParams });
        newMessages.push({ chatMessage: chatRes });
        setIsLoading(false);
        setMessages([...messages, ...newMessages]);
        await sleep(16);
        scrollToBottom();
      } catch (e: any) {
        setIsLoading(false);
        newMessages.push({ error: e });
        setMessages([...messages, ...newMessages]);
        await sleep(16);
        scrollToBottom();
      }
    },
    [messages, completionParams],
  );

  return (
    <>
      <Head>
        <title>ChatGPT</title>
        <meta name="description" content="微信风格的 ChatGPT，基于 Next.js 构建，私有化部署的最佳选择！" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/chatgpt-green-icon.png" />
        <link rel="apple-touch-icon" type="image/png" href="/chatgpt-green-icon.png" />
      </Head>
      <div className="mx-auto md:w-[1125px] md:min-h-screen md:flex">
        <Menu
          isLogged={isLogged}
          setIsLogged={setIsLogged}
          completionParams={completionParams}
          setCompletionParams={setCompletionParams}
          windowHeight={windowHeight}
        />
        <main className="w-full bg-gray-wx md:w-[50rem] md:px-4 md:flex md:flex-col">
          <div placeholder="" className={classNames('h-14 md:h-16', { hidden: props.isWeChat })} />
          <h1
            className={classNames(
              `w-inherit fixed z-10 top-0 py-3.5 bg-gray-wx text-center text-lg border-b-[0.5px] border-gray-300
              md:-mx-4 md:pt-[1.375rem]`,
              { hidden: props.isWeChat },
            )}
          >
            ChatGPT
          </h1>

          <div className="md:grow" style={{ display: 'flow-root' }}>
            <SystemMessage>
              本页面会将数据发送给 OpenAI
              <br />
              请注意隐私风险，禁止发送违法内容
            </SystemMessage>
            <Message chatMessage={{ text: WELCOME_MESSAGE }} />
            {/* <Message avatar="user" chatMessage={userMessage} />
            <Message chatMessage={regexpNumberMessage} />
            <Message avatar="user" chatMessage={userMessage} />
            <Message chatMessage={htmlMessage} /> */}
            {messages.map((messageProps, index) => (
              <Message key={index} {...messageProps} />
            ))}
            {isLoading && <Message chatMessage={{ text: LOADING_MESSAGE }} />}
          </div>
          <TextareaForm isLogged={isLogged} onSubmit={onSubmit} />
        </main>
      </div>
    </>
  );
}
