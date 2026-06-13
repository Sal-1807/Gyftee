'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { AppUser } from '@/types/user.types';
import { getAvatarUrl } from '@/utils/pocketbase-image';
import { useIsFollowing, useToggleFollow } from '@/hooks/useFollows';
import { useAuth } from '@/features/auth/AuthContext';
import { UserPlus, UserCheck, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface ProfileHeaderProps {
  user: AppUser;
  followersCount: number;
  followingCount: number;
  likedCount: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

export function ProfileHeader({ user, followersCount, followingCount, likedCount, onFollowersClick, onFollowingClick }: ProfileHeaderProps) {
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === user.id;
  const { toast } = useToast();

  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${user.username}`;
    const shareData = { title: `${user.username}'s Gyftee wishlist`, text: `Check out ${user.username}'s wishlist on Gyftee!`, url };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast('Profile link copied!', 'success');
    }
  };

  const { data: following } = useIsFollowing(currentUser?.id, user.id);
  const { mutate: toggleFollow, isPending } = useToggleFollow(currentUser?.id ?? '');

  return (
    <div className="flex flex-col items-center text-center gap-3 pt-2">
      {/* Avatar */}
      <Avatar src={getAvatarUrl(user)} username={user.username} size="xl" className="w-24 h-24 ring-4 ring-white shadow-md" />

      {/* Name + bio */}
      <div>
        <h1 className="text-xl font-bold text-text">{user.name || user.username}</h1>
        {user.name && (
          <p className="text-sm mt-0.5" className="text-text-muted">
            @{user.username}
          </p>
        )}
      </div>

      {/* Share button */}
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors"
      >
        <Share2 size={13} />
        Share wishlist
      </button>

      {/* Follow button */}
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

      {/* Stats */}
      <div className="glass-card w-full grid grid-cols-3 divide-x divide-border text-center mt-2">
        {[
          { label: 'Followers', value: followersCount, onClick: onFollowersClick },
          { label: 'Following', value: followingCount, onClick: onFollowingClick },
          { label: 'Wishlist',  value: likedCount,     onClick: undefined         },
        ].map(({ label, value, onClick }) => (
          <div
            key={label}
            className={`py-3 ${onClick ? 'cursor-pointer hover:bg-surface-2 transition-colors rounded-xl' : ''}`}
            onClick={onClick}
          >
            <p className="text-xl font-bold" style={{ color: '#2CC4A0' }}>{value}</p>
            <p className="text-xs text-text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
