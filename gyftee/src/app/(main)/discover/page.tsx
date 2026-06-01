'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/features/auth/AuthContext';
import { useGifts } from '@/hooks/useGifts';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useDebounce } from '@/hooks/useDebounce';
import { useIsFollowing, useToggleFollow } from '@/hooks/useFollows';
import { useLikedGifts, useSubmitSwipe, useRemoveFromWishlist } from '@/hooks/useSwipes';
import { GiftCard } from '@/components/gifts/GiftCard';
import { GiftModal } from '@/components/gifts/GiftModal';
import { CategoryFilter } from '@/components/gifts/CategoryFilter';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { searchGifts } from '@/services/gifts.service';
import { searchUsers } from '@/services/users.service';
import { getAvatarUrl } from '@/utils/pocketbase-image';
import type { Gift, GiftCategory } from '@/types/gift.types';
import type { AppUser } from '@/types/user.types';
import { pb } from '@/lib/pocketbase';
import { AddGiftModal } from '@/components/gifts/AddGiftModal';
import { PriceSlider } from '@/components/gifts/PriceSlider';
import { Search, Sparkles, Brain, UserPlus, UserCheck, Plus } from 'lucide-react';

const MAX_PRICE_INR = 7000;

function UserRow({ user, currentUserId }: { user: AppUser; currentUserId: string }) {
  const { data: following } = useIsFollowing(currentUserId, user.id);
  const { mutate: toggleFollow, isPending } = useToggleFollow(currentUserId);
  const isOwn = currentUserId === user.id;

  return (
    <div className="glass-card p-3 flex items-center gap-3">
      <Link href={`/profile/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar src={getAvatarUrl(user)} username={user.username} size="md" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text truncate">@{user.username}</p>
          {user.name && <p className="text-xs text-text-muted truncate">{user.name}</p>}
        </div>
      </Link>
      {!isOwn && (
        <Button
          variant={following ? 'secondary' : 'primary'}
          size="sm"
          loading={isPending}
          onClick={() => toggleFollow({ targetId: user.id, following: !!following })}
        >
          {following ? <UserCheck size={14} /> : <UserPlus size={14} />}
          {following ? 'Following' : 'Follow'}
        </Button>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState<GiftCategory | undefined>(undefined);
  const [selected, setSelected] = useState<Gift | null>(null);
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(Infinity);
  const debouncedQuery = useDebounce(query, 300);

  const { data: likedGifts } = useLikedGifts(user?.id);
  const wishlistedIds = new Set(likedGifts?.map((g) => g.id));
  const { mutate: addToWishlist } = useSubmitSwipe(user?.id ?? '');
  const { mutate: removeFromWishlist } = useRemoveFromWishlist(user?.id ?? '');

  function handleWishlistToggle(gift: Gift) {
    if (!user) return;
    if (wishlistedIds.has(gift.id)) {
      removeFromWishlist(gift.id);
    } else {
      addToWishlist({ giftId: gift.id, liked: true });
    }
  }
  const isSearching = debouncedQuery.trim().length > 0;

  const { data: allGifts, isLoading: giftsLoading } = useGifts(category, undefined, maxPrice === Infinity ? undefined : maxPrice);
  const { data: rec } = useRecommendations(20);

  const { data: recommendedGifts, isLoading: recLoading } = useQuery({
    queryKey: ['recommendedGifts', rec?.gift_ids],
    enabled: !!rec?.gift_ids?.length && !isSearching,
    queryFn: async () => {
      const items = await Promise.all(
        rec!.gift_ids.map((id) => pb.collection('gifts').getOne(id))
      );
      return items as Gift[];
    },
  });

  const { data: giftResults, isLoading: giftSearchLoading } = useQuery({
    queryKey: ['searchGifts', debouncedQuery],
    enabled: isSearching,
    queryFn: () => searchGifts(debouncedQuery),
  });

  const { data: userResults, isLoading: userSearchLoading } = useQuery({
    queryKey: ['searchUsers', debouncedQuery],
    enabled: isSearching,
    queryFn: () => searchUsers(debouncedQuery),
  });

  const showRecommended = !category && !isSearching && !!recommendedGifts?.length;
  const displayGifts = showRecommended ? recommendedGifts! : (allGifts ?? []);
  const isLoading = isSearching
    ? giftSearchLoading || userSearchLoading
    : giftsLoading || (showRecommended && recLoading);

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-8">
      <PageHeader title="Discover" subtitle="Find gifts you never knew you wanted" />

      {/* Search bar */}
      <div className="mb-5">
        <Input
          placeholder="Search gifts or people..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<Search size={15} />}
        />
      </div>

      {isSearching ? (
        <>
          {/* Gift search results */}
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
              Gifts
            </h2>
            {giftSearchLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : giftResults?.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {giftResults.map((gift) => (
                  <GiftCard
                    key={gift.id}
                    gift={gift}
                    onClick={() => setSelected(gift)}
                    isWishlisted={wishlistedIds.has(gift.id)}
                    onWishlistToggle={() => handleWishlistToggle(gift)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No gifts found for "{debouncedQuery}"</p>
            )}
          </section>

          {/* User search results */}
          <section>
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
              People
            </h2>
            {userSearchLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="glass-card p-3 h-16 animate-pulse" />
                ))}
              </div>
            ) : userResults?.length ? (
              <div className="space-y-2">
                {userResults.map((u) => (
                  <UserRow key={u.id} user={u} currentUserId={user?.id ?? ''} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No people found for "{debouncedQuery}"</p>
            )}
          </section>
        </>
      ) : (
        <>
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

          <div className="mb-3">
            <CategoryFilter selected={category} onChange={setCategory} />
          </div>

          <div className="glass-card p-4 mb-5">
            <PriceSlider
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
              absoluteMax={MAX_PRICE_INR}
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {displayGifts.map((gift) => (
                <GiftCard
                    key={gift.id}
                    gift={gift}
                    onClick={() => setSelected(gift)}
                    isWishlisted={wishlistedIds.has(gift.id)}
                    onWishlistToggle={() => handleWishlistToggle(gift)}
                  />
              ))}
            </div>
          )}
        </>
      )}

      <GiftModal gift={selected} onClose={() => setSelected(null)} />

      {/* Floating add button */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-24 right-5 w-14 h-14 gradient-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform z-40"
        aria-label="Add a gift"
      >
        <Plus size={24} />
      </button>

      {addOpen && <AddGiftModal onClose={() => setAddOpen(false)} />}
    </div>
  );
}
