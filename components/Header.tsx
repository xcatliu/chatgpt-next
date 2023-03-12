import { KeyIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { getCookie } from 'cookies-next';
import { FC, useCallback, useEffect, useState } from 'react';

import { login, logout } from '@/utils/login';
import { sleep } from '@/utils/sleep';

interface HeaderProps {
  OPENAI_API_KEY?: string;
}

/**
 * 顶部栏
 */
export const Header: FC<HeaderProps> = ({ OPENAI_API_KEY }) => {
  const [logged, setLogged] = useState(!!(OPENAI_API_KEY ?? getCookie('OPENAI_API_KEY')));

  useEffect(() => {
    (async () => {
      // 最开始如果未登录，则弹窗登录
      if (!logged) {
        const loginResult = await login();
        setLogged(loginResult);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 点击钥匙按钮，弹出重新登录框 */
  const onKeyIconClick = useCallback(async () => {
    // 如果未登录，则弹窗登录
    if (!logged) {
      const loginResult = await login();
      setLogged(loginResult);
      return;
    }

    // 如果已登录，则弹窗登出
    const logoutResult = await logout();
    setLogged(!logoutResult);

    // 如果登出成功，则继续弹窗要求用户登录
    if (logoutResult) {
      await sleep(100);
      const loginResult = await login();
      setLogged(loginResult);
    }
  }, [logged]);

  return (
    <div>
      <div className="h-12" />
      <header
        className="fixed w-full top-0 z-10 border-b border-gray-300 text-center"
        style={{ backgroundColor: '#ededed' }}
      >
        <h1 className="text-lg py-2.5">ChatGPT</h1>
        <KeyIcon
          className={classNames('absolute top-0 right-0 w-12 h-12 p-3.5', {
            'text-green-600': logged,
            'text-red-400': !logged,
          })}
          onClick={onKeyIconClick}
        />
      </header>
    </div>
  );
};
