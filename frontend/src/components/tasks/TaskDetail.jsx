import Modal from "../common/Modal";
import { StatusBadge, PriorityBadge } from "../common/Badge";
import Avatar from "../common/Avatar";
import Button from "../common/Button";
import Select from "../common/Select";
import { formatDate, isOverdue, timeAgo, cn } from "../../utils";
import { STATUS_OPTIONS } from "../../constants";
import { useAuth } from "../../store/AuthContext";
import { ROLES } from "../../constants";
import { useState } from "react";
import tasksApi from "../../api/tasks.api";
import useAsync from "../../hooks/useAsync";
import toast from "react-hot-toast";

const DetailRow = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
    <div className="text-sm text-slate-800">{children}</div>
  </div>
);

const TaskDetail = ({ task, isOpen, onClose, onRefresh }) => {
  const { user } = useAuth();
  const { execute, isLoading } = useAsync();
  const [newStatus, setNewStatus] = useState(task?.status || "todo");
  const overdue = isOverdue(task?.dueDate, task?.status);

  if (!task) return null;

  const canUpdateStatus = true; // both roles
  const isAdmin = user?.role === ROLES.ADMIN;

  const handleStatusUpdate = async () => {
    try {
      await execute(() => tasksApi.update(task._id, { status: newStatus }));
      toast.success("Status updated!");
      onRefresh?.();
      onClose();
    } catch {}
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details" size="md">
      <div className="space-y-5">
        {/* Title & badges */}
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-2">{task.title}</h3>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {overdue && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                Overdue
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-100">
            {task.description}
          </p>
        )}

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-4">
          <DetailRow label="Assignee">
            {task.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar name={task.assignee.name} size="xs" />
                <span>{task.assignee.name}</span>
              </div>
            ) : (
              <span className="text-slate-400">Unassigned</span>
            )}
          </DetailRow>
          <DetailRow label="Due Date">
            <span className={cn(overdue ? "text-red-600 font-medium" : "")}>
              {formatDate(task.dueDate)}
            </span>
          </DetailRow>
          <DetailRow label="Created By">
            {task.createdBy?.name || "—"}
          </DetailRow>
          <DetailRow label="Created">
            {timeAgo(task.createdAt)}
          </DetailRow>
        </div>

        {/* Status update */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Update Status</p>
          <div className="flex gap-2">
            <Select
              className="flex-1"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={STATUS_OPTIONS}
            />
            <Button
              onClick={handleStatusUpdate}
              isLoading={isLoading}
              disabled={newStatus === task.status}
            >
              Update
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetail;
