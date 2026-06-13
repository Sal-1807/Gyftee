'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const CARDS = [
  {
    emoji: '⌨️', name: 'Mech Keyboard', price: '₹2,499', category: 'Tech',
    bg: 'linear-gradient(145deg,#E4EBFF,#C7D3FF)',
    style: { top: '-16px', left: '-26px', rotate: '-12deg' },
    delay: 0,
  },
  {
    emoji: '👗', name: 'Kurti Set', price: '₹1,299', category: 'Fashion',
    bg: 'linear-gradient(145deg,#FFE8F2,#FFD0E8)',
    style: { top: '12px', right: '-18px', rotate: '10deg' },
    delay: 0.6,
  },
  {
    emoji: '🎮', name: 'PS5 Controller', price: '₹5,999', category: 'Gaming',
    bg: 'linear-gradient(145deg,#EFE6FF,#D8C2FF)',
    style: { bottom: '80px', left: '-20px', rotate: '9deg' },
    delay: 0.3,
  },
  {
    emoji: '📚', name: 'Atomic Habits', price: '₹299', category: 'Books',
    bg: 'linear-gradient(145deg,#FFFADF,#FFE896)',
    style: { bottom: '100px', right: '-14px', rotate: '-9deg' },
    delay: 0.9,
  },
];

function FloatingCard({
  emoji, name, price, category, bg, style, delay,
}: typeof CARDS[0]) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={style as React.CSSProperties}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <div className="w-[152px] bg-white rounded-[20px] p-3 shadow-md overflow-hidden">
        <div
          className="h-[80px] rounded-xl flex items-center justify-center text-[38px]"
          style={{ background: bg }}
        >
          {emoji}
        </div>
        <div className="mt-2">
          <p className="text-[13px] font-bold text-text truncate leading-tight">{name}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[12px] font-bold" style={{ color: '#2CC4A0' }}>{price}</span>
            <span className="text-[10px] text-text-muted bg-background px-1.5 py-0.5 rounded-[5px]">
              {category}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden relative">
      {CARDS.map((card) => (
        <FloatingCard key={card.name} {...card} />
      ))}

      {/* Centre content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-10">
        {/* App icon */}
        <div
          className="w-[76px] h-[76px] rounded-[22px] overflow-hidden mb-5"
          style={{ boxShadow: '0 8px 28px rgba(44,196,160,0.36)' }}
        >
          <Image src="/icon-192.png" alt="Gyftee" width={76} height={76} className="w-full h-full object-cover" />
        </div>

        <h1
          className="text-[36px] font-extrabold leading-[1.15] tracking-[-0.8px] mb-3"
          style={{ color: '#182622' }}
        >
          Discover gifts<br />you&apos;ll actually<br />
          <span style={{ color: '#2CC4A0' }}>love.</span>
        </h1>

        <p className="text-[15px] leading-relaxed max-w-[255px]" style={{ color: '#7B9490' }}>
          Swipe, save, and share. Build your perfect wishlist.
        </p>
      </div>

      {/* CTAs */}
      <div className="relative z-10 px-6 pb-11 flex flex-col gap-3 w-full max-w-sm mx-auto">
        <Link
          href="/signup"
          className="w-full h-14 rounded-2xl flex items-center justify-center text-[17px] font-bold text-white tracking-[-0.2px] transition-all hover:opacity-90 active:scale-95"
          style={{ background: '#2CC4A0', boxShadow: '0 4px 22px rgba(44,196,160,0.4)' }}
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="w-full h-14 rounded-2xl flex items-center justify-center text-[17px] font-bold tracking-[-0.2px] transition-all hover:bg-surface-2 active:scale-95"
          style={{ border: '2px solid #2CC4A0', color: '#2CC4A0' }}
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
