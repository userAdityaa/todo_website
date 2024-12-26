import React, { useEffect, useState } from 'react';
import { Public_Sans } from 'next/font/google';
import TaskManager from '../components/TaskManager';
import axios from 'axios';

const public_sans = Public_Sans({
  subsets: ['latin'],
  weight: '400',
});

const TodayPage = () => {
  const [userTask, setUserTask] = useState("");
  const [list, setList] = useState<{ id: string; name: string; completed: boolean }[]>([]);
  const [selectedTask, setSelectedTask] = useState<{ id: string; name: string } | null>(null);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:8000/all-todo');
      setList(response.data.map((task: any) => ({
        ...task,
        completed: task.completed ?? false, // Ensure completed is always defined
      })));
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (userTask.trim()) {
      try {
        const response = await axios.post('http://localhost:8000/create-todo', {
          name: userTask.trim()
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const newTask = {
          id: response.data.id, 
          name: userTask.trim(), 
          completed: false,
        }
        setList((prevList) => [
          ...prevList,
          newTask,
        ]);
        fetchTasks();
        setUserTask("");
      } catch (error) {
        console.error("Error creating task:", error);
      }
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

  const handleTaskClick = (task: { id: string; name: string }) => {
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
            className="flex items-center gap-3 border-b border-gray-300 py-2"
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleTaskCompletion(index)}
              className="cursor-pointer"
            />
            <span
              className={`flex-grow ${
                item.completed ? "line-through text-gray-500" : "text-gray-500"
              }`}
            >
              {item.name}
            </span>
            <img
              src="/images/arrow_right.svg"
              alt="More details"
              className="w-4 h-4 cursor-pointer"
              onClick={() => handleTaskClick({ id: item.id, name: item.name })}
            />
          </li>
        ))}
      </ul>

      {selectedTask && (
        <TaskManager taskName={selectedTask.name} onClose={handleCloseTaskManager} taskId={selectedTask.id} />
      )}
    </div>
  );
};

export default TodayPage;