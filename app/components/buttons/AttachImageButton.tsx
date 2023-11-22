import { PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import type { FC } from 'react';
import { useContext } from 'react';

import { ChatContext } from '@/context/ChatContext';
import { LoginContext } from '@/context/LoginContext';
import { MAX_GPT_VISION_IMAGES } from '@/utils/constants';
import { readImageFile } from '@/utils/image';

/**
 * 添加图片
 */
export const AttachImageButton: FC<{}> = () => {
  const { images, appendImages } = useContext(ChatContext)!;
  const { isLogged } = useContext(LoginContext)!;

  return (
    <>
      <label
        htmlFor="input-attach-image"
        className={classNames('button-attach-image flex items-center w-10 h-10 md:w-14 md:h-16', {
          disabled: !isLogged || images.length >= MAX_GPT_VISION_IMAGES,
          'justify-center': images.length === 0,
          'justify-end w-14 h-16': images.length > 0,
        })}
      >
        {images.length === 0 ? <PhotoIcon className="w-9 h-9 p-2" /> : <PlusIcon className="w-9 h-9 p-2" />}
      </label>

      <input
        id="input-attach-image"
        type="file"
        multiple
        accept="image/jpeg, image/png"
        disabled={!isLogged || images.length >= MAX_GPT_VISION_IMAGES}
        className="hidden"
        onChange={async (e) => {
          const files = e.target.files;
          // 确保文件已被选择
          if (files === null || files.length === 0) {
            return;
          }

          const images = await Promise.all(Array.from(files).map(readImageFile));
          appendImages(...images);

          // https://stackoverflow.com/a/56258902
          e.target.value = '';
        }}
      />
    </>
  );
};
