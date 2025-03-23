
import React, { useState } from 'react';
import { useProjects } from '@/contexts/ProjectContext';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const AddProjectButton: React.FC = () => {
  const [projectName, setProjectName] = useState('');
  const { addProject } = useProjects();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      addProject(projectName.trim());
      setProjectName('');
    }
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-7 text-xs flex items-center gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Project
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="text-sm font-medium mb-1">New Project</div>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project name"
            className="w-full p-2 rounded-md border bg-background/70 focus-ring text-sm"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="submit"
              size="sm"
              className="h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Project
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default AddProjectButton;
