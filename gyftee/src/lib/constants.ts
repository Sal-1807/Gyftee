export const CATEGORIES = [
  'Tech',
  'Fashion',
  'Home',
  'Gaming',
  'Books',
  'Fitness',
  'Food',
] as const;

export const SWIPE_THRESHOLD_PX = 100;
export const SWIPE_VELOCITY_THRESHOLD = 500;
export const DECK_SIZE = 3;
export const GIFTS_PER_PAGE = 20;

export const CATEGORY_COLORS: Record<string, string> = {
  Tech:    '#3b82f6',
  Fashion: '#ec4899',
  Home:    '#f59e0b',
  Gaming:  '#8b5cf6',
  Books:   '#10b981',
  Fitness: '#84cc16',
  Food:    '#ef4444',
};
