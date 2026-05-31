'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { signup, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    try {
      await signup(email, username, password);
      toast('Account created! Start swiping.', 'success');
      router.push('/onboarding');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      if (msg.includes('username')) setError('Username already taken.');
      else if (msg.includes('email')) setError('Email already registered.');
      else setError(msg);
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

      <h1 className="text-xl font-bold text-text text-center mb-6">Create Account</h1>

      <div className="glass-card p-7 space-y-5">
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
          <Input
            label="Username"
            type="text"
            placeholder="coolperson99"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            icon={<User size={14} />}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={14} />}
            required
          />

          {error && <p className="text-xs text-error">{error}</p>}

          <Button type="submit" fullWidth loading={isLoading} size="lg">
            Create Account
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-text-muted mt-5">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold" style={{ color: '#1bbf96' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
