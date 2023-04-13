import { headers } from 'next/headers';

import { isWeChat as utilIsWeChat } from '@/utils/device';

export const Title = () => {
  const userAgent = headers().get('user-agent') ?? '';
  const isWeChat = utilIsWeChat(userAgent);

  if (isWeChat) {
    return null;
  }

  return (
    <>
      <div placeholder="" className="h-14" />
      <h1 className="w-inherit fixed z-10 top-0 py-3.5 bg-gray-wx text-center text-lg border-b-[0.5px] border-gray-300 md:-mx-4">
        ChatGPT Next
      </h1>
    </>
  );
};
