'use client'
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { CalendarPage, TodayPage, UpcomingTask } from '../pages';
import StickyWall from '../pages/StickWall';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Cookie from 'js-cookie'
import axios from 'axios';

export interface Todo { 
  id: string; 
  name: string; 
  description: string;
  list: string;
  due_date: string;
  sub_task: string[];
  completed?: boolean;
}

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [list, setList] = useState<Todo[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState('Today');
  const [lists, setLists] = useState([
    { name: 'Personal', color: 'bg-red-300', count: 3 },
    { name: 'Work', color: 'bg-cyan-300', count: 3 },
    { name: 'List 1', color: 'bg-yellow-300', count: 3 }
  ]);
  const [tags, setTags] = useState(['Tag 1', 'Tag 2']);

  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-red-300');
  const [newTag, setNewTag] = useState('');

  const colors = [
    'bg-red-300', 'bg-blue-300', 'bg-green-300', 'bg-yellow-300', 
    'bg-purple-300', 'bg-pink-300', 'bg-indigo-300', 'bg-cyan-300'
  ];

  useEffect(() => { 
    const handleGoogleAuthRedirect = () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
    
      if (token) {
        localStorage.setItem('authToken', token);
      } 
    };
    
    handleGoogleAuthRedirect();

    const getUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get("http://localhost:8000/auth/user", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        if(response.data.todos != null){
          setList(response.data.todos.map((todo: Todo) => ({ 
            ...todo, 
            completed: false,
          })));
        } 
      } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
      }
    };

    getUserData();
  })

  const handleAddList = () => {
    if (newListName.trim()) {
      setLists([...lists, {
        name: newListName,
        color: selectedColor,
        count: 0
      }]);
      setNewListName('');
      setSelectedColor('bg-red-300');
      setIsListDialogOpen(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
      setIsTagDialogOpen(false);
    }
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const renderContent = () => {
    switch (selectedMenuItem) {
      case 'Upcoming':
        return <UpcomingTask task = {list}/>;
      case 'Today':
        return <TodayPage task = {list}/>;
      case 'Calendar':
        return <CalendarPage />;
      case 'Sticky Wall':
        return <StickyWall />;
      default:
        return null;
    }
  };

  const menuItems = [
    { label: 'Upcoming', icon: '/images/upcoming.svg', count: 12 },
    { label: 'Today', icon: '/images/todo.svg', count: 5 },
    { label: 'Calendar', icon: '/images/calendar.svg' },
    { label: 'Sticky Wall', icon: '/images/notes.svg' },
  ];

  return (
    <div className="bg-white h-screen w-screen flex overflow-hidden">
      <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div>
              <label className="block text-sm font-medium mb-1">List Name</label>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter list name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full ${color} ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsListDialogOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddList}
                className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
              >
                Create List
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tag Name</label>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter tag name"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsTagDialogOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTag}
                className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
              >
                Create Tag
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <button 
        className={`absolute z-50 transition-all duration-300 ${
          isMenuOpen ? 'top-9 left-[20vw]' : 'top-5 left-5'
        }`}
        onClick={handleMenuToggle}
      >
        <Image 
          src="/images/ham_menu.svg" 
          alt="Menu" 
          height={30} 
          width={24} 
        />
      </button>

      <div className={`fixed left-0 top-0 h-screen bg-gray-100 transition-all duration-300 ease-in-out
        ${isMenuOpen ? 'w-[22vw] opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-full'}
        rounded-xl mt-5 ml-5`}
      >
        {isMenuOpen && (
          <div className="p-4 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <p className="text-zinc-700 text-2xl font-bold">Menu</p>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 p-2 bg-white border border-gray-200 rounded-lg"
              />
            </div>

            <div className="space-y-6 mb-20">
              <section>
                <h2 className="text-sm font-semibold text-zinc-500 mb-2">TASKS</h2>
                <div className="space-y-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.label}
                      className={`w-full flex items-center justify-between p-2 rounded-lg
                        ${selectedMenuItem === item.label ? 'bg-gray-200' : ''}`}
                      onClick={() => setSelectedMenuItem(item.label)}
                    >
                      <div className="flex items-center gap-3">
                        <Image src={item.icon} alt={`${item.label} icon`} height={20} width={20} />
                        <span className="text-zinc-700">{item.label}</span>
                      </div>
                      {item.count && (
                        <span className="bg-gray-200 px-2 rounded-md text-sm">{item.count}</span>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-zinc-500 mb-2">LISTS</h2>
                <div className="space-y-1">
                  {lists.map((list) => (
                    <button key={list.name} className="w-full flex items-center justify-between p-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${list.color}`} />
                        <span className="text-zinc-700">{list.name}</span>
                      </div>
                      <span className="bg-gray-200 px-2 rounded-md text-sm">{list.count}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setIsListDialogOpen(true)}
                    className="w-full flex items-center gap-3 p-2 text-zinc-500"
                  >
                    <span className="text-xl">+</span>
                    <span>Add New List</span>
                  </button>
                </div>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-zinc-500 mb-2">TAGS</h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-gray-200 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                  <button
                    onClick={() => setIsTagDialogOpen(true)}
                    className="px-3 py-1 bg-gray-200 rounded-full text-sm"
                  >
                    + Add Tag
                  </button>
                </div>
              </section>
            </div>

            <div className="absolute bottom-8 w-[calc(100%-2rem)] space-y-2">
              <button className="w-full flex items-center gap-3 p-2">
                <Image src="/images/settings.svg" alt="Settings icon" height={20} width={20} />
                <span className="text-zinc-700">Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 p-2">
                <Image src="/images/signout.svg" alt="Sign out icon" height={20} width={20} />
                <span className="text-zinc-700">Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={`flex-1 transition-all duration-300 ease-in-out
        ${isMenuOpen ? 'ml-[24vw]' : 'ml-[4vw]'} p-5`}
      >
        <div className="h-[95%] w-full">{renderContent()}</div>
      </div>
    </div>
  );
};


export default Home;