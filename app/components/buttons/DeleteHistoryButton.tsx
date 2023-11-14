import { TrashIcon } from '@heroicons/react/24/outline';
import type { FC } from 'react';
import { useContext } from 'react';

import { ChatContext } from '@/context/ChatContext';

/**
 * 删除聊天记录
 */
export const DeleteHistoryButton: FC<{ historyIndex: 'current' | number }> = ({ historyIndex }) => {
  const { deleteHistory } = useContext(ChatContext)!;

  return (
    <button
      className="button-icon absolute bottom-0 right-0"
      onClick={(e) => {
        // 点击删除时，阻止冒泡
        e.stopPropagation();
        deleteHistory(historyIndex);
      }}
    >
      <TrashIcon />
    </button>
  );
};
