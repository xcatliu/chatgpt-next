'use client';

import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useState } from 'react';

/**
 * 菜单栏的 Key，直接用图标的名字表示
 */
export enum MenuKey {
  /** 聊天记录 tab */
  InboxStack = 'InboxStack',
  /** 参数配置 tab */
  AdjustmentsHorizontal = 'AdjustmentsHorizontal',
}

/**
 * 菜单栏的 Context
 */
export const MenuContext = createContext<{
  isMenuShow: boolean;
  setIsMenuShow: (isMenuShow: boolean) => void;
  currentMenu: MenuKey | undefined;
  setCurrentMenu: (currentMenu: MenuKey | undefined) => void;
} | null>(null);

export const MenuProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isMenuShow, setStateIsMenuShow] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<MenuKey | undefined>(undefined);

  /**
   * 设置菜单栏的显示隐藏
   */
  const setIsMenuShow = useCallback((isMenuShow: boolean) => {
    // 如果想隐藏，则去掉 html 上的样式，然后设置 state
    if (!isMenuShow) {
      document.documentElement.classList.remove('show-menu');
      setStateIsMenuShow(isMenuShow);
      return;
    }

    // 如果想展示，则先设置 state，再设置样式
    setStateIsMenuShow(isMenuShow);
    // 由于 transform 的 fixed 定位失效问题，这里需要手动设置和取消 form-container 的 top
    const formContainer = document.getElementById('form-container');
    if (formContainer) {
      formContainer.style.top = `${getComputedStyle(formContainer).top}px`;
    }
    document.documentElement.classList.add('show-menu');
  }, []);

  return (
    <MenuContext.Provider
      value={{
        isMenuShow,
        setIsMenuShow,
        currentMenu,
        setCurrentMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};
