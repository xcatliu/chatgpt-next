import { PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import type { FC } from 'react';
import { useContext } from 'react';

import { ChatContext } from '@/context/ChatContext';
import { LoginContext } from '@/context/LoginContext';
import { readImageFile } from '@/utils/image';

/**
 * 添加图片
 */
export const AttachImageButton: FC<{}> = () => {
  const { images, appendImages } = useContext(ChatContext)!;
  const { isLogged } = useContext(LoginContext)!;

  return (
    <div className="h-full max-h-16">
      <label
        htmlFor="input-attach-image"
        className={classNames('button-attach-image flex items-center w-14 py-2 h-full max-h-16', {
          disabled: !isLogged || images.length === 9,
          'px-[18px]': images.length === 0,
          'pl-[28px] pr-[8px]': images.length > 0,
        })}
      >
        {images.length === 0 ? <PhotoIcon /> : <PlusIcon />}
      </label>

      <input
        id="input-attach-image"
        type="file"
        multiple
        accept="image/jpeg, image/png"
        disabled={!isLogged || images.length === 9}
        className="hidden"
        onChange={async (e) => {
          const files = e.target.files;
          // 确保文件已被选择
          if (files === null || files.length === 0) {
            return;
          }

          const images = await Promise.all(Array.from(files).map(readImageFile));
          appendImages(...images);
        }}
      />
    </div>
  );
};
