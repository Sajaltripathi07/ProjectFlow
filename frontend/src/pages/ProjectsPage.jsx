import { useState, useCallback } from "react";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectForm from "../components/projects/ProjectForm";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import { CardSkeleton } from "../components/common/Skeleton";
import projectsApi from "../api/projects.api";
import useProjects from "../hooks/useProjects";
import useAsync from "../hooks/useAsync";
import toast from "react-hot-toast";
import { useAuth } from "../store/AuthContext";
import { ROLES } from "../constants";

const ProjectsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const { data, isLoading, error, refetch } = useProjects();
  const { execute, isLoading: isDeleting } = useAsync();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);

  const projects = data || [];

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await execute(() => projectsApi.delete(deletingProject._id));
      toast.success("Project deleted.");
      setDeletingProject(null);
      refetch();
    } catch {
      toast.error("Failed to delete project.");
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingProject(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Projects</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isLoading ? "Loading…" : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setFormOpen(true)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            }
          >
            New Project
          </Button>
        )}
      </div>

      {/* Content */}
      {error ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          }
          title={isAdmin ? "No projects yet" : "No projects assigned"}
          description={isAdmin ? "Create your first project to get started." : "You haven't been added to any projects yet."}
          action={
            isAdmin && (
              <Button onClick={() => setFormOpen(true)} size="sm">
                Create Project
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={handleEdit}
              onDelete={setDeletingProject}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ProjectForm
        isOpen={formOpen}
        onClose={handleFormClose}
        project={editingProject}
        onSuccess={refetch}
      />
      <ConfirmDialog
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"? All tasks will be permanently removed.`}
      />
    </div>
  );
};

export default ProjectsPage;
