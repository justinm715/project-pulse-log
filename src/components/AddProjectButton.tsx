
import React, { useState } from 'react';
import { useProjects } from '@/contexts/ProjectContext';
import { Plus } from 'lucide-react';

const AddProjectButton: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [projectName, setProjectName] = useState('');
  const { addProject } = useProjects();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      addProject(projectName.trim());
      setProjectName('');
      setIsAdding(false);
    }
  };
  
  if (isAdding) {
    return (
      <div className="w-full p-3 rounded-lg glass shadow-glass transition-all animate-scale-in">
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project name"
            className="w-full p-2 rounded-md border bg-background/70 focus-ring"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2 py-1 rounded-md border hover:bg-secondary/50 transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs"
            >
              Add Project
            </button>
          </div>
        </form>
      </div>
    );
  }
  
  return (
    <button
      onClick={() => setIsAdding(true)}
      className="w-full h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all hover:bg-accent/50 group"
    >
      <Plus className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors" />
      <span className="font-medium text-sm">Add Project</span>
    </button>
  );
};

export default AddProjectButton;
