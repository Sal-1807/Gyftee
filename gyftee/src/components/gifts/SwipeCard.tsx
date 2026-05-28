'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, X, ExternalLink } from 'lucide-react';
import type { Gift } from '@/types/gift.types';
import { getGiftImageUrl } from '@/utils/pocketbase-image';
import { formatPrice } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';
import { CATEGORY_COLORS } from '@/lib/constants';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import type { SwipeDirection } from '@/types/gift.types';

interface SwipeCardProps {
  gift: Gift;
  onSwipe: (direction: SwipeDirection) => void;
  isTop: boolean;
  stackIndex: number;
}

export function SwipeCard({ gift, onSwipe, isTop, stackIndex }: SwipeCardProps) {
  const { x, rotate, likeOpacity, nopeOpacity, controls, flyOut, dragProps } =
    useSwipeGesture({ onSwipe });

  const scale = 1 - stackIndex * 0.04;
  const yOffset = stackIndex * 8;

  if (!isTop) {
    return (
      <div
        className="absolute inset-0 glass-card overflow-hidden"
        style={{
          transform: `scale(${scale}) translateY(${yOffset}px)`,
          zIndex: -stackIndex,
          pointerEvents: 'none',
        }}
      />
    );
  }

  return (
    <motion.div
      style={{ x, rotate, zIndex: 10 }}
      animate={controls}
      className="absolute inset-0 glass-card overflow-hidden cursor-grab active:cursor-grabbing touch-none"
      {...dragProps}
    >
      {/* Like / Nope overlays */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-6 left-6 z-20 pointer-events-none"
      >
        <div className="border-4 border-success rounded-xl px-4 py-1.5 rotate-[-15deg]">
          <span className="text-2xl font-black text-success tracking-wider">LIKE</span>
        </div>
      </motion.div>
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="absolute top-6 right-6 z-20 pointer-events-none"
      >
        <div className="border-4 border-error rounded-xl px-4 py-1.5 rotate-[15deg]">
          <span className="text-2xl font-black text-error tracking-wider">NOPE</span>
        </div>
      </motion.div>

      {/* Image */}
      <div className="relative h-[55%]">
        <Image
          src={getGiftImageUrl(gift)}
          alt={gift.name}
          fill
          className="object-cover"
          sizes="480px"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent" />
        <div className="absolute top-4 right-4">
          <span className="bg-black/50 backdrop-blur-sm text-white font-bold text-sm px-3 py-1.5 rounded-xl">
            {formatPrice(gift.price)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold text-text leading-tight">{gift.name}</h2>
          <Badge
            style={{
              backgroundColor: `${CATEGORY_COLORS[gift.category]}20`,
              color: CATEGORY_COLORS[gift.category],
              borderColor: `${CATEGORY_COLORS[gift.category]}30`,
            }}
          >
            {gift.category}
          </Badge>
        </div>

        <p className="text-sm text-text-muted leading-relaxed line-clamp-3">{gift.description}</p>

        {gift.tags && gift.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {gift.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs bg-surface-3 text-text-dim px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {gift.store_link && (
          <a
            href={gift.store_link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs text-primary-light hover:text-primary transition-colors w-fit"
          >
            <ExternalLink size={12} />
            View on store
          </a>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-6">
        <button
          onClick={() => flyOut('left')}
          className="w-14 h-14 rounded-full bg-error/15 border-2 border-error/40 flex items-center justify-center text-red-400 hover:bg-error/25 active:scale-90 transition-all"
          aria-label="Dislike"
        >
          <X size={24} />
        </button>
        <button
          onClick={() => flyOut('right')}
          className="w-14 h-14 rounded-full bg-success/15 border-2 border-success/40 flex items-center justify-center text-emerald-400 hover:bg-success/25 active:scale-90 transition-all"
          aria-label="Like"
        >
          <Heart size={24} />
        </button>
      </div>
    </motion.div>
  );
}
