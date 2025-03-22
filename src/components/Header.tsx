
import React, { useState, useEffect } from 'react';
import { useProjects } from '@/contexts/ProjectContext';
import { formatDuration } from '@/lib/timeUtils';
import { Timer, Plus } from 'lucide-react';

const Header: React.FC = () => {
  const { activeProject, stopSession } = useProjects();
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  
  // Update the elapsed time for the active session every second
  useEffect(() => {
    if (!activeProject) {
      setElapsedTime(0);
      return;
    }
    
    // Find the active session
    const activeSession = activeProject.sessions.find(s => s.endTime === null);
    if (!activeSession) return;
    
    // Start interval to update elapsed time
    const interval = setInterval(() => {
      const elapsed = Date.now() - activeSession.startTime.getTime();
      setElapsedTime(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeProject]);
  
  const handleStopSession = () => {
    if (activeProject) {
      stopSession(activeProject.id);
    }
  };
  
  return (
    <header className="sticky top-0 z-10 w-full glass shadow-subtle py-2 px-4 mb-4 transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary animate-pulse-light" />
          <h1 className="text-lg font-medium tracking-tight">Pulse</h1>
        </div>
        
        {activeProject ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="text-xs text-muted-foreground">Recording:</div>
              <div className="text-sm font-medium">{activeProject.name}</div>
            </div>
            
            <div className="text-base font-mono tracking-tighter text-primary">
              {formatDuration(elapsedTime)}
            </div>
            
            <button 
              onClick={handleStopSession}
              className="px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-xs font-medium transition-all"
            >
              Stop
            </button>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic">
            No active timer
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
