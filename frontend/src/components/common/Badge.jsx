import { cn } from "../../utils";
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from "../../constants";

export const StatusBadge = ({ status }) => (
  <span className={cn(`badge-${status}`)}>
    {TASK_STATUS_LABELS[status] || status}
  </span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={cn(`badge-${priority}`)}>
    {TASK_PRIORITY_LABELS[priority] || priority}
  </span>
);

export const RoleBadge = ({ role }) => (
  <span
    className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
      role === "admin"
        ? "bg-violet-100 text-violet-700"
        : "bg-slate-100 text-slate-600"
    )}
  >
    {role}
  </span>
);
