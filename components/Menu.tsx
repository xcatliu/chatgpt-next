import { AdjustmentsHorizontalIcon, InboxStackIcon, KeyIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type { CompletionParams } from '@/utils/completionParams';
import { CompletionParamsModel } from '@/utils/completionParams';
import { login, logout } from '@/utils/login';
import { scrollToTop } from '@/utils/scroll';
import { sleep } from '@/utils/sleep';

interface MenuProps {
  isLogged: boolean;
  setIsLogged: (isLogged: boolean) => void;
  completionParams: CompletionParams;
  setCompletionParams: (completionParams: CompletionParams) => void;
  windowHeight: string | number;
}

export const Menu: FC<MenuProps> = ({ isLogged, setIsLogged, completionParams, setCompletionParams, windowHeight }) => {
  // TODO 默认值需要改成 !isMobile()
  const [isMenuShow, setIsMenuShow] = useState(false);
  const [currentTab, setCurrentTab] = useState<'InboxStack' | 'AdjustmentsHorizontal'>('AdjustmentsHorizontal');

  useEffect(() => {
    (async () => {
      // 最开始如果未登录，则弹窗登录
      if (!isLogged) {
        setIsLogged(await login());
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 点击钥匙按钮，弹出重新登录框 */
  const onKeyIconClick = useCallback(async () => {
    // 如果未登录，则弹窗登录
    if (!isLogged) {
      setIsLogged(await login());
      return;
    }
    // 如果已登录，则弹窗登出
    const logoutResult = await logout();
    setIsLogged(!logoutResult);
    // 如果登出成功，则继续弹窗要求用户登录
    if (logoutResult) {
      await sleep(100);
      const loginResult = await login();
      setIsLogged(loginResult);
    }
  }, [isLogged, setIsLogged]);

  return (
    <>
      <div
        className={classNames('fixed z-20 top-0 right-0 md:hidden', {
          hidden: isMenuShow,
        })}
      >
        <MenuEntryButton
          isLogged={isLogged}
          onKeyIconClick={onKeyIconClick}
          setIsMenuShow={setIsMenuShow}
          setCurrentTab={setCurrentTab}
        />
      </div>
      <div
        className={classNames('fixed z-20 top-0 left-0 w-screen bg-[rgba(0,0,0,0.4)] md:hidden', {
          hidden: !isMenuShow,
        })}
        style={{
          height: windowHeight,
        }}
        onTouchStart={async () => {
          document.documentElement.classList.remove('show-menu');
          setIsMenuShow(false);
          // 由于 transform 的 fixed 定位失效问题，这里需要手动设置和取消 form-container 的 top
          await sleep(300);
          const formContainer = document.getElementById('form-container');
          if (formContainer) {
            formContainer.style.top = 'unset';
          }
        }}
        onClick={async () => {
          document.documentElement.classList.remove('show-menu');
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
        // 293px 是 768px 的黄金分割点，239 + 16 * 2 = 325
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
          <MenuContent
            isLogged={isLogged}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            completionParams={completionParams}
            setCompletionParams={setCompletionParams}
            onKeyIconClick={onKeyIconClick}
          />
        </div>
      </div>
    </>
  );
};

const MenuEntryButton: FC<any> = ({ isLogged, onKeyIconClick, setIsMenuShow, setCurrentTab }) => {
  return (
    <button
      className="text-gray-400"
      onClick={() => {
        if (isLogged) {
          scrollToTop();
          setCurrentTab('AdjustmentsHorizontal');
          setIsMenuShow(true);
          // 由于 transform 的 fixed 定位失效问题，这里需要手动设置和取消 form-container 的 top
          const formContainer = document.getElementById('form-container');
          if (formContainer) {
            formContainer.style.top = `${formContainer.offsetTop}px`;
          }
          document.documentElement.classList.add('show-menu');
        } else {
          onKeyIconClick();
        }
      }}
    >
      {isLogged ? (
        <AdjustmentsHorizontalIcon />
      ) : (
        <KeyIcon
          className={classNames({
            'text-green-600': isLogged,
            'text-red-500': !isLogged,
          })}
        />
      )}
    </button>
  );
};

/**
 * 侧边菜单栏
 */
const MenuContent: FC<any> = ({
  isLogged,
  currentTab,
  setCurrentTab,
  completionParams,
  setCompletionParams,
  onKeyIconClick,
}) => {
  return (
    <>
      <menu
        className={`w-inherit flex z-10 justify-end bg-gray-wx border-b-[0.5px] border-gray-300
                   md:flex-row-reverse md:px-4 md:pt-2 md:border-r`}
      >
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
              'text-green-600': isLogged,
              'text-red-500': !isLogged,
            })}
          />
        </button>
      </menu>
      <div className="grow md:mx-4 md:my-2">
        {currentTab === 'InboxStack' && <div className="m-4">聊天记录功能开发中...</div>}
        {currentTab === 'AdjustmentsHorizontal' && (
          <div className="m-4">
            模型：
            <select
              value={completionParams.model}
              onChange={(e) =>
                setCompletionParams({
                  ...completionParams,
                  model: e.target.value,
                })
              }
            >
              {Object.values(CompletionParamsModel).map((model) => (
                <option key={model}>{model}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="mx-4 my-5 pb-[env(safe-area-inset-bottom)] text-center text-gray-400 text-sm">
        由{' '}
        <a
          className="underline decoration hover:text-gray-500"
          href="https://github.com/xcatliu/chatgpt-next"
          target="_blank"
        >
          ChatGPT Next
        </a>{' '}
        驱动
      </div>
    </>
  );
};
