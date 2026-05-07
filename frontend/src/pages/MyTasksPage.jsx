import { useState, useCallback } from "react";
import useFetch from "../hooks/useFetch";
import useAsync from "../hooks/useAsync";
import tasksApi from "../api/tasks.api";
import TaskCard from "../components/tasks/TaskCard";
import TaskDetail from "../components/tasks/TaskDetail";
import TaskFilters from "../components/tasks/TaskFilters";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import { CardSkeleton } from "../components/common/Skeleton";
import { useAuth } from "../store/AuthContext";

const MyTasksPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({});
  const [viewingTask, setViewingTask] = useState(null);

  const fetchFn = useCallback(
    () => tasksApi.getMyTasks(filters),
    [JSON.stringify(filters)]
  );
  const { data, isLoading, error, refetch } = useFetch(fetchFn, [JSON.stringify(filters)]);
  const tasks = data || [];

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && t.status !== "done" && new Date(t.dueDate) < new Date()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">My Tasks</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {isLoading ? "Loading…" : `${tasks.length} task${tasks.length !== 1 ? "s" : ""} assigned to you`}
          {overdueTasks.length > 0 && (
            <span className="ml-2 text-red-500 font-medium">
              · {overdueTasks.length} overdue
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      <TaskFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters({})}
      />

      {/* Content */}
      {error ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="No tasks assigned"
          description={
            Object.values(filters).some(Boolean)
              ? "No tasks match the current filters."
              : "You don't have any tasks assigned to you yet."
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={setViewingTask}
            />
          ))}
        </div>
      )}

      {/* Task detail modal */}
      <TaskDetail
        task={viewingTask}
        isOpen={!!viewingTask}
        onClose={() => setViewingTask(null)}
        onRefresh={refetch}
      />
    </div>
  );
};

export default MyTasksPage;
