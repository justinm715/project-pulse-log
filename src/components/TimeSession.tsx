
import React, { useState, useEffect } from 'react';
import { TimeSession as TimeSessionType } from '@/types';
import { formatTime, formatDate, formatDuration, calculateSessionDuration } from '@/lib/timeUtils';
import { useProjects } from '@/contexts/ProjectContext';
import { Clock, AlignLeft, Trash, Play, Move, Timer } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface TimeSessionProps {
  session: TimeSessionType;
  projectId: string;
  isDraggingOver?: boolean;
}

const TimeSession: React.FC<TimeSessionProps> = ({ session, projectId, isDraggingOver }) => {
  const { deleteSession, updateSessionNote, resumeSession, moveSessionToProject } = useProjects();
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(session.note);
  const [currentDuration, setCurrentDuration] = useState(
    session.duration || calculateSessionDuration(session.startTime, session.endTime)
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editStartTime, setEditStartTime] = useState(format(session.startTime, "yyyy-MM-dd'T'HH:mm:ss"));
  const [editEndTime, setEditEndTime] = useState(session.endTime ? format(session.endTime, "yyyy-MM-dd'T'HH:mm:ss") : '');

  useEffect(() => {
    if (session.endTime === null) {
      const interval = setInterval(() => {
        setCurrentDuration(calculateSessionDuration(session.startTime, new Date()));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    setCurrentDuration(session.duration || calculateSessionDuration(session.startTime, session.endTime));
    setEditStartTime(format(session.startTime, "yyyy-MM-dd'T'HH:mm:ss"));
    setEditEndTime(session.endTime ? format(session.endTime, "yyyy-MM-dd'T'HH:mm:ss") : '');
  }, [session]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
  };

  const handleSaveNote = () => {
    updateSessionNote(projectId, session.id, note);
    setIsEditing(false);
  };

  const handleDeleteSession = () => {
    if (confirm('Are you sure you want to delete this time session?')) {
      deleteSession(projectId, session.id);
    }
  };

  const handleResumeSession = () => {
    if (session.endTime) {
      resumeSession(projectId, session.id);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify({
      sessionId: session.id,
      sourceProjectId: projectId
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleEditTimes = () => {
    if (isEditingTime) {
      try {
        const newStartTime = new Date(editStartTime);
        const newEndTime = editEndTime ? new Date(editEndTime) : null;
        
        if (newEndTime && newEndTime <= newStartTime) {
          alert('End time must be after start time');
          return;
        }

        const updatedSession = {
          ...session,
          startTime: newStartTime,
          endTime: newEndTime,
          duration: newEndTime ? calculateSessionDuration(newStartTime, newEndTime) : undefined
        };

        moveSessionToProject(projectId, session.id, projectId, updatedSession);
        setIsEditingTime(false);
      } catch (error) {
        alert('Invalid date format');
      }
    } else {
      setIsEditingTime(true);
    }
  };

  const isActive = session.endTime === null;

  return (
    <TableRow 
      className={`${isActive ? 'bg-green-50/50 dark:bg-green-950/20' : ''} 
        ${isDraggingOver ? 'bg-primary/10 border-l-primary' : ''} 
        ${isDragging ? 'opacity-50' : ''} 
        border-l-4 border-l-muted/30 even:bg-muted/10 odd:bg-transparent`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <TableCell className={`py-1 px-2 font-mono tracking-tighter text-xs ${isActive ? 'text-green-600 dark:text-green-400' : ''}`}>
        <div className="flex items-center gap-1">
          <Timer className="h-3 w-3 text-muted-foreground" />
          {formatDuration(currentDuration)}
        </div>
      </TableCell>
      <TableCell className="py-1 px-2 text-xs">
        {isEditing ? (
          <div className="space-y-1">
            <textarea
              value={note}
              onChange={handleNoteChange}
              placeholder="Add notes..."
              className="w-full p-1 text-xs rounded-md border focus-ring min-h-[40px]"
              autoFocus
            />
            <div className="flex gap-1 justify-end">
              <button
                onClick={() => {
                  setNote(session.note);
                  setIsEditing(false);
                }}
                className="px-1 py-0.5 text-xs rounded-md hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-1 py-0.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setIsEditing(true)}
            className="cursor-pointer group flex items-start gap-1 hover:text-foreground text-muted-foreground"
          >
            <AlignLeft className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span className="group-hover:underline decoration-dotted underline-offset-2">
              {session.note || "Add notes..."}
            </span>
          </div>
        )}
      </TableCell>
      <TableCell className="py-1 px-2 text-xs whitespace-nowrap">
        {isEditingTime ? (
          <Input
            type="datetime-local"
            value={editStartTime}
            onChange={(e) => setEditStartTime(e.target.value)}
            className="h-7 text-xs"
            step="1"
          />
        ) : (
          <div className="flex items-center gap-1 cursor-pointer" onClick={handleEditTimes}>
            <Clock className="h-3 w-3 text-muted-foreground" />
            {formatDate(session.startTime)} {formatTime(session.startTime)}
          </div>
        )}
      </TableCell>
      <TableCell className="py-1 px-2 text-xs whitespace-nowrap">
        {isEditingTime ? (
          <div className="flex items-center gap-2">
            <Input
              type="datetime-local"
              value={editEndTime}
              onChange={(e) => setEditEndTime(e.target.value)}
              className="h-7 text-xs"
              step="1"
            />
            <button
              onClick={handleEditTimes}
              className="px-2 py-1 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 cursor-pointer" onClick={handleEditTimes}>
            <Clock className="h-3 w-3 text-muted-foreground" />
            {session.endTime ? 
              `${formatDate(session.endTime)} ${formatTime(session.endTime)}` : 
              <span className="text-green-600 dark:text-green-400">In progress</span>
            }
          </div>
        )}
      </TableCell>
      <TableCell className="py-1 px-2 text-right">
        <div className="flex items-center justify-end space-x-1">
          <div className="flex-shrink-0 p-1 text-muted-foreground cursor-move">
            <Move className="h-3 w-3" aria-label="Drag to move session" />
          </div>
          {!isActive && session.endTime && (
            <button
              onClick={handleResumeSession}
              className="text-muted-foreground hover:text-green-600 transition-colors p-1 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 flex-shrink-0"
              aria-label="Resume session"
            >
              <Play className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={handleDeleteSession}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10 flex-shrink-0"
            aria-label="Delete session"
          >
            <Trash className="h-3 w-3" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TimeSession;
