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

const UpcomingTask = () => {
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

  const getTasksByDate = (dateType: 'today' | 'tomorrow' | 'this_week') => {
    return list.filter(task => task.due_date.toLowerCase() === dateType);
  };

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

  const toggleTaskCompletion = (taskId: string) => {
    setList((prevList) =>
      prevList.map((item) =>
        item.id === taskId ? { ...item, completed: !item.completed } : item
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

  const TaskSection = ({ title, tasks }: { title: string; tasks: Task[] }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="flex items-center border border-gray-300 px-2 py-1 mb-4 rounded-lg">
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
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-start gap-3 border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
          >
            <div className="pt-1">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTaskCompletion(task.id)}
                className="cursor-pointer h-5 w-5"
              />
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-lg truncate ${task.completed ? "line-through text-gray-500" : ""}`}>
                  {task.name}
                </span>
                {task.list && (
                  <span className={`text-xs px-2 py-1 rounded-md ${getListColor(task.list)}`}>
                    {task.list}
                  </span>
                )}
              </div>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-2">
                {task.sub_task && task.sub_task.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <img
                      src="/images/todo.svg"
                      alt="Subtasks"
                      className="w-4 h-4"
                    />
                    {task.sub_task.length} subtask{task.sub_task.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
            <img
              src="/images/arrow_right.svg"
              alt="More details"
              className="w-4 h-4 cursor-pointer"
              onClick={() => handleTaskClick({ id: task.id, name: task.name })}
            />
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className={`flex flex-col text-black ${public_sans.className} px-2 ${selectedTask ? 'w-2/3' : 'w-full'} h-screen overflow-hidden`}>
      <h1 className="font-bold text-[40px] mb-6">Upcoming</h1>
      
      <div className="overflow-y-auto flex-1">
        <TaskSection title="Today" tasks={getTasksByDate('today')} />
        <TaskSection title="Tomorrow" tasks={getTasksByDate('tomorrow')} />
        <TaskSection title="This Week" tasks={getTasksByDate('this_week')} />
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

export default UpcomingTask;