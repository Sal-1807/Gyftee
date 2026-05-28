import { pb } from '@/lib/pocketbase';
import type { Gift } from '@/types/gift.types';
import type { AppUser } from '@/types/user.types';

export function getFileUrl(
  record: { id: string; collectionId: string; collectionName: string },
  filename: string,
  thumb?: string
): string {
  if (!filename) return '';
  return pb.files.getURL(record, filename, thumb ? { thumb } : undefined);
}

export function getGiftImageUrl(gift: Gift, thumb = '400x400'): string {
  if (!gift.image) {
    return `https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80`;
  }
  return getFileUrl(gift, gift.image, thumb);
}

export function getAvatarUrl(user: AppUser, thumb = '100x100'): string {
  if (!user.avatar) return '';
  return getFileUrl(user, user.avatar, thumb);
}
