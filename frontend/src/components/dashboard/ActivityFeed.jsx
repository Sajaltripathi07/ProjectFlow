import Avatar from "../common/Avatar";
import { timeAgo } from "../../utils";

const ActivityItem = ({ activity }) => (
  <div className="flex items-start gap-3 py-3">
    <Avatar name={activity.user?.name} size="sm" className="mt-0.5 shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-sm text-slate-700">
        <span className="font-medium">{activity.user?.name}</span>{" "}
        <span className="text-slate-500">{activity.action}</span>{" "}
        <span className="font-medium text-brand-600 truncate">{activity.entityName}</span>
      </p>
      <p className="text-xs text-slate-400 mt-0.5">{timeAgo(activity.createdAt)}</p>
    </div>
  </div>
);

const ActivityFeed = ({ activities = [] }) => {
  if (!activities.length) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">No recent activity.</div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {activities.map((a) => (
        <ActivityItem key={a._id} activity={a} />
      ))}
    </div>
  );
};

export default ActivityFeed;
