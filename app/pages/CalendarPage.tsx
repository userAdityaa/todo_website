import React, { useEffect, useState } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth, isSameDay, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { EventDialog } from '../components/EventDialog';

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: Date;
  backgroundColor: string;
}

interface BackendEvent {
  id: string;
  title: string;
  date: string;
  color: string;
  start: string;
  end: string;
}

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  refetchEvents: () => Promise<void>;
}

const useEvents = (): UseEventsReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/all-event', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if(!response.ok) return;

      const data = await response.json();
      
      if (!data || typeof data === 'string' || 'message' in data) {
        setEvents([]);
        return;
      }

      const eventsArray = Array.isArray(data) ? data : [];
      
      const transformedEvents: Event[] = eventsArray.map((event: BackendEvent) => ({
        id: event.id,
        title: event.title,
        date: new Date(event.date),
        backgroundColor: event.color,
        startTime: format(new Date(event.start), 'hh:mm a'),
        endTime: format(new Date(event.end), 'hh:mm a'),
        description: '',
      }));

      setEvents(transformedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setEvents([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, error, refetchEvents: fetchEvents };
};

interface TimeColumnProps {}

interface DayViewProps {
  date: Date;
  events: Event[];
}

interface WeekViewProps {
  currentDate: Date;
  events: Event[];
}

interface MonthViewProps {
  currentDate: Date;
  events: Event[];
}

const TimeColumn: React.FC<TimeColumnProps> = () => {
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:00 ${ampm}`;
  });

  return (
    <div className="w-20 flex-none mt-[1rem]">
      {timeSlots.map((time) => (
        <div key={time} className="h-16 text-right pr-4">
          <span className="text-sm font-medium text-gray-700">{time}</span>
        </div>
      ))}
    </div>
  );
};

const DayView: React.FC<DayViewProps> = ({ date, events }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const dayEvents = events.filter(event => isSameDay(date, event.date));

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    return `${totalMinutes * (65/60)}px`;
  };

  const convertTo24Hour = (timeStr: string): number => {
    const [rawTime, period] = timeStr.trim().split(' ');
    let [hours, minutes] = rawTime.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours = hours + 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours + (minutes / 60);
  };

  const getEventPosition = (timeStr: string): number => {
    const hours24 = convertTo24Hour(timeStr);
    return hours24 * 64; 
  };

  const getEventHeight = (startTime: string, endTime: string): number => {
    const startHours = convertTo24Hour(startTime);
    const endHours = convertTo24Hour(endTime);
    return Math.max((endHours - startHours) * 64, 32);
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
        {dayEvents.map((event) => {
          const topPosition = getEventPosition(event.startTime);
          const height = getEventHeight(event.startTime, event.endTime);
          const isShortEvent = height <= 40; 
          
          return (
            <div
              key={event.id}
              className={`absolute left-4 right-4 p-2 rounded-lg ${event.backgroundColor || 'bg-blue-50'}`}
              style={{
                top: `${topPosition + 25}px`,
                height: `${height}px`,
                minHeight: '32px',
                overflow: 'hidden'
              }}
            >
              <div className="flex flex-col h-full">
                
                {isShortEvent ? (
                  <div className="text-sm text-gray-800 truncate">
                    {event.title}
                  </div>
                ) : (
                  <>
                  <div className="font-medium text-gray-800 truncate">
                    {event.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {event.startTime} - {event.endTime}
                  </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WeekView: React.FC<WeekViewProps> = ({ currentDate, events }) => {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12.toString().padStart(2, '0')}:00 ${ampm}`;
  });

  const convertTo24Hour = (timeStr: string): number => {
    const [rawTime, period] = timeStr.trim().split(' ');
    let [hours, minutes] = rawTime.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours = hours + 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours + (minutes / 60);
  };

  const getEventStyles = (event: Event) => {
    const startHour = convertTo24Hour(event.startTime);
    const endHour = convertTo24Hour(event.endTime);
    const duration = endHour - startHour;
    const height = Math.max(duration * 64, 32); 
    
    return {
      top: `${startHour * 64}px`,
      height: `${height}px`,
      backgroundColor: event.backgroundColor,
    };
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b sticky top-0 bg-white z-10">
        <div className="w-20 flex-shrink-0" />
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
                className={`h-16 border-t border-gray-200 ${
                  idx === timeSlots.length - 1 ? 'border-b' : ''
                }`}
              />
            ))}

            {events
              .filter(event => isSameDay(day, event.date))
              .map(event => {
                const startHour = convertTo24Hour(event.startTime);
                const endHour = convertTo24Hour(event.endTime);
                const duration = endHour - startHour;
                const isShortEvent = duration < 1;

                return (
                  <div
                    key={event.id}
                    className={`absolute left-1 right-1 p-2 rounded-lg shadow-sm overflow-hidden ${event.backgroundColor}`}
                    style={getEventStyles(event)}
                  >
                    <div className="text-sm font-medium truncate">{event.title}</div>
                    {!isShortEvent && (
                      <div className="text-xs truncate">
                        {event.startTime} - {event.endTime}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
};

const MonthView: React.FC<MonthViewProps> = ({ currentDate, events }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  
  // Debug log to check incoming events
  console.log('Incoming events:', events);
  
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

  const processedEventIds = new Set<string>();

  return (
    <div className="flex-1 grid grid-cols-7 gap-px bg-gray-200">
      {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
        <div key={day} className="bg-white p-2 text-sm font-medium text-center">
          {day}
        </div>
      ))}
      {weeks.flat().map((day, idx) => {
        processedEventIds.clear();
        
        const dayEvents = events.filter(event => {
          if (isSameDay(day, event.date) && !processedEventIds.has(event.id)) {
            processedEventIds.add(event.id);
            return true;
          }
          return false;
        });

        return (
          <div
            key={idx}
            className={`bg-white min-h-[100px] p-2 ${
              !isSameMonth(day, currentDate) ? 'text-gray-400' : ''
            }`}
          >
            <div className="font-medium text-sm">{format(day, 'd')}</div>
            <div className="space-y-1 mt-1">
              {dayEvents
                .reduce((unique: Event[], event) => {
                  const hasTimeSlot = unique.some(
                    existingEvent => 
                      existingEvent.startTime === event.startTime &&
                      existingEvent.endTime === event.endTime
                  );
                  
                  if (!hasTimeSlot) {
                    unique.push(event);
                  }
                  
                  return unique;
                }, [])
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
        );
      })}
    </div>
  );
};

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [isEventDialogOpen, setIsEventDialogOpen] = useState<boolean>(false);
  const { events, loading, error, refetchEvents } = useEvents();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl font-medium text-gray-600">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl font-medium text-red-600">Error: {error}</div>
      </div>
    );
  }

  const handleSaveEvent = async (eventData: Event) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch('http://localhost:8000/create-event', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: eventData.title,
          date: eventData.date.toISOString(),
          color: eventData.backgroundColor,
          start: new Date(`${format(eventData.date, 'yyyy-MM-dd')} ${eventData.startTime}`).toISOString(),
          end: new Date(`${format(eventData.date, 'yyyy-MM-dd')} ${eventData.endTime}`).toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await refetchEvents();
    } catch (err) {
      console.error('Error saving event:', err);
    }
  };

  const getEventStyles = (event: Event) => {
    const getHoursFromTimeString = (timeStr: string): number => {
      const [time, period] = timeStr.split(' ');
      let [hours] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours;
    };

    const startHour = getHoursFromTimeString(event.startTime);
    const endHour = getHoursFromTimeString(event.endTime);
    const duration = endHour - startHour || 1; 
    
    return {
      top: `${startHour * 64}px`,
      height: `${duration * 64}px`,
      backgroundColor: event.backgroundColor || '#E5F6F6',
    };
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl font-medium text-gray-600">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-xl font-medium text-red-600">Error: {error}</div>
      </div>
    );
  }

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
          existingEvents={events}
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