import { cn } from "../../utils/cn";

export const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  ...props 
}) => {
  const variants = {
    primary: "btn-primary",
    outline: "btn-outline",
    ghost: "text-white/60 hover:text-white transition-colors",
    secondary: "bg-white/10 text-white hover:bg-white/20 transition-all px-6 py-3 font-semibold",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center gap-2 select-none",
        variants[variant],
        variant !== 'ghost' && variant !== 'secondary' && sizes[size],
        variant === 'secondary' && sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
