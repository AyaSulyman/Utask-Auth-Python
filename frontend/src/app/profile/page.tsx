'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Badge, Banner, Card, Field, GradientButton, TextInput } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError, type UpdateMePayload } from '@/lib/api';

interface ProfileForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  age: string;
  password: string;
}

function ProfileContent() {
  const { user, token, refreshUser } = useAuth();
  const [form, setForm] = useState<ProfileForm>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    age: user ? String(user.age) : '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key: keyof ProfileForm) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const payload: UpdateMePayload = { ...form, age: Number(form.age) };
      if (!payload.password) delete payload.password;
      if (!token) return;
      await api.updateMe(token, payload);
      await refreshUser();
      setMessage('Profile updated successfully.');
      setForm((f) => ({ ...f, password: '' }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <AppLayout>
      <div style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--grad-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 800,
              boxShadow: 'var(--shadow-glow)',
              flexShrink: 0,
            }}
          >
            {user.first_name[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 21 }}>
              {user.first_name} {user.last_name}
            </h2>
            <Badge tone={user.type === 'admin' ? 'admin' : 'client'} icon={user.type === 'admin' ? 'shield' : 'user'}>
              {user.type}
            </Badge>
          </div>
        </div>

        <Card hover>
          {message && <Banner tone="success">{message}</Banner>}
          {error && <Banner>{error}</Banner>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="First name">
                <TextInput value={form.first_name} onChange={update('first_name')} />
              </Field>
              <Field label="Last name">
                <TextInput value={form.last_name} onChange={update('last_name')} />
              </Field>
            </div>
            <Field label="Email address">
              <TextInput type="email" value={form.email} onChange={update('email')} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Phone number">
                <TextInput icon="phone" value={form.phone} onChange={update('phone')} />
              </Field>
              <Field label="Age">
                <TextInput type="number" value={form.age} onChange={update('age')} />
              </Field>
            </div>
            <Field label="City">
              <TextInput icon="map-pin" value={form.city} onChange={update('city')} />
            </Field>
            <Field label="New password (leave blank to keep current)">
              <TextInput icon="lock" type="password" value={form.password} onChange={update('password')} />
            </Field>
            <GradientButton type="submit" icon="check" loading={loading}>
              {loading ? 'Saving…' : 'Save changes'}
            </GradientButton>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
