import { pb } from '@/lib/pocketbase';
import type { Gift, GiftCategory } from '@/types/gift.types';
import type { TypedPocketBase } from '@/types/pocketbase.types';
import { GIFTS_PER_PAGE } from '@/lib/constants';

export async function getGifts(
  opts?: { category?: GiftCategory; page?: number; perPage?: number },
  client: TypedPocketBase = pb
): Promise<Gift[]> {
  const { category, page = 1, perPage = GIFTS_PER_PAGE } = opts ?? {};
  const filter = category ? `category = "${category}"` : '';
  const result = await client.collection('gifts').getList(page, perPage, {
    filter,
    sort: 'created',
  });
  return result.items;
}

export async function getGift(
  id: string,
  client: TypedPocketBase = pb
): Promise<Gift> {
  return client.collection('gifts').getOne(id);
}

export async function getUnswipedGifts(
  swipedIds: string[],
  client: TypedPocketBase = pb
): Promise<Gift[]> {
  const result = await client.collection('gifts').getList(1, 200, {
    sort: 'created',
  });
  const swipedSet = new Set(swipedIds);
  return result.items.filter((g) => !swipedSet.has(g.id));
}

export async function getAllGiftIds(
  client: TypedPocketBase = pb
): Promise<string[]> {
  const result = await client.collection('gifts').getFullList({ fields: 'id' });
  return result.map((g) => g.id);
}
