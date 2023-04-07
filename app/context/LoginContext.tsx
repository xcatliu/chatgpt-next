'use client';

import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useState } from 'react';

import { login as utilsLogin, logout as utilsLogout } from '@/utils/login';

/**
 * 登录相关的 Context
 */
export const LoginContext = createContext<{
  isLogged: boolean;
  login: () => Promise<boolean>;
  logout: () => Promise<boolean>;
} | null>(null);

export const LoginProvider: FC<{ children: ReactNode; isLogged: boolean }> = ({
  children,
  isLogged: propsIsLogged,
}) => {
  const [isLogged, setIsLogged] = useState(propsIsLogged);

  const login = useCallback(async () => {
    const loginResult = await utilsLogin();
    setIsLogged(loginResult);

    return loginResult;
  }, []);

  const logout = useCallback(async () => {
    const logoutResult = await utilsLogout();
    setIsLogged(!logoutResult);

    return logoutResult;
  }, []);

  return <LoginContext.Provider value={{ isLogged, login, logout }}>{children}</LoginContext.Provider>;
};
