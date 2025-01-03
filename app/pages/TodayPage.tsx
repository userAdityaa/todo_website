import React, { useEffect, useState } from 'react';
import { Public_Sans } from 'next/font/google';
import TaskManager from '../components/TaskManager';
import axios from 'axios';

const public_sans = Public_Sans({
  subsets: ['latin'],
  weight: '400',
});

interface Todo {
  id: string;
  name: string;
  description: string;
  list: string;
  due_date: string;
  sub_task: string[];
  completed?: boolean;
}

interface TaskProps { 
  task: Todo[];
}

const TodayPage = ({task}: TaskProps) => {
  const [userTask, setUserTask] = useState("");
  const [list, setList] = useState<Todo[]>([]);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);

  const getEndOfDay = () => {
    const today = new Date();
    today.setHours(23, 59, 0, 0);  
  
    const hours = today.getHours();
    const minutes = today.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;  
    const minuteStr = minutes < 10 ? `0${minutes}` : minutes;
  
    const timeString = `${hour12}:${minuteStr} ${ampm}`;
    return `${today.toISOString().slice(0, 10)} ${timeString}`;
  };
  const toggleTaskCompletion = async (index: number) => {
    const updatedList = list.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    );
    setList(updatedList);

    const task = updatedList[index];
    if (task.completed) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`http://localhost:8000/delete-todo/${task.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  useEffect(() => {
    if (task && Array.isArray(task)) {
      const today = new Date().toISOString().split("T")[0];
      
      const todayTasks = task.filter((item) => {
        const taskDate = new Date(item.due_date).toISOString().split("T")[0]; 
        return taskDate === today;
      });
  
      setList(todayTasks); 
    }
  }, [task]);
  

  const handleAddTask = async () => {
    if (userTask.trim()) {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.post('http://localhost:8000/create-todo', {
          name: userTask.trim(),
          due_date: getEndOfDay(),
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const newTask: Todo = response.data;
        setList([...list, newTask]);
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
  
  const handleTaskClick = (task: Todo) => {
    setSelectedTask(task);
  };

  const handleCloseTaskManager = () => {
    setSelectedTask(null);
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateString;
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
                
                <div className="flex-grow min-w-0"> 
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
                        {formatDate(item.due_date)}
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
                  onClick={() => handleTaskClick(item)}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {selectedTask && (
        <TaskManager 
          todo={selectedTask}
          onClose={handleCloseTaskManager} 
        />
      )}
    </div>
  );
};

export default TodayPage;