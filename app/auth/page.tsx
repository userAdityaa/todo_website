'use client'
import React from 'react'
import Image from 'next/image';
import { Shanti } from "next/font/google";
import axios from 'axios'
import { useRouter } from 'next/navigation';

const shanti = Shanti({
  subsets: ['latin'], 
  weight: '400',
});

const Auth = () => {

  const router = useRouter();

  const handleLoginIn = async () => { 
    try {
      window.location.href = "https://backend-minimal.vercel.app/auth/google/login";
    } catch (error) {
      console.error('Error during login:', error);
    }
  };
  

  return (
    <div className={`bg-white flex items-center justify-center h-[100vh] w-[100vw] ${shanti.className} font-bold`}>
        <p className="text-white absolute top-8 font-bold text-[28px] left-10 w-5 leading-[2rem]">Organic Mind</p>
        <div className="w-[50%] h-full bg-black">
            <div className="w-[105%] h-full bg-black flex items-center justify-center rounded-2xl ">
            <Image src = '/images/second_page.png' alt="first page image" height={380} width={380}></Image>
            </div>
        </div>
    
        <div className="w-[50%] h-full flex items-center justify-center">
            <div className="w-[60%] h-[20%] flex flex-col gap-4 ">
                <h1 className="text-black text-[36px] font-bold">Sign In</h1>
                <button className='text-black flex items-center gap-6 border border-black p-4 rounded-xl' onClick={handleLoginIn}> <Image src = '/images/google.png' alt='google icon' height={25} width={25}></Image>Sign In with Google</button>
            </div>
        </div>
    </div>
  )
}

export default Auth