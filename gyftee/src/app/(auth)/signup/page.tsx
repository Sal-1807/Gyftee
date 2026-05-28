'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gift, Mail, Lock, User } from 'lucide-react';
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
      router.push('/swipe');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      if (msg.includes('username')) setError('Username already taken.');
      else if (msg.includes('email')) setError('Email already registered.');
      else setError(msg);
    }
  };

  return (
    <div className="w-full max-w-sm space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-2xl font-bold">
          <Gift className="text-primary-light" size={24} />
          <span className="text-gradient">gyftee</span>
        </div>
        <p className="text-text-muted text-sm">Create your free account</p>
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

        {error && <p className="text-xs text-red-400">{error}</p>}

        <Button type="submit" fullWidth loading={isLoading} size="lg">
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-text-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-light hover:text-primary transition-colors font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
