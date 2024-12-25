import React, { useState } from 'react';
import { Public_Sans } from 'next/font/google';
import TaskManager from '../components/TaskManager';

const public_sans = Public_Sans({
  subsets: ['latin'],
  weight: '400',
});

const TodayPage = () => {
  const [userTask, setUserTask] = useState("");
  const [list, setList] = useState<{ task: string; completed: boolean }[]>([]);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const handleAddTask = () => {
    if (userTask.trim()) {
      setList((prevList) => [
        ...prevList,
        { task: userTask.trim(), completed: false },
      ]);
      setUserTask("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTask();
    }
  };

  const toggleTaskCompletion = (index: number) => {
    setList((prevList) =>
      prevList.map((item, i) =>
        i === index ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleTaskClick = (task: string) => {
    setSelectedTask(task);
  };

  const handleCloseTaskManager = () => {
    setSelectedTask(null);
  };

  return (
    <div className={`flex flex-col text-black ${public_sans.className} px-4 ${selectedTask ? 'w-2/3' : 'w-full'}`}>
      <h1 className="font-bold text-[40px]">Today</h1>
      <div className="flex items-center border border-gray-300 px-2 py-1 mt-[1.5rem] rounded-lg">
        <img
          src="/images/plus_sign.svg"
          alt="Add task"
          className="w-4 h-4 mr-2 cursor-pointer"
          onClick={handleAddTask}
        />
        <input
          type="text"
          placeholder="Add new task"
          className="flex-grow outline-none p-2"
          value={userTask}
          onChange={(e) => setUserTask(e.target.value)}
          onKeyDown={handleKeyPress}
        />
      </div>
      <ul className="mt-4">
        {list.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-3 border-b border-gray-300 py-2 hover:cursor-pointer"
            onClick={() => handleTaskClick(item.task)}
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleTaskCompletion(index)}
              className="cursor-pointer"
            />
            <span
              className={`flex-grow ${
                item.completed ? "line-through text-gray-500" : ""
              }`}
            >
              {item.task}
            </span>
            <img
              src="/images/arrow_right.svg"
              alt="More details"
              className="w-4 h-4 cursor-pointer"
            />
          </li>
        ))}
      </ul>

      {selectedTask && (
        <TaskManager taskName={selectedTask} onClose={handleCloseTaskManager} />
      )}
    </div>
  );
};

export default TodayPage;