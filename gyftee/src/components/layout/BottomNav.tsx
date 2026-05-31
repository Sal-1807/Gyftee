'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, Compass, Users, User } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { cn } from '@/utils/cn';
import { useEffect, useState } from 'react';

const items = [
  { href: '/swipe',    icon: Flame,   label: 'Swipe'    },
  { href: '/discover', icon: Compass, label: 'Discover' },
  { href: '/feed',     icon: Users,   label: 'Feed'     },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 bg-white border-t border-border flex items-center safe-area-bottom">
      <div className="flex w-full">
        {items.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors"
              style={{ color: active ? '#1bbf96' : '#9ca3af' }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        <Link
          href={mounted && user ? `/profile/${user.username}` : '/login'}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors"
          style={{ color: pathname.startsWith('/profile') ? '#1bbf96' : '#9ca3af' }}
        >
          <User size={20} strokeWidth={pathname.startsWith('/profile') ? 2.5 : 1.8} />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}
