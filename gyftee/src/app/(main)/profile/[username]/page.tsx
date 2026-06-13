'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthContext';
import { getUserByUsername } from '@/services/users.service';
import { getLikedGifts } from '@/services/swipes.service';
import { getFollowers, getFollowing } from '@/services/follows.service';
import { useIsFollowing } from '@/hooks/useFollows';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { GiftGrid } from '@/components/profile/GiftGrid';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useLikedGifts, useSubmitSwipe, useRemoveFromWishlist } from '@/hooks/useSwipes';
import { FollowListModal } from '@/components/profile/FollowListModal';
import type { AppUser } from '@/types/user.types';
import type { Follower } from '@/types/user.types';
import { Pencil, LogOut, Lock } from 'lucide-react';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { user: currentUser, logout } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null);

  const { data: profileUser, isLoading: userLoading } = useQuery({
    queryKey: ['user', username],
    queryFn: () => getUserByUsername(username),
  });

  const isOwnProfile = currentUser?.id === profileUser?.id;

  const { data: isFollowingUser } = useIsFollowing(currentUser?.id, profileUser?.id);
  const canSeeWishlist = isOwnProfile || !!isFollowingUser;

  const { data: likedGifts, isLoading: giftsLoading } = useQuery({
    queryKey: ['likedGifts', profileUser?.id],
    enabled: !!profileUser?.id,
    queryFn: () => getLikedGifts(profileUser!.id),
  });

  const { data: followers } = useQuery({
    queryKey: ['followers', profileUser?.id],
    enabled: !!profileUser?.id,
    queryFn: () => getFollowers(profileUser!.id),
  });

  const { data: following } = useQuery({
    queryKey: ['following', profileUser?.id],
    enabled: !!profileUser?.id,
    queryFn: () => getFollowing(profileUser!.id),
  });

  const { mutate: removeGift } = useRemoveFromWishlist(currentUser?.id ?? '');
  const { data: viewerLikedGifts } = useLikedGifts(currentUser?.id);
  const viewerWishlistedIds = new Set(viewerLikedGifts?.map((g) => g.id));
  const { mutate: addToWishlist } = useSubmitSwipe(currentUser?.id ?? '');

  const handleViewerWishlistToggle = (giftId: string) => {
    if (!currentUser) return;
    if (viewerWishlistedIds.has(giftId)) {
      removeGift(giftId);
    } else {
      addToWishlist({ giftId, liked: true });
    }
  };

  if (userLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4">
        <Skeleton className="w-full h-40" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-6 text-center">
        <p className="text-text-muted">User not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <ProfileHeader
        user={profileUser}
        followersCount={followers?.length ?? 0}
        followingCount={following?.length ?? 0}
        likedCount={likedGifts?.length ?? 0}
        onFollowersClick={canSeeWishlist ? () => setFollowModal('followers') : undefined}
        onFollowingClick={canSeeWishlist ? () => setFollowModal('following') : undefined}
      />

      {isOwnProfile && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil size={14} />
            Edit Profile
          </Button>
          <Button variant="danger" size="sm" className="md:hidden" onClick={logout}>
            <LogOut size={14} />
            Log out
          </Button>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-text mb-4">Wishlist</h2>

        {canSeeWishlist ? (
          <GiftGrid
            gifts={likedGifts ?? []}
            isLoading={giftsLoading}
            onRemove={isOwnProfile ? removeGift : undefined}
            viewerWishlistedIds={!isOwnProfile ? viewerWishlistedIds : undefined}
            onViewerWishlistToggle={!isOwnProfile ? handleViewerWishlistToggle : undefined}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-14 gap-4 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: '#EAF7F1', border: '1px solid #B8DDD4' }}
            >
              <Lock size={22} style={{ color: '#2CC4A0' }} />
            </div>
            <div>
              <p className="font-semibold text-text">Follow to see their wishlist</p>
              <p className="text-sm text-text-muted mt-1">
                Follow @{profileUser.username} to unlock their gift picks
              </p>
            </div>
          </div>
        )}
      </div>

      {editOpen && currentUser && (
        <ProfileEditModal user={currentUser} onClose={() => setEditOpen(false)} />
      )}

      {followModal === 'followers' && (
        <FollowListModal
          title="Followers"
          users={(followers ?? []).map((f: Follower) => f.expand?.follower).filter((u): u is AppUser => !!u)}
          currentUserId={currentUser?.id ?? ''}
          onClose={() => setFollowModal(null)}
        />
      )}

      {followModal === 'following' && (
        <FollowListModal
          title="Following"
          users={(following ?? []).map((f: Follower) => f.expand?.following).filter((u): u is AppUser => !!u)}
          currentUserId={currentUser?.id ?? ''}
          showUnfollow={isOwnProfile}
          onClose={() => setFollowModal(null)}
        />
      )}
    </div>
  );
}
