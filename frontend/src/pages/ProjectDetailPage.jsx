import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useTasks from "../hooks/useTasks";
import useAsync from "../hooks/useAsync";
import projectsApi from "../api/projects.api";
import tasksApi from "../api/tasks.api";
import usersApi from "../api/users.api";
import TaskCard from "../components/tasks/TaskCard";
import TaskForm from "../components/tasks/TaskForm";
import TaskDetail from "../components/tasks/TaskDetail";
import TaskFilters from "../components/tasks/TaskFilters";
import MemberManager from "../components/projects/MemberManager";
import ProjectForm from "../components/projects/ProjectForm";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import { CardSkeleton } from "../components/common/Skeleton";
import { PageSpinner } from "../components/common/Spinner";
import { StatusBadge } from "../components/common/Badge";
import { useAuth } from "../store/AuthContext";
import { ROLES } from "../constants";
import toast from "react-hot-toast";

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  const [taskFilters, setTaskFilters] = useState({});
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);

  const { execute: execDelete, isLoading: isDeleting } = useAsync();

  /* ── Fetch project ── */
  const projectFetch = useCallback(() => projectsApi.getById(id), [id]);
  const {
    data: projectData,
    isLoading: projectLoading,
    error: projectError,
    refetch: refetchProject,
  } = useFetch(projectFetch, [id]);

  /* ── Fetch tasks ── */
  const {
    data: tasksData,
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useTasks(id, taskFilters);

  /* ── Fetch all users (for member management panel) ── */
  const usersFetch = useCallback(() => usersApi.getAll(), []);
  const { data: allUsers } = useFetch(usersFetch, []);

  const project = projectData?.project;
  const tasks = tasksData || [];
  const isOwner = project?.owner?._id === user?._id;

  /* ── Build deduplicated assignable members list (members + owner) ──
       The backend seeds the owner into members[], but after editing the
       project the owner may or may not appear — deduplicate by _id.     ── */
  const assignableMembers = useMemo(() => {
    if (!project) return [];
    const seen = new Set();
    const all = [];

    // Include owner first
    if (project.owner && !seen.has(project.owner._id)) {
      seen.add(project.owner._id);
      all.push({ ...project.owner, role: project.owner.role || "admin" });
    }

    // Then all members
    (project.members || []).forEach((m) => {
      if (!seen.has(m._id)) {
        seen.add(m._id);
        all.push(m);
      }
    });

    return all;
  }, [project]);

  const handleDeleteTask = async () => {
    try {
      await execDelete(() => tasksApi.delete(deletingTask._id));
      toast.success("Task deleted.");
      setDeletingTask(null);
      refetchTasks();
    } catch {
      toast.error("Failed to delete task.");
    }
  };

  const handleFilterReset = () => setTaskFilters({});

  if (projectLoading) return <PageSpinner />;
  if (projectError) return <ErrorMessage message={projectError} />;
  if (!project) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Project header ── */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => navigate("/projects")}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>
              <h2 className="text-lg font-bold text-slate-900 truncate">{project.name}</h2>
            </div>
            {project.description && (
              <p className="text-sm text-slate-500 ml-6">{project.description}</p>
            )}

            {/* Member avatars summary */}
            <div className="ml-6 mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400">
                {assignableMembers.length} member{assignableMembers.length !== 1 ? "s" : ""}
              </span>
              <span className="text-slate-200">·</span>
              <span className="text-xs text-slate-400">
                Owner: <span className="text-slate-600 font-medium">{project.owner?.name}</span>
              </span>
            </div>
          </div>

          {/* Task stat badges */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {(projectData?.taskStats || []).map((s) => (
              <div key={s._id} className="flex items-center gap-1.5">
                <StatusBadge status={s._id} />
                <span className="text-xs font-semibold text-slate-600 tabular-nums">{s.count}</span>
              </div>
            ))}
          </div>

          {isAdmin && isOwner && (
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="secondary" size="sm" onClick={() => setMembersOpen(true)}>
                Members
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setEditProjectOpen(true)}>
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Tasks section ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-900">
              Tasks{" "}
              <span className="text-slate-400 font-normal">({tasks.length})</span>
            </h3>
            <TaskFilters
              filters={taskFilters}
              onChange={setTaskFilters}
              onReset={handleFilterReset}
            />
          </div>
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => { setEditingTask(null); setTaskFormOpen(true); }}
              leftIcon={
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              }
            >
              Add Task
            </Button>
          )}
        </div>

        {tasksError ? (
          <ErrorMessage message={tasksError} onRetry={refetchTasks} />
        ) : tasksLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            }
            title="No tasks yet"
            description={
              isAdmin
                ? "Add the first task to this project."
                : "No tasks have been assigned to this project yet."
            }
            action={
              isAdmin && (
                <Button size="sm" onClick={() => setTaskFormOpen(true)}>
                  Add Task
                </Button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={setViewingTask}
                onEdit={(t) => { setEditingTask(t); setTaskFormOpen(true); }}
                onDelete={setDeletingTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}

      {/* Task create / edit — passes deduplicated assignable members */}
      <TaskForm
        isOpen={taskFormOpen}
        onClose={() => { setTaskFormOpen(false); setEditingTask(null); }}
        task={editingTask}
        projectId={id}
        members={assignableMembers}
        onSuccess={refetchTasks}
      />

      <TaskDetail
        task={viewingTask}
        isOpen={!!viewingTask}
        onClose={() => setViewingTask(null)}
        onRefresh={refetchTasks}
      />

      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
        isLoading={isDeleting}
        title="Delete Task"
        message={`Delete "${deletingTask?.title}"? This cannot be undone.`}
      />

      {/* Member management modal */}
      <Modal isOpen={membersOpen} onClose={() => setMembersOpen(false)} title="Manage Members" size="md">
        <MemberManager
          project={project}
          allUsers={allUsers || []}
          onRefresh={() => { refetchProject(); setMembersOpen(false); }}
          isOwner={isOwner}
        />
      </Modal>

      {/* Edit project modal */}
      <ProjectForm
        isOpen={editProjectOpen}
        onClose={() => setEditProjectOpen(false)}
        project={project}
        onSuccess={() => { refetchProject(); setEditProjectOpen(false); }}
      />
    </div>
  );
};

export default ProjectDetailPage;
