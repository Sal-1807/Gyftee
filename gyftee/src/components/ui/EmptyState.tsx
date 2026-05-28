import { cn } from '@/utils/cn';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl gradient-primary-subtle border border-primary/20 flex items-center justify-center text-primary-light text-2xl">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="font-semibold text-text">{title}</p>
        {description && <p className="text-sm text-text-muted max-w-xs">{description}</p>}
      </div>
      {action}
    </div>
  );
}
