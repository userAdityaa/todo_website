import React, { useEffect, useState } from 'react';
import { Public_Sans } from 'next/font/google';
import TaskManager from '../components/TaskManager';
import axios from 'axios';
import { DateSelectionModal } from '../components';
import { List, Todo } from '../home/page';
import { format } from 'date-fns';

const public_sans = Public_Sans({
  subsets: ['latin'],
  weight: '400',
});

interface TaskProps {
  task: Todo[];
}

const UpcomingTask = () => {
  const [userTask, setUserTask] = useState("");
  const [list, setList] = useState<Todo[]>([]);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [listDetails, setListDetails] = useState<Map<string, List>>(new Map());

  const getUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get("https://backend-minimal.vercel.app/auth/user", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      let todos: Todo[] = [];
      if(response.data.todos != null) {
        todos = response.data.todos.map((todo: Todo) => ({
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
          axios.get(`https://backend-minimal.vercel.app/lists/${listId}`, {
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

  const createTodo = async (todoData: Todo) => {
    try {
      const authToken = localStorage.getItem('authToken');
  
      if (!authToken) {
        console.error("Auth token not found in localStorage");
        return null;
      }

      const formattedTodoData = {
        ...todoData,
        due_date: todoData.due_date
      };
  
      const config = {
        headers: {
          'Authorization': `Bearer ${authToken}`, 
          'Content-Type': 'application/json',     
        },
      };
  
      const response = await axios.post('https://backend-minimal.vercel.app/create-todo', formattedTodoData, config);
      return response.data;
    } catch (error) {
      console.error("Error creating a new task", error);
      return null;
    }
  };

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

  const handleAddTask = async (category: "today" | "tomorrow" | "thisWeek") => {
    const now = new Date();
    let dueDate: Date;
  
    if (category === "today") {
      dueDate = new Date(now);
    } else if (category === "tomorrow") {
      dueDate = new Date(now);
      dueDate.setDate(now.getDate() + 1);
    } else {
      dueDate = new Date(now);
      const todayDayIndex = now.getDay();
      const daysUntilSaturday = 6 - todayDayIndex;
      dueDate.setDate(now.getDate() + daysUntilSaturday);
    }
  
    dueDate.setHours(23, 59, 0, 0);
  
    const formattedDueDate = format(dueDate, 'yyyy-MM-dd hh:mm a');
  
    const newTask = {
      id: '',
      name: newTaskName,
      description: "",
      list: "",
      due_date: formattedDueDate,
      sub_task: [],
    };
  
    const createdTask = await createTodo(newTask);
    
    if (createdTask) {
      setList(prevList => [...prevList, createdTask]);
    }
  
    setUserTask("");
    setNewTaskName("");
    setModalOpen(false);
  };

  const fetchTasks = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.error("Auth token not found in localStorage");
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      };

      const response = await axios.get('https://backend-minimal.vercel.app/all-todo', config);
      if(response.data === null){
        const sortedTasks = response.data.sort((a: Todo, b: Todo) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        );
        setList(sortedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [list]); 

  const filterTasksByDate = (tasks: Todo[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return {
      today: tasks.filter(task => {
        const taskDate = new Date(task.due_date);
        return taskDate >= today && taskDate < tomorrow;
      }),
      tomorrow: tasks.filter(task => {
        const taskDate = new Date(task.due_date);
        return taskDate >= tomorrow && taskDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
      }),
      thisWeek: tasks.filter(task => {
        const taskDate = new Date(task.due_date);
        return taskDate > tomorrow && taskDate <= weekEnd;
      })
    };
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && userTask.trim()) {
      e.preventDefault();
      setNewTaskName(userTask);
      setModalOpen(true);
    }
  };

  const handleTaskClick = (clickedTask: Todo) => {
    setSelectedTask(clickedTask);
  };

  const handleCloseTaskManager = async () => {
    setSelectedTask(null);
    await getUserData();
  };

  const TaskItem = ({ task }: { task: Todo }) => {
    return (
      <li className="flex flex-col border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
        <div className="flex items-start gap-3">
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg truncate">{task.name}</span>
              <span className="text-sm text-gray-500">
                {formatTime(task.due_date)}
              </span>
              {task.list && (
                <span className={`text-xs px-2 py-1 rounded-md ${getListColor(task.list)}`}>
                  {getListName(task.list)}
                </span>
              )}
            </div>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1 truncate">{task.description}</p>
            )}
            {task.sub_task && task.sub_task.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                <img src="/images/todo.svg" alt="Subtasks" className="w-4 h-4" />
                {task.sub_task.length} subtask{task.sub_task.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
          <img
            src="/images/arrow_right.svg"
            alt="More details"
            className="w-4 h-4 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              handleTaskClick(task);
            }}
          />
        </div>
      </li>
    );
  };

  const TaskList = ({ tasks }: { tasks: Todo[] }) => (
    <ul className="space-y-4">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </ul>
  );

  const { today, tomorrow, thisWeek } = filterTasksByDate(list);

  return (
    <div className={`flex flex-col text-black ${public_sans.className} px-2 ${selectedTask ? 'w-2/3' : 'w-full'} h-screen`}>
      <h1 className="font-bold text-[40px]">Upcoming</h1>
      
      <div className="flex items-center border border-gray-300 px-2 py-1 mt-[1.5rem] rounded-lg">
        <img
          src="/images/plus_sign.svg"
          alt="Add task"
          className="w-4 h-4 mr-2 cursor-pointer"
          onClick={() => setModalOpen(true)}
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

      <DateSelectionModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddTask}
      />

      <div className="mt-4 overflow-y-auto flex-1">
        {today.length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold text-xl mb-4">Today</h2>
            <TaskList tasks={today} />
          </div>
        )}
        {tomorrow.length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold text-xl mb-4">Tomorrow</h2>
            <TaskList tasks={tomorrow} />
          </div>
        )}
        {thisWeek.length > 0 && (
          <div className="mb-8">
            <h2 className="font-semibold text-xl mb-4">This Week</h2>
            <TaskList tasks={thisWeek} />
          </div>
        )}
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

export default UpcomingTask;