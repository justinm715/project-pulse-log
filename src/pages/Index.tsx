
import React from 'react';
import { ProjectProvider, useProjects } from '@/contexts/ProjectContext';
import Header from '@/components/Header';
import ProjectCard from '@/components/ProjectCard';
import AddProjectButton from '@/components/AddProjectButton';

const ProjectGrid: React.FC = () => {
  const { projects } = useProjects();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
      <AddProjectButton />
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <ProjectProvider>
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Header />
        <main className="max-w-5xl mx-auto px-4 pb-20">
          <ProjectGrid />
        </main>
      </div>
    </ProjectProvider>
  );
};

export default Index;
