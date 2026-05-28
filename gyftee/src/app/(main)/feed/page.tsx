'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthContext';
import { useFeed } from '@/hooks/useFeed';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar } from '@/components/ui/Avatar';
import { GiftModal } from '@/components/gifts/GiftModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { getAvatarUrl, getGiftImageUrl } from '@/utils/pocketbase-image';
import { formatPrice, timeAgo } from '@/utils/format';
import { Rss, Heart } from 'lucide-react';
import type { Gift } from '@/types/gift.types';
import type { AppUser } from '@/types/user.types';

export default function FeedPage() {
  const { user } = useAuth();
  const { data: swipes, isLoading } = useFeed(user?.id);
  const [selected, setSelected] = useState<Gift | null>(null);

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-8">
      <PageHeader title="Feed" subtitle="What your friends are loving" />

      {isLoading && (
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

      {!isLoading && (!swipes || swipes.length === 0) && (
        <EmptyState
          icon={<Rss />}
          title="Your feed is empty"
          description="Follow people to see what gifts they're loving."
        />
      )}

      {!isLoading && swipes && swipes.length > 0 && (
        <div className="space-y-4">
          {swipes.map((swipe) => {
            const swipeUser = swipe.expand?.user as AppUser | undefined;
            const gift = swipe.expand?.gift as Gift | undefined;
            if (!gift) return null;

            return (
              <div key={swipe.id} className="glass-card overflow-hidden">
                <div className="p-4 flex items-center gap-3">
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
                    <span className="text-sm text-text-muted"> liked a gift</span>
                    <p className="text-xs text-text-dim">{timeAgo(swipe.created)}</p>
                  </div>
                  <Heart size={14} className="text-accent flex-shrink-0" />
                </div>

                <button
                  onClick={() => setSelected(gift)}
                  className="w-full text-left"
                >
                  <div className="relative h-48 mx-4 mb-4 rounded-xl overflow-hidden">
                    <Image
                      src={getGiftImageUrl(gift)}
                      alt={gift.name}
                      fill
                      className="object-cover"
                      sizes="560px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <p className="font-semibold text-white text-sm">{gift.name}</p>
                      <span className="text-sm font-bold text-primary-light">
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
