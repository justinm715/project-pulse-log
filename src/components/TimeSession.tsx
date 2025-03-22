
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
    <div className="p-3 rounded-md bg-card border hover:shadow-subtle transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {formatDate(session.startTime)} {formatTime(session.startTime)} - 
              {session.endTime ? ` ${formatTime(session.endTime)}` : ' In progress'}
            </span>
          </div>
          
          <div className="text-sm font-mono tracking-tighter mt-1">
            {formatDuration(duration)}
          </div>
          
          {isEditing ? (
            <div className="mt-1 space-y-1">
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
              className="mt-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer group flex items-start gap-1"
            >
              <AlignLeft className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span className="group-hover:underline decoration-dotted underline-offset-2">
                {session.note || "Add notes..."}
              </span>
            </div>
          )}
        </div>
        
        <button
          onClick={handleDeleteSession}
          className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10 flex-shrink-0"
          title="Delete session"
        >
          <Trash className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default TimeSession;
