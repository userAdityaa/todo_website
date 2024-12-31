import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth, isSameDay, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { EventDialog } from '../components/EventDialog';

interface Event {
  id: string;
  title: string;
  startTime: string;
  date: Date;
  backgroundColor?: string;
}



const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Session 1: Marketing Sprint',
    startTime: '09:00 AM',
    date: new Date(2024, 11, 30),
    backgroundColor: 'bg-blue-50'
  },
  {
    id: '2',
    title: 'Sales Catchup',
    startTime: '10:00 AM',
    date: new Date(2024, 11, 30),
    backgroundColor: 'bg-blue-50'
  },
  {
    id: '3',
    title: "Coaching session",
    startTime: '11:00 AM',
    date: new Date(2024, 11, 30),
    backgroundColor: 'bg-yellow-50'
  }
];

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

const DayView = ({ date, events }: any) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    return `${(totalMinutes / (24 * 60)) * 100}%`;
  };

  return (
    <div className="flex flex-1 min-h-[960px]">
      <TimeColumn />
      <div className="flex-1 relative">
        {isSameDay(date, new Date()) && (
          <div
            className="absolute left-0 right-0 border-t-[0.5px] border-black z-10"
            style={{ top: getCurrentTimePosition() }}
          >
            <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-black" />
          </div>
        )}
        {events.map((event: any) => (
          <div
            key={event.id}
            className={`absolute left-4 right-4 p-2 rounded-lg ${event.backgroundColor || 'bg-blue-50'}`}
            style={{
              top: `${(parseInt(event.startTime.split(':')[0]) + (event.startTime.includes('PM') && event.startTime.split(':')[0] !== '12' ? 12 : 0)) * (16 * 4)}px`,
              height: '64px'
            }}
          >
            <span className="font-medium text-gray-800">{event.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


const WeekView: React.FC<{ currentDate: Date; events: Event[] }> = ({ currentDate, events }) => {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  
  const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 9;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 12 ? 12 : hour % 12;
    return `${hour12}:00 ${ampm}`;
  });

  return (
    <div className="flex flex-1">
      <div className="w-20 flex-none">
        {timeSlots.map((time) => (
          <div key={time} className="h-20 text-right pr-4 text-sm text-gray-500">
            {time}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7">
        {days.map((day) => (
          <div key={format(day, 'yyyy-MM-dd')} className="border-l relative">
            <div className="sticky top-0 z-10 bg-white text-sm font-medium text-center py-2 border-b">
              {format(day, 'EEE').toUpperCase()}
              <div className="text-xs text-gray-500">{format(day, 'd')}</div>
            </div>
            {events
              .filter(event => isSameDay(day, event.date))
              .map(event => {
                const hour = parseInt(event.startTime.split(':')[0]);
                const isPM = event.startTime.includes('PM');
                const hour24 = isPM && hour !== 12 ? hour + 12 : hour;
                const topPosition = (hour24 - 9) * 80;

                return (
                  <div
                    key={event.id}
                    className={`absolute left-1 right-1 p-2 rounded-lg ${event.backgroundColor || 'bg-blue-50'} overflow-hidden`}
                    style={{
                      top: `${topPosition}px`,
                      height: '64px'
                    }}
                  >
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {event.title}
                    </div>
                  </div>
                );
              })}
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
  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [isEventDialogOpen, setIsEventDialogOpen] = useState<boolean>(false);
  const [events, setEvents] = useState<Event[]>(mockEvents);

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
            <Plus size={20} className='bg-gray-400 rounded-xl'/>
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
          {view === 'Week' && <WeekView currentDate={currentDate} events={mockEvents} />}
          {view === 'Month' && <MonthView currentDate={currentDate} events={mockEvents} />}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;