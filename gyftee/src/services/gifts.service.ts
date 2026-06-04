import { pb } from '@/lib/pocketbase';
import type { Gift, GiftCategory } from '@/types/gift.types';
import type { TypedPocketBase } from '@/types/pocketbase.types';
import { GIFTS_PER_PAGE } from '@/lib/constants';

export async function getGifts(
  opts?: { category?: GiftCategory; page?: number; perPage?: number; minPrice?: number; maxPrice?: number },
  client: TypedPocketBase = pb
): Promise<Gift[]> {
  const { category, page = 1, perPage = GIFTS_PER_PAGE, minPrice, maxPrice } = opts ?? {};
  const filters: string[] = [];
  if (category) filters.push(`category = "${category}"`);
  if (minPrice !== undefined) filters.push(`price >= ${minPrice}`);
  if (maxPrice !== undefined) filters.push(`price <= ${maxPrice}`);
  const result = await client.collection('gifts').getList(page, perPage, {
    ...(filters.length && { filter: filters.join(' && ') }),
    sort: 'created',
    requestKey: null,
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
    requestKey: null,
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

export async function searchGifts(
  query: string,
  client: TypedPocketBase = pb
): Promise<Gift[]> {
  const q = query.trim().replace(/"/g, '');
  if (!q) return [];
  const result = await client.collection('gifts').getList(1, 30, {
    filter: `name ~ "${q}" || description ~ "${q}" || category ~ "${q}"`,
    requestKey: null,
  });
  return result.items;
}

export async function createGift(
  data: {
    name: string;
    description: string;
    category: GiftCategory;
    price: number;
    store_link?: string;
    tags: string[];
    imageFile?: File;
  },
  client: TypedPocketBase = pb
): Promise<Gift> {
  const formData = new FormData();
  formData.append('name', data.name.trim());
  formData.append('description', data.description.trim());
  formData.append('category', data.category);
  formData.append('price', String(data.price));
  formData.append('tags', JSON.stringify(data.tags));
  if (data.store_link?.trim()) formData.append('store_link', data.store_link.trim());
  if (data.imageFile) formData.append('image', data.imageFile);
  return client.collection('gifts').create(formData) as Promise<Gift>;
}
