'use client';

import { CATEGORIES, CATEGORY_COLORS } from '@/lib/constants';
import type { GiftCategory } from '@/types/gift.types';
import { cn } from '@/utils/cn';

interface CategoryFilterProps {
  selected: GiftCategory | undefined;
  onChange: (cat: GiftCategory | undefined) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        onClick={() => onChange(undefined)}
        className={cn(
          'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
          !selected
            ? 'gradient-primary text-white shadow-lg shadow-purple-900/30'
            : 'glass-bright text-text-muted hover:text-text'
        )}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
            selected === cat
              ? 'text-white shadow-lg'
              : 'glass-bright text-text-muted hover:text-text border-transparent'
          )}
          style={
            selected === cat
              ? {
                  backgroundColor: `${CATEGORY_COLORS[cat]}30`,
                  borderColor: `${CATEGORY_COLORS[cat]}60`,
                  color: CATEGORY_COLORS[cat],
                }
              : undefined
          }
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
