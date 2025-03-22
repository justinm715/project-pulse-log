
import React from 'react';
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
import { 
  Clock, 
  Edit, 
  Trash, 
  Play, 
  Pause, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { formatDuration } from '@/lib/timeUtils';
import { ScrollArea } from '@/components/ui/scroll-area';

const ProjectTable: React.FC = () => {
  const { 
    projects, 
    startSession, 
    stopSession, 
    deleteProject, 
    updateProjectName 
  } = useProjects();
  const [expandedProjects, setExpandedProjects] = React.useState<Record<string, boolean>>({});
  const [editingTitle, setEditingTitle] = React.useState<string | null>(null);
  const [projectName, setProjectName] = React.useState<Record<string, string>>({});
  
  // For updating active session times
  const [elapsedTimes, setElapsedTimes] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    // Initialize expanded state and project names
    const expanded: Record<string, boolean> = {};
    const names: Record<string, string> = {};
    const times: Record<string, number> = {};
    
    projects.forEach(project => {
      expanded[project.id] = expandedProjects[project.id] || false;
      names[project.id] = project.name;
      times[project.id] = project.totalTime;
    });
    
    setExpandedProjects(expanded);
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

  const toggleExpand = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

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

  return (
    <div className="rounded-md border">
      <ScrollArea className="h-[calc(100vh-120px)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map(project => (
              <React.Fragment key={project.id}>
                <TableRow className={project.isActive ? 'bg-green-50/50 dark:bg-green-950/20' : ''}>
                  <TableCell>
                    <button 
                      onClick={() => toggleExpand(project.id)}
                      className="p-1 rounded-sm hover:bg-muted/80"
                    >
                      {expandedProjects[project.id] ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
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
                        <span className={project.isActive ? 'text-green-600 dark:text-green-400 font-medium' : 'font-medium'}>
                          {project.name}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-mono tracking-tighter ${project.isActive ? 'text-green-600 dark:text-green-400' : ''}`}>
                      {formatDuration(elapsedTimes[project.id] || project.totalTime)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
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
                
                {expandedProjects[project.id] && project.sessions.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-0">
                      <div className="bg-muted/30 px-4 py-2">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-b border-border/40">
                              <TableHead className="py-2">Start Time</TableHead>
                              <TableHead className="py-2">End Time</TableHead>
                              <TableHead className="py-2">Duration</TableHead>
                              <TableHead className="py-2">Notes</TableHead>
                              <TableHead className="py-2 text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {[...project.sessions]
                              .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                              .map(session => (
                                <TimeSession
                                  key={session.id}
                                  session={session}
                                  projectId={project.id}
                                />
                              ))
                            }
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="p-3 border-t">
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
