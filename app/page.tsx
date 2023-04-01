import { Menu } from '@/app/components/Menu';
import { Messages } from '@/app/components/Messages';
import { TextareaForm } from '@/app/components/TextareaForm';
import { Title } from '@/app/components/Title';
import { isWeChat } from '@/app/utils/device';

export default function Home() {
  return (
    <div className="mx-auto md:w-[1125px] md:min-h-screen md:flex">
      <Menu />
      <main className="w-full bg-gray-wx md:w-[50rem] md:px-4 md:flex md:flex-col">
        {!isWeChat() && <Title />}
        <Messages />
        <TextareaForm />
      </main>
    </div>
  );
}
