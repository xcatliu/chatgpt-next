import type { AppProps } from 'next/app';

import '@/styles/globals.css';
import { ChatMessageProvider } from '@/context/ChatMessageContext';
import { LoginProvider } from '@/context/LoginContext';
import { WindowSizeProvider } from '@/context/WindowSizeContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WindowSizeProvider windowWidth={pageProps.windowWidth} windowHeight={pageProps.windowHeight}>
      <LoginProvider isLogged={pageProps.isLogged}>
        <ChatMessageProvider>
          <Component {...pageProps} />
        </ChatMessageProvider>
      </LoginProvider>
    </WindowSizeProvider>
  );
}
