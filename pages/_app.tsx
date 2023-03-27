import type { AppProps } from 'next/app';

import '@/styles/globals.css';
import { ChatMessageProvider } from '@/context/ChatMessageContext';
import { DeviceProvider } from '@/context/DeviceContext';
import { LoginProvider } from '@/context/LoginContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DeviceProvider
      windowWidth={pageProps.windowWidth}
      windowHeight={pageProps.windowHeight}
      uaIsMobile={pageProps.uaIsMobile}
      isWeChat={pageProps.isWeChat}
    >
      <LoginProvider isLogged={pageProps.isLogged}>
        <ChatMessageProvider>
          <Component {...pageProps} />
        </ChatMessageProvider>
      </LoginProvider>
    </DeviceProvider>
  );
}
