import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Textarea from "../common/Textarea";
import Select from "../common/Select";
import Button from "../common/Button";
import tasksApi from "../../api/tasks.api";
import useAsync from "../../hooks/useAsync";
import toast from "react-hot-toast";
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from "../../constants";

const TaskForm = ({ isOpen, onClose, task, projectId, members = [], onSuccess }) => {
  const isEditing = !!task;
  const { execute, isLoading } = useAsync();

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assigneeId: "",
    dueDate: "",
    projectId: projectId || "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "todo",
        priority: task.priority || "medium",
        assigneeId: task.assignee?._id || "",
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
        projectId: task.project?._id || task.project || projectId || "",
      });
    } else {
      setForm({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assigneeId: "",
        dueDate: "",
        projectId: projectId || "",
      });
    }
    setErrors({});
  }, [task, isOpen, projectId]);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required";
    else if (form.title.trim().length < 3) errs.title = "Title must be at least 3 characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    /* ── Build clean payload — omit null/empty optional fields entirely
         so express-validator optional() chains are never triggered      ── */
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      projectId: form.projectId,
    };

    // Only include assigneeId if a real value is selected
    if (form.assigneeId) payload.assigneeId = form.assigneeId;

    // Only include dueDate if a date was picked
    if (form.dueDate) payload.dueDate = form.dueDate;

    try {
      if (isEditing) {
        await execute(() => tasksApi.update(task._id, payload));
        toast.success("Task updated!");
      } else {
        await execute(() => tasksApi.create(payload));
        toast.success("Task created!");
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    }
  };

  /* ── Build assignee dropdown from project members ── */
  const memberOptions = members.map((m) => ({
    value: m._id,
    label: `${m.name} — ${m.role}`,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Task" : "New Task"} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          required
          value={form.title}
          onChange={set("title")}
          error={errors.title}
          placeholder="e.g. Design landing page"
        />

        <Textarea
          label="Description"
          value={form.description}
          onChange={set("description")}
          placeholder="Optional task description..."
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            value={form.status}
            onChange={set("status")}
            options={STATUS_OPTIONS}
          />
          <Select
            label="Priority"
            value={form.priority}
            onChange={set("priority")}
            options={PRIORITY_OPTIONS}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Assign To</label>
            <select
              className="input-field appearance-none cursor-pointer"
              value={form.assigneeId}
              onChange={set("assigneeId")}
            >
              <option value="">Unassigned</option>
              {memberOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {memberOptions.length === 0 && (
              <p className="text-xs text-amber-600 mt-0.5">
                Add members to this project first to assign tasks.
              </p>
            )}
          </div>

          <Input
            label="Due Date"
            type="date"
            value={form.dueDate}
            onChange={set("dueDate")}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskForm;
