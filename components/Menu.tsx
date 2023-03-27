import { AdjustmentsHorizontalIcon, InboxStackIcon, KeyIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import type { FC } from 'react';
import { useCallback, useContext, useEffect } from 'react';

import { ChatMessageContext } from '@/context/ChatMessageContext';
import { DeviceContext } from '@/context/DeviceContext';
import { LoginContext } from '@/context/LoginContext';
import { CompletionParamsModel } from '@/utils/completionParams';
import { scrollToTop } from '@/utils/scroll';
import { sleep } from '@/utils/sleep';

import { History } from './History';

export const Menu: FC = () => {
  const { windowHeight, isWeChat } = useContext(DeviceContext)!;
  const { isLogged, login, logout } = useContext(LoginContext)!;
  const { isMenuShow, setIsMenuShow } = useContext(ChatMessageContext)!;

  useEffect(() => {
    // 最开始如果未登录，则弹窗登录
    if (!isLogged) {
      login();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 点击钥匙按钮，弹出重新登录框 */
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
          <MenuContent isLogged={isLogged} onKeyIconClick={onKeyIconClick} />
        </div>
      </div>
    </>
  );
};

const MenuEntryButton: FC<any> = ({ onKeyIconClick }) => {
  const { isLogged } = useContext(LoginContext)!;
  const { setIsMenuShow, history, setCurrentMenu } = useContext(ChatMessageContext)!;

  return (
    <button
      className="text-gray-400"
      onClick={() => {
        if (!isLogged) {
          onKeyIconClick();
        } else if (history && history.length > 0) {
          scrollToTop();
          setCurrentMenu('InboxStack');
          setIsMenuShow(true);
        } else {
          scrollToTop();
          setCurrentMenu('AdjustmentsHorizontal');
          setIsMenuShow(true);
        }
      }}
    >
      {!isLogged ? (
        <KeyIcon
          className={classNames({
            'text-green-600': isLogged,
            'text-red-500': !isLogged,
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
 * 侧边菜单栏
 */
const MenuContent: FC<any> = ({ onKeyIconClick }) => {
  const { isLogged } = useContext(LoginContext)!;
  const { completionParams, setCompletionParams, currentMenu, setCurrentMenu } = useContext(ChatMessageContext)!;

  return (
    <>
      <menu
        className={`w-inherit flex z-10 justify-end bg-gray-wx border-b-[0.5px] border-gray-300
                   md:flex-row-reverse md:px-4 md:pt-2 md:border-r`}
      >
        <button onClick={() => setCurrentMenu('InboxStack')}>
          <InboxStackIcon className={classNames({ 'text-gray-400': currentMenu !== 'InboxStack' })} />
        </button>
        <button onClick={() => setCurrentMenu('AdjustmentsHorizontal')}>
          <AdjustmentsHorizontalIcon
            className={classNames({ 'text-gray-400': currentMenu !== 'AdjustmentsHorizontal' })}
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
      <div className="grow md:mx-4">
        {currentMenu === 'InboxStack' && <History />}
        {currentMenu === 'AdjustmentsHorizontal' && (
          <div className="m-4">
            模型：
            <select
              value={completionParams.model}
              onChange={(e) =>
                setCompletionParams({
                  ...completionParams,
                  model: e.target.value as CompletionParamsModel,
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
        <a className="text-link-gray" href="https://github.com/xcatliu/chatgpt-next" target="_blank">
          ChatGPT Next
        </a>{' '}
        驱动
      </div>
    </>
  );
};
