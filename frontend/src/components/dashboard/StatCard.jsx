import { cn } from "../../utils";

const StatCard = ({ label, value, icon, color = "brand", trend }) => {
  const colorMap = {
    brand: "bg-brand-50 text-brand-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="card p-5 flex items-start justify-between gap-4 hover:shadow-md transition-shadow duration-200">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">{label}</p>
        <p className="text-3xl font-bold text-slate-900 tabular-nums">{value ?? "—"}</p>
        {trend && <p className="text-xs text-slate-500 mt-1">{trend}</p>}
      </div>
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", colorMap[color])}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
