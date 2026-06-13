'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { useEffect, useState } from 'react';

const MINT  = '#2CC4A0';
const MUTED = '#7B9490';

function SwipeIcon({ active }: { active: boolean }) {
  const c = active ? MINT : MUTED;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="1" y="5" width="14" height="11" rx="3" stroke={c} strokeWidth="1.8"/>
      <rect x="7" y="2" width="14" height="11" rx="3" fill={active ? '#EAF7F1' : 'white'} stroke={c} strokeWidth="1.8"/>
    </svg>
  );
}

function DiscoverIcon({ active }: { active: boolean }) {
  const c = active ? MINT : MUTED;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="9" stroke={c} strokeWidth="1.8"/>
      <path d="M15.5 6.5L13 12.5L7 15L9.5 9L15.5 6.5Z" stroke={c} strokeWidth="1.6" strokeLinejoin="round" fill={active ? MINT : 'none'}/>
    </svg>
  );
}

function FeedIcon({ active }: { active: boolean }) {
  const c = active ? MINT : MUTED;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="7.5" cy="7.5" r="3" stroke={c} strokeWidth="1.8"/>
      <path d="M1.5 19C1.5 15.7 4.2 13 7.5 13" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="14.5" cy="7.5" r="3" stroke={c} strokeWidth="1.8"/>
      <path d="M14.5 13C17.8 13 20.5 15.7 20.5 19" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const c = active ? MINT : MUTED;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="7.5" r="3.5" stroke={c} strokeWidth="1.8"/>
      <path d="M3 20C3 15.9 6.7 12.5 11 12.5C15.3 12.5 19 15.9 19 20" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

const items = [
  { href: '/swipe',    label: 'Swipe',    Icon: SwipeIcon    },
  { href: '/discover', label: 'Discover', Icon: DiscoverIcon },
  { href: '/feed',     label: 'Feed',     Icon: FeedIcon     },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-start pt-2.5 safe-area-bottom"
      style={{ height: '72px', background: 'white', borderTop: '1px solid #EAF7F1', boxShadow: '0 -4px 20px rgba(0,0,0,0.04)' }}
    >
      <div className="flex w-full">
        {items.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-[3px] transition-colors"
            >
              <Icon active={active} />
              <span
                className="text-[11px]"
                style={{ fontWeight: active ? 700 : 500, color: active ? MINT : MUTED }}
              >
                {label}
              </span>
            </Link>
          );
        })}
        <Link
          href={mounted && user ? `/profile/${user.username}` : '/login'}
          className="flex flex-1 flex-col items-center gap-[3px] transition-colors"
        >
          <ProfileIcon active={pathname.startsWith('/profile')} />
          <span
            className="text-[11px]"
            style={{ fontWeight: pathname.startsWith('/profile') ? 700 : 500, color: pathname.startsWith('/profile') ? MINT : MUTED }}
          >
            Profile
          </span>
        </Link>
      </div>
    </nav>
  );
}
