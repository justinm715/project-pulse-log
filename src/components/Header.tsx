
import React, { useState, useEffect } from 'react';
import { useProjects } from '@/contexts/ProjectContext';
import { formatDuration } from '@/lib/timeUtils';
import { Timer, Plus } from 'lucide-react';

const Header: React.FC = () => {
  const { activeProject, stopSession } = useProjects();
  
  return (
    <header className="sticky top-0 z-10 w-full glass shadow-subtle py-2 px-4 mb-4 transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary animate-pulse-light" />
          <h1 className="text-lg font-medium tracking-tight">Pulse</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
