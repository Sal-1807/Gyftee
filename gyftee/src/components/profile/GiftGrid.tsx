'use client';

import { useState } from 'react';
import { X, Heart } from 'lucide-react';
import type { Gift } from '@/types/gift.types';
import { GiftModal } from '@/components/gifts/GiftModal';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { getGiftImageUrl } from '@/utils/pocketbase-image';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';

interface GiftGridProps {
  gifts: Gift[];
  isLoading?: boolean;
  onRemove?: (giftId: string) => void;
  viewerWishlistedIds?: Set<string>;
  onViewerWishlistToggle?: (giftId: string) => void;
}

export function GiftGrid({ gifts, isLoading, onRemove, viewerWishlistedIds, onViewerWishlistToggle }: GiftGridProps) {
  const [selected, setSelected] = useState<Gift | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
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
      <div className="grid grid-cols-3 gap-2">
        {gifts.map((gift) => (
          <div
            key={gift.id}
            className="relative group cursor-pointer rounded-xl overflow-hidden aspect-square bg-surface-2 border border-border"
            onClick={() => setSelected(gift)}
          >
            <img
              src={getGiftImageUrl(gift)}
              alt={gift.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
            <div className="absolute bottom-0 inset-x-0 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-[10px] font-semibold truncate drop-shadow">{gift.name}</p>
              <p className="text-[10px] font-bold drop-shadow" style={{ color: '#2CC4A0' }}>{formatPrice(gift.price)}</p>
            </div>

            {/* Remove button (own profile) */}
            {onRemove && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(gift.id); }}
                className={cn(
                  'absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 rounded-full',
                  'flex items-center justify-center text-red-400',
                  'md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-sm',
                  'hover:bg-red-50 active:scale-90'
                )}
                aria-label="Remove from wishlist"
              >
                <X size={12} />
              </button>
            )}

            {/* Wishlist toggle (viewer on another user's profile) */}
            {onViewerWishlistToggle && (
              <button
                onClick={(e) => { e.stopPropagation(); onViewerWishlistToggle(gift.id); }}
                className={cn(
                  'absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 rounded-full',
                  'flex items-center justify-center shadow-sm',
                  'hover:bg-red-50 active:scale-90 transition-all'
                )}
                aria-label={viewerWishlistedIds?.has(gift.id) ? 'Remove from your wishlist' : 'Add to your wishlist'}
              >
                <Heart
                  size={11}
                  className={viewerWishlistedIds?.has(gift.id) ? 'fill-current' : 'text-text-dim'}
                  style={viewerWishlistedIds?.has(gift.id) ? { color: '#FF6B9D' } : undefined}
                />
              </button>
            )}
          </div>
        ))}
      </div>
      <GiftModal
        gift={selected}
        onClose={() => setSelected(null)}
        isWishlisted={selected && onViewerWishlistToggle ? viewerWishlistedIds?.has(selected.id) : undefined}
        onWishlistToggle={selected && onViewerWishlistToggle ? () => onViewerWishlistToggle(selected.id) : undefined}
        onRemove={selected && onRemove ? () => { onRemove(selected.id); setSelected(null); } : undefined}
      />
    </>
  );
}
