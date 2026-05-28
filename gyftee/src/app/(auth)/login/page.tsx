'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Gift, Mail, Lock } from 'lucide-react';
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
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-2xl font-bold">
          <Gift className="text-primary-light" size={24} />
          <span className="text-gradient">gyftee</span>
        </div>
        <p className="text-text-muted text-sm">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={14} />}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={14} />}
          required
        />

        {error && <p className="text-xs text-red-400">{error}</p>}

        <Button type="submit" fullWidth loading={isLoading} size="lg">
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted">
        No account?{' '}
        <Link href="/signup" className="text-primary-light hover:text-primary transition-colors font-medium">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
