import React, { useEffect, useState } from 'react';
import { Public_Sans } from 'next/font/google';
import TaskManager from '../components/TaskManager';
import axios from 'axios';

const public_sans = Public_Sans({
  subsets: ['latin'],
  weight: '400',
});

interface Task {
  id: string;
  name: string;
  description: string;
  list: string;
  due_date: string;
  sub_task: string[];
  completed?: boolean;
}

const TodayPage = () => {
  const [userTask, setUserTask] = useState("");
  const [list, setList] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<{ id: string; name: string } | null>(null);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:8000/all-todo');
      setList(response.data.map((task: Task) => ({
        ...task,
        completed: false
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
        
        await fetchTasks();
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
    fetchTasks(); 
  };

  const getListColor = (listName: string) => {
    switch (listName.toLowerCase()) {
      case 'personal':
        return 'bg-red-200';
      case 'work':
        return 'bg-blue-200';
      default:
        return 'bg-yellow-200';
    }
  };

  const formatDueDate = (date: string) => {
    switch (date.toLowerCase()) {
      case 'today':
        return 'Today';
      case 'tomorrow':
        return 'Tomorrow';
      case 'next_week':
        return 'Next Week';
      default:
        return date;
    }
  };

  return (
    <div className={`flex flex-col text-black ${public_sans.className} px-2 ${selectedTask ? 'w-2/3' : 'w-full'} h-screen`}>
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
      
      <div className="mt-4 overflow-y-auto flex-1">
        <ul className="space-y-4 last:py-10">
          {list.map((item, index) => (
            <li
              key={index}
              className="flex flex-col border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex items-start gap-3">
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleTaskCompletion(index)}
                    className="cursor-pointer h-5 w-5"
                  />
                </div>
                
                <div className="flex-grow min-w-0"> {/* Added min-w-0 to enable text truncation */}
                  <div className="flex items-center gap-2">
                    <span className={`text-lg truncate ${item.completed ? "line-through text-gray-500" : ""}`}>
                      {item.name}
                    </span>
                    {item.list && (
                      <span className={`text-xs px-2 py-1 rounded-md ${getListColor(item.list)}`}>
                        {item.list}
                      </span>
                    )}
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-2">
                    {item.due_date && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <img
                          src="/images/calendar.svg"
                          alt="Due date"
                          className="w-4 h-4"
                        />
                        {formatDueDate(item.due_date)}
                      </div>
                    )}
                    
                    {item.sub_task && item.sub_task.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <img
                          src="/images/todo.svg"
                          alt="Subtasks"
                          className="w-4 h-4"
                        />
                        {item.sub_task.length} subtask{item.sub_task.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
                
                <img
                  src="/images/arrow_right.svg"
                  alt="More details"
                  className="w-4 h-4 cursor-pointer"
                  onClick={() => handleTaskClick({ id: item.id, name: item.name })}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {selectedTask && (
        <TaskManager 
          taskName={selectedTask.name} 
          onClose={handleCloseTaskManager} 
          taskId={selectedTask.id} 
        />
      )}
    </div>
  );
};

export default TodayPage;