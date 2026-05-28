import type { GiftCategory } from './gift.types';

export interface AppUser {
  id: string;
  username: string;
  email: string;
  name?: string;
  avatar?: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
}

export interface Follower {
  id: string;
  follower: string;
  following: string;
  expand?: {
    follower?: AppUser;
    following?: AppUser;
  };
  created: string;
  updated: string;
}

// Shape used internally by the Python ML service — not persisted
export interface UserProfile {
  categoryWeights: Partial<Record<GiftCategory, number>>;
  preferredTags: Map<string, number>;
  priceRange: { min: number; max: number; avg: number };
  likedGiftIds: Set<string>;
}
