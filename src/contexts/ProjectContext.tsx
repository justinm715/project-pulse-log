
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, TimeSession } from '@/types';
import { toast } from 'sonner';
import { calculateTotalTime, getRandomPastelColor } from '@/lib/timeUtils';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  addProject: (name: string) => void;
  deleteProject: (id: string) => void;
  startSession: (projectId: string) => void;
  stopSession: (projectId: string, note?: string) => void;
  deleteSession: (projectId: string, sessionId: string) => void;
  updateSessionNote: (projectId: string, sessionId: string, note: string) => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Load from localStorage on initial render
  useEffect(() => {
    const savedProjects = localStorage.getItem('timeTrackerProjects');
    if (savedProjects) {
      try {
        // Need to convert string dates back to Date objects
        const parsedProjects: Project[] = JSON.parse(savedProjects, (key, value) => {
          if (key === 'startTime' || key === 'endTime') {
            return value ? new Date(value) : null;
          }
          return value;
        });
        
        setProjects(parsedProjects);
        
        // Find any active project
        const active = parsedProjects.find(p => p.isActive);
        if (active) {
          setActiveProject(active);
        }
      } catch (error) {
        console.error('Error parsing saved projects:', error);
        toast.error('Could not load saved projects');
      }
    }
  }, []);

  // Save to localStorage whenever projects change
  useEffect(() => {
    localStorage.setItem('timeTrackerProjects', JSON.stringify(projects));
  }, [projects]);

  // Add a new project
  const addProject = (name: string) => {
    if (!name.trim()) {
      toast.error('Project name cannot be empty');
      return;
    }
    
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      color: getRandomPastelColor(),
      sessions: [],
      isActive: false,
      totalTime: 0
    };
    
    setProjects(prev => [...prev, newProject]);
    toast.success(`Added project: ${name}`);
  };

  // Delete a project
  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    
    if (activeProject?.id === id) {
      setActiveProject(null);
    }
    
    toast.success('Project deleted');
  };

  // Start a time session for a project
  const startSession = (projectId: string) => {
    // If there's already an active project, stop its session first
    if (activeProject && activeProject.id !== projectId) {
      stopSession(activeProject.id);
    }
    
    const now = new Date();
    
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        // Start a new session
        const newSession: TimeSession = {
          id: Date.now().toString(),
          projectId,
          startTime: now,
          endTime: null,
          note: ''
        };
        
        return {
          ...project,
          isActive: true,
          sessions: [...project.sessions, newSession]
        };
      }
      
      // Make sure other projects are marked as inactive
      return {
        ...project,
        isActive: false
      };
    }));
    
    // Update active project reference
    setActiveProject(projects.find(p => p.id === projectId) || null);
  };

  // Stop the active time session
  const stopSession = (projectId: string, note: string = '') => {
    const now = new Date();
    
    setProjects(prev => prev.map(project => {
      if (project.id === projectId && project.isActive) {
        const updatedSessions = [...project.sessions];
        
        // Find the active session (should be the last one)
        const activeSessionIndex = updatedSessions.findIndex(s => s.endTime === null);
        
        if (activeSessionIndex !== -1) {
          const activeSession = updatedSessions[activeSessionIndex];
          const duration = now.getTime() - activeSession.startTime.getTime();
          
          // Update the session with end time and duration
          updatedSessions[activeSessionIndex] = {
            ...activeSession,
            endTime: now,
            note: note || activeSession.note, // Keep existing note if no new note
            duration
          };
        }
        
        // Calculate total time for this project
        const totalTime = calculateTotalTime(updatedSessions);
        
        return {
          ...project,
          sessions: updatedSessions,
          isActive: false,
          totalTime
        };
      }
      
      return project;
    }));
    
    // Clear active project
    setActiveProject(null);
  };

  // Delete a session
  const deleteSession = (projectId: string, sessionId: string) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const updatedSessions = project.sessions.filter(s => s.id !== sessionId);
        
        // Recalculate total time for this project
        const totalTime = calculateTotalTime(updatedSessions);
        
        return {
          ...project,
          sessions: updatedSessions,
          totalTime
        };
      }
      
      return project;
    }));
    
    toast.success('Session deleted');
  };

  // Update a session's note
  const updateSessionNote = (projectId: string, sessionId: string, note: string) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const updatedSessions = project.sessions.map(session => {
          if (session.id === sessionId) {
            return {
              ...session,
              note
            };
          }
          return session;
        });
        
        return {
          ...project,
          sessions: updatedSessions
        };
      }
      
      return project;
    }));
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        addProject,
        deleteProject,
        startSession,
        stopSession,
        deleteSession,
        updateSessionNote
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
