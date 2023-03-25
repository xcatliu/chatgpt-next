import type { FC } from 'react';

export const Title: FC = () => {
  return (
    <>
      <div placeholder="" className="h-14 md:h-16" />
      <h1
        className={`w-inherit fixed z-10 top-0 py-3.5 bg-gray-wx text-center text-lg border-b-[0.5px] border-gray-300
                   md:-mx-4 md:pt-[1.375rem]`}
      >
        ChatGPT Next
      </h1>
    </>
  );
};
