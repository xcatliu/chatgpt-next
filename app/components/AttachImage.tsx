'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import type { FC } from 'react';
import { useContext } from 'react';

import { ChatContext } from '@/context/ChatContext';

import { AttachImageButton } from './buttons/AttachImageButton';

export const AttachImage: FC = () => {
  const { images, deleteImage } = useContext(ChatContext)!;

  return (
    <div className="flex flex-row-reverse items-end">
      <AttachImageButton />
      {[...images].reverse().map((imageProp, index) => (
        <div key={index} className="attach-image-container relative mr-[-28px] z-10 cursor-pointer">
          <XMarkIcon
            className="attach-image-delete absolute top-0 right-0 w-5 h-5 p-0.5 m-0.5 rounded-sm hidden"
            onClick={() => {
              // 因为前面将 images revert 了，所以这里需要计算真正的 index
              deleteImage(images.length - 1 - index);
            }}
          />
          <Image {...imageProp} className="h-16 w-14 object-cover rounded border-[0.5px] border-gray" alt="图片" />
        </div>
      ))}
    </div>
  );
};
