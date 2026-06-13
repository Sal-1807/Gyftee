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
        <div className="border-4 rounded-xl px-4 py-1.5 rotate-[-15deg]" style={{ borderColor: '#2CC4A0' }}>
          <span className="text-2xl font-black tracking-wider" style={{ color: '#2CC4A0' }}>LIKE</span>
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

      {/* Discover Gifts pill */}
      <div className="absolute top-4 inset-x-0 flex justify-center z-10">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            if (!onRefresh || isRefreshing) return;
            onRefresh();
          }}
          disabled={isRefreshing}
          className="text-white text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md transition-opacity disabled:opacity-70"
          style={{ background: '#182622' }}
        >
          {isRefreshing
            ? <><Loader2 size={11} className="animate-spin" />Loading...</>
            : <><span style={{ color: '#2CC4A0' }}>✦</span>Discover Gifts</>
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
            style={{ backgroundColor: '#2CC4A0' }}
          >
            {formatPrice(gift.price)}
          </span>
          <span
            className="text-xs font-medium px-3 py-1 rounded-full border"
            style={{ backgroundColor: '#EAF7F1', borderColor: '#B8DDD4', color: '#2CC4A0' }}
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
          className="w-[62px] h-[62px] bg-white rounded-full flex items-center justify-center text-text-muted hover:bg-surface-2 active:scale-90 transition-all"
          style={{ border: '1.5px solid #D5EDE7', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
          aria-label="Dislike"
        >
          <X size={20} strokeWidth={2.2} style={{ color: '#7B9490' }} />
        </button>
        <button
          onClick={() => flyOut('right')}
          className="w-[62px] h-[62px] rounded-full flex items-center justify-center active:scale-90 transition-all"
          style={{ backgroundColor: '#FF6B9D', boxShadow: '0 6px 22px rgba(255,107,157,0.44)' }}
          aria-label="Like"
        >
          <Heart size={23} className="text-white" fill="white" />
        </button>
      </div>
    </motion.div>
  );
}
