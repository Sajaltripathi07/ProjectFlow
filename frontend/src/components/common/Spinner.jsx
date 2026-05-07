import { cn } from "../../utils";

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-7 w-7 border-2",
  lg: "h-10 w-10 border-[3px]",
};

const Spinner = ({ size = "md", className }) => (
  <div
    className={cn(
      "animate-spin rounded-full border-slate-200 border-t-brand-600",
      sizeMap[size],
      className
    )}
    role="status"
    aria-label="Loading"
  />
);

export const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Spinner size="lg" />
  </div>
);

export default Spinner;
