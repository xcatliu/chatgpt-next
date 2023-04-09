import { Menu } from '@/components/Menu';
import { Messages } from '@/components/Messages';
import { TextareaForm } from '@/components/TextareaForm';
import { Title } from '@/components/Title';

export default function Home() {
  return (
    <div className="mx-auto md:w-[1125px] md:min-h-screen md:flex">
      <Menu />
      <main className="w-full bg-gray-wx md:w-[50rem] md:px-4 md:flex md:flex-col">
        <Title />
        <Messages />
        <TextareaForm />
      </main>
    </div>
  );
}
