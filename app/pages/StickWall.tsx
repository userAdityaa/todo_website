import React, { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TodoNote {
  id: string;
  title: string;
  content: string[];
  color: string;
}

interface Props {
  initialNotes?: TodoNote[];
}

const getRandomPastelColor = () => {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 90%)`;
};

const defaultNotes: TodoNote[] = [];

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
      value={value}
      onChange={onChange}
      rows={1}
      className={`w-full resize-none bg-transparent border-none focus:outline-none overflow-hidden ${className}`}
    />
  );
};

const StickyWall: React.FC<Props> = ({ initialNotes = defaultNotes }) => {
  const [notes, setNotes] = useState<TodoNote[]>(initialNotes);

  const sendStickyToServer = async (newNote: TodoNote) => {
    try {
      const response = await fetch('http://localhost:8000/create-sticky', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          topic: newNote.title,
          content: newNote.content.join('\n'),
          color: newNote.color,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create sticky: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Sticky created successfully:', data);
    } catch (error) {
      console.error('Error creating sticky:', error);
    }
  };

  const addNote = async () => {
    const newNote: TodoNote = {
      id: Date.now().toString(),
      title: 'New Note',
      content: ['Add your content here'],
      color: getRandomPastelColor(),
    };

    setNotes((prevNotes) => [...prevNotes, newNote]);

    await sendStickyToServer(newNote);
  };

  const updateNote = (id: string, field: 'title' | 'content', value: string | string[]) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, [field]: value } : note
    ));
  };

  const handleContentEdit = (noteId: string, index: number, value: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      const newContent = [...note.content];
      newContent[index] = value;
      updateNote(noteId, 'content', newContent);
    }
  };

  const addContentItem = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      updateNote(noteId, 'content', [...note.content, '']);
    }
  };

  return (
    <div className="h-screen overflow-y-auto p-6">
      <h1 className="text-4xl font-bold mb-6 sticky top-0 bg-white z-10">Sticky Wall</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
        {notes.map((note) => (
          <Card 
            key={note.id} 
            className="shadow-sm min-h-[100px]" 
            style={{ backgroundColor: note.color }}
          >
            <CardContent className="p-4">
              <AutoResizeTextArea
                value={note.title}
                onChange={(e) => updateNote(note.id, 'title', e.target.value)}
                className="text-xl font-semibold mb-2 min-h-[32px]"
              />
              <ul className="space-y-2">
                {note.content.map((item, index) => (
                  <li key={index}>
                    <AutoResizeTextArea
                      value={item}
                      onChange={(e) => handleContentEdit(note.id, index, e.target.value)}
                      className="text-gray-700 min-h-[24px]"
                    />
                  </li>
                ))}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    addContentItem(note.id);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  + Add item
                </button>
              </ul>
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
