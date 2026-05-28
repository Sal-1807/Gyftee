import PocketBase, { type RecordService } from 'pocketbase';
import type { Gift, Swipe } from './gift.types';
import type { AppUser, Follower } from './user.types';

export interface TypedPocketBase extends PocketBase {
  collection(idOrName: 'users'):     RecordService<AppUser>;
  collection(idOrName: 'gifts'):     RecordService<Gift>;
  collection(idOrName: 'swipes'):    RecordService<Swipe>;
  collection(idOrName: 'followers'): RecordService<Follower>;
}
