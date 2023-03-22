import { AdjustmentsHorizontalIcon, InboxStackIcon, KeyIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useState } from 'react';

import { login, logout } from '@/utils/login';
import { sleep } from '@/utils/sleep';

interface MenuProps {
  logged: boolean;
  setLogged: (logged: boolean) => void;
  isWeChat: boolean;
}

/**
 * 侧边菜单栏
 */
export const Menu: FC<MenuProps> = ({ logged, setLogged, isWeChat }) => {
  const [isMenuShow, setIsMenuShow] = useState(false);

  useEffect(() => {
    (async () => {
      // 最开始如果未登录，则弹窗登录
      if (!logged) {
        setLogged(await login());
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 点击钥匙按钮，弹出重新登录框 */
  const onKeyIconClick = useCallback(async () => {
    // 如果未登录，则弹窗登录
    if (!logged) {
      setLogged(await login());
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
  }, [logged, setLogged]);

  return (
    <menu className="flex w-inherit justify-end top-0 md:px-4 md:pt-4 z-10 bg-[#ededed] border-gray-300 text-center border-b-[0.5px]">
      <button className="w-10 h-10 m-2 p-[0.625rem]" onClick={() => alert(1)}>
        <InboxStackIcon className="text-gray-400" />
      </button>
      <button className="w-10 h-10 m-2 p-[0.625rem]" onClick={() => alert(1)}>
        <AdjustmentsHorizontalIcon className="text-gray-400" />
      </button>
      <div className="grow" />
      <button className="w-10 h-10 m-2 p-[0.625rem]" onClick={onKeyIconClick}>
        <KeyIcon
          className={classNames({
            'text-green-600': logged,
            'text-red-500': !logged,
          })}
        />
      </button>
    </menu>
  );
};
