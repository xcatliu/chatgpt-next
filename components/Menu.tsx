import { AdjustmentsHorizontalIcon, InboxStackIcon, KeyIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useState } from 'react';

import { CompletionParams } from '@/pages';
import { login, logout } from '@/utils/login';
import { sleep } from '@/utils/sleep';

interface MenuProps {
  logged: boolean;
  setLogged: (logged: boolean) => void;
  completionParams: CompletionParams;
  setCompletionParams: (completionParams: CompletionParams) => void;
}

/**
 * 侧边菜单栏
 */
export const Menu: FC<MenuProps> = ({ logged, setLogged, completionParams, setCompletionParams }) => {
  const [isMenuShow, setIsMenuShow] = useState(false);
  const [currentTab, setCurrentTab] = useState<'InboxStack' | 'AdjustmentsHorizontal'>('AdjustmentsHorizontal');

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
    <>
      <button
        className={classNames('absolute top-0 right-0 text-gray-400', {
          hidden: isMenuShow,
        })}
        onClick={() => {
          if (logged) {
            setCurrentTab('AdjustmentsHorizontal');
            setIsMenuShow(true);
            document.documentElement.classList.add('show-menu');
          } else {
            onKeyIconClick();
          }
        }}
      >
        {logged ? (
          <AdjustmentsHorizontalIcon />
        ) : (
          <KeyIcon
            className={classNames({
              'text-green-600': logged,
              'text-red-500': !logged,
            })}
          />
        )}
      </button>

      {isMenuShow && (
        <>
          <div
            className="fixed z-20 top-0 left-0 w-screen h-screen"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
            }}
            onClick={() => {
              setIsMenuShow(false);
              document.documentElement.classList.remove('show-menu');
            }}
          />
          <div className="fixed top-0 left-[100vw] w-[calc(100vw-6.25rem)] h-screen">
            <menu className="flex w-inherit justify-end top-0 md:px-4 md:pt-4 z-10 bg-[#ededed] border-gray-300 text-center border-b-[0.5px]">
              <button onClick={() => setCurrentTab('InboxStack')}>
                <InboxStackIcon className={classNames({ 'text-gray-400': currentTab !== 'InboxStack' })} />
              </button>
              <button onClick={() => setCurrentTab('AdjustmentsHorizontal')}>
                <AdjustmentsHorizontalIcon
                  className={classNames({ 'text-gray-400': currentTab !== 'AdjustmentsHorizontal' })}
                />
              </button>
              <div className="grow" />
              <button onClick={onKeyIconClick}>
                <KeyIcon
                  className={classNames({
                    'text-green-600': logged,
                    'text-red-500': !logged,
                  })}
                />
              </button>
            </menu>
            <div className="grow" />
            {currentTab === 'InboxStack' && <div className="m-4">聊天记录功能开发中...</div>}
            {currentTab === 'AdjustmentsHorizontal' && (
              <div className="m-4">
                模型：
                <select
                  value={completionParams?.model}
                  onChange={(e) =>
                    setCompletionParams({
                      ...completionParams,
                      model: e.target.value as any,
                    })
                  }
                >
                  {['gpt-3.5-turbo-0301', 'gpt-3.5-turbo', 'gpt-4', 'gpt-4-0314', 'gpt-4-32k', 'gpt-4-32k-0314'].map(
                    (model) => (
                      <option key={model}>{model}</option>
                    ),
                  )}
                  <option />
                </select>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
