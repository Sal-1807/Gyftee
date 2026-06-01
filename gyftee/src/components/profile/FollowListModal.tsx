'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useIsFollowing, useToggleFollow } from '@/hooks/useFollows';
import { getAvatarUrl } from '@/utils/pocketbase-image';
import type { AppUser } from '@/types/user.types';

interface UserRowProps {
  user: AppUser;
  currentUserId: string;
  showUnfollow: boolean;
  onClose: () => void;
}

function UserRow({ user, currentUserId, showUnfollow, onClose }: UserRowProps) {
  const isOwn = currentUserId === user.id;
  const { data: following } = useIsFollowing(currentUserId, user.id);
  const { mutate: toggleFollow, isPending } = useToggleFollow(currentUserId);

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <Link href={`/profile/${user.username}`} onClick={onClose} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar src={getAvatarUrl(user)} username={user.username} size="md" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text truncate">@{user.username}</p>
          {user.name && <p className="text-xs text-text-muted truncate">{user.name}</p>}
        </div>
      </Link>

      {!isOwn && showUnfollow && following && (
        <Button
          variant="danger"
          size="sm"
          loading={isPending}
          onClick={() => toggleFollow({ targetId: user.id, following: true })}
        >
          Unfollow
        </Button>
      )}

      {!isOwn && !showUnfollow && (
        <Button
          variant={following ? 'secondary' : 'primary'}
          size="sm"
          loading={isPending}
          onClick={() => toggleFollow({ targetId: user.id, following: !!following })}
        >
          {following ? 'Following' : 'Follow'}
        </Button>
      )}
    </div>
  );
}

interface FollowListModalProps {
  title: string;
  users: AppUser[];
  currentUserId: string;
  showUnfollow?: boolean;
  onClose: () => void;
}

export function FollowListModal({ title, users, currentUserId, showUnfollow = false, onClose }: FollowListModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        key="follow-list-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />
      <motion.div
        key="follow-list-modal"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-3xl flex flex-col max-h-[85vh] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-sm md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:rounded-3xl md:max-h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-bold text-text">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-text-muted hover:text-text"
          >
            <X size={16} />
          </button>
        </div>

        {/* List — flex-1 + min-h-0 lets it shrink/grow and scroll when needed */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5">
          {users.length === 0 ? (
            <p className="text-center text-sm text-text-muted py-10">No users yet.</p>
          ) : (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                currentUserId={currentUserId}
                showUnfollow={showUnfollow}
                onClose={onClose}
              />
            ))
          )}
        </div>

        {/* Clears the fixed bottom nav on mobile */}
        <div className="pb-20 md:pb-6" />
      </motion.div>
    </AnimatePresence>
  );
}
