import Image from "next/image";
import { Shanti } from "next/font/google";
import Link from "next/link";

const shanti = Shanti({
  subsets: ['latin'], 
  weight: '400',
});

export default function Home() {
  return (
    <div className={`bg-white flex items-center justify-center h-[100vh] w-[100vw] ${shanti.className} font-bold`}>
      <p className="text-white absolute top-8 font-bold text-[28px] left-10 w-5 leading-[2rem]">Organic Mind</p>
      <div className="w-[50%] h-full bg-black">
        <div className="w-[105%] h-full bg-black flex items-center justify-center rounded-2xl ">
          <Image src = '/images/first_page.png' alt="first page image" height={350} width={340}></Image>
        </div>
      </div>

      <div className="w-[50%] h-full flex items-center justify-center">
        <div className="w-[60%] h-[40%] flex flex-col gap-4">
          <h1 className="text-black text-[36px] font-bold">Productive Mind</h1>
          <p className="text-zinc-500">With only features you need, Organic Mind is customized for individiuals seeking a stress-free way to stay focused on their goals, projects and tasks.</p>
          <button className="bg-yellow-400 rounded-md text-black py-2">Get Started</button>
          <p className="text-zinc-700 text-center">Already have an account? <span> <Link href='/auth'>Sign in </Link></span></p>
        </div>
      </div>
    </div>
  );
}
