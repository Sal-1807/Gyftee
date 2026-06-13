'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthContext';
import { useFeed } from '@/hooks/useFeed';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { GiftModal } from '@/components/gifts/GiftModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { getAvatarUrl, getGiftImageUrl } from '@/utils/pocketbase-image';
import { timeAgo, formatPrice } from '@/utils/format';
import { Rss, Heart, HeartOff } from 'lucide-react';
import type { Gift } from '@/types/gift.types';
import type { AppUser } from '@/types/user.types';

export default function FeedPage() {
  const { user } = useAuth();
  const { data: swipes, isLoading } = useFeed(user?.id);
  const [selected, setSelected] = useState<Gift | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-8">
      <PageHeader title="Feed" subtitle="What your friends are loving" />

      {(!mounted || isLoading) && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-32 h-3" />
              </div>
              <Skeleton className="w-full h-40 rounded-lg" />
              <Skeleton className="w-2/3 h-3" />
            </div>
          ))}
        </div>
      )}

      {mounted && !isLoading && (!swipes || swipes.length === 0) && (
        <EmptyState
          icon={<Rss />}
          title="Your feed is empty"
          description="Follow people to see what gifts they're loving."
        />
      )}

      {mounted && !isLoading && swipes && swipes.length > 0 && (
        <div className="space-y-3">
          {swipes.map((swipe) => {
            const swipeUser = swipe.expand?.user as AppUser | undefined;
            const gift = swipe.expand?.gift as Gift | undefined;
            if (!gift) return null;

            return (
              <div key={swipe.id} className="glass-card overflow-hidden">
                <div className="p-3 flex items-center gap-2.5">
                  {swipeUser && (
                    <Link href={`/profile/${swipeUser.username}`}>
                      <Avatar
                        src={getAvatarUrl(swipeUser)}
                        username={swipeUser.username}
                        size="sm"
                      />
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-text">
                      {swipeUser?.username ?? 'Someone'}
                    </span>
                    <span className="text-sm text-text-muted">
                      {swipe.liked ? ' liked a gift' : ' removed from wishlist'}
                    </span>
                    <p className="text-xs text-text-dim">{timeAgo(swipe.updated)}</p>
                  </div>
                  {swipe.liked
                    ? <Heart size={13} className="text-accent flex-shrink-0" />
                    : <HeartOff size={13} className="text-text-muted flex-shrink-0" />
                  }
                </div>

                <button
                  onClick={() => setSelected(gift)}
                  className="w-full text-left"
                >
                  <div className="relative h-32 mx-3 mb-3 rounded-xl overflow-hidden">
                    <img
                      src={getGiftImageUrl(gift)}
                      alt={gift.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between">
                      <p className="font-semibold text-white text-sm">{gift.name}</p>
                      <span className="text-sm font-bold" style={{ color: '#2CC4A0' }}>
                        {formatPrice(gift.price)}
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <GiftModal gift={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
