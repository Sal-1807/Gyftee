import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFollowers,
  getFollowing,
  isFollowing,
  followUser,
  unfollowUser,
} from '@/services/follows.service';

export function useFollowers(userId: string | undefined) {
  return useQuery({
    queryKey: ['followers', userId],
    enabled: !!userId,
    queryFn: () => getFollowers(userId!),
  });
}

export function useFollowing(userId: string | undefined) {
  return useQuery({
    queryKey: ['following', userId],
    enabled: !!userId,
    queryFn: () => getFollowing(userId!),
  });
}

export function useIsFollowing(followerId: string | undefined, followingId: string | undefined) {
  return useQuery({
    queryKey: ['isFollowing', followerId, followingId],
    enabled: !!followerId && !!followingId && followerId !== followingId,
    queryFn: () => isFollowing(followerId!, followingId!),
  });
}

export function useToggleFollow(currentUserId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ targetId, following }: { targetId: string; following: boolean }) => {
      if (following) await unfollowUser(currentUserId, targetId);
      else await followUser(currentUserId, targetId);
    },
    onSuccess: (_data, { targetId }) => {
      qc.invalidateQueries({ queryKey: ['isFollowing', currentUserId, targetId] });
      qc.invalidateQueries({ queryKey: ['followers', targetId] });
      qc.invalidateQueries({ queryKey: ['following', currentUserId] });
      // The swipes read rule is follow-gated, so this user's wishlist result
      // changes the moment the follow does. Without this the profile page keeps
      // showing the pre-follow (empty) response until a manual reload.
      qc.invalidateQueries({ queryKey: ['likedGifts', targetId] });
    },
  });
}
