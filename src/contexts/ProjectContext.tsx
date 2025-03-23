import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, TimeSession } from '@/types';
import { toast } from 'sonner';
import { calculateTotalTime, getRandomPastelColor } from '@/lib/timeUtils';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  addProject: (name: string) => void;
  deleteProject: (id: string) => void;
  updateProjectName: (id: string, name: string) => void;
  startSession: (projectId: string) => void;
  stopSession: (projectId: string, note?: string) => void;
  deleteSession: (projectId: string, sessionId: string) => void;
  updateSessionNote: (projectId: string, sessionId: string, note: string) => void;
  resumeSession: (projectId: string, sessionId: string) => void;
  moveSessionToProject: (sourceProjectId: string, sessionId: string, targetProjectId: string, newSession?: TimeSession) => void;
  clearAllSessions: () => void;
  clearAllProjects: () => void;
  updateSession: (projectId: string, sessionId: string, updatedFields: Partial<TimeSession>) => void;
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

  useEffect(() => {
    const savedProjects = localStorage.getItem('timeTrackerProjects');
    if (savedProjects) {
      try {
        const parsedProjects: Project[] = JSON.parse(savedProjects, (key, value) => {
          if (key === 'startTime' || key === 'endTime') {
            return value ? new Date(value) : null;
          }
          return value;
        });
        
        setProjects(parsedProjects);
        
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

  useEffect(() => {
    localStorage.setItem('timeTrackerProjects', JSON.stringify(projects));
  }, [projects]);

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

  const updateProjectName = (id: string, name: string) => {
    if (!name.trim()) {
      toast.error('Project name cannot be empty');
      return;
    }
    
    setProjects(prev => prev.map(project => {
      if (project.id === id) {
        return {
          ...project,
          name
        };
      }
      return project;
    }));
    
    if (activeProject?.id === id) {
      setActiveProject(prev => prev ? { ...prev, name } : null);
    }
    
    toast.success(`Project renamed to: ${name}`);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    
    if (activeProject?.id === id) {
      setActiveProject(null);
    }
    
    toast.success('Project deleted');
  };

  const startSession = (projectId: string) => {
    if (activeProject && activeProject.id !== projectId) {
      stopSession(activeProject.id);
    }
    
    const now = new Date();
    
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
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
      
      return {
        ...project,
        isActive: false
      };
    }));
    
    setActiveProject(projects.find(p => p.id === projectId) || null);
  };

  const stopSession = (projectId: string, note: string = '') => {
    const now = new Date();
    
    setProjects(prev => prev.map(project => {
      if (project.id === projectId && project.isActive) {
        const updatedSessions = [...project.sessions];
        
        const activeSessionIndex = updatedSessions.findIndex(s => s.endTime === null);
        
        if (activeSessionIndex !== -1) {
          const activeSession = updatedSessions[activeSessionIndex];
          const duration = now.getTime() - activeSession.startTime.getTime();
          
          updatedSessions[activeSessionIndex] = {
            ...activeSession,
            endTime: now,
            note: note || activeSession.note,
            duration
          };
        }
        
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
    
    setActiveProject(null);
  };

  const deleteSession = (projectId: string, sessionId: string) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        const updatedSessions = project.sessions.filter(s => s.id !== sessionId);
        
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

  const resumeSession = (projectId: string, sessionId: string) => {
    if (activeProject) {
      stopSession(activeProject.id);
    }

    setProjects(prev => {
      let existingSession: TimeSession | undefined;
      let updatedProjects = prev.map(project => {
        if (project.id === projectId) {
          const sessionIndex = project.sessions.findIndex(session => session.id === sessionId);
          if (sessionIndex !== -1) {
            existingSession = project.sessions[sessionIndex];
          }
        }
        return project;
      });

      if (!existingSession) {
        toast.error("Session not found");
        return prev;
      }

      const now = new Date();
      const newSession: TimeSession = {
        id: Date.now().toString(),
        projectId,
        startTime: now,
        endTime: null,
        note: existingSession.note,
      };

      return updatedProjects.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            isActive: true,
            sessions: [...project.sessions, newSession]
          };
        }
        
        return {
          ...project,
          isActive: false
        };
      });
    });

    const projectToActivate = projects.find(p => p.id === projectId) || null;
    setActiveProject(projectToActivate);
    
    toast.success("Session resumed");
  };

  const updateSession = (projectId: string, sessionId: string, updatedFields: Partial<TimeSession>) => {
    setProjects(prev =>
      prev.map(project => {
        if (project.id === projectId) {
          const updatedSessions = project.sessions.map(session =>
            session.id === sessionId ? { ...session, ...updatedFields } : session
          );
          return {
            ...project,
            sessions: updatedSessions,
            totalTime: calculateTotalTime(updatedSessions),
          };
        }
        return project;
      })
    );
  };
  

  const moveSessionToProject = (
    sourceProjectId: string, 
    sessionId: string, 
    targetProjectId: string,
    newSession?: TimeSession
  ) => {
    setProjects(prev => {
      if (newSession && sourceProjectId === 'temp') {
        return prev.map(project => {
          if (project.id === targetProjectId) {
            const updatedSessions = [...project.sessions, newSession];
            
            return {
              ...project,
              sessions: updatedSessions,
              totalTime: calculateTotalTime(updatedSessions)
            };
          }
          return project;
        });
      }
      
      let sessionToMove: TimeSession | undefined;
      
      const updatedProjects = prev.map(project => {
        if (project.id === sourceProjectId) {
          const sourceSessionIndex = project.sessions.findIndex(s => s.id === sessionId);
          
          if (sourceSessionIndex !== -1) {
            sessionToMove = {...project.sessions[sourceSessionIndex], projectId: targetProjectId};
            
            const updatedSessions = project.sessions.filter(s => s.id !== sessionId);
            
            return {
              ...project,
              sessions: updatedSessions,
              totalTime: calculateTotalTime(updatedSessions)
            };
          }
        }
        return project;
      });
      
      if (sessionToMove) {
        return updatedProjects.map(project => {
          if (project.id === targetProjectId) {
            const updatedSessions = [...project.sessions, sessionToMove!];
            
            return {
              ...project,
              sessions: updatedSessions,
              totalTime: calculateTotalTime(updatedSessions)
            };
          }
          return project;
        });
      }
      
      return updatedProjects;
    });
    
    toast.success(newSession ? "Time entry added" : "Session moved to another project");
  };

  const clearAllSessions = () => {
    setProjects(prev => prev.map(project => ({
      ...project,
      sessions: [],
      totalTime: 0,
      isActive: false
    })));
    
    setActiveProject(null);
  };

  const clearAllProjects = () => {
    setProjects([]);
    setActiveProject(null);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        addProject,
        deleteProject,
        updateProjectName,
        startSession,
        stopSession,
        deleteSession,
        updateSessionNote,
        resumeSession,
        moveSessionToProject,
        clearAllSessions,
        clearAllProjects,
        updateSession,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
