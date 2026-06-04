'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/AuthContext';
import { submitSwipe } from '@/services/swipes.service';
import { pb } from '@/lib/pocketbase';
import { Button } from '@/components/ui/Button';
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

    // Persist selected categories so the swipe deck can prioritise them
    try {
      localStorage.setItem(`gyftee_interests_${user.id}`, JSON.stringify(Array.from(selected)));
    } catch {}

    try {
      // Find one gift per selected category and auto-like it to seed ML
      await Promise.all(
        Array.from(selected).map(async (cat) => {
          const result = await pb.collection('gifts').getList(1, 1, {
            filter: `category = "${cat}"`,
            requestKey: null,
          });
          if (result.items[0]) {
            await submitSwipe(user.id, result.items[0].id, true);
          }
        })
      );
    } catch {
      // Non-fatal — still proceed to swipe
    } finally {
      setLoading(false);
      router.push('/swipe');
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="text-4xl mb-3">🎁</div>
        <h1 className="text-2xl font-black text-text">What do you love?</h1>
        <p className="text-sm text-text-muted">Pick your interests so we can personalise your feed.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(CATEGORIES as readonly GiftCategory[]).map((cat, i) => {
          const isSelected = selected.has(cat);
          const { emoji, desc } = CATEGORY_META[cat];
          return (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggle(cat)}
              className="relative p-4 rounded-2xl border-2 text-left transition-all active:scale-95"
              style={{
                backgroundColor: isSelected ? '#edfaf5' : '#ffffff',
                borderColor: isSelected ? '#1bbf96' : '#e2ede8',
              }}
            >
              <span className="text-2xl block mb-1">{emoji}</span>
              <span className="text-sm font-bold text-text block">{cat}</span>
              <span className="text-xs text-text-muted">{desc}</span>
              {isSelected && (
                <span
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: '#1bbf96' }}
                >
                  ✓
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      <Button
        fullWidth
        size="lg"
        loading={loading}
        disabled={selected.size === 0}
        onClick={handleStart}
      >
        Start Swiping →
      </Button>

      <button
        onClick={() => router.push('/swipe')}
        className="w-full text-center text-sm text-text-dim hover:text-text-muted transition-colors"
      >
        Skip for now
      </button>
    </div>
  );
}
