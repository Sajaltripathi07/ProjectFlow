import { useCallback } from "react";
import dashboardApi from "../api/dashboard.api";
import useFetch from "../hooks/useFetch";
import StatCard from "../components/dashboard/StatCard";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import TaskStatusChart from "../components/dashboard/TaskStatusChart";
import { StatCardSkeleton } from "../components/common/Skeleton";
import ErrorMessage from "../components/common/ErrorMessage";
import { useAuth } from "../store/AuthContext";

const TotalIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
  </svg>
);
const DoneIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const OverdueIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);
const ProjectsIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
};

const DashboardPage = () => {
  const { user } = useAuth();

  /* No deps needed — dashboard always fetches fresh on mount */
  const fetchFn = useCallback(() => dashboardApi.getStats(), []);
  const { data, isLoading, error, refetch } = useFetch(fetchFn, []);

  /* Default all values to 0 so UI never shows undefined */
  const stats = {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    overdueTasks: 0,
    projectCount: 0,
    tasksByStatus: { todo: 0, in_progress: 0, done: 0 },
    recentActivity: [],
    ...(data || {}),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Here&apos;s what&apos;s happening across your projects.
        </p>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={refetch} />
      ) : (
        <>
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  label="Total Tasks"
                  value={stats.totalTasks}
                  icon={<TotalIcon />}
                  color="brand"
                />
                <StatCard
                  label="Completed"
                  value={stats.completedTasks}
                  icon={<DoneIcon />}
                  color="emerald"
                  trend={
                    stats.totalTasks > 0
                      ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% completion rate`
                      : "No tasks yet"
                  }
                />
                <StatCard
                  label="Overdue"
                  value={stats.overdueTasks}
                  icon={<OverdueIcon />}
                  color={stats.overdueTasks > 0 ? "red" : "brand"}
                />
                <StatCard
                  label="Projects"
                  value={stats.projectCount}
                  icon={<ProjectsIcon />}
                  color="blue"
                />
              </>
            )}
          </div>

          {/* ── Bottom section ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tasks by status */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Tasks by Status</h3>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2" />
                      <div className="h-2 bg-slate-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <TaskStatusChart
                  tasksByStatus={stats.tasksByStatus}
                  totalTasks={stats.totalTasks}
                />
              )}
            </div>

            {/* Recent activity */}
            <div className="card p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Recent Activity</h3>
              <p className="text-xs text-slate-400 mb-3">Latest actions across your projects</p>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" />
                        <div className="h-2 bg-slate-200 rounded animate-pulse w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ActivityFeed activities={stats.recentActivity} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
