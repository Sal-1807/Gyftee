'use client';

import { formatPrice } from '@/utils/format';

interface PriceSliderProps {
  maxPrice: number;
  onMaxPriceChange: (val: number) => void;
  absoluteMax?: number;
}

const QUICK_CHIPS = [
  { label: 'Any',          val: Infinity },
  { label: 'Under ₹500',   val: 500      },
  { label: 'Under ₹1,000', val: 1000     },
  { label: 'Under ₹2,500', val: 2500     },
  { label: 'Under ₹5,000', val: 5000     },
];

export function PriceSlider({ maxPrice, onMaxPriceChange, absoluteMax = 7000 }: PriceSliderProps) {
  const isAll = maxPrice >= absoluteMax;
  const displayVal = isAll ? absoluteMax : maxPrice;
  const pct = (displayVal / absoluteMax) * 100;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted">Budget</span>
        <span className="text-xs font-semibold" style={{ color: '#1bbf96' }}>
          {isAll ? 'Any price' : `Under ${formatPrice(maxPrice)}`}
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={0}
          max={absoluteMax}
          step={100}
          value={displayVal}
          onChange={(e) => {
            const v = Number(e.target.value);
            onMaxPriceChange(v >= absoluteMax ? Infinity : v);
          }}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none"
          style={{
            background: `linear-gradient(to right, #1bbf96 0%, #1bbf96 ${pct}%, #e2ede8 ${pct}%, #e2ede8 100%)`,
          }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-text-dim">
        <span>₹0</span>
        <span>₹3,500</span>
        <span>Any</span>
      </div>

      {/* Quick chips */}
      <div className="flex gap-1.5 flex-wrap pt-0.5">
        {QUICK_CHIPS.map(({ label, val }) => {
          const active = val === Infinity ? isAll : Math.abs(maxPrice - val) < 1;
          return (
            <button
              key={label}
              onClick={() => onMaxPriceChange(val)}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all"
              style={active
                ? { backgroundColor: '#f9a8b4', color: '#fff', borderColor: '#f9a8b4' }
                : { backgroundColor: '#fff', color: '#6b7280', borderColor: '#e2ede8' }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
