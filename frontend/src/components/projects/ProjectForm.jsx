import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Textarea from "../common/Textarea";
import Button from "../common/Button";
import projectsApi from "../../api/projects.api";
import useAsync from "../../hooks/useAsync";
import toast from "react-hot-toast";

const ProjectForm = ({ isOpen, onClose, project, onSuccess }) => {
  const isEditing = !!project;
  const { execute, isLoading } = useAsync();

  const [form, setForm] = useState({ name: "", description: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setForm({ name: project.name || "", description: project.description || "" });
    } else {
      setForm({ name: "", description: "" });
    }
    setErrors({});
  }, [project, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Project name is required";
    else if (form.name.trim().length < 3) errs.name = "Name must be at least 3 characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    try {
      await execute(() =>
        isEditing
          ? projectsApi.update(project._id, form)
          : projectsApi.create(form)
      );
      toast.success(isEditing ? "Project updated!" : "Project created!");
      onSuccess();
      onClose();
    } catch {
      // error is handled by useAsync
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Project" : "New Project"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          required
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          error={errors.name}
          placeholder="e.g. Mobile App Redesign"
        />
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Brief description of the project..."
          rows={3}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectForm;
