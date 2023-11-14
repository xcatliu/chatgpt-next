import { AdjustmentsHorizontalIcon, InboxStackIcon } from '@heroicons/react/24/outline';
import { useContext } from 'react';

import { ChatContext } from '@/context/ChatContext';
import { LoginContext } from '@/context/LoginContext';
import { MenuContext, MenuKey } from '@/context/MenuContext';
import { scrollToTop } from '@/utils/scroll';

import { LoginButton } from './LoginButton';

/**
 * 显示菜单栏的入口按钮，仅在移动端需要显示/隐藏菜单栏
 */
export const MenuEntryButton = () => {
  const { isLogged } = useContext(LoginContext)!;
  const { history } = useContext(ChatContext)!;
  const { setIsMenuShow, setCurrentMenu } = useContext(MenuContext)!;

  if (!isLogged) {
    return <LoginButton />;
  }

  if (history === undefined) {
    return null;
  }

  if (history.length > 0) {
    return (
      <button
        className="button-icon"
        onClick={() => {
          scrollToTop();
          setCurrentMenu(MenuKey.InboxStack);
          setIsMenuShow(true);
        }}
      >
        <InboxStackIcon />
      </button>
    );
  }

  return (
    <button
      className="button-icon"
      onClick={() => {
        scrollToTop();
        setCurrentMenu(MenuKey.AdjustmentsHorizontal);
        setIsMenuShow(true);
      }}
    >
      <AdjustmentsHorizontalIcon />
    </button>
  );
};
