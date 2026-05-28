import Image from 'next/image';
import { cn } from '@/utils/cn';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizes: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-xs' },
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-14 h-14', text: 'text-lg' },
  xl: { container: 'w-20 h-20', text: 'text-2xl' },
};

interface AvatarProps {
  src?: string | null;
  username?: string;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ src, username, size = 'md', className }: AvatarProps) {
  const { container, text } = sizes[size];
  const initial = username?.[0]?.toUpperCase() ?? '?';

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden flex-shrink-0',
        'gradient-primary flex items-center justify-center',
        container,
        className
      )}
    >
      {src ? (
        <Image src={src} alt={username ?? 'avatar'} fill className="object-cover" sizes="80px" />
      ) : (
        <span className={cn('font-bold text-white select-none', text)}>{initial}</span>
      )}
    </div>
  );
}
