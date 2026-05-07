const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon && (
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
        {icon}
      </div>
    )}
    <h3 className="text-sm font-semibold text-slate-800 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 max-w-xs mb-5">{description}</p>}
    {action && action}
  </div>
);

export default EmptyState;
