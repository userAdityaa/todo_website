import React, { useEffect, useState } from 'react';
import { Public_Sans } from 'next/font/google';
import TaskManager from '../components/TaskManager';
import axios from 'axios';
import { List, Todo } from '../home/page';

const public_sans = Public_Sans({
  subsets: ['latin'],
  weight: '400',
});


const TodayPage = () => {
  const [userTask, setUserTask] = useState<string>("");
  const [list, setList] = useState<Todo[]>([]);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [listDetails, setListDetails] = useState<Map<string, List>>(new Map());

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
  
      let todos: Todo[] = [];
      if (response.data.todos != null) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
  
        todos = response.data.todos
          .filter((todo: Todo) => {
            const dueDate = new Date(todo.due_date);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === today.getTime();
          })
          .map((todo: Todo) => ({
            ...todo,
            completed: false,
          }));
  
        setList(todos);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    const fetchListDetails = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const uniqueListIds = Array.from(new Set(list.map(item => item.list).filter(Boolean)));
        
        const listDetailsPromises = uniqueListIds.map(listId =>
          axios.get(`http://localhost:8000/lists/${listId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        );

        const responses = await Promise.all(listDetailsPromises);
        const newListDetails = new Map();
        
        responses.forEach((response, index) => {
          const listData = response.data;
          newListDetails.set(uniqueListIds[index], {
            id: listData.id,
            name: listData.name,
            color: listData.color
          });
        });

        setListDetails(newListDetails);
      } catch (error) {
        console.error("Error fetching list details:", error);
      }
    };

    if (list.length > 0) {
      fetchListDetails();
    }
  }, [list]);

  const getListName = (listId: string) => {
    return listDetails.get(listId)?.name || 'Unknown List';
  };

  const getListColor = (listId: string) => {
    const listColor = listDetails.get(listId)?.color;
    if (listColor) {
      return listColor; 
    }
    return 'bg-gray-200'; 
  };

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
      const taskToRemove = list[index];
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`http://localhost:8000/delete-todo/${taskToRemove.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
    
        const updatedList = list.filter((_, i) => i !== index);
        setList(updatedList);
      } catch (error) {
        console.error("Error removing task:", error);
      }
  };

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
    getUserData();
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
                        {getListName(item.list)}
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