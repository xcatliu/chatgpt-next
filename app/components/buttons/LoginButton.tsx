import { KeyIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { useCallback, useContext } from 'react';

import { LoginContext } from '@/context/LoginContext';
import { sleep } from '@/utils/sleep';

/**
 * 登录按钮
 */
export const LoginButton = () => {
  const { isLogged, login, logout } = useContext(LoginContext)!;

  /**
   * 点击钥匙按钮，弹出重新登录框
   */
  const onKeyIconClick = useCallback(async () => {
    // 如果未登录，则弹窗登录
    if (!isLogged) {
      await login();
      return;
    }
    // 如果已登录，则弹窗登出
    const logoutResult = await logout();
    // 如果登出成功，则继续弹窗要求用户登录
    if (logoutResult) {
      await sleep(100);
      await login();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogged]);

  return (
    <button
      className={classNames('button-icon', {
        'text-green-600 hover:text-green-700': isLogged,
        'text-red-500 hover:text-red-600': !isLogged,
      })}
      onClick={onKeyIconClick}
    >
      <KeyIcon />
    </button>
  );
};
