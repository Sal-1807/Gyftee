'use client';

import { useAuth } from '@/features/auth/AuthContext';
import { useSubmitSwipe } from '@/hooks/useSwipes';
import { useRecommendations } from '@/hooks/useRecommendations';
import { SwipeDeck } from '@/components/gifts/SwipeDeck';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { useToast } from '@/components/ui/Toast';
import { getSwipedGiftIds } from '@/services/swipes.service';
import { useEffect, useRef, useState } from 'react';
import type { Gift, GiftCategory } from '@/types/gift.types';
import { getUnswipedGifts } from '@/services/gifts.service';

export default function SwipePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { mutate: submitSwipe } = useSubmitSwipe(user?.id ?? '');
  const { data: rec } = useRecommendations(100);

  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [deckRevision, setDeckRevision] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshingRef = useRef(false);

  const applySort = (unswiped: Gift[], recIds: string[] | undefined, isFallback: boolean) => {
    let interests = new Set<GiftCategory>();
    try {
      const stored = localStorage.getItem(`gyftee_interests_${user!.id}`);
      if (stored) interests = new Set<GiftCategory>(JSON.parse(stored));
    } catch {}

    if (recIds?.length && !isFallback) {
      const recOrder = new Map(recIds.map((id, i) => [id, i]));
      return [...unswiped].sort((a, b) => (recOrder.get(a.id) ?? 9999) - (recOrder.get(b.id) ?? 9999));
    } else if (interests.size > 0) {
      return [...unswiped].sort((a, b) =>
        (interests.has(a.category as GiftCategory) ? 0 : 1) - (interests.has(b.category as GiftCategory) ? 0 : 1)
      );
    }
    return unswiped;
  };

  const loadGifts = () => {
    if (!user) return;
    setLoading(true);
    getSwipedGiftIds(user.id)
      .then((swipedIds) => getUnswipedGifts(swipedIds))
      .then((unswiped) => setGifts(applySort(unswiped, rec?.gift_ids, !!rec?.fallback)))
      .finally(() => setLoading(false));
  };

  // Only re-run when the user changes. rec is read from closure: if cached recs are
  // already available on mount they're used; if not, interests-sort is used and the
  // user can explicitly refresh via the "Discover Gifts" button once ML resolves.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadGifts(); }, [user?.id]);

  const handleRefreshDeck = async () => {
    if (!user || refreshingRef.current) return;
    refreshingRef.current = true;
    setIsRefreshing(true);
    try {
      let interests: string[] = [];
      try {
        const stored = localStorage.getItem(`gyftee_interests_${user.id}`);
        if (stored) interests = JSON.parse(stored);
      } catch {}

      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, n: 100, interests }),
      });
      const freshRec = res.ok ? await res.json() : null;

      const swipedIds = await getSwipedGiftIds(user.id);
      const unswiped = await getUnswipedGifts(swipedIds);

      let sorted: Gift[];
      if (freshRec?.gift_ids?.length && !freshRec?.fallback) {
        sorted = applySort(unswiped, freshRec.gift_ids, false);
      } else {
        // ML unavailable — sort by interests; if no interests, shuffle
        sorted = applySort(unswiped, undefined, true);
        if (sorted === unswiped) {
          sorted = [...unswiped];
          for (let i = sorted.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
          }
        }
      }

      setGifts(sorted);
      setDeckRevision((r) => r + 1);
      toast('Deck refreshed!', 'success');
    } finally {
      refreshingRef.current = false;
      setIsRefreshing(false);
    }
  };

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
          key={deckRevision}
          gifts={gifts}
          onSwipe={handleSwipe}
          onEmpty={loadGifts}
          onRefresh={handleRefreshDeck}
          isRefreshing={isRefreshing}
        />
      )}
    </div>
  );
}
