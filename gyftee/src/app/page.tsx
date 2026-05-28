import Link from 'next/link';
import { Gift, Zap, Users, Brain, ArrowRight, Heart, X } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* Nav */}
      <header className="glass border-b border-border px-6 h-16 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 font-bold text-lg">
          <Gift size={20} className="text-primary-light" />
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            gyftee
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-text-muted hover:text-text transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-2xl mx-auto gap-6">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full glass-bright text-sm text-primary-light border border-primary/20">
          <Brain size={14} />
          ML-powered gift recommendations
        </div>

        <h1 className="text-5xl md:text-6xl font-black leading-tight">
          Discover gifts
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            you actually want
          </span>
        </h1>

        <p className="text-text-muted text-lg max-w-md">
          Swipe through curated gifts. Build your wishlist. Share it with people who actually care what you want.
        </p>

        {/* Mock swipe card */}
        <div className="relative w-64 h-80 my-4">
          <div className="absolute glass-card inset-0 rounded-2xl overflow-hidden translate-y-3 scale-95 opacity-60" />
          <div className="absolute glass-card inset-0 rounded-2xl overflow-hidden" style={{ transform: 'translateY(6px) scale(0.97)', opacity: 0.8 }} />
          <div className="glass-card absolute inset-0 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex-1 bg-gradient-to-br from-violet-900/40 to-pink-900/40 flex items-center justify-center">
              <Gift size={48} className="text-primary-light opacity-60" />
            </div>
            <div className="p-4">
              <p className="font-semibold text-text text-sm">Mechanical Keyboard</p>
              <p className="text-xs text-text-muted">Tech · $129</p>
            </div>
          </div>
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-8 z-10">
            <div className="w-12 h-12 rounded-full bg-red-900/40 border-2 border-red-500/40 flex items-center justify-center">
              <X size={20} className="text-red-400" />
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-900/40 border-2 border-emerald-500/40 flex items-center justify-center">
              <Heart size={20} className="text-emerald-400" />
            </div>
          </div>
        </div>

        <Link
          href="/signup"
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold text-lg hover:opacity-90 active:scale-95 transition-all shadow-2xl shadow-purple-900/40"
        >
          Start swiping free
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-4xl mx-auto w-full">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: <Zap className="text-yellow-400" size={20} />,
              title: 'Swipe & discover',
              desc: 'Tinder-style swipe cards across 7 categories. Like what you love, pass on the rest.',
            },
            {
              icon: <Brain className="text-primary-light" size={20} />,
              title: 'ML recommendations',
              desc: 'TF-IDF + collaborative filtering learns your taste. Gets smarter every swipe.',
            },
            {
              icon: <Users className="text-pink-400" size={20} />,
              title: 'Share with friends',
              desc: 'Follow friends, see their wishlists, and never guess a gift again.',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="glass-card p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl glass-bright flex items-center justify-center">
                {icon}
              </div>
              <h3 className="font-semibold text-text">{title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
