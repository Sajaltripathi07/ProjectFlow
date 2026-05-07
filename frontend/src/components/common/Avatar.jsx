import { getInitials, cn } from "../../utils";

const colorList = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

const getColor = (name = "") => colorList[name.charCodeAt(0) % colorList.length];

const sizeMap = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-11 h-11 text-base",
};

const Avatar = ({ name = "", size = "md", className }) => (
  <div
    className={cn(
      "rounded-full flex items-center justify-center font-semibold shrink-0",
      sizeMap[size],
      getColor(name),
      className
    )}
    title={name}
  >
    {getInitials(name)}
  </div>
);

export const AvatarGroup = ({ users = [], max = 3 }) => {
  const visible = users.slice(0, max);
  const rest = users.length - max;
  return (
    <div className="flex -space-x-2">
      {visible.map((u, i) => (
        <Avatar key={u._id || i} name={u.name} size="sm" className="ring-2 ring-white" />
      ))}
      {rest > 0 && (
        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-center ring-2 ring-white">
          +{rest}
        </div>
      )}
    </div>
  );
};

export default Avatar;
