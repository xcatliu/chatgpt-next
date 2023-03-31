import { cookies } from 'next/headers';
import type { FC, ReactNode } from 'react';
import { createContext, useCallback, useState } from 'react';

import { login as utilsLogin, logout as utilsLogout } from '@/app/utils/login';

export const LoginContext = createContext<{
  isLogged: boolean;
  login: () => Promise<boolean>;
  logout: () => Promise<boolean>;
} | null>(null);

export const LoginProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isLogged, setIsLogged] = useState(!!cookies().get('apiKey'));

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
