'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import AuthLayout from '@/components/AuthLayout';
import { Banner, Field, GradientButton, TextInput } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key: keyof LoginForm) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      router.push(user.type === 'admin' ? '/admin/users' : '/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Good to see you again."
      sub="Sign in to track your projects, manage your team and stay on top of every task."
    >
      <h2 style={{ fontSize: 24, marginBottom: 6 }}>Log in</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 26 }}>
        Enter your details to access your account.
      </p>

      {error && <Banner>{error}</Banner>}

      <form onSubmit={handleSubmit}>
        <Field label="Email address">
          <TextInput
            icon="mail"
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password">
          <TextInput
            icon="lock"
            type="password"
            required
            value={form.password}
            onChange={update('password')}
            placeholder="••••••••"
          />
        </Field>

        <GradientButton type="submit" full loading={loading} style={{ marginTop: 8 }}>
          {loading ? 'Signing in…' : 'Log in'}
        </GradientButton>
      </form>

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
        Don&apos;t have an account?{' '}
        <Link href="/register" style={{ color: 'var(--magenta)', fontWeight: 700 }}>
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
