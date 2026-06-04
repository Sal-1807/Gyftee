'use client';

import { motion } from 'framer-motion';
import { Heart, X, Sparkles, Loader2 } from 'lucide-react';
import type { Gift } from '@/types/gift.types';
import { getGiftImageUrl } from '@/utils/pocketbase-image';
import { formatPrice } from '@/utils/format';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import type { SwipeDirection } from '@/types/gift.types';

interface SwipeCardProps {
  gift: Gift;
  onSwipe: (direction: SwipeDirection) => void;
  isTop: boolean;
  stackIndex: number;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

export function SwipeCard({ gift, onSwipe, isTop, stackIndex, onRefresh, isRefreshing }: SwipeCardProps) {
  const { x, rotate, likeOpacity, nopeOpacity, controls, flyOut, dragProps } =
    useSwipeGesture({ onSwipe });

  const scale = 1 - stackIndex * 0.04;
  const yOffset = stackIndex * 10;

  if (!isTop) {
    return (
      <div
        className="absolute inset-0 bg-white rounded-3xl border border-border shadow-sm overflow-hidden"
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
      className="absolute inset-0 bg-white rounded-3xl border border-border shadow-lg overflow-hidden cursor-grab active:cursor-grabbing touch-none"
      {...dragProps}
    >
      {/* Like / Nope overlays */}
      <motion.div
        style={{ opacity: likeOpacity }}
        className="absolute top-6 left-6 z-20 pointer-events-none"
      >
        <div className="border-4 rounded-xl px-4 py-1.5 rotate-[-15deg]" style={{ borderColor: '#1bbf96' }}>
          <span className="text-2xl font-black tracking-wider" style={{ color: '#1bbf96' }}>LIKE</span>
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

      {/* Header pill — refresh button */}
      <div className="absolute top-4 inset-x-0 flex justify-center z-10">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            if (!onRefresh || isRefreshing) return;
            onRefresh();
          }}
          disabled={isRefreshing}
          className="bg-gray-900 text-white text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md transition-opacity disabled:opacity-70"
        >
          {isRefreshing
            ? <><Loader2 size={11} className="animate-spin" />Loading...</>
            : <><Sparkles size={11} className="text-yellow-400" />Discover Gifts</>
          }
        </button>
      </div>

      {/* Image */}
      <div className="relative h-[58%]">
        <img
          src={getGiftImageUrl(gift)}
          alt={gift.name}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Info */}
      <div className="px-5 pt-4 pb-20 flex flex-col gap-2">
        <h2 className="text-lg font-bold text-text leading-tight">{gift.name}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full text-white"
            style={{ backgroundColor: '#1bbf96' }}
          >
            {formatPrice(gift.price)}
          </span>
          <span className="text-xs font-medium px-3 py-1 rounded-full border"
            style={{ backgroundColor: '#edfaf5', borderColor: '#c8dfd6', color: '#1bbf96' }}
          >
            {gift.category}
          </span>
        </div>
        {gift.description && (
          <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">{gift.description}</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-8">
        <button
          onClick={() => flyOut('left')}
          className="w-14 h-14 bg-white rounded-full border border-border shadow-md flex items-center justify-center text-text-muted hover:bg-surface-2 active:scale-90 transition-all"
          aria-label="Dislike"
        >
          <X size={22} />
        </button>
        <button
          onClick={() => flyOut('right')}
          className="w-14 h-14 rounded-full shadow-md flex items-center justify-center active:scale-90 transition-all"
          style={{ backgroundColor: '#fda4a4' }}
          aria-label="Like"
        >
          <Heart size={22} className="text-white" fill="white" />
        </button>
      </div>
    </motion.div>
  );
}
