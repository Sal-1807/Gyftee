import { useQuery } from '@tanstack/react-query';
import { pb } from '@/lib/pocketbase';
import type { Swipe } from '@/types/gift.types';

export function useFeed(userId: string | undefined) {
  return useQuery({
    queryKey: ['feed', userId],
    enabled: !!userId,
    staleTime: 1000 * 60,
    queryFn: async () => {
      // Fetch the list of users this person follows
      const followingRecords = await pb.collection('followers').getFullList({
        filter: `follower = "${userId}"`,
        fields: 'following',
      });

      const followingIds = followingRecords.map((r) => r.following as string);

      if (followingIds.length === 0) return [];

      // Fetch recent liked swipes from followed users
      const filter = followingIds
        .map((id) => `user = "${id}"`)
        .join(' || ');

      return pb.collection('swipes').getFullList<Swipe>({
        filter: `(${filter}) && liked = true`,
        expand: 'user,gift',
        sort: '-created',
        perPage: 50,
      });
    },
  });
}
