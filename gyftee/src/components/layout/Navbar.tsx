'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gift, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { getAvatarUrl } from '@/utils/pocketbase-image';
import { cn } from '@/utils/cn';
import { useEffect, useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="hidden md:flex glass border-b border-border sticky top-0 z-40 h-16 items-center px-6">
      <Link href="/" className="flex items-center gap-2 font-bold text-lg mr-8">
        <Gift size={20} className="text-primary-light" />
        <span className="text-gradient">gyftee</span>
      </Link>

      <nav className="flex items-center gap-1 flex-1">
        {[
          { href: '/swipe', label: 'Swipe' },
          { href: '/discover', label: 'Discover' },
          { href: '/feed', label: 'Feed' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-primary/15 text-primary-light'
                : 'text-text-muted hover:text-text hover:bg-surface-2'
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      {mounted && user && (
        <div className="flex items-center gap-3">
          <Link href={`/profile/${user.username}`}>
            <Avatar src={getAvatarUrl(user)} username={user.username} size="sm" />
          </Link>
          <button
            onClick={logout}
            className="p-2 rounded-xl text-text-dim hover:text-text-muted hover:bg-surface-2 transition-colors"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </header>
  );
}
