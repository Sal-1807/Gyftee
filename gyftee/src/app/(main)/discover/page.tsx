'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useGifts } from '@/hooks/useGifts';
import { useRecommendations } from '@/hooks/useRecommendations';
import { GiftCard } from '@/components/gifts/GiftCard';
import { GiftModal } from '@/components/gifts/GiftModal';
import { CategoryFilter } from '@/components/gifts/CategoryFilter';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Gift, GiftCategory } from '@/types/gift.types';
import { pb } from '@/lib/pocketbase';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Brain } from 'lucide-react';

export default function DiscoverPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState<GiftCategory | undefined>(undefined);
  const [selected, setSelected] = useState<Gift | null>(null);

  const { data: allGifts, isLoading: giftsLoading } = useGifts(category);
  const { data: rec } = useRecommendations(20);

  const { data: recommendedGifts, isLoading: recLoading } = useQuery({
    queryKey: ['recommendedGifts', rec?.gift_ids],
    enabled: !!rec?.gift_ids?.length,
    queryFn: async () => {
      const items = await Promise.all(
        rec!.gift_ids.map((id) => pb.collection('gifts').getOne(id))
      );
      return items as Gift[];
    },
  });

  const showRecommended = !category && !!recommendedGifts?.length;
  const displayGifts = showRecommended ? recommendedGifts! : (allGifts ?? []);
  const isLoading = giftsLoading || (showRecommended && recLoading);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-8">
      <PageHeader
        title="Discover"
        subtitle="Find gifts you never knew you wanted"
      />

      {/* ML info card */}
      {rec && !rec.fallback && (
        <div className="glass-card p-4 mb-5 flex items-start gap-3">
          <Brain size={18} className="text-primary-light mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-medium text-text">
              {rec.user_swipe_count < 5
                ? 'Showing all gifts — swipe more for personalised picks'
                : `Personalised for you · ${rec.user_swipe_count} swipes`}
            </span>
            {rec.user_swipe_count >= 5 && (
              <div className="text-text-muted mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={11} />
                  Content match {Math.round((rec.model_weights.content ?? 0) * 100)}%
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles size={11} />
                  Collaborative {Math.round((rec.model_weights.collab ?? 0) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-5">
        <CategoryFilter selected={category} onChange={setCategory} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayGifts.map((gift) => (
            <GiftCard key={gift.id} gift={gift} onClick={() => setSelected(gift)} />
          ))}
        </div>
      )}

      <GiftModal gift={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
