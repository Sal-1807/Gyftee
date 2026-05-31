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
import type { Gift } from '@/types/gift.types';
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
    getSwipedGiftIds(user.id)
      .then((swipedIds) => getUnswipedGifts(swipedIds))
      .then((unswiped) => {
        // Reorder by ML recommendations if available
        if (rec?.gift_ids?.length && !rec.fallback) {
          const recOrder = new Map(rec.gift_ids.map((id, i) => [id, i]));
          const sorted = [...unswiped].sort((a, b) => {
            const ai = recOrder.get(a.id) ?? 9999;
            const bi = recOrder.get(b.id) ?? 9999;
            return ai - bi;
          });
          setGifts(sorted);
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
