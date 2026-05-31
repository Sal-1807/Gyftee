import { pb } from '@/lib/pocketbase';
import type { AppUser } from '@/types/user.types';
import type { TypedPocketBase } from '@/types/pocketbase.types';

export async function getUserByUsername(
  username: string,
  client: TypedPocketBase = pb
): Promise<AppUser> {
  return client.collection('users').getFirstListItem(`username = "${username}"`);
}

export async function getUserById(
  id: string,
  client: TypedPocketBase = pb
): Promise<AppUser> {
  return client.collection('users').getOne(id);
}

export async function updateAvatar(
  userId: string,
  file: File,
  client: TypedPocketBase = pb
): Promise<AppUser> {
  const formData = new FormData();
  formData.append('avatar', file);
  return client.collection('users').update(userId, formData);
}

export async function updateUsername(
  userId: string,
  username: string,
  client: TypedPocketBase = pb
): Promise<AppUser> {
  return client.collection('users').update(userId, { username });
}

export async function searchUsers(
  query: string,
  client: TypedPocketBase = pb
): Promise<AppUser[]> {
  const q = query.trim().replace(/"/g, '');
  if (!q) return [];
  const result = await client.collection('users').getList(1, 20, {
    filter: `username ~ "${q}" || name ~ "${q}"`,
    requestKey: null,
  });
  return result.items as AppUser[];
}
