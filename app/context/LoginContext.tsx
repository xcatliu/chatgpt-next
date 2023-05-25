'use client';

import { setCookie } from 'cookies-next';
import { useSearchParams } from 'next/navigation';
import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { getCache, setCache } from '@/utils/cache';
import { login as utilsLogin, logout as utilsLogout } from '@/utils/login';

import { SettingsContext } from './SettingsContext';

/**
 * 登录相关的 Context
 */
export const LoginContext = createContext<{
  isLogged: boolean;
  login: () => Promise<boolean>;
  logout: () => Promise<boolean>;
} | null>(null);

export const LoginProvider: FC<{ children: ReactNode; cookieApiKey?: string }> = ({ children, cookieApiKey }) => {
  const { initAvailableModels } = useContext(SettingsContext)!;
  const [isLogged, setIsLogged] = useState(!!cookieApiKey);

  const queryApiKey = useSearchParams().get('api-key');

  useEffect(() => {
    // 如果 query 中传入了 apiKey，则覆盖 cookie 和 localStorage
    if (queryApiKey) {
      setIsLogged(true);
      setCookie('apiKey', queryApiKey);
      setCache('apiKey', queryApiKey);
      return;
    }

    // 如果 query 中不存在 apiKey，则优先从 localStorage 中拿取 apiKey，并将其缓存在 cookie 中
    const cacheApiKey = getCache('apiKey');
    if (cacheApiKey) {
      setIsLogged(true);
      setCookie('apiKey', cacheApiKey);
      return;
    }

    // 如果 cookie 中存在 apiKey，则将其缓存在 localStorage 中
    if (cookieApiKey) {
      setIsLogged(true);
      setCache('apiKey', cookieApiKey);
      return;
    }

    // 如果所有地方都不存在 apiKey，则弹出登录框
    login();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async () => {
    const isLogged = await utilsLogin();
    setIsLogged(isLogged);

    if (isLogged) {
      initAvailableModels();
    }

    return isLogged;
  }, [initAvailableModels]);

  const logout = useCallback(async () => {
    const logoutResult = await utilsLogout();
    setIsLogged(!logoutResult);

    return logoutResult;
  }, []);

  return <LoginContext.Provider value={{ isLogged, login, logout }}>{children}</LoginContext.Provider>;
};
