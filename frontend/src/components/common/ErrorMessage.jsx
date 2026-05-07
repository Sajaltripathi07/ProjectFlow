const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-3">
      <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    </div>
    <p className="text-sm font-medium text-slate-700 mb-1">Failed to load</p>
    <p className="text-xs text-slate-500 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        Try again
      </button>
    )}
  </div>
);

export default ErrorMessage;
