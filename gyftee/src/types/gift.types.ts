export type GiftCategory =
  | 'Tech'
  | 'Fashion'
  | 'Home'
  | 'Gaming'
  | 'Books'
  | 'Fitness'
  | 'Food';

export interface Gift {
  id: string;
  name: string;
  description: string;
  image: string;
  category: GiftCategory;
  tags: string[];
  price: number;
  store_link: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
}

export interface Swipe {
  id: string;
  user: string;
  gift: string;
  liked: boolean;
  expand?: {
    gift?: Gift;
    user?: import('./user.types').AppUser;
  };
  created: string;
  updated: string;
}

export type SwipeDirection = 'left' | 'right' | 'up';
