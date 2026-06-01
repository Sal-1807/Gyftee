import { useQuery } from '@tanstack/react-query';
import { pb } from '@/lib/pocketbase';
import type { Swipe } from '@/types/gift.types';

export function useFeed(userId: string | undefined) {
  return useQuery({
    queryKey: ['feed', userId],
    enabled: !!userId,
    staleTime: 1000 * 30,         // refresh after 30s
    refetchInterval: 1000 * 60,   // poll every 60s
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const followingRecords = await pb.collection('followers').getFullList({
        filter: `follower = "${userId}"`,
        fields: 'following',
      });

      const followingIds = followingRecords.map((r) => r.following as string);
      if (followingIds.length === 0) return [];

      const filter = followingIds.map((id) => `user = "${id}"`).join(' || ');

      return pb.collection('swipes').getFullList<Swipe>({
        filter: `(${filter}) && (liked = true || (liked = false && updated > created))`,
        expand: 'user,gift',
        sort: '-updated',
        perPage: 100,
      });
    },
  });
}
