'use client';

import { X, ExternalLink, Heart, Tag, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { formatPrice } from '@/utils/format';
import { motion, AnimatePresence } from 'framer-motion';
import type { Gift } from '@/types/gift.types';
import { getGiftImageUrl } from '@/utils/pocketbase-image';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CATEGORY_COLORS } from '@/lib/constants';

interface GiftModalProps {
  gift: Gift | null;
  onClose: () => void;
}

export function GiftModal({ gift, onClose }: GiftModalProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    if (!gift) return;
    const url = `${window.location.origin}/discover?gift=${gift.id}`;
    const shareData = { title: gift.name, text: `Check out "${gift.name}" on Gyftee!`, url };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast('Link copied!', 'success');
    }
  };

  return (
    <AnimatePresence>
      {gift && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto glass-card overflow-hidden"
          >
            <div className="relative h-64">
              <img
                src={getGiftImageUrl(gift)}
                alt={gift.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-text-muted hover:text-text transition-colors"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-end justify-between gap-2">
                  <h2 className="text-xl font-bold text-white leading-tight">{gift.name}</h2>
                  <span className="text-xl font-bold flex-shrink-0" style={{ color: '#1bbf96' }}>
                    {formatPrice(gift.price)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2">
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

              <p className="text-sm text-text-muted leading-relaxed">{gift.description}</p>

              {gift.tags && gift.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={12} className="text-text-dim" />
                  {gift.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-surface-3 text-text-dim px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                {gift.store_link && (
                  <a
                    href={gift.store_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button fullWidth variant="primary" size="md">
                      <ExternalLink size={14} />
                      Buy Now
                    </Button>
                  </a>
                )}
                <Button variant="secondary" size="md" onClick={handleShare}>
                  <Share2 size={14} />
                  Share
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
