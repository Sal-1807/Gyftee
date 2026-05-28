import { pb } from '@/lib/pocketbase';
import type { Follower } from '@/types/user.types';
import type { TypedPocketBase } from '@/types/pocketbase.types';

export async function followUser(
  followerId: string,
  followingId: string,
  client: TypedPocketBase = pb
): Promise<Follower> {
  return client.collection('followers').create({
    follower: followerId,
    following: followingId,
  });
}

export async function unfollowUser(
  followerId: string,
  followingId: string,
  client: TypedPocketBase = pb
): Promise<void> {
  const record = await client
    .collection('followers')
    .getFirstListItem(`follower = "${followerId}" && following = "${followingId}"`);
  await client.collection('followers').delete(record.id);
}

export async function getFollowing(
  userId: string,
  client: TypedPocketBase = pb
): Promise<Follower[]> {
  return client.collection('followers').getFullList({
    filter: `follower = "${userId}"`,
    expand: 'following',
    sort: '-created',
  });
}

export async function getFollowers(
  userId: string,
  client: TypedPocketBase = pb
): Promise<Follower[]> {
  return client.collection('followers').getFullList({
    filter: `following = "${userId}"`,
    expand: 'follower',
    sort: '-created',
  });
}

export async function isFollowing(
  followerId: string,
  followingId: string,
  client: TypedPocketBase = pb
): Promise<boolean> {
  try {
    await client
      .collection('followers')
      .getFirstListItem(`follower = "${followerId}" && following = "${followingId}"`);
    return true;
  } catch {
    return false;
  }
}
