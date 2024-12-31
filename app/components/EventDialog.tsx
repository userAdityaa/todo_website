import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { isAfter, startOfDay, isSameDay } from 'date-fns';

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
}

export interface EventData {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  backgroundColor: string;
}

export const EventDialog: React.FC<EventDialogProps> = ({ isOpen, onClose, onSave, selectedDate }) => {
  const [error, setError] = useState<string>('');
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: selectedDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    backgroundColor: 'bg-blue-50',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventDate = new Date(eventData.date);
    const today = startOfDay(new Date());

    if (isAfter(today, eventDate) && !isSameDay(today, eventDate)) {
      setError('Cannot create events in the past');
      return;
    }

    const newEvent: EventData = {
      id: Math.random().toString(36).substr(2, 9),
      ...eventData,
      date: eventDate
    };

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
    setError('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}
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
              onChange={e => {
                setEventData({...eventData, date: e.target.value});
                setError('');
              }}
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
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};