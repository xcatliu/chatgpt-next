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
      <h1
        className={`w-inherit fixed z-10 top-0 py-3.5 bg-chat-bg text-center text-lg border-b-[0.5px] border-gray
                    md:tall:top-24 md:-mx-4 dark:bg-chat-bg-dark`}
      >
        ChatGPT Next
      </h1>
    </>
  );
};
