import { Menu } from '@/components/Menu';
import { MessageDetail } from '@/components/MessageDetail';
import { Messages } from '@/components/Messages';
import { TextareaForm } from '@/components/TextareaForm';
import { Title } from '@/components/Title';

export default function Home() {
  return (
    <div className="mx-auto md:w-[1125px] md:min-h-screen md:flex md:tall:py-24">
      <div className="hidden md:tall:block fixed top-0 w-inherit z-10 h-24 bg-white dark:bg-gray-800" />
      <Menu />
      <main className="w-full bg-chat-bg dark:bg-chat-bg-dark md:w-[50rem] md:px-4 md:flex md:flex-col">
        <Title />
        <Messages />
        <TextareaForm />
      </main>
      <div className="hidden md:tall:block fixed bottom-0 w-inherit z-10 h-24 bg-white dark:bg-gray-800" />
      <MessageDetail />
    </div>
  );
}
