'use client';

import { AdjustmentsHorizontalIcon, InboxStackIcon, KeyIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import type { FC } from 'react';
import { useCallback, useContext, useEffect } from 'react';

import { ChatContext } from '@/context/ChatContext';
import { DeviceContext } from '@/context/DeviceContext';
import { LoginContext } from '@/context/LoginContext';
import { MenuContext, MenuKey } from '@/context/MenuContext';
import { scrollToTop } from '@/utils/scroll';
import { sleep } from '@/utils/sleep';

import { History } from './History';

/**
 * 菜单栏
 */
export const Menu: FC = () => {
  const { windowHeight, isWeChat } = useContext(DeviceContext)!;
  const { isLogged, login, logout } = useContext(LoginContext)!;
  const { isMenuShow, setIsMenuShow } = useContext(MenuContext)!;

  useEffect(() => {
    // 最开始如果未登录，则弹窗登录
    if (!isLogged) {
      login();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <>
      <div
        className={classNames('fixed z-20 top-0 right-0 md:hidden', {
          absolute: isWeChat,
          hidden: isMenuShow,
        })}
      >
        <MenuEntryButton onKeyIconClick={onKeyIconClick} />
      </div>
      <div
        className={classNames('fixed z-20 top-0 left-0 w-screen bg-[rgba(0,0,0,0.4)] md:hidden', {
          hidden: !isMenuShow,
        })}
        style={{
          height: windowHeight,
        }}
        onTouchStart={async () => {
          setIsMenuShow(false);
          // 由于 transform 的 fixed 定位失效问题，这里需要手动设置和取消 form-container 的 top
          await sleep(300);
          const formContainer = document.getElementById('form-container');
          if (formContainer) {
            formContainer.style.top = 'unset';
          }
        }}
        onClick={async () => {
          setIsMenuShow(false);
          // 由于 transform 的 fixed 定位失效问题，这里需要手动设置和取消 form-container 的 top
          await sleep(300);
          const formContainer = document.getElementById('form-container');
          if (formContainer) {
            formContainer.style.top = 'unset';
          }
        }}
      />
      <div
        // 293px 是 768px 的黄金分割点，293 + 16 * 2 = 325
        className={classNames('fixed left-[100vw] w-[calc(100vw-6.25rem)] md:block md:static md:w-[325px]', {
          hidden: !isMenuShow,
        })}
      >
        <div
          className="w-inherit fixed flex flex-col bg-gray-100 md:h-screen md:border-r md:border-gray-300"
          style={{
            height: windowHeight,
          }}
        >
          <MenuContent isLogged={isLogged} onKeyIconClick={onKeyIconClick} />
        </div>
      </div>
    </>
  );
};

/**
 * 显示菜单栏的入口按钮，仅在移动端需要显示/隐藏菜单栏
 */
const MenuEntryButton: FC<any> = ({ onKeyIconClick }) => {
  const { isLogged } = useContext(LoginContext)!;
  const { history } = useContext(ChatContext)!;
  const { setIsMenuShow, setCurrentMenu } = useContext(MenuContext)!;

  return (
    <button
      onClick={() => {
        if (!isLogged) {
          onKeyIconClick();
        } else if (history && history.length > 0) {
          scrollToTop();
          setCurrentMenu(MenuKey.InboxStack);
          setIsMenuShow(true);
        } else {
          scrollToTop();
          setCurrentMenu(MenuKey.AdjustmentsHorizontal);
          setIsMenuShow(true);
        }
      }}
    >
      {!isLogged ? (
        <KeyIcon
          className={classNames({
            'text-green-600 hover:text-green-700': isLogged,
            'text-red-500 hover:text-red-600': !isLogged,
          })}
        />
      ) : history === undefined ? null : history.length > 0 ? (
        <InboxStackIcon />
      ) : (
        <AdjustmentsHorizontalIcon />
      )}
    </button>
  );
};

/**
 * 菜单栏内容
 */
const MenuContent: FC<any> = ({ onKeyIconClick }) => {
  const { isLogged } = useContext(LoginContext)!;
  const { currentMenu, setCurrentMenu } = useContext(MenuContext)!;

  return (
    <>
      <menu
        className={`w-inherit flex z-10 justify-end bg-gray-wx border-b-[0.5px] border-gray-300
                   md:flex-row-reverse md:px-4 md:pt-2 md:border-r`}
      >
        <button
          className={classNames({
            'text-gray-700 hover:text-gray-700': currentMenu === MenuKey.InboxStack,
          })}
          onClick={() => setCurrentMenu(MenuKey.InboxStack)}
        >
          <InboxStackIcon />
        </button>
        <button
          className={classNames({
            'text-gray-700 hover:text-gray-700': currentMenu === MenuKey.AdjustmentsHorizontal,
          })}
          onClick={() => setCurrentMenu(MenuKey.AdjustmentsHorizontal)}
        >
          <AdjustmentsHorizontalIcon />
        </button>
        <div className="grow" />
        <button
          className={classNames({
            'text-green-600 hover:text-green-700': isLogged,
            'text-red-500 hover:text-red-600': !isLogged,
          })}
          onClick={onKeyIconClick}
        >
          <KeyIcon />
        </button>
      </menu>
      <div className="grow overflow-y-scroll md:px-4">
        {currentMenu === MenuKey.InboxStack && <History />}
        {currentMenu === MenuKey.AdjustmentsHorizontal && (
          <>
            {/* <div className="m-4">
              模型：
              <select
                value={completionParams.model}
                onChange={(e) =>
                  setCompletionParams({
                    ...completionParams,
                    model: e.target.value as Model,
                  })
                }
              >
                {Object.values(CompletionParamsModel).map((model) => (
                  <option key={model}>{model}</option>
                ))}
              </select>
            </div>
            <div className="m-4">
              <label>
                流式响应：
                <input
                  defaultChecked={completionParams.stream}
                  type="checkbox"
                  onChange={(e) =>
                    setCompletionParams({
                      ...completionParams,
                      stream: e.target.checked,
                    })
                  }
                />
              </label>
            </div> */}
          </>
        )}
      </div>
      <div className="flex-none mx-4 my-5 pb-[env(safe-area-inset-bottom)] text-center text-gray-400 text-sm">
        由{' '}
        <a className="text-link-gray" href="https://github.com/xcatliu/chatgpt-next" target="_blank">
          ChatGPT Next
        </a>{' '}
        驱动
      </div>
    </>
  );
};
