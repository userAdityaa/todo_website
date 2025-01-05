import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth, isSameDay, addWeeks, subWeeks, addMonths, subMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { EventDialog } from '../components/EventDialog';
import axios from 'axios';

interface Todo {
  id: string;
  name: string;
  description: string;
  list: string;
  due_date: string;
  sub_task: string[];
  completed?: boolean;
}

interface Event {
  id: string;
  title: string;
  startTime: string;
  date: Date;
  backgroundColor?: string;
  description?: string;
  isTodo?: boolean;
}

const getListColor = (list: string): string => {
  const colorMap: { [key: string]: string } = {
    'personal': '#FFE0B2',  // Light Orange
    'work': '#B3E0FF',      // Light Blue
    'shopping': '#E8F5E9',  // Light Green
    'study': '#F3E5F5',     // Light Purple
    'health': '#FFCDD2',    // Light Red
  };
  
  // Generate a consistent color for unknown lists using string hash
  if (!list || !colorMap[list]) {
    let hash = 0;
    for (let i = 0; i < (list || '').length; i++) {
      hash = list.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 90%)`; // Light pastel color
  }
  
  return colorMap[list];
};

const convertTodosToEvents = (todos: Todo[], existingEvents: Event[]): Event[] => {
  return todos.map(todo => {
    const date = parseISO(todo.due_date);
    const startTime = findAvailableTimeSlot(date, existingEvents);
    
    return {
      id: todo.id,
      title: todo.name,
      startTime: startTime,
      date: date,
      backgroundColor: todo.completed ? '#E5F6E5' : getListColor(todo.list),
      description: todo.description,
      isTodo: true, // Add this flag to distinguish todos from regular events
    };
  });
};

const findAvailableTimeSlot = (date: Date, events: Event[]): string => {
  const occupiedSlots = events
    .filter(event => isSameDay(event.date, date))
    .map(event => {
      const hour = parseInt(event.startTime.split(':')[0]);
      const isPM = event.startTime.includes('PM');
      return isPM && hour !== 12 ? hour + 12 : hour;
    });

  for (let hour = 9; hour <= 17; hour++) {
    if (!occupiedSlots.includes(hour)) {
      return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
    }
  }
  
  for (let hour = 0; hour < 24; hour++) {
    if (!occupiedSlots.includes(hour)) {
      return `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
    }
  }
  
  return '9:00 AM'; 
};

const TimeColumn = () => {
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:00 ${ampm}`;
  });

  return (
    <div className="w-20 flex-none mt-[4.5rem]">
      {timeSlots.map((time) => (
        <div key={time} className="h-16 text-right pr-4">
          <span className="text-sm font-medium text-gray-700">{time}</span>
        </div>
      ))}
    </div>
  );
};

const DayView = ({ date, events }: { date: Date; events: Event[] }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Filter events for the current day only
  const dayEvents = events.filter(event => isSameDay(date, event.date));

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    return `${totalMinutes * (68.5/60)}px`;
  };

  return (
    <div className="flex flex-1 min-h-[960px]">
      <TimeColumn />
      <div className="flex-1 relative">
        {isSameDay(date, new Date()) && (
          <div
            className="absolute left-0 right-0 border-t-2 border-black z-10"
            style={{ top: getCurrentTimePosition() }}
          >
            <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-black" />
          </div>
        )}
        {dayEvents.map((event) => (
          <div
            key={event.id}
            className={`absolute left-4 right-4 p-2 rounded-lg ${event.backgroundColor || 'bg-blue-50'}`}
            style={{
              top: `${(parseInt(event.startTime.split(':')[0]) + (event.startTime.includes('PM') && event.startTime.split(':')[0] !== '12' ? 12 : 0)) * 64}px`,
              height: '64px'
            }}
          >
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">{event.title}</span>
              {/* {event.isTodo && (
                <span className="text-xs text-gray-600">
                  {event.description?.substring(0, 30)}
                  {event.description!.length > 30 ? '...' : ''}
                </span>
              )} */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WeekView: React.FC<{ currentDate: Date; events: Event[] }> = ({ currentDate, events }) => {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i)); // Monday to Sunday
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12.toString().padStart(2, '0')}:00 ${ampm}`;
  });

  const getEventStyles = (event: Event) => {
    const hour = parseInt(event.startTime.split(':')[0]);
    const isPM = event.startTime.includes('PM');
    const hour24 = isPM && hour !== 12 ? hour + 12 : hour;
    const topPosition = hour24 * 64; 

    return {
      top: `${topPosition}px`,
      backgroundColor: event.backgroundColor || '#E5F6F6',
      height: '64px', 
    };
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b sticky top-0 bg-white z-10">
        <div className="w-20 flex-shrink-0" /> {/* Time column spacer */}
        {days.map((day) => (
          <div key={day.toISOString()} className="flex-1 py-4 px-2">
            <div className="text-sm font-semibold text-gray-500">
              {format(day, 'EEE').toUpperCase()}
            </div>
            <div className="text-2xl font-bold mt-1">
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-1 overflow-y-auto">
        <div className="w-20 flex-shrink-0 border-r bg-white sticky left-0">
          {timeSlots.map((time) => (
            <div key={time} className="h-16 flex items-center justify-end pr-4">
              <span className="text-sm text-gray-500">{time}</span>
            </div>
          ))}
        </div>

        {days.map((day) => (
          <div key={day.toISOString()} className="flex-1 border-r relative min-w-[120px]">
            {timeSlots.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-16 ${idx === 0 ? '' : 'border-t border-gray-200'}`}
              />
            ))}

            {events
              .filter(event => isSameDay(day, event.date))
              .map(event => (
                <div
                  key={event.id}
                  className="absolute left-1 right-1 p-2 rounded-lg shadow-sm"
                  style={getEventStyles(event)}
                >
                  <div className="text-sm font-medium">{event.title}</div>
                  {/* {event.isTodo && (
                    <div className="text-xs text-gray-600 truncate">
                      {event.description?.substring(0, 20)}
                      {event.description?.length > 20 ? '...' : ''}
                    </div>
                  )} */}
                </div>
              ))}

          </div>
        ))}
      </div>
    </div>
  );
};



const MonthView: React.FC<{ currentDate: Date; events: Event[] }> = ({ currentDate, events }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  
  const weeks = [];
  let week = [];
  let day = startDate;

  while (week.length < 7 || day <= monthEnd) {
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    week.push(day);
    day = addDays(day, 1);
  }
  if (week.length > 0) {
    weeks.push(week);
  }

  return (
    <div className="flex-1 grid grid-cols-7 gap-px bg-gray-200">
      {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
        <div key={day} className="bg-white p-2 text-sm font-medium text-center">
          {day}
        </div>
      ))}
      {weeks.flat().map((day, idx) => (
        <div
          key={idx}
          className={`bg-white min-h-[100px] p-2 ${
            !isSameMonth(day, currentDate) ? 'text-gray-400' : ''
          }`}
        >
          <div className="font-medium text-sm">{format(day, 'd')}</div>
          <div className="space-y-1 mt-1">
          {events
          .filter(event => isSameDay(day, event.date))
          .map(event => (
            <div
              key={event.id}
              className={`${event.backgroundColor || 'bg-blue-50'} p-1 rounded text-xs truncate`}
            >
              {event.startTime} {event.title}
              {/* {event.isTodo && (
                // <div className="text-xs text-gray-600 truncate">
                //   {event.description?.substring(0, 15)}
                //   {event.description?.length > 15 ? '...' : ''}
                // </div>
              )} */}
            </div>
          ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [isEventDialogOpen, setIsEventDialogOpen] = useState<boolean>(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get("http://localhost:8000/auth/user", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        if (response.data.todos != null) {
          const newTodos = response.data.todos.map((todo: Todo) => ({
            ...todo,
            completed: false,
          }));
          setTodos(newTodos);
          
          // Convert todos to events and merge with existing events
          const todoEvents = convertTodosToEvents(newTodos, events);
          setEvents(prevEvents => [...prevEvents, ...todoEvents]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();
  }, []);

  const handleSaveEvent = (eventData: Event) => {
    setEvents(prevEvents => [...prevEvents, eventData]);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (view === 'Day') {
      setCurrentDate(prev => direction === 'prev' ? addDays(prev, -1) : addDays(prev, 1));
    } else if (view === 'Week') {
      setCurrentDate(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
    } else {
      setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
    }
  };

  const getHeaderText = () => {
    if (view === 'Day') return format(currentDate, 'dd MMMM yyyy');
    if (view === 'Week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = addDays(start, 6);
      return `${format(start, 'dd')}-${format(end, 'dd MMMM yyyy')}`;
    }
    return format(currentDate, 'MMMM yyyy');
  };

  return (
    <div className="h-screen flex flex-col w-full mx-auto p-4">
      <div className="flex-none">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {getHeaderText()}
          </h1>
          <button className="px-4 py-2 bg-white rounded-lg border shadow-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => setIsEventDialogOpen(true)}>
            <Plus size={20} className='rounded-xl'/>
            <span className="font-medium text-gray-500">Add Event</span>
          </button>
        </div>

        <EventDialog 
          isOpen={isEventDialogOpen}
          onClose={() => setIsEventDialogOpen(false)}
          onSave={handleSaveEvent}
          selectedDate={currentDate}
        />

        <div className="flex items-center gap-4 mb-8">
          <div className="flex rounded-lg overflow-hidden bg-gray-100">
            {['Day', 'Week', 'Month'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v as typeof view)}
                className={`px-4 py-2 font-medium ${
                  view === v ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          {view === 'Day' && <DayView date={currentDate} events={events} />}
          {view === 'Week' && <WeekView currentDate={currentDate} events={events} />}
          {view === 'Month' && <MonthView currentDate={currentDate} events={events} />}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;