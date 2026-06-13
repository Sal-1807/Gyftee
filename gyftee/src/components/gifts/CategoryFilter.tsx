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
      <button
        onClick={() => onChange(undefined)}
        className="flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all"
        style={
          !selected
            ? { backgroundColor: '#2CC4A0', color: '#ffffff', border: '1.5px solid #2CC4A0' }
            : { backgroundColor: '#ffffff', color: '#182622', border: '1.5px solid #D5EDE7' }
        }
      >
        All
      </button>

      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={cn('flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all')}
          style={
            selected === cat
              ? { backgroundColor: '#2CC4A0', color: '#ffffff', border: '1.5px solid #2CC4A0' }
              : { backgroundColor: '#ffffff', color: '#182622', border: '1.5px solid #D5EDE7' }
          }
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
