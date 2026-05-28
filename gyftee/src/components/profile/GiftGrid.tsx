'use client';

import { useState } from 'react';
import type { Gift } from '@/types/gift.types';
import { GiftCard } from '@/components/gifts/GiftCard';
import { GiftModal } from '@/components/gifts/GiftModal';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Heart } from 'lucide-react';

interface GiftGridProps {
  gifts: Gift[];
  isLoading?: boolean;
}

export function GiftGrid({ gifts, isLoading }: GiftGridProps) {
  const [selected, setSelected] = useState<Gift | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (gifts.length === 0) {
    return (
      <EmptyState
        icon={<Heart />}
        title="No liked gifts yet"
        description="Start swiping to build your wishlist."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {gifts.map((gift) => (
          <GiftCard key={gift.id} gift={gift} onClick={() => setSelected(gift)} />
        ))}
      </div>
      <GiftModal gift={selected} onClose={() => setSelected(null)} />
    </>
  );
}
