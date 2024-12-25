'use client'
import React, { useEffect, useState }  from 'react'
import { FaHamburger } from 'react-icons/fa'
import { GiHamburgerMenu } from 'react-icons/gi'
import { MdUpcoming } from 'react-icons/md'
import Image from 'next/image'
import { TodayPage } from '../pages'

const Home = () => {
  const [open, setOpen] = useState<boolean>(true);
  const [width, setWidth] = useState<String>('68rem');
  const [selectedMenuItem, setSelectedMenuItem] = useState('Today');

  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'Upcoming':
        return <div className='h-[95%] w-full border border-black'>Upcoming content</div>;
      case 'Today':
        return <TodayPage/>
      case 'Calendar':
        return <div className='h-[95%] w-full border border-black'>Calendar content</div>;
      case 'Sticky Notes':
        return <div className='h-[95%] w-full border border-black'>Sticky Notes content</div>;
      default:
        return null;
    }
  };
  
  const handleMenuClick = () => { 
    setOpen(false);
    setWidth('90rem');
  }

  return (
    <div className='bg-white h-[100vh] w-[100vw]'>


        {open && 
        <div className='bg-gray-100 h-[95vh] w-[22vw] rounded-xl absolute top-5 left-5'>
            <div className='flex items-center justify-between w-[90%] mx-auto mt-2'>
                <p className='text-zinc-700 text-[26px] font-bold'>Menu</p>
                <GiHamburgerMenu className='text-black' onClick={handleMenuClick}/>
            </div>

            <div className='w-[90%] mx-auto mt-4 text-black'>
                <input 
                    type='text' 
                    placeholder='Search...' 
                    className='w-full p-2 border border-gray-300 rounded-md'
                />
            </div>

            <div>
              <p className='text-zinc-700 text-[15px] mt-[1rem] w-[90%] mx-auto font-bold'>Tasks</p>

              <ul className='flex flex-col gap-4 text-zinc-500 mx-auto w-[90%] mt-[1rem]'>
              <button className='flex items-center font-semibold gap-4'><Image src = '/images/upcoming.svg' alt='upcoming icon' height={30} width={15}></Image>Upcoming</button>
              <button className='flex items-center font-semibold gap-4'><Image src = '/images/todo.svg' alt='todo icon' height={30} width={15}></Image>Today</button>
              <button className='flex items-center font-semibold gap-4'><Image src = '/images/calendar.svg' alt='calendar icon' height={30} width={15}></Image>Calendar</button>
              <button className='flex items-center font-semibold gap-4'><Image src = '/images/notes.svg' alt='sticky notes icon' height={30} width={15}></Image>Sticky Notes</button>
              </ul>

            </div>



            <div className='border border-gray-300 border-t-[0.0000001rem] mt-[1rem] mb-[1rem]'></div>


            <div>
              <p className='text-zinc-700 text-[15px] mt-[1rem] w-[90%] mx-auto font-bold'>Tasks</p>

              <ul className='flex flex-col gap-4 text-zinc-500 mx-auto w-[90%] mt-[1rem]'>
              <button className='flex items-center font-semibold gap-4'><Image src = '/images/upcoming.svg' alt='upcoming icon' height={30} width={15}></Image>Upcoming</button>
              <button className='flex items-center font-semibold gap-4'><Image src = '/images/todo.svg' alt='todo icon' height={30} width={15}></Image>Today</button>
              <button className='flex items-center font-semibold gap-4'><Image src = '/images/calendar.svg' alt='calendar icon' height={30} width={15}></Image>Calendar</button>
              <button className='flex items-center font-semibold gap-4'><Image src = '/images/notes.svg' alt='sticky notes icon' height={30} width={15}></Image>Sticky Notes</button>
              </ul>

            </div>

            <div className='border border-gray-300 border-t-[0.0000001rem] mt-[1rem] mb-[1rem]'></div>


            <div className='mt-[10rem]'>
              <ul className='flex flex-col gap-4 text-zinc-500 mx-auto w-[90%] mt-[1rem]'>
                <button className='flex items-center font-semibold gap-4'><Image src = '/images/settings.svg' alt='upcoming icon' height={30} width={15}></Image>Settings</button>
                <button className='flex items-center font-semibold gap-4'><Image src = '/images/signout.svg' alt='todo icon' height={30} width={15}></Image>Sign Out</button>
              </ul>
            </div>
            
        </div>}

        <div className={`w-[${width}] ml-auto flex items-center justify-center h-[100vh]`}>
          <div className='h-[95%] w-full'>
            {renderContent()}
          </div>
        </div>
    </div>  
  )
}

export default Home