import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoreVertical, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export interface TodoNote {
  id: string;
  topic: string;
  content: string;
  color: string;
  isUpdating?: boolean;
}

interface Props {
  initialNotes?: TodoNote[];
}

const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 90%)`;
};

const AutoResizeTextArea = ({ value, onChange, className }: { 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value || ''}
      onChange={onChange}
      rows={1}
      className={`w-full resize-none bg-transparent border-none focus:outline-none overflow-hidden ${className}`}
    />
  );
};

const StickyWall: React.FC<Props> = ({ initialNotes = [] }) => {
  const [notes, setNotes] = useState<TodoNote[]>([]);
  const [localUpdates, setLocalUpdates] = useState<{ [key: string]: { topic?: string; content?: string } }>({});
  const updateTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    if (initialNotes && initialNotes.length > 0) {
      setNotes(
        initialNotes.map((note) => ({
          ...note,
          color: note.color || getRandomPastelColor(),
          topic: note.topic || 'Untitled',
          content: note.content || '',
        }))
      );
    }
  }, [initialNotes]);

  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`https://todo-backend-sym9.onrender.com/delete-sticky`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ id: noteId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete sticky: ${response.statusText}`);
      }

      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      
      if (updateTimeoutRef.current[noteId]) {
        clearTimeout(updateTimeoutRef.current[noteId]);
        delete updateTimeoutRef.current[noteId];
      }
      
      setLocalUpdates(prev => {
        const newUpdates = { ...prev };
        delete newUpdates[noteId];
        return newUpdates;
      });

    } catch (error) {
      console.error('Error deleting sticky:', error);
    }
  };

  const updateNoteOnServer = async (noteId: string, updates: { topic?: string; content?: string }) => {
    try {
      const updatedSticky = {
        id: noteId,
        ...updates 
      };
  
      const response = await fetch(`https://todo-backend-sym9.onrender.com/update-sticky`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(updatedSticky),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Failed to update sticky: ${response.statusText}`);
      }
  
      const responseData = await response.json();
  
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === noteId
            ? {
                ...note,
                ...updates 
              }
            : note
        )
      );

      setLocalUpdates(prev => {
        const newUpdates = { ...prev };
        delete newUpdates[noteId];
        return newUpdates;
      });
  
    } catch (error) {
      console.error('Error updating sticky:', error);
      setLocalUpdates(prev => {
        const newUpdates = { ...prev };
        delete newUpdates[noteId];
        return newUpdates;
      });
    }
  };

  const debouncedUpdateNote = useCallback((noteId: string, updates: { topic?: string; content?: string }) => {
    if (updateTimeoutRef.current[noteId]) {
      clearTimeout(updateTimeoutRef.current[noteId]);
    }

    updateTimeoutRef.current[noteId] = setTimeout(() => {
      updateNoteOnServer(noteId, updates);
      delete updateTimeoutRef.current[noteId];
    }, 1500); 
  }, []);

  const updateNote = (id: string, field: 'topic' | 'content', value: string) => {
    setLocalUpdates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
    debouncedUpdateNote(id, { [field]: value });
  };

  const addNote = async () => {
    const newNote: TodoNote = {
      id: "",
      topic: 'New Note',
      content: 'Add your content here',
      color: getRandomPastelColor(),
    };

    setNotes(prevNotes => [...prevNotes, newNote]);

    try {
      const response = await fetch('https://todo-backend-sym9.onrender.com/create-sticky', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) {
        throw new Error(`Failed to create sticky: ${response.statusText}`);
      }

      const createdNote = await response.json();
      
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === newNote.id ? { ...note, ...createdNote } : note
        )
      );
    } catch (error) {
      console.error('Error creating sticky:', error);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== newNote.id));
    }
  };

  useEffect(() => {
    return () => {
      Object.values(updateTimeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  const getNoteValue = (note: TodoNote, field: 'topic' | 'content') => {
    return localUpdates[note.id]?.[field] ?? note[field];
  };

  return (
    <div className="h-screen overflow-y-auto p-6">
      <h1 className="text-4xl font-bold mb-6 sticky top-0 bg-white z-10">Sticky Wall</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
      {notes.map((note) => (
        <Card
          key={note.id}
          className="shadow-sm min-h-[100px] border-none relative"
          style={{ backgroundColor: note.color }}
        >
          <div className="absolute top-2 right-2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors">
                <MoreVertical className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 cursor-pointer flex items-center gap-2"
                  onClick={() => deleteNote(note.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardContent className="p-4">
            <AutoResizeTextArea
              value={getNoteValue(note, 'topic')}
              onChange={(e) => updateNote(note.id, 'topic', e.target.value)}
              className="text-xl font-semibold mb-2 min-h-[32px]"
            />
            <AutoResizeTextArea
              value={getNoteValue(note, 'content')}
              onChange={(e) => updateNote(note.id, 'content', e.target.value)}
              className="text-gray-700 min-h-[24px]"
            />
          </CardContent>
        </Card>
      ))}
        <button
          onClick={addNote}
          className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors min-h-[100px]"
        >
          <Plus className="w-8 h-8 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default StickyWall;