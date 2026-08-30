import { pb } from '@/lib/pocketbase';
import type { Swipe } from '@/types/gift.types';
import type { Gift } from '@/types/gift.types';
import type { TypedPocketBase } from '@/types/pocketbase.types';

export async function getUserSwipes(
  userId: string,
  client: TypedPocketBase = pb
): Promise<Swipe[]> {
  return client.collection('swipes').getFullList({
    filter: `user = "${userId}"`,
    expand: 'gift',
    sort: '-created',
  });
}

export async function getLikedGifts(
  userId: string,
  client: TypedPocketBase = pb
): Promise<Gift[]> {
  const swipes = await client.collection('swipes').getFullList({
    filter: `user = "${userId}" && liked = true`,
    expand: 'gift',
    sort: '-created',
    requestKey: null,
  });
  return swipes
    .map((s) => s.expand?.gift)
    .filter((g): g is Gift => Boolean(g));
}

export async function submitSwipe(
  userId: string,
  giftId: string,
  liked: boolean,
  client: TypedPocketBase = pb
): Promise<Swipe> {
  return client.collection('swipes').create({
    user: userId,
    gift: giftId,
    liked,
  });
}

export async function removeFromWishlist(
  userId: string,
  giftId: string,
  client: TypedPocketBase = pb
): Promise<void> {
  const records = await client.collection('swipes').getFullList({
    filter: `user = "${userId}" && gift = "${giftId}" && liked = true`,
    requestKey: null,
  });
  await Promise.all(records.map((r) => client.collection('swipes').update(r.id, { liked: false })));
}

export async function getSwipedGiftIds(
  userId: string,
  client: TypedPocketBase = pb
): Promise<string[]> {
  // Exclude liked gifts and definitive left-swipes, but not "removed from wishlist"
  // so those gifts can re-appear in the swipe deck.
  const swipes = await client.collection('swipes').getFullList({
    filter: `user = "${userId}" && (liked = true || (liked = false && updated = created))`,
    fields: 'gift',
    requestKey: null,
  });
  return swipes.map((s) => s.gift);
}
