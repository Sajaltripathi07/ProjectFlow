import { cn } from "../../utils";
import Spinner from "./Spinner";

const variantMap = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost: "inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors",
};

const sizeMap = {
  sm: "!px-3 !py-1.5 !text-xs",
  md: "",
  lg: "!px-5 !py-3 !text-base",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => (
  <button
    className={cn(variantMap[variant], sizeMap[size], className)}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading ? (
      <Spinner size="sm" />
    ) : leftIcon ? (
      <span className="shrink-0">{leftIcon}</span>
    ) : null}
    {children}
    {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
  </button>
);

export default Button;
