'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/swipe';

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
    <div className="w-full max-w-sm relative">
      {/* Back button */}
      <Link
        href="/"
        className="absolute -top-12 left-0 w-9 h-9 bg-white rounded-full border border-border shadow-sm flex items-center justify-center text-text-muted hover:text-text transition-colors"
      >
        <ChevronLeft size={18} />
      </Link>

      <h1 className="text-xl font-bold text-text text-center mb-6">Log In</h1>

      <div className="glass-card p-7 space-y-5">
        {/* Icon */}
        <div className="flex justify-center mb-2">
          <div className="w-14 h-14 bg-surface-2 rounded-2xl flex items-center justify-center text-3xl border border-border">
            🎁
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="hello@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={14} />}
            required
          />
          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={14} />}
              required
            />
            <div className="flex justify-end">
              <button type="button" className="text-xs font-medium" style={{ color: '#1bbf96' }}>
                Forgot password?
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <Button type="submit" fullWidth loading={isLoading} size="lg">
            Sign In
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-text-muted mt-5">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold" style={{ color: '#1bbf96' }}>
          Sign up
        </Link>
      </p>
    </div>
  );
}
