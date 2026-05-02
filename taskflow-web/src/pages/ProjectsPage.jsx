// src/pages/ProjectsPage.jsx

import { useState } from 'react';
import Layout from '../components/Layout/Layout';
import ProjectCard from '../components/Project/ProjectCard';
import ProjectForm from '../components/Project/ProjectForm';
import ConfirmDelete from '../components/Project/ConfirmDelete';
import { useProjects } from '../features/projects/useProjects';
import Button from '../shared/ui/Button';
import Spinner from '../shared/ui/Spinner';

const ProjectsPage = () => {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);

  const handleCreate = async (data) => {
    await createProject(data);
  };

  const handleUpdate = async (data) => {
    await updateProject(editingProject.id, data);
    setEditingProject(null);
  };

  const handleDelete = async () => {
    await deleteProject(deletingProject.id);
    setDeletingProject(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Projects
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Organize your tasks into projects
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            + New Project
          </Button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No projects yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first project to organize tasks
            </p>
            <Button onClick={() => setShowForm(true)}>
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={setEditingProject}
                onDelete={setDeletingProject}
                taskCount={project.taskCount || 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showForm || editingProject) && (
        <ProjectForm
          project={editingProject}
          onSubmit={editingProject ? handleUpdate : handleCreate}
          onClose={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deletingProject && (
        <ConfirmDelete
          project={deletingProject}
          onConfirm={handleDelete}
          onClose={() => setDeletingProject(null)}
        />
      )}
    </Layout>
  );
};

export default ProjectsPage;