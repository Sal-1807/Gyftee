'use client';

import { useState, useCallback } from 'react';
import type { Gift, SwipeDirection } from '@/types/gift.types';
import { SwipeCard } from './SwipeCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Shuffle } from 'lucide-react';
import { DECK_SIZE } from '@/lib/constants';

interface SwipeDeckProps {
  gifts: Gift[];
  onSwipe: (giftId: string, liked: boolean) => void;
  onEmpty?: () => void;
  onRefresh?: (currentGiftId: string) => Promise<void>;
  isRefreshing?: boolean;
}

export function SwipeDeck({ gifts, onSwipe, onEmpty, onRefresh, isRefreshing }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      const gift = gifts[currentIndex];
      if (!gift) return;

      const liked = direction === 'right';
      onSwipe(gift.id, liked);

      const next = currentIndex + 1;
      setCurrentIndex(next);
      if (next >= gifts.length) {
        onEmpty?.();
      }
    },
    [currentIndex, gifts, onSwipe, onEmpty]
  );

  const remaining = gifts.slice(currentIndex, currentIndex + DECK_SIZE);

  if (remaining.length === 0) {
    return (
      <EmptyState
        icon={<Shuffle />}
        title="You've seen everything!"
        description="Come back later for new gifts, or explore the discover page."
      />
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto" style={{ aspectRatio: '9/14' }}>
      {remaining
        .slice()
        .reverse()
        .map((gift, reversedIdx) => {
          const stackIndex = remaining.length - 1 - reversedIdx;
          return (
            <SwipeCard
              key={gift.id}
              gift={gift}
              onSwipe={handleSwipe}
              isTop={stackIndex === 0}
              stackIndex={stackIndex}
              onRefresh={stackIndex === 0 && onRefresh ? () => onRefresh(gift.id) : undefined}
              isRefreshing={stackIndex === 0 ? isRefreshing : undefined}
            />
          );
        })}
    </div>
  );
}
