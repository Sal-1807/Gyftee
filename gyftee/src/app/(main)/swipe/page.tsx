'use client';

import { useAuth } from '@/features/auth/AuthContext';
import { useSubmitSwipe } from '@/hooks/useSwipes';
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

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGifts = () => {
    if (!user) return;
    setLoading(true);
    getSwipedGiftIds(user.id)
      .then((swipedIds) => getUnswipedGifts(swipedIds))
      .then(setGifts)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGifts();
  }, [user?.id]);

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
