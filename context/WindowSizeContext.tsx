import { setCookie } from 'cookies-next';
import type { FC, ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';

export const WindowSizeContext = createContext<{
  windowWidth: number | '100vw';
  windowHeight: number | '100vh';
  isMobile: boolean;
} | null>(null);

export const WindowSizeProvider: FC<{
  windowWidth: number | '100vw';
  windowHeight: number | '100vh';
  uaIsMobile: boolean;
  children: ReactNode;
}> = ({ windowWidth: propsWindowWidth, windowHeight: propsWindowHeight, uaIsMobile, children }) => {
  // 由于移动端的 height:100vh 不靠谱，故需要精确的数值用于设置高度
  const [size, setSize] = useState<{ windowWidth: number | '100vw'; windowHeight: number | '100vh' }>({
    windowWidth: propsWindowWidth,
    windowHeight: propsWindowHeight,
  });

  useEffect(() => {
    // 通过计算获取高度
    // https://stackoverflow.com/a/52936500/2777142
    setCookie('windowWidth', window.innerWidth);
    setCookie('windowHeight', window.innerHeight);
    setSize({
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    });
    // 设置精确的高度以控制滚动条
    document.body.style.minHeight = `${window.innerHeight}px`;

    window.addEventListener('resize', () => {
      setCookie('windowWidth', window.innerWidth);
      setCookie('windowHeight', window.innerHeight);
      setSize({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      });
      // 设置精确的高度以控制滚动条
      document.body.style.minHeight = `${window.innerHeight}px`;
    });
  }, []);

  return (
    <WindowSizeContext.Provider
      value={{ ...size, isMobile: typeof size.windowWidth === 'number' ? size.windowWidth < 1126 : uaIsMobile }}
    >
      {children}
    </WindowSizeContext.Provider>
  );
};
