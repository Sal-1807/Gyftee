'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { submitSwipe } from '@/services/swipes.service';
import { pb } from '@/lib/pocketbase';
import { CATEGORIES } from '@/lib/constants';
import type { GiftCategory } from '@/types/gift.types';

const CATEGORY_META: Record<GiftCategory, { emoji: string; desc: string }> = {
  Tech:    { emoji: '💻', desc: 'Gadgets & gear' },
  Fashion: { emoji: '👟', desc: 'Clothes & style' },
  Home:    { emoji: '🏠', desc: 'Decor & living' },
  Gaming:  { emoji: '🎮', desc: 'Games & consoles' },
  Books:   { emoji: '📚', desc: 'Reading & learning' },
  Fitness: { emoji: '🏋️', desc: 'Health & sport' },
  Food:    { emoji: '🍜', desc: 'Snacks & kitchen' },
};

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<Set<GiftCategory>>(new Set());
  const [loading, setLoading] = useState(false);

  const toggle = (cat: GiftCategory) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const handleStart = async () => {
    if (!user || selected.size === 0) return;
    setLoading(true);
    try {
      localStorage.setItem(`gyftee_interests_${user.id}`, JSON.stringify(Array.from(selected)));
    } catch {}
    try {
      await Promise.all(
        Array.from(selected).map(async (cat) => {
          const result = await pb.collection('gifts').getList(1, 1, {
            filter: `category = "${cat}"`,
            requestKey: null,
          });
          if (result.items[0]) await submitSwipe(user.id, result.items[0].id, true);
        })
      );
    } catch {}
    finally {
      setLoading(false);
      router.push('/swipe');
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ background: '#EAF7F1' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-0 text-center flex-shrink-0">
        <div
          className="w-12 h-12 rounded-[14px] overflow-hidden mx-auto mb-4"
          style={{ boxShadow: '0 4px 14px rgba(44,196,160,0.3)' }}
        >
          <Image src="/icon-192.png" alt="Gyftee" width={48} height={48} className="w-full h-full object-cover" />
        </div>
        <h1 className="text-[26px] font-extrabold tracking-[-0.5px] mb-2" style={{ color: '#182622' }}>
          What do you love?
        </h1>
        <p className="text-[14px] leading-relaxed" style={{ color: '#7B9490' }}>
          Pick your interests to personalise your feed
        </p>
      </div>

      {/* Grid */}
      <div className="flex-1 px-[18px] pt-[18px] overflow-y-auto">
        <div className="grid grid-cols-2 gap-2.5">
          {(CATEGORIES as readonly GiftCategory[]).map((cat) => {
            const isSelected = selected.has(cat);
            const { emoji, desc } = CATEGORY_META[cat];
            return (
              <button
                key={cat}
                onClick={() => toggle(cat)}
                className="relative p-3.5 rounded-2xl text-left transition-all active:scale-95"
                style={{
                  border: `2px solid ${isSelected ? '#2CC4A0' : '#D5EDE7'}`,
                  background: isSelected ? 'rgba(44,196,160,0.07)' : 'white',
                }}
              >
                <div className="flex items-start justify-between mb-2.5">
                  <span className="text-[28px] leading-none">{emoji}</span>
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isSelected ? '#2CC4A0' : 'transparent',
                      border: `2px solid ${isSelected ? '#2CC4A0' : '#D5EDE7'}`,
                    }}
                  >
                    {isSelected && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <div className="text-[14px] font-bold mb-0.5" style={{ color: '#182622' }}>{cat}</div>
                <div className="text-[11px]" style={{ color: '#7B9490' }}>{desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTAs */}
      <div className="px-6 pt-4 pb-7 flex flex-col items-center gap-3.5 flex-shrink-0">
        <button
          onClick={handleStart}
          disabled={loading || selected.size === 0}
          className="w-full h-14 rounded-2xl text-[17px] font-bold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
          style={{ background: '#2CC4A0', boxShadow: '0 4px 22px rgba(44,196,160,0.4)' }}
        >
          {loading ? 'Saving…' : 'Start Swiping →'}
        </button>
        <button
          onClick={() => router.push('/swipe')}
          className="text-[14px] transition-colors hover:opacity-70"
          style={{ color: '#7B9490' }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
