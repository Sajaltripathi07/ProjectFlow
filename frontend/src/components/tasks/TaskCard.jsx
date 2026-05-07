import { StatusBadge, PriorityBadge } from "../common/Badge";
import Avatar from "../common/Avatar";
import { formatDate, isOverdue, cn } from "../../utils";
import { useAuth } from "../../store/AuthContext";
import { ROLES } from "../../constants";

const TaskCard = ({ task, onClick, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      className="card p-4 flex flex-col gap-3 hover:shadow-md transition-all duration-200 cursor-pointer group animate-fade-in"
      onClick={() => onClick?.(task)}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2 flex-1">
          {task.title}
        </h4>
        {isAdmin && (
          <div
            className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onEdit?.(task)}
              className="p-1 rounded text-slate-400 hover:text-brand-600 transition-colors"
              title="Edit"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete?.(task)}
              className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
      )}

      {/* Badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        {overdue && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            Overdue
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <Avatar name={task.assignee.name} size="xs" />
            <span className="text-xs text-slate-500 truncate max-w-[80px]">{task.assignee.name}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Unassigned</span>
        )}
        {task.dueDate && (
          <span className={cn("text-xs", overdue ? "text-red-500 font-medium" : "text-slate-400")}>
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
