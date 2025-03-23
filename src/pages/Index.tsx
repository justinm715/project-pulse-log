
import React, { useState } from 'react';
import { ProjectProvider, useProjects } from '@/contexts/ProjectContext';
import Header from '@/components/Header';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import TimeSession from '@/components/TimeSession';
import AddProjectButton from '@/components/AddProjectButton';
import AddSessionForm from '@/components/AddSessionForm';
import { 
  Edit, 
  Trash, 
  Play, 
  Pause, 
  Plus
} from 'lucide-react';
import { formatDuration } from '@/lib/timeUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';

const ProjectTable: React.FC = () => {
  const { 
    projects, 
    startSession, 
    stopSession, 
    deleteProject, 
    updateProjectName,
    moveSessionToProject
  } = useProjects();
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<Record<string, string>>({});
  const [addingSessionToProject, setAddingSessionToProject] = useState<string | null>(null);
  
  // For updating active session times
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, number>>({});

  React.useEffect(() => {
    // Initialize project names
    const names: Record<string, string> = {};
    const times: Record<string, number> = {};
    
    projects.forEach(project => {
      names[project.id] = project.name;
      times[project.id] = project.totalTime;
    });
    
    setProjectName(names);
    setElapsedTimes(times);
  }, [projects]);

  // Update the elapsed time for active projects
  React.useEffect(() => {
    const activeProjects = projects.filter(p => p.isActive);
    if (activeProjects.length === 0) return;

    const interval = setInterval(() => {
      const updatedTimes: Record<string, number> = { ...elapsedTimes };
      
      activeProjects.forEach(project => {
        // Find the active session
        const activeSession = project.sessions.find(s => s.endTime === null);
        if (!activeSession) return;
        
        const sessionTime = Date.now() - activeSession.startTime.getTime();
        updatedTimes[project.id] = project.totalTime + sessionTime;
      });
      
      setElapsedTimes(updatedTimes);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [projects, elapsedTimes]);

  const handleStartStop = (projectId: string, isActive: boolean) => {
    if (isActive) {
      stopSession(projectId);
    } else {
      startSession(projectId);
    }
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    if (confirm(`Are you sure you want to delete the project "${projectName}"?`)) {
      deleteProject(projectId);
    }
  };

  const handleEditTitle = (projectId: string) => {
    setEditingTitle(projectId);
    setProjectName(prev => ({
      ...prev,
      [projectId]: projects.find(p => p.id === projectId)?.name || ''
    }));
  };

  const handleSaveTitle = (projectId: string) => {
    if (projectName[projectId].trim() !== "") {
      updateProjectName(projectId, projectName[projectId].trim());
      setEditingTitle(null);
    }
  };

  const handleDragOver = (e: React.DragEvent, projectId: string) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-muted/50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-muted/50');
  };

  const handleDrop = (e: React.DragEvent, targetProjectId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-muted/50');
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.sessionId && data.sourceProjectId && data.sourceProjectId !== targetProjectId) {
        moveSessionToProject(data.sourceProjectId, data.sessionId, targetProjectId);
      }
    } catch (error) {
      console.error("Error processing dropped data:", error);
    }
  };

  return (
    <div className="rounded-md border">
      <ScrollArea className="h-[calc(100vh-120px)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-2">Duration</TableHead>
              <TableHead className="p-2">Notes</TableHead>
              <TableHead className="p-2">Start Time</TableHead>
              <TableHead className="p-2">End Time</TableHead>
              <TableHead className="p-2 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map(project => (
              <React.Fragment key={project.id}>
                <TableRow 
                  className={project.isActive ? 'bg-green-50/50 dark:bg-green-950/20' : ''}
                  onDragOver={(e) => handleDragOver(e, project.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, project.id)}
                >
                  <TableCell 
                    colSpan={2}
                    className="p-2"
                  >
                    <div 
                      className="flex items-center" 
                      style={{ 
                        borderLeft: `3px solid ${project.isActive ? '#4ade80' : project.color}`,
                        paddingLeft: '8px'
                      }}
                    >
                      {editingTitle === project.id ? (
                        <input
                          type="text"
                          value={projectName[project.id]}
                          onChange={(e) => setProjectName(prev => ({
                            ...prev,
                            [project.id]: e.target.value
                          }))}
                          className="flex-1 px-2 py-1 text-sm rounded-md border focus-ring"
                          autoFocus
                          onBlur={() => handleSaveTitle(project.id)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle(project.id)}
                        />
                      ) : (
                        <span className={`${project.isActive ? 'text-green-600 dark:text-green-400 font-medium' : 'font-medium'} text-sm`}>
                          {project.name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="p-2 text-xs whitespace-nowrap">
                    <span className={`font-mono tracking-tighter ${project.isActive ? 'text-green-600 dark:text-green-400' : ''}`}>
                      {formatDuration(elapsedTimes[project.id] || project.totalTime)}
                    </span>
                  </TableCell>
                  <TableCell colSpan={2} className="p-2 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Popover open={addingSessionToProject === project.id} onOpenChange={(open) => {
                        if (!open) setAddingSessionToProject(null);
                      }}>
                        <PopoverTrigger asChild>
                          <Button
                            onClick={() => setAddingSessionToProject(project.id)}
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add Entry
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-2" align="end">
                          <AddSessionForm 
                            projectId={project.id} 
                            onClose={() => setAddingSessionToProject(null)} 
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <button
                        onClick={() => handleEditTitle(project.id)}
                        className="p-1 rounded-md hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                        aria-label="Edit project name"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStartStop(project.id, project.isActive)}
                        className={`p-1 rounded-md ${
                          project.isActive 
                            ? 'hover:bg-red-100 dark:hover:bg-red-900/20 text-green-600 hover:text-red-600' 
                            : 'hover:bg-green-100 dark:hover:bg-green-900/20 hover:text-green-600'
                        }`}
                        aria-label={project.isActive ? "Stop timer" : "Start timer"}
                      >
                        {project.isActive ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id, project.name)}
                        className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        aria-label="Delete project"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
                
                {project.sessions.length > 0 && (
                  [...project.sessions]
                    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                    .map(session => (
                      <TimeSession
                        key={session.id}
                        session={session}
                        projectId={project.id}
                      />
                    ))
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="p-2 border-t">
        <AddProjectButton />
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <ProjectProvider>
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Header />
        <main className="max-w-7xl mx-auto px-3 pb-12 pt-4">
          <ProjectTable />
        </main>
      </div>
    </ProjectProvider>
  );
};

export default Index;
