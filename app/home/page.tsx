'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { TodayPage } from '../pages';

const Home = () => {
  const [open, setOpen] = useState<boolean>(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState('Today');
  const [width, setWidth] = useState<String>('68rem')

  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'Upcoming':
        return <div className='h-[95%] w-full border border-black'>Upcoming content</div>;
      case 'Today':
        return <TodayPage />;
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
  };

  const menuItems = [
    { label: 'Upcoming', icon: '/images/upcoming.svg' },
    { label: 'Today', icon: '/images/todo.svg' },
    { label: 'Calendar', icon: '/images/calendar.svg' },
    { label: 'Sticky Notes', icon: '/images/notes.svg' },
  ];

  return (
    <div className='bg-white h-[100vh] w-[100vw]'>
      {open && (
        <div className='bg-gray-100 h-[95vh] w-[22vw] rounded-xl absolute top-5 left-5'>
          <div className='flex items-center justify-between w-[90%] mx-auto mt-2'>
            <p className='text-zinc-700 text-[26px] font-bold'>Menu</p>
            <button onClick={handleMenuClick}>
              <Image src='/images/hamburger.svg' alt='Menu' height={30} width={30} />
            </button>
          </div>

          <div className='w-[90%] mx-auto mt-4 text-black'>
            <input
              type='text'
              placeholder='Search...'
              className='w-full p-2 border border-gray-300 rounded-md'
            />
          </div>

          <p className='text-zinc-700 text-[15px] mt-[1rem] w-[90%] mx-auto font-bold'>Tasks</p>

          <ul className='flex flex-col gap-2 text-zinc-500 mx-auto w-[90%] mt-[1rem]'>
            {menuItems.map((item) => (
              <button
                key={item.label}
                className={`flex items-center font-semibold gap-4 py-2 rounded-lg ${
                  selectedMenuItem === item.label ? 'bg-gray-300' : ''
                }`}
                onClick={() => setSelectedMenuItem(item.label)}
              >
                <Image
                  src={item.icon}
                  alt={`${item.label} icon`}
                  height={30}
                  width={15}
                  className={`${selectedMenuItem === item.label ? 'ml-4' : ''}`}
                />
                {item.label}
              </button>
            ))}
          </ul>

          <div className='border border-gray-300 border-t-[0.0000001rem] mt-[1rem] mb-[1rem]'></div>

          <div className='mt-[10rem]'>
            <ul className='flex flex-col gap-4 text-zinc-500 mx-auto w-[90%] mt-[1rem]'>
              <button className='flex items-center font-semibold gap-4'>
                <Image src='/images/settings.svg' alt='Settings icon' height={30} width={15} />
                Settings
              </button>
              <button className='flex items-center font-semibold gap-4'>
                <Image src='/images/signout.svg' alt='Sign Out icon' height={30} width={15} />
                Sign Out
              </button>
            </ul>
          </div>
        </div>
      )}

      <div className={`ml-auto flex items-center justify-center h-[100vh] w-[${width}]`}>
        <div className='h-[95%] w-full'>{renderContent()}</div>
      </div>
    </div>
  );
};

export default Home;
