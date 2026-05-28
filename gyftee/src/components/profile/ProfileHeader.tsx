'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { AppUser } from '@/types/user.types';
import { getAvatarUrl } from '@/utils/pocketbase-image';
import { useIsFollowing, useToggleFollow } from '@/hooks/useFollows';
import { useAuth } from '@/features/auth/AuthContext';
import { UserPlus, UserCheck } from 'lucide-react';

interface ProfileHeaderProps {
  user: AppUser;
  followersCount: number;
  followingCount: number;
  likedCount: number;
}

export function ProfileHeader({ user, followersCount, followingCount, likedCount }: ProfileHeaderProps) {
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === user.id;

  const { data: following } = useIsFollowing(currentUser?.id, user.id);
  const { mutate: toggleFollow, isPending } = useToggleFollow(currentUser?.id ?? '');

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-start gap-4">
        <Avatar src={getAvatarUrl(user)} username={user.username} size="xl" />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-text">{user.username}</h1>
          {user.name && <p className="text-sm text-text-muted mt-0.5">{user.name}</p>}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="primary">Gyftee Member</Badge>
          </div>
        </div>
        {!isOwnProfile && currentUser && (
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

      <div className="grid grid-cols-3 divide-x divide-border text-center">
        {[
          { label: 'Liked', value: likedCount },
          { label: 'Followers', value: followersCount },
          { label: 'Following', value: followingCount },
        ].map(({ label, value }) => (
          <div key={label} className="py-2">
            <p className="text-xl font-bold text-text">{value}</p>
            <p className="text-xs text-text-muted">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
