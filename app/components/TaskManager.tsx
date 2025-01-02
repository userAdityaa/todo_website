import React, { useState } from 'react';
import { Public_Sans } from 'next/font/google';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';

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

interface TaskManagerProps {
  todo: Todo;
  onClose: () => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ todo, onClose }) => {
  const [description, setDescription] = useState(todo.description);
  const [selectedList, setSelectedList] = useState(todo.list);
  const [dueDate, setDueDate] = useState(todo.due_date.split('T')[0] || '');
  const [dueTime, setDueTime] = useState(todo.due_date.split('T')[1] || '');
  const [subtasks, setSubtasks] = useState<string[]>(todo.sub_task);
  const router = useRouter();

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const combinedDateTime = dueDate && dueTime 
        ? `${dueDate}T${dueTime}` 
        : '';

      await axios.put(`http://localhost:8000/update-todo/${todo.id}`, {
        name: todo.name,
        description,
        list: selectedList,
        due_date: combinedDateTime,
        sub_task: subtasks,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleSubtaskChange = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = value;
    setSubtasks(newSubtasks);
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, '']);
  };

  const handleDeleteTask = async () => {
    const token = localStorage.getItem('authToken');
    try {
      await axios.delete(`http://localhost:8000/delete-todo/${todo.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      onClose();
      router.push("/home");
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className={`absolute right-5 bg-zinc-100 rounded-xl h-[95vh] w-[40vh] flex flex-col ${public_sans.className}`}>
      <div className='flex flex-col p-4 h-full'>
        <div className='flex items-center justify-between'>
          <h1 className='font-bold text-[25px]'>Task:</h1>
          <Image
            src='/images/cross_button.svg'
            alt='cross button icon'
            width={18}
            height={20}
            onClick={onClose}
            className='cursor-pointer'
          />
        </div>

        <div className='flex-1 overflow-y-auto'>
          <input
            type="text"
            value={todo.name}
            className="mt-2 p-2 border rounded-lg w-full"
            readOnly
          />
          
          <textarea
            placeholder="Write description here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-4 p-2 border rounded-lg h-32 w-full"
          />

          <div className='flex items-center mt-4'>
            <label className='mr-2'>List:</label>
            <select
              value={selectedList}
              onChange={(e) => setSelectedList(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="">Select a list</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="shopping">Shopping</option>
            </select>
          </div>

          <div className='flex flex-col gap-2 mt-4'>
            <label>Due Date & Time:</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="p-2 border rounded-lg"
            />
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="p-2 border rounded-lg"
            />
          </div>

          <div className='mt-4'>
            <h2 className='font-bold text-[20px]'>Subtasks:</h2>
            {subtasks.map((subtask, index) => (
              <input
                key={index}
                type="text"
                value={subtask}
                onChange={(e) => handleSubtaskChange(index, e.target.value)}
                placeholder={`Subtask ${index + 1}`}
                className="mt-2 p-2 border rounded-lg w-full focus:outline-none"
              />
            ))}
            <button
              onClick={addSubtask}
              className="mt-2 p-2 bg-blue-500 text-white rounded-lg"
            >
              Add Subtask
            </button>
          </div>
        </div>
        
        <div className='flex justify-between mt-4 pt-4 border-t border-gray-200'>
          <button
            onClick={handleDeleteTask}
            className="p-2 px-6 bg-red-500 text-white rounded-lg"
          >
            Delete Task
          </button>
          <button
            onClick={handleSaveChanges}
            className="p-2 px-6 bg-green-500 text-white rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskManager;