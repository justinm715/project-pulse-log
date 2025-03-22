
import React, { useState, useEffect } from 'react';
import { TimeSession as TimeSessionType } from '@/types';
import { formatTime, formatDate, formatDuration, calculateSessionDuration } from '@/lib/timeUtils';
import { useProjects } from '@/contexts/ProjectContext';
import { Clock, AlignLeft, Trash, Play, Move } from 'lucide-react';
import { TableRow, TableCell } from '@/components/ui/table';

interface TimeSessionProps {
  session: TimeSessionType;
  projectId: string;
}

const TimeSession: React.FC<TimeSessionProps> = ({ session, projectId }) => {
  const { deleteSession, updateSessionNote, resumeSession, moveSessionToProject } = useProjects();
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(session.note);
  const [currentDuration, setCurrentDuration] = useState(
    session.duration || calculateSessionDuration(session.startTime, session.endTime)
  );
  const [isDragging, setIsDragging] = useState(false);
  
  // Update time for active sessions
  useEffect(() => {
    if (session.endTime === null) {
      const interval = setInterval(() => {
        setCurrentDuration(calculateSessionDuration(session.startTime, new Date()));
      }, 1000);
      
      return () => clearInterval(interval);
    }
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
    // Set the session and project data in the drag event
    e.dataTransfer.setData('application/json', JSON.stringify({
      sessionId: session.id,
      sourceProjectId: projectId
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const isActive = session.endTime === null;
  
  return (
    <TableRow 
      className={`${isActive ? 'bg-green-50/50 dark:bg-green-950/20' : ''} 
        ${isDragging ? 'opacity-50' : ''}`}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <TableCell className={`text-xs ${isActive ? 'text-green-600 dark:text-green-400' : ''}`}>
        {formatDate(session.startTime)} {formatTime(session.startTime)}
      </TableCell>
      <TableCell className="text-xs">
        {session.endTime ? `${formatDate(session.endTime)} ${formatTime(session.endTime)}` : 
          <span className="text-green-600 dark:text-green-400">In progress</span>
        }
      </TableCell>
      <TableCell className={`font-mono tracking-tighter text-xs ${isActive ? 'text-green-600 dark:text-green-400' : ''}`}>
        {formatDuration(currentDuration)}
      </TableCell>
      <TableCell className="text-xs">
        {isEditing ? (
          <div className="space-y-1">
            <textarea
              value={note}
              onChange={handleNoteChange}
              placeholder="Add notes..."
              className="w-full p-1.5 text-xs rounded-md border focus-ring min-h-[60px]"
              autoFocus
            />
            <div className="flex gap-1 justify-end">
              <button
                onClick={() => {
                  setNote(session.note);
                  setIsEditing(false);
                }}
                className="px-1.5 py-0.5 text-xs rounded-md hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-1.5 py-0.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
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
      <TableCell className="text-right">
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
