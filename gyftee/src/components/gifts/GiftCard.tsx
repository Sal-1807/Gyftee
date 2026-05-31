'use client';

import Image from 'next/image';
import { Heart } from 'lucide-react';
import type { Gift } from '@/types/gift.types';
import { getGiftImageUrl } from '@/utils/pocketbase-image';
import { formatPrice } from '@/utils/format';
import { cn } from '@/utils/cn';

interface GiftCardProps {
  gift: Gift;
  onClick?: () => void;
  className?: string;
}

export function GiftCard({ gift, onClick, className }: GiftCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5',
        className
      )}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
        <Image
          src={getGiftImageUrl(gift)}
          alt={gift.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {/* Heart icon */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm transition-colors hover:bg-white"
          aria-label="Save"
        >
          <Heart size={14} className="text-text-dim" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-text text-sm leading-tight mb-1.5 line-clamp-1">
          {gift.name}
        </h3>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold" style={{ color: '#1bbf96' }}>
            {formatPrice(gift.price)}
          </span>
          <span className="text-xs text-text-dim truncate">{gift.category}</span>
        </div>
      </div>
    </div>
  );
}
