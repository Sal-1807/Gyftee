import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'text-white shadow-md hover:opacity-90 active:scale-95',
  secondary:
    'bg-white border border-border text-text hover:bg-surface-2 active:scale-95',
  ghost:
    'text-text-muted hover:text-text hover:bg-surface-2 active:scale-95',
  danger:
    'bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 active:scale-95',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-full',
  md: 'px-5 py-2.5 text-sm rounded-full',
  lg: 'px-7 py-3.5 text-base rounded-full',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className, children, disabled, style, ...props }, ref) => {
    const isPrimary = variant === 'primary';
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        style={isPrimary ? { backgroundColor: '#1bbf96', ...style } : style}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
