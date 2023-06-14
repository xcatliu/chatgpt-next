import './globals.css';

import npmIsMobile from 'is-mobile';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';

import { ChatProvider } from '@/context/ChatContext';
import { DeviceProvider } from '@/context/DeviceContext';
import { LoginProvider } from '@/context/LoginContext';
import { MenuProvider } from '@/context/MenuContext';
import { MessageDetailProvider } from '@/context/MessageDetailContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { isWeChat as utilIsWeChat } from '@/utils/device';

export const metadata: Metadata = {
  title: 'ChatGPT Next',
  description: '微信风格的 ChatGPT，基于 Next.js 构建，私有化部署的最佳选择！',
  icons: { icon: '/chatgpt-icon-green.png', apple: '/chatgpt-icon-green.png' },
  viewport: { width: 'device-width', initialScale: 1, viewportFit: 'cover' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const userAgent = headers().get('user-agent') ?? '';
  const isWeChat = utilIsWeChat(userAgent);
  const uaIsMobile = isWeChat || npmIsMobile({ ua: userAgent });

  const cookiesWindowWidth = cookies().get('windowWidth')?.value;
  const windowWidth = cookiesWindowWidth ? Number(cookiesWindowWidth) : '100vw';
  const cookiesWindowHeight = cookies().get('windowHeight')?.value;
  const windowHeight = cookiesWindowHeight ? Number(cookiesWindowHeight) : '100vh';

  const cookieApiKey = cookies().get('apiKey')?.value;

  return (
    <html lang="zh-CN">
      <body>
        <DeviceProvider
          isWeChat={isWeChat}
          uaIsMobile={uaIsMobile}
          windowWidth={windowWidth}
          windowHeight={windowHeight}
        >
          <SettingsProvider isLogged={!!cookieApiKey}>
            <LoginProvider cookieApiKey={cookieApiKey}>
              <MenuProvider>
                <ChatProvider>
                  <MessageDetailProvider>{children}</MessageDetailProvider>
                </ChatProvider>
              </MenuProvider>
            </LoginProvider>
          </SettingsProvider>
        </DeviceProvider>
        <script async src="/prism.js" />
      </body>
    </html>
  );
}
