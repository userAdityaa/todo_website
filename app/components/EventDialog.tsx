import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { isAfter, isBefore, isSameDay, parse, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const colorOptions = [
  { value: 'bg-blue-50', label: 'Blue' },
  { value: 'bg-green-50', label: 'Green' },
  { value: 'bg-yellow-50', label: 'Yellow' },
  { value: 'bg-red-50', label: 'Red' },
  { value: 'bg-purple-50', label: 'Purple' }
];

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: EventData) => void;
  selectedDate?: Date;
  existingEvents: EventData[];
}

export interface EventData {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  backgroundColor: string;
}

export const EventDialog: React.FC<EventDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  selectedDate,
  existingEvents 
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    backgroundColor: 'bg-blue-50',
  });

  const validateDateTime = () => {
    // Convert event date and times to Date objects
    const eventDate = parseISO(eventData.date);
    const now = new Date();
    
    const startDateTime = parse(
      `${eventData.date} ${eventData.startTime}`, 
      'yyyy-MM-dd HH:mm', 
      new Date()
    );
    
    const endDateTime = parse(
      `${eventData.date} ${eventData.endTime}`, 
      'yyyy-MM-dd HH:mm', 
      new Date()
    );

    if (isBefore(startDateTime, now)) {
      toast({
        variant: "destructive",
        title: "Invalid Date/Time",
        description: "Cannot create events in the past"
      });
      return false;
    }

    if (isBefore(endDateTime, startDateTime)) {
      toast({
        variant: "destructive",
        title: "Invalid Time Range",
        description: "End time must be after start time"
      });
      return false;
    }

    return true;
  };

  const checkTimeSlotConflict = () => {
    const newEventStart = parse(
      `${eventData.date} ${eventData.startTime}`, 
      'yyyy-MM-dd HH:mm', 
      new Date()
    );
    
    const newEventEnd = parse(
      `${eventData.date} ${eventData.endTime}`, 
      'yyyy-MM-dd HH:mm', 
      new Date()
    );

    const hasConflict = existingEvents.some(event => {
      if (!isSameDay(new Date(event.date), parseISO(eventData.date))) {
        return false;
      }

      const existingStart = parse(
        `${eventData.date} ${event.startTime}`, 
        'yyyy-MM-dd HH:mm', 
        new Date()
      );
      
      const existingEnd = parse(
        `${eventData.date} ${event.endTime}`, 
        'yyyy-MM-dd HH:mm', 
        new Date()
      );

      // Check for any overlap
      const hasOverlap = (
        (isBefore(newEventStart, existingEnd) && isAfter(newEventEnd, existingStart)) ||
        (isBefore(existingStart, newEventEnd) && isAfter(existingEnd, newEventStart))
      );

      if (hasOverlap) {
        toast({
          variant: "destructive",
          title: "Time Slot Conflict",
          description: `This time slot conflicts with "${event.title}"`
        });
        return true;
      }

      return false;
    });

    return hasConflict;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateDateTime() || checkTimeSlotConflict()) {
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in again to continue"
        });
        setIsLoading(false);
        return;
      }

      const eventDate = parseISO(eventData.date);
      const startDateTime = parse(
        `${eventData.date} ${eventData.startTime}`, 
        'yyyy-MM-dd HH:mm', 
        new Date()
      );
      const endDateTime = parse(
        `${eventData.date} ${eventData.endTime}`, 
        'yyyy-MM-dd HH:mm', 
        new Date()
      );

      const response = await axios.post(
        'https://backend-minimal.vercel.app/create-event',
        {
          title: eventData.title,
          description: eventData.description,
          date: eventDate,
          start: startDateTime,
          end: endDateTime,
          color: eventData.backgroundColor
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.status === 201) {
        const newEvent: EventData = {
          id: response.data.id,
          ...eventData,
          date: eventDate
        };

        toast({
          title: "Success",
          description: "Event created successfully"
        });

        onSave(newEvent);
        onClose();
        setEventData({
          title: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '10:00',
          backgroundColor: 'bg-blue-50',
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data?.message || 'Failed to create event'
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Event Name</Label>
            <Input
              value={eventData.title}
              onChange={e => setEventData({...eventData, title: e.target.value})}
              placeholder="Enter event name"
              required
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={eventData.date}
              onChange={e => setEventData({...eventData, date: e.target.value})}
              required
            />
          </div>
          <div>
            <Label>Color</Label>
            <div className="flex gap-2 mt-1">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-6 h-6 rounded-full ${color.value} ${
                    eventData.backgroundColor === color.value ? 'ring-2 ring-offset-2 ring-blue-600' : ''
                  }`}
                  onClick={() => setEventData({...eventData, backgroundColor: color.value})}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Time</Label>
              <Input
                type="time"
                value={eventData.startTime}
                onChange={e => setEventData({...eventData, startTime: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>End Time</Label>
              <Input
                type="time"
                value={eventData.endTime}
                onChange={e => setEventData({...eventData, endTime: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;