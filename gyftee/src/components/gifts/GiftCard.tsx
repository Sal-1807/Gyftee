'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import type { Gift } from '@/types/gift.types';
import { getGiftImageUrl } from '@/utils/pocketbase-image';
import { formatPrice } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';
import { CATEGORY_COLORS } from '@/lib/constants';
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
        'glass-card overflow-hidden cursor-pointer group transition-all duration-200',
        'hover:border-border-bright hover:scale-[1.02]',
        className
      )}
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={getGiftImageUrl(gift)}
          alt={gift.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge
            variant="primary"
            className="text-[10px]"
            style={{ backgroundColor: `${CATEGORY_COLORS[gift.category]}20`, color: CATEGORY_COLORS[gift.category], borderColor: `${CATEGORY_COLORS[gift.category]}30` }}
          >
            {gift.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <span className="text-sm font-bold text-white bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">
            {formatPrice(gift.price)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-text text-sm leading-tight mb-1 line-clamp-1">{gift.name}</h3>
        <p className="text-xs text-text-muted line-clamp-2 mb-3 leading-relaxed">{gift.description}</p>

        {gift.tags && gift.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {gift.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] bg-surface-3 text-text-dim px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {gift.store_link && (
        <div className="px-4 pb-4">
          <a
            href={gift.store_link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs text-primary-light hover:text-primary transition-colors"
          >
            <ExternalLink size={12} />
            View on store
          </a>
        </div>
      )}
    </div>
  );
}
