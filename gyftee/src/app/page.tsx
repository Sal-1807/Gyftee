'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const CARDS = [
  { emoji: '⌨️', name: 'Mech Keyboard', price: '$129', category: 'Tech',    delay: 0,   rotate: -8,  top: '-16px',    left: '-20px'  },
  { emoji: '👟', name: 'Air Jordan 1',  price: '$180', category: 'Fashion', delay: 0.7, rotate:  8,  top: '-16px',    right: '-20px' },
  { emoji: '🎮', name: 'PS5 Controller',price: '$69',  category: 'Gaming',  delay: 0.4, rotate:  6,  bottom: '-16px', left: '-20px'  },
  { emoji: '📚', name: 'Atomic Habits', price: '$18',  category: 'Books',   delay: 1.0, rotate: -6,  bottom: '-16px', right: '-20px' },
];

type CardPos = {
  emoji: string; name: string; price: string; category: string;
  delay: number; rotate: number;
  top?: string; bottom?: string; left?: string; right?: string;
};

function FloatingCard({ emoji, name, price, category, delay, rotate, top, bottom, left, right }: CardPos) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ top, bottom, left, right, rotate: `${rotate}deg` }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <div className="bg-white rounded-2xl shadow-md border border-border w-36 overflow-hidden">
        <div className="bg-surface-2 h-16 flex items-center justify-center text-3xl">
          {emoji}
        </div>
        <div className="p-2.5">
          <p className="text-xs font-bold text-text truncate">{name}</p>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-xs font-semibold" style={{ color: '#1bbf96' }}>{price}</span>
            <span className="text-[10px] text-text-dim">{category}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#edfaf5' }}
    >
      {/* Corner cards — bleed off screen edges */}
      {CARDS.map((card) => (
        <FloatingCard key={card.name} {...card} />
      ))}

      {/* Main content — padded so it never touches cards */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-xs mx-auto gap-6 px-6 py-24">

        {/* App icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-3xl"
        >
          🎁
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl font-black leading-tight"
          style={{
            background: 'linear-gradient(135deg, #1bbf96 0%, #f87171 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Discover gifts you actually want
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-text-muted text-sm leading-relaxed"
        >
          Swipe, save, and share. The easiest way to build your perfect wishlist and find what your friends love.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col gap-3 w-full"
        >
          <Link
            href="/signup"
            className="w-full py-4 rounded-full font-semibold text-base text-white text-center transition-all hover:opacity-90 active:scale-95 shadow-sm"
            style={{ backgroundColor: '#f9a8b4' }}
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="w-full py-4 rounded-full font-semibold text-base text-center bg-white border-2 transition-all hover:bg-surface-2 active:scale-95"
            style={{ borderColor: '#1bbf96', color: '#1bbf96' }}
          >
            Log In
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
