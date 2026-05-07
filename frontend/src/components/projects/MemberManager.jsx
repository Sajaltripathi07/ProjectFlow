import { useState } from "react";
import Avatar from "../common/Avatar";
import { RoleBadge } from "../common/Badge";
import Button from "../common/Button";
import Select from "../common/Select";
import projectsApi from "../../api/projects.api";
import useAsync from "../../hooks/useAsync";
import toast from "react-hot-toast";

const MemberManager = ({ project, allUsers = [], onRefresh, isOwner }) => {
  const { execute, isLoading } = useAsync();
  const [selectedUserId, setSelectedUserId] = useState("");

  const memberIds = new Set(project.members?.map((m) => m._id));
  const availableUsers = allUsers.filter((u) => !memberIds.has(u._id) && u._id !== project.owner?._id);

  const handleAdd = async () => {
    if (!selectedUserId) return;
    try {
      await execute(() => projectsApi.addMember(project._id, selectedUserId));
      toast.success("Member added.");
      setSelectedUserId("");
      onRefresh();
    } catch {}
  };

  const handleRemove = async (userId) => {
    try {
      await execute(() => projectsApi.removeMember(project._id, userId));
      toast.success("Member removed.");
      onRefresh();
    } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Member list */}
      <div className="divide-y divide-slate-100">
        {project.members?.map((member) => {
          const isProjectOwner = member._id === project.owner?._id;
          return (
            <div key={member._id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Avatar name={member.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RoleBadge role={member.role} />
                {isOwner && !isProjectOwner && (
                  <button
                    onClick={() => handleRemove(member._id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded"
                    title="Remove member"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add member */}
      {isOwner && availableUsers.length > 0 && (
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <Select
            className="flex-1"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            options={availableUsers.map((u) => ({ value: u._id, label: `${u.name} (${u.role})` }))}
            placeholder="Select a user to add..."
          />
          <Button onClick={handleAdd} isLoading={isLoading} disabled={!selectedUserId}>
            Add
          </Button>
        </div>
      )}
    </div>
  );
};

export default MemberManager;
