'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { useToast } from '@/components/ui/Toast';

function BackButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 transition-colors hover:opacity-80"
      style={{ background: '#EAF7F1' }}
    >
      <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
        <path d="M7.5 1.5L1.5 7.5L7.5 13.5" stroke="#182622" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </Link>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-bold uppercase tracking-[0.7px] mb-2" style={{ color: '#7B9490' }}>
      {children}
    </label>
  );
}

function FieldInput({ icon, ...props }: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-[14px] px-4 py-3.5"
      style={{ background: '#F5FBFA', border: '1.5px solid #D5EDE7' }}
    >
      <span style={{ color: '#7B9490', flexShrink: 0 }}>{icon}</span>
      <input
        className="flex-1 bg-transparent border-none outline-none text-[15px]"
        style={{ color: '#182622' }}
        {...props}
      />
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('next') ?? '/swipe';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      toast('Welcome back!', 'success');
      router.push(redirect);
    } catch {
      setError('Incorrect email or password.');
    }
  };

  return (
    <div className="w-full flex flex-col bg-white min-h-screen">
      {/* Header */}
      <div className="px-6 pt-5 flex items-center gap-3.5 flex-shrink-0">
        <BackButton href="/" />
        <span className="text-[19px] font-bold tracking-[-0.4px] whitespace-nowrap" style={{ color: '#182622' }}>
          Log In
        </span>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-[60px] h-[60px] rounded-[17px] overflow-hidden mb-2.5"
            style={{ boxShadow: '0 4px 18px rgba(44,196,160,0.3)' }}
          >
            <Image src="/icon-192.png" alt="Gyftee" width={60} height={60} className="w-full h-full object-cover" />
          </div>
          <span className="text-[20px] font-extrabold tracking-[-0.4px]" style={{ color: '#182622' }}>Gyftee</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
          <div>
            <FieldLabel>Email</FieldLabel>
            <FieldInput
              icon={
                <svg width="17" height="13" viewBox="0 0 17 13" fill="none">
                  <rect x="0.75" y="0.75" width="15.5" height="11.5" rx="2.25" stroke="#7B9490" strokeWidth="1.5"/>
                  <path d="M1 1.5L8.5 7.5L16 1.5" stroke="#7B9490" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              }
              type="email"
              placeholder="hello@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <FieldLabel>Password</FieldLabel>
            <FieldInput
              icon={
                <svg width="13" height="17" viewBox="0 0 13 17" fill="none">
                  <rect x="0.75" y="7.25" width="11.5" height="9" rx="2.25" stroke="#7B9490" strokeWidth="1.5"/>
                  <path d="M3 7V4.5a3.5 3.5 0 017 0V7" stroke="#7B9490" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="6.5" cy="12" r="1.5" fill="#7B9490"/>
                </svg>
              }
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex justify-end mt-2.5">
              <button type="button" className="text-[13px] font-semibold" style={{ color: '#2CC4A0' }}>
                Forgot password?
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 rounded-[14px] text-[17px] font-bold text-white mt-1 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: '#2CC4A0', boxShadow: '0 4px 18px rgba(44,196,160,0.32)' }}
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-7 text-[14px]" style={{ color: '#7B9490' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-bold" style={{ color: '#2CC4A0' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
