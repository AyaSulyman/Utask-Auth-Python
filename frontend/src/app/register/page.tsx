'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import AuthLayout from '@/components/AuthLayout';
import { Banner, Field, GradientButton, TextInput } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError } from '@/lib/api';

interface RegisterForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  age: string;
  password: string;
}

const initialForm: RegisterForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  city: '',
  age: '',
  password: '',
};

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const update = (key: keyof RegisterForm) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);
    try {
      await api.register({ ...form, age: Number(form.age) });
      await login(form.email, form.password);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.errors) {
          const mapped: Record<string, string> = {};
          err.errors.forEach((fe) => {
            mapped[fe.field] = fe.message;
          });
          setFieldErrors(mapped);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Create your account."
      sub="New accounts start as clients. Ask an admin to grant elevated access if you need it."
    >
      <h2 style={{ fontSize: 24, marginBottom: 6 }}>Sign up</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 22 }}>
        It only takes a minute.
      </p>

      {error && <Banner>{error}</Banner>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="First name" error={fieldErrors.first_name}>
            <TextInput required value={form.first_name} onChange={update('first_name')} />
          </Field>
          <Field label="Last name" error={fieldErrors.last_name}>
            <TextInput required value={form.last_name} onChange={update('last_name')} />
          </Field>
        </div>

        <Field label="Email address" error={fieldErrors.email}>
          <TextInput icon="mail" type="email" required value={form.email} onChange={update('email')} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Phone number" error={fieldErrors.phone_number}>
            <TextInput
              required
              value={form.phone}
              onChange={update('phone')}
              placeholder="+96170123456"
            />
          </Field>
          <Field label="Age" error={fieldErrors.age}>
            <TextInput type="number" required value={form.age} onChange={update('age')} />
          </Field>
        </div>

        <Field label="City" error={fieldErrors.city}>
          <TextInput required value={form.city} onChange={update('city')} />
        </Field>

        <Field label="Password" error={fieldErrors.password}>
          <TextInput
            type="password"
            required
            value={form.password}
            onChange={update('password')}
            placeholder="At least 8 characters, letters + numbers"
            icon="lock"
          />
        </Field>

        <GradientButton type="submit" full loading={loading} style={{ marginTop: 8 }}>
          {loading ? 'Creating account…' : 'Create account'}
        </GradientButton>
      </form>

      <p style={{ textAlign: 'center', marginTop: 22, fontSize: 14, color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--magenta)', fontWeight: 700 }}>
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
