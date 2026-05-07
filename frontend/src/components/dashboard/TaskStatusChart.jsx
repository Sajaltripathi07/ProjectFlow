import { TASK_STATUS_LABELS } from "../../constants";

const statusColors = {
  todo: { bar: "bg-slate-300", text: "text-slate-600" },
  in_progress: { bar: "bg-blue-400", text: "text-blue-600" },
  done: { bar: "bg-emerald-400", text: "text-emerald-600" },
};

const TaskStatusChart = ({ tasksByStatus = {}, totalTasks = 0 }) => {
  const statuses = ["todo", "in_progress", "done"];

  return (
    <div className="space-y-3">
      {statuses.map((status) => {
        const count = tasksByStatus[status] || 0;
        const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
        const { bar, text } = statusColors[status];

        return (
          <div key={status}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-600">
                {TASK_STATUS_LABELS[status]}
              </span>
              <span className={`text-xs font-semibold tabular-nums ${text}`}>
                {count} <span className="font-normal text-slate-400">({pct}%)</span>
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskStatusChart;
