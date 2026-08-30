'use client';

import { useAuth } from '@/features/auth/AuthContext';
import { useSubmitSwipe } from '@/hooks/useSwipes';
import { useRecommendations } from '@/hooks/useRecommendations';
import { SwipeDeck } from '@/components/gifts/SwipeDeck';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { useToast } from '@/components/ui/Toast';
import { getSwipedGiftIds, getLikedGifts } from '@/services/swipes.service';
import { useEffect, useRef, useState } from 'react';
import type { Gift } from '@/types/gift.types';
import { getUnswipedGifts } from '@/services/gifts.service';

// Below this many likes there isn't enough signal to infer taste from swipe
// history, so we fall back to the categories picked during onboarding.
const MIN_LIKES_FOR_TASTE = 3;

function readInterests(userId: string): string[] {
  try {
    const stored = localStorage.getItem(`gyftee_interests_${userId}`);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

/**
 * Preferred categories, strongest first.
 *
 * Primary signal is the user's actual liked-swipe history so preferences adapt
 * as their taste evolves. `likedGifts` arrives newest-first, so ties are broken
 * towards the more recently liked category. Onboarding interests are only used
 * while there is too little history to be meaningful.
 */
function getPreferredCategories(likedGifts: Gift[], onboardingInterests: string[]): string[] {
  if (likedGifts.length < MIN_LIKES_FOR_TASTE) return onboardingInterests;

  const counts = new Map<string, number>();
  const mostRecentIdx = new Map<string, number>();

  likedGifts.forEach((gift, idx) => {
    if (!gift.category) return;
    counts.set(gift.category, (counts.get(gift.category) ?? 0) + 1);
    if (!mostRecentIdx.has(gift.category)) mostRecentIdx.set(gift.category, idx);
  });

  if (counts.size === 0) return onboardingInterests;

  return [...counts.keys()].sort((a, b) => {
    const byCount = (counts.get(b) ?? 0) - (counts.get(a) ?? 0);
    if (byCount !== 0) return byCount;
    return (mostRecentIdx.get(a) ?? 0) - (mostRecentIdx.get(b) ?? 0);
  });
}

/**
 * Reranking layer on top of the ML recommendation — it never rescores anything.
 *
 * Category tier is the primary key (preferred categories in order, then
 * everything else); the ML ranking is the secondary key, so the model still
 * decides the ordering *within* a category. When ML is unavailable we keep the
 * previous graceful fallback of randomising within a tier so the deck varies.
 *
 * `blocked` holds gifts already shown as the top card in this refresh cycle;
 * the first unblocked gift is promoted to the front so a refresh moves forward
 * instead of re-showing the current card.
 */
function rankDeck({
  unswiped,
  recIds,
  isFallback,
  preferred,
  blocked,
}: {
  unswiped: Gift[];
  recIds: string[] | undefined;
  isFallback: boolean;
  preferred: string[];
  blocked: Set<string>;
}): Gift[] {
  const preferredRank = new Map<string, number>();
  preferred.forEach((category, i) => preferredRank.set(category, i));
  const unpreferredTier = preferred.length;

  const secondary = new Map<string, number>();
  if (recIds?.length && !isFallback) {
    recIds.forEach((id, i) => secondary.set(id, i));
  } else {
    unswiped.forEach((gift) => secondary.set(gift.id, Math.random()));
  }

  const sorted = [...unswiped].sort((a, b) => {
    const tierA = preferredRank.get(a.category) ?? unpreferredTier;
    const tierB = preferredRank.get(b.category) ?? unpreferredTier;
    if (tierA !== tierB) return tierA - tierB;
    return (
      (secondary.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
      (secondary.get(b.id) ?? Number.MAX_SAFE_INTEGER)
    );
  });

  // With one gift left there is nothing to move it aside for — show it.
  if (sorted.length <= 1 || blocked.size === 0) return sorted;

  const headIdx = sorted.findIndex((gift) => !blocked.has(gift.id));
  // -1 = everything is blocked (caller resets the cycle), 0 = already unblocked.
  if (headIdx <= 0) return sorted;

  const [head] = sorted.splice(headIdx, 1);
  sorted.unshift(head);
  return sorted;
}

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
  // Gifts shown as the top card since the last real swipe. Without this, two
  // gifts ping-pong: the deterministic ranking puts A first, refresh demotes A
  // to show B, and the next refresh demotes B and brings A straight back.
  const recentlyShownRef = useRef<Set<string>>(new Set());

  const loadGifts = () => {
    if (!user) return;
    setLoading(true);
    recentlyShownRef.current.clear();
    Promise.all([getSwipedGiftIds(user.id), getLikedGifts(user.id)])
      .then(async ([swipedIds, likedGifts]) => {
        const unswiped = await getUnswipedGifts(swipedIds);
        const ranked = rankDeck({
          unswiped,
          recIds: rec?.gift_ids,
          isFallback: !!rec?.fallback,
          preferred: getPreferredCategories(likedGifts, readInterests(user.id)),
          blocked: new Set<string>(),
        });
        setGifts(ranked);
        if (ranked[0]) recentlyShownRef.current.add(ranked[0].id);
      })
      .finally(() => setLoading(false));
  };

  // Only re-run when the user changes. rec is read from closure: if cached recs are
  // already available on mount they're used; if not, interests-sort is used and the
  // user can explicitly refresh via the "Discover Gifts" button once ML resolves.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadGifts(); }, [user?.id]);

  const handleRefreshDeck = async (currentGiftId: string) => {
    if (!user || refreshingRef.current) return;
    refreshingRef.current = true;
    setIsRefreshing(true);
    try {
      const interests = readInterests(user.id);

      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, n: 100, interests }),
      });
      const freshRec = res.ok ? await res.json() : null;

      const [swipedIds, likedGifts] = await Promise.all([
        getSwipedGiftIds(user.id),
        getLikedGifts(user.id),
      ]);
      const unswiped = await getUnswipedGifts(swipedIds);

      const blocked = new Set(recentlyShownRef.current);
      if (currentGiftId) blocked.add(currentGiftId);

      // Every remaining gift has already been shown — start a new cycle rather
      // than freezing on one ordering. The current card stays blocked unless
      // it's the only unseen gift left.
      if (unswiped.length > 0 && unswiped.every((gift) => blocked.has(gift.id))) {
        recentlyShownRef.current.clear();
        blocked.clear();
        if (unswiped.length > 1 && currentGiftId) blocked.add(currentGiftId);
      }

      const ranked = rankDeck({
        unswiped,
        recIds: freshRec?.gift_ids,
        isFallback: !!freshRec?.fallback,
        preferred: getPreferredCategories(likedGifts, interests),
        blocked,
      });

      setGifts(ranked);
      if (ranked[0]) recentlyShownRef.current.add(ranked[0].id);
      setDeckRevision((r) => r + 1);
      toast('Deck refreshed!', 'success');
    } finally {
      refreshingRef.current = false;
      setIsRefreshing(false);
    }
  };

  const handleSwipe = (giftId: string, liked: boolean) => {
    if (!user) return;
    // A real swipe changes the candidate pool, so the shown-history is stale.
    recentlyShownRef.current.clear();
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
