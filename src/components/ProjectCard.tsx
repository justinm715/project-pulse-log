
import React, { useState } from 'react';
import { Project } from '@/types';
import { useProjects } from '@/contexts/ProjectContext';
import { formatDuration } from '@/lib/timeUtils';
import TimeSession from './TimeSession';
import { Play, Pause, Trash, ChevronDown, ChevronUp } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { startSession, stopSession, deleteProject } = useProjects();
  const [showSessions, setShowSessions] = useState(false);
  
  const handleStartStop = () => {
    if (project.isActive) {
      stopSession(project.id);
    } else {
      startSession(project.id);
    }
  };
  
  const handleDeleteProject = () => {
    if (confirm(`Are you sure you want to delete the project "${project.name}"?`)) {
      deleteProject(project.id);
    }
  };
  
  // Get sessions in reverse chronological order (newest first)
  const sortedSessions = [...project.sessions].sort((a, b) => {
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });
  
  return (
    <div 
      className="rounded-xl glass shadow-glass hover:shadow-glass-hover transition-all overflow-hidden"
      style={{ borderTop: `4px solid ${project.color}` }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{project.name}</h3>
          
          <button
            onClick={handleDeleteProject}
            className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10"
            title="Delete project"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="text-xl font-mono tracking-tighter">
            {formatDuration(project.totalTime)}
          </div>
          
          <button
            onClick={handleStartStop}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              project.isActive 
                ? 'bg-secondary text-foreground' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {project.isActive ? (
              <>
                <Pause className="h-3.5 w-3.5" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" />
                <span>Start</span>
              </>
            )}
          </button>
        </div>
        
        {sortedSessions.length > 0 && (
          <div className="mt-4">
            <button 
              onClick={() => setShowSessions(!showSessions)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showSessions ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>Hide sessions</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Show {sortedSessions.length} session{sortedSessions.length !== 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {showSessions && (
        <div className="px-5 pb-5 space-y-3 animate-slide-up">
          {sortedSessions.map(session => (
            <TimeSession 
              key={session.id} 
              session={session} 
              projectId={project.id} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
