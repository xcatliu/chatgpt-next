import { getCookies } from 'cookies-next';
import type { NextPageContext } from 'next';
import Head from 'next/head';

import { Menu } from '@/components/Menu';
import { Messages } from '@/components/Messages';
import { TextareaForm } from '@/components/TextareaForm';
import { Title } from '@/components/Title';
import { isWeChat } from '@/utils/device';

interface HomeProps {
  isLogged: boolean;
  isWeChat: boolean;
  windowWidth: '100vw' | number;
  windowHeight: '100vh' | number;
}

// This gets called on every request
export async function getServerSideProps(ctx: NextPageContext): Promise<{ props: HomeProps }> {
  const cookies = getCookies(ctx);
  const userAgent = ctx.req?.headers['user-agent'];

  return {
    props: {
      isLogged: !!cookies?.apiKey,
      isWeChat: isWeChat(userAgent),
      windowWidth: cookies?.windowWidth ? Number(cookies?.windowWidth) : '100vw',
      windowHeight: cookies?.windowHeight ? Number(cookies?.windowHeight) : '100vh',
    },
  };
}

export default function Home({ isWeChat }: HomeProps) {
  return (
    <>
      <Head>
        <title>ChatGPT Next</title>
        <meta name="description" content="微信风格的 ChatGPT，基于 Next.js 构建，私有化部署的最佳选择！" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/chatgpt-green-icon.png" />
        <link rel="apple-touch-icon" type="image/png" href="/chatgpt-green-icon.png" />
      </Head>
      <div className="mx-auto md:w-[1125px] md:min-h-screen md:flex">
        <Menu />
        <main className="w-full bg-gray-wx md:w-[50rem] md:px-4 md:flex md:flex-col">
          {!isWeChat && <Title />}
          <Messages />
          <TextareaForm />
        </main>
      </div>
    </>
  );
}
