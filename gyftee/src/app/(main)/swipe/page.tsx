'use client';

import { useAuth } from '@/features/auth/AuthContext';
import { useSubmitSwipe } from '@/hooks/useSwipes';
import { useRecommendations } from '@/hooks/useRecommendations';
import { SwipeDeck } from '@/components/gifts/SwipeDeck';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { useToast } from '@/components/ui/Toast';
import { useQueryClient } from '@tanstack/react-query';
import { getSwipedGiftIds } from '@/services/swipes.service';
import { useEffect, useState } from 'react';
import type { Gift, GiftCategory } from '@/types/gift.types';
import { getUnswipedGifts } from '@/services/gifts.service';

export default function SwipePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { mutate: submitSwipe } = useSubmitSwipe(user?.id ?? '');
  const { data: rec } = useRecommendations(100);

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGifts = () => {
    if (!user) return;
    setLoading(true);

    let interests = new Set<GiftCategory>();
    try {
      const stored = localStorage.getItem(`gyftee_interests_${user.id}`);
      if (stored) interests = new Set<GiftCategory>(JSON.parse(stored));
    } catch {}

    getSwipedGiftIds(user.id)
      .then((swipedIds) => getUnswipedGifts(swipedIds))
      .then((unswiped) => {
        if (rec?.gift_ids?.length && !rec.fallback) {
          // ML recommendations available — use their order
          const recOrder = new Map(rec.gift_ids.map((id, i) => [id, i]));
          setGifts([...unswiped].sort((a, b) => {
            const ai = recOrder.get(a.id) ?? 9999;
            const bi = recOrder.get(b.id) ?? 9999;
            return ai - bi;
          }));
        } else if (interests.size > 0) {
          // ML not ready yet — surface selected-interest categories first
          setGifts([...unswiped].sort((a, b) => {
            const aMatch = interests.has(a.category as GiftCategory) ? 0 : 1;
            const bMatch = interests.has(b.category as GiftCategory) ? 0 : 1;
            return aMatch - bMatch;
          }));
        } else {
          setGifts(unswiped);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGifts();
  }, [user?.id, rec?.gift_ids]);

  const handleSwipe = (giftId: string, liked: boolean) => {
    if (!user) return;
    submitSwipe({ giftId, liked }, {
      onSuccess: () => {
        if (liked) toast('Added to wishlist!', 'success');
      },
    });
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <PageHeader title="Swipe" subtitle="Like or pass on gifts" />

      {loading ? (
        <CardSkeleton />
      ) : (
        <SwipeDeck
          gifts={gifts}
          onSwipe={handleSwipe}
          onEmpty={loadGifts}
        />
      )}
    </div>
  );
}
