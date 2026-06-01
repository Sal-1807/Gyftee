import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLikedGifts, submitSwipe, removeFromWishlist } from '@/services/swipes.service';

export function useLikedGifts(userId: string | undefined) {
  return useQuery({
    queryKey: ['swipes', 'liked', userId],
    enabled: !!userId,
    queryFn: () => getLikedGifts(userId!),
  });
}

export function useRemoveFromWishlist(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (giftId: string) => removeFromWishlist(userId, giftId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['likedGifts', userId] });
      qc.invalidateQueries({ queryKey: ['swipes', 'liked', userId] });
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useSubmitSwipe(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ giftId, liked }: { giftId: string; liked: boolean }) =>
      submitSwipe(userId, giftId, liked),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gifts', 'unswiped', userId] });
      qc.invalidateQueries({ queryKey: ['swipes', 'liked', userId] });
      qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
