
import React, { useState } from 'react';
import { TimeSession as TimeSessionType } from '@/types';
import { formatTime, formatDate, formatDuration, calculateSessionDuration } from '@/lib/timeUtils';
import { useProjects } from '@/contexts/ProjectContext';
import { Clock, AlignLeft, Trash } from 'lucide-react';

interface TimeSessionProps {
  session: TimeSessionType;
  projectId: string;
}

const TimeSession: React.FC<TimeSessionProps> = ({ session, projectId }) => {
  const { deleteSession, updateSessionNote } = useProjects();
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(session.note);
  
  const duration = session.duration || calculateSessionDuration(session.startTime, session.endTime);
  
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
  
  return (
    <div className="p-4 rounded-lg bg-card border hover:shadow-subtle transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {formatDate(session.startTime)} {formatTime(session.startTime)} - 
              {session.endTime ? ` ${formatTime(session.endTime)}` : ' In progress'}
            </span>
          </div>
          
          <div className="text-base font-mono tracking-tighter">
            {formatDuration(duration)}
          </div>
          
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={note}
                onChange={handleNoteChange}
                placeholder="Add notes about what you worked on..."
                className="w-full p-2 text-sm rounded-md border focus-ring min-h-[80px]"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setNote(session.note);
                    setIsEditing(false);
                  }}
                  className="px-2 py-1 text-xs rounded-md hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-2 py-1 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setIsEditing(true)}
              className="mt-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer group flex items-start gap-1.5"
            >
              <AlignLeft className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span className="group-hover:underline decoration-dotted underline-offset-2">
                {session.note || "Add notes..."}
              </span>
            </div>
          )}
        </div>
        
        <button
          onClick={handleDeleteSession}
          className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10"
          title="Delete session"
        >
          <Trash className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TimeSession;
