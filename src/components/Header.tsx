
import React from 'react';
import { useProjects } from '@/contexts/ProjectContext';
import { formatDuration } from '@/lib/timeUtils';
import { Timer, Plus } from 'lucide-react';

const Header: React.FC = () => {
  const { activeProject, stopSession } = useProjects();
  const [elapsedTime, setElapsedTime] = React.useState<number>(0);
  
  // Update the elapsed time for the active session every second
  React.useEffect(() => {
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
    <header className="sticky top-0 z-10 w-full glass shadow-subtle py-4 px-6 mb-6 transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Timer className="h-6 w-6 text-primary animate-pulse-light" />
          <h1 className="text-xl font-medium tracking-tight">Pulse</h1>
        </div>
        
        {activeProject ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Recording time for</div>
              <div className="font-medium">{activeProject.name}</div>
            </div>
            
            <div className="text-xl font-mono tracking-tighter text-primary">
              {formatDuration(elapsedTime)}
            </div>
            
            <button 
              onClick={handleStopSession}
              className="px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 text-sm font-medium transition-all"
            >
              Stop
            </button>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic">
            No active timer
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
