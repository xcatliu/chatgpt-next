'use client';

import { setCookie } from 'cookies-next';
import throttle from 'lodash.throttle';
import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useEffect, useState } from 'react';

/**
 * 设备相关 Context
 */
export const DeviceContext = createContext<{
  isWeChat: boolean;
  isMobile: boolean;
  windowWidth: number | '100vw';
  windowHeight: number | '100vh';
} | null>(null);

export const DeviceProvider: FC<{
  children: ReactNode;
  isWeChat: boolean;
  uaIsMobile: boolean;
  windowWidth: number | '100vw';
  windowHeight: number | '100vh';
}> = ({ children, isWeChat, uaIsMobile, windowWidth: propsWindowWidth, windowHeight: propsWindowHeight }) => {
  const [windowWidth, setWindowWidth] = useState<number | '100vw'>(propsWindowWidth);
  // 由于移动端的 height:100vh 不靠谱，故需要精确的数值用于设置高度
  const [windowHeight, setWindowHeight] = useState<number | '100vh'>(propsWindowHeight);

  const isMobile = typeof windowWidth === 'number' ? windowWidth < 1125 : uaIsMobile;

  /**
   * 重置 window 宽高计算
   */
  const resetWindowWidthHeight = useCallback(() => {
    // 通过计算获取高度
    // https://stackoverflow.com/a/52936500/2777142
    setCookie('windowWidth', window.innerWidth);
    setCookie('windowHeight', window.innerHeight);
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);
    // 设置精确的高度以控制滚动条
    document.body.style.minHeight = `${window.innerHeight}px`;
  }, []);

  useEffect(() => {
    resetWindowWidthHeight();
    window.addEventListener('resize', throttle(resetWindowWidthHeight, 100));
  }, [resetWindowWidthHeight]);

  return (
    <DeviceContext.Provider value={{ windowWidth, windowHeight, isWeChat, isMobile }}>
      {children}
    </DeviceContext.Provider>
  );
};
