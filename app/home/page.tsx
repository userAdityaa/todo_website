'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { TodayPage, UpcomingTask } from '../pages';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState('Today');

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'Upcoming':
        return <UpcomingTask />;
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

  const menuItems = [
    { label: 'Upcoming', icon: '/images/upcoming.svg' },
    { label: 'Today', icon: '/images/todo.svg' },
    { label: 'Calendar', icon: '/images/calendar.svg' },
    { label: 'Sticky Notes', icon: '/images/notes.svg' },
  ];

  return (
    <div className='bg-white h-screen w-screen flex overflow-hidden'>
      <button 
        className={`
          absolute z-50 transition-all duration-300
          ${isMenuOpen ? 'top-9 left-[20vw]' : 'top-5 left-5'}
        `}
        onClick={handleMenuToggle}
      >
        <Image 
          src='/images/ham_menu.svg' 
          alt='Menu' 
          height={30} 
          width={24} 
          className={`transform transition-transform duration-300 ${isMenuOpen ? '' : ''}`}
        />
      </button>

      <div 
        className={`
          fixed left-0 top-0 h-screen bg-gray-100
          transition-all duration-300 ease-in-out
          ${isMenuOpen ? 'w-[22vw] opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-full'}
          rounded-xl mt-5 ml-5
        `}
      >
        {isMenuOpen && (
          <>
            <div className='flex items-center w-[90%] mx-auto mt-2'>
              <p className='text-zinc-700 text-[26px] font-bold'>Menu</p>
            </div>

            <div className='w-[90%] mx-auto mt-4 text-black'>
              <input
                type='text'
                placeholder='Search...'
                className='w-full p-2 border border-gray-300 rounded-md'
              />
            </div>

            <p className='text-zinc-700 text-[15px] mt-4 w-[90%] mx-auto font-bold'>Tasks</p>

            <ul className='flex flex-col gap-2 text-zinc-500 mx-auto w-[90%] mt-4'>
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

            <div className='border border-gray-300 border-t-[0.0000001rem] mt-4 mb-4'></div>

            <div className='mt-40'>
              <ul className='flex flex-col gap-4 text-zinc-500 mx-auto w-[90%] mt-4'>
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
          </>
        )}
      </div>

      <div 
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isMenuOpen ? 'ml-[24vw]' : 'ml-[4vw]'}
          p-5
        `}
      >
        <div className='h-[95%] w-full'>{renderContent()}</div>
      </div>
    </div>
  );
};

export default Home;