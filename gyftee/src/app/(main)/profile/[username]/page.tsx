'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthContext';
import { getUserByUsername } from '@/services/users.service';
import { getLikedGifts } from '@/services/swipes.service';
import { getFollowers, getFollowing } from '@/services/follows.service';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileEditModal } from '@/components/profile/ProfileEditModal';
import { GiftGrid } from '@/components/profile/GiftGrid';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Pencil } from 'lucide-react';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { user: currentUser } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  const { data: profileUser, isLoading: userLoading } = useQuery({
    queryKey: ['user', username],
    queryFn: () => getUserByUsername(username),
  });

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

  const isOwnProfile = currentUser?.id === profileUser?.id;

  if (userLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4">
        <Skeleton className="w-full h-40" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
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
      />

      {isOwnProfile && (
        <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil size={14} />
          Edit Profile
        </Button>
      )}

      <div>
        <h2 className="text-lg font-semibold text-text mb-4">Wishlist</h2>
        <GiftGrid gifts={likedGifts ?? []} isLoading={giftsLoading} />
      </div>

      {editOpen && currentUser && (
        <ProfileEditModal user={currentUser} onClose={() => setEditOpen(false)} />
      )}
    </div>
  );
}
