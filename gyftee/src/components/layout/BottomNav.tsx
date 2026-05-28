'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shuffle, Compass, Rss, User } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/utils/cn';

const items = [
  { href: '/swipe', icon: Shuffle, label: 'Swipe' },
  { href: '/discover', icon: Compass, label: 'Discover' },
  { href: '/feed', icon: Rss, label: 'Feed' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="md:hidden glass border-t border-border fixed bottom-0 inset-x-0 z-40 h-16 flex items-center">
      <div className="flex w-full">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors',
                active ? 'text-primary-light' : 'text-text-dim hover:text-text-muted'
              )}
            >
              <Icon size={20} />
              <span className="text-[10px]">{label}</span>
            </Link>
          );
        })}
        <Link
          href={user ? `/profile/${user.username}` : '/login'}
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors',
            pathname.startsWith('/profile') ? 'text-primary-light' : 'text-text-dim hover:text-text-muted'
          )}
        >
          <User size={20} />
          <span className="text-[10px]">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
