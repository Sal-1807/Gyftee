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
    filter: `user = "${userId}" && gift = "${giftId}"`,
    requestKey: null,
  });
  await Promise.all(records.map((r) => client.collection('swipes').delete(r.id)));
}

export async function getSwipedGiftIds(
  userId: string,
  client: TypedPocketBase = pb
): Promise<string[]> {
  const swipes = await client.collection('swipes').getFullList({
    filter: `user = "${userId}"`,
    fields: 'gift',
    requestKey: null,
  });
  return swipes.map((s) => s.gift);
}
