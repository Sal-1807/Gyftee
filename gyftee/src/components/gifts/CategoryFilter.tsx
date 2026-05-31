'use client';

import { CATEGORIES } from '@/lib/constants';
import type { GiftCategory } from '@/types/gift.types';
import { cn } from '@/utils/cn';

interface CategoryFilterProps {
  selected: GiftCategory | undefined;
  onChange: (cat: GiftCategory | undefined) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {/* All chip */}
      <button
        onClick={() => onChange(undefined)}
        className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
        style={
          !selected
            ? { backgroundColor: '#1bbf96', color: '#ffffff' }
            : { backgroundColor: '#ffffff', color: '#6b7280', border: '1px solid #e2ede8' }
        }
      >
        All
      </button>

      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn(
            'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
          )}
          style={
            selected === cat
              ? { backgroundColor: '#1bbf96', color: '#ffffff', borderColor: '#1bbf96' }
              : { backgroundColor: '#ffffff', color: '#6b7280', borderColor: '#e2ede8' }
          }
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
