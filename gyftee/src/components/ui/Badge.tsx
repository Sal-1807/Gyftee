import { cn } from '@/utils/cn';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-surface-3 text-text-muted',
  primary: 'bg-primary/15 text-primary-light border border-primary/20',
  success: 'bg-success/15 text-emerald-400 border border-success/20',
  warning: 'bg-warning/15 text-amber-400 border border-warning/20',
  error: 'bg-error/15 text-red-400 border border-error/20',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ children, variant = 'default', className, style }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}
