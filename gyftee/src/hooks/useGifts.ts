import { useQuery } from '@tanstack/react-query';
import { getGifts } from '@/services/gifts.service';
import type { GiftCategory } from '@/types/gift.types';

export function useGifts(category?: GiftCategory, minPrice?: number, maxPrice?: number, perPage?: number) {
  return useQuery({
    queryKey: ['gifts', category, minPrice, maxPrice, perPage],
    queryFn: () => getGifts({ category, minPrice, maxPrice, perPage }),
  });
}
