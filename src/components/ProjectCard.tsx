
import React, { useState, useEffect } from 'react';
import { Project } from '@/types';
import { useProjects } from '@/contexts/ProjectContext';
import { formatDuration } from '@/lib/timeUtils';
import TimeSession from './TimeSession';
import { Play, Pause, Trash, ChevronDown, ChevronUp, Edit } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { startSession, stopSession, deleteProject, updateProjectName } = useProjects();
  const [showSessions, setShowSessions] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [elapsedTime, setElapsedTime] = useState(project.totalTime);
  
  // Update the elapsed time for active projects every second
  useEffect(() => {
    if (!project.isActive) {
      setElapsedTime(project.totalTime);
      return;
    }
    
    // Find the active session
    const activeSession = project.sessions.find(s => s.endTime === null);
    if (!activeSession) return;
    
    // Calculate base time (all completed sessions)
    const baseTime = project.totalTime;
    
    // Start interval to update elapsed time
    const interval = setInterval(() => {
      const sessionTime = Date.now() - activeSession.startTime.getTime();
      setElapsedTime(baseTime + sessionTime);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [project]);
  
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
  
  const handleSaveTitle = () => {
    if (projectName.trim() !== "") {
      updateProjectName(project.id, projectName.trim());
      setEditingTitle(false);
    }
  };
  
  // Get sessions in reverse chronological order (newest first)
  const sortedSessions = [...project.sessions].sort((a, b) => {
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });
  
  return (
    <div 
      className="rounded-lg glass shadow-glass hover:shadow-glass-hover transition-all overflow-hidden"
      style={{ borderLeft: `3px solid ${project.color}` }}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          {editingTitle ? (
            <div className="flex-1 flex items-center gap-1">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="flex-1 px-2 py-1 text-base rounded-md border focus-ring"
                autoFocus
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <h3 className="text-base font-medium">{project.name}</h3>
              <button
                onClick={() => setEditingTitle(true)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
                title="Edit project name"
              >
                <Edit className="h-3 w-3" />
              </button>
            </div>
          )}
          
          <button
            onClick={handleDeleteProject}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10"
            title="Delete project"
          >
            <Trash className="h-3.5 w-3.5" />
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="text-base font-mono tracking-tighter">
            {formatDuration(elapsedTime)}
          </div>
          
          <button
            onClick={handleStartStop}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all ${
              project.isActive 
                ? 'bg-secondary text-foreground' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {project.isActive ? (
              <>
                <Pause className="h-3 w-3" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                <span>Start</span>
              </>
            )}
          </button>
        </div>
        
        {sortedSessions.length > 0 && (
          <div className="mt-2">
            <button 
              onClick={() => setShowSessions(!showSessions)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showSessions ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  <span>Hide sessions</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  <span>Show {sortedSessions.length} session{sortedSessions.length !== 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {showSessions && (
        <div className="px-3 pb-3 space-y-2 animate-slide-up">
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
