'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Badge,
  Banner,
  Card,
  EmptyState,
  Field,
  GhostButton,
  GradientButton,
  Icon,
  Select,
  Spinner,
  TextInput,
} from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError, type AdminUserPayload, type User, type UserType } from '@/lib/api';

interface UserForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  age: string;
  type: UserType;
  password: string;
}

const emptyForm: UserForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  city: '',
  age: '',
  type: 'client',
  password: '',
};

interface Filters {
  city: string;
  type: string;
  first_name: string;
  email: string;
}

function AdminUsersContent() {
  const { token, user: currentUser } = useAuth();
  const [rows, setRows] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState<Filters>({ city: '', type: '', first_name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.listUsers(token, { page, limit, ...filters });
      setRows(data.users);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    loadUsers();

  }, [page, filters]);

  const applyFilter = (key: keyof Filters) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: e.target.value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (u: User) => {
    setEditingId(u.id);
    setForm({
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      phone: u.phone,
      city: u.city,
      age: String(u.age),
      type: u.type,
      password: '',
    });
    setFormError('');
    setShowForm(true);
  };

  const updateForm =
    (key: keyof UserForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        const payload: AdminUserPayload = { ...form, age: Number(form.age) };
        if (!payload.password) delete payload.password;
        await api.updateUser(token, editingId, payload);
      } else {
        await api.createUser(token, { ...form, age: Number(form.age) });
      }
      setShowForm(false);
      loadUsers();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: User) => {
    if (!token || !currentUser) return;
    if (u.id === currentUser.id) return;
    if (
      !window.confirm(
        `Soft-delete ${u.first_name} ${u.last_name}? This can be undone in the database, but they'll lose access immediately.`
      )
    )
      return;
    try {
      await api.deleteUser(token, u.id);
      loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    }
  };

  if (!currentUser) return null;

  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 23 }}>Manage users</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginTop: 4 }}>
            {total} active {total === 1 ? 'user' : 'users'}
          </p>
        </div>
        <GradientButton icon="plus" onClick={openCreate}>
          New user
        </GradientButton>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <TextInput icon="search" placeholder="Filter by first name" onChange={applyFilter('first_name')} />
          <TextInput icon="map-pin" placeholder="Filter by city" onChange={applyFilter('city')} />
          <TextInput icon="mail" placeholder="Filter by email" onChange={applyFilter('email')} />
          <Select onChange={applyFilter('type')} defaultValue="">
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="client">Client</option>
          </Select>
        </div>
      </Card>

      {error && <Banner>{error}</Banner>}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface-alt)' }}>
              {['Name', 'Email', 'City', 'Age', 'Role', ''].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '13px 18px',
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} style={{ padding: 30, textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Spinner />
                  </div>
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 0 }}>
                  <EmptyState icon="users" title="No users match these filters" sub="Try adjusting or clearing your filters." />
                </td>
              </tr>
            )}
            {rows.map((u) => (
              <tr key={u.id} className="ut-row" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '13px 18px', fontWeight: 600 }}>
                  {u.first_name} {u.last_name}
                </td>
                <td style={{ padding: '13px 18px', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '13px 18px', color: 'var(--text-secondary)' }}>{u.city}</td>
                <td style={{ padding: '13px 18px', color: 'var(--text-secondary)' }}>{u.age}</td>
                <td style={{ padding: '13px 18px' }}>
                  <Badge tone={u.type === 'admin' ? 'admin' : 'client'}>{u.type}</Badge>
                </td>
                <td style={{ padding: '13px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <GhostButton icon="edit" onClick={() => openEdit(u)} style={{ marginRight: 8 }}>
                    Edit
                  </GhostButton>
                  <GhostButton
                    icon="trash"
                    danger
                    onClick={() => handleDelete(u)}
                    disabled={u.id === currentUser.id}
                  >
                    Delete
                  </GhostButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <GhostButton icon="chevron-left" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Prev
          </GhostButton>
          <span style={{ padding: '10px 14px', fontSize: 13.5, fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>
          <GhostButton
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ flexDirection: 'row-reverse' }}
            icon="chevron-right"
          >
            Next
          </GhostButton>
        </div>
      )}

      {showForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20,10,30,0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
          onClick={() => setShowForm(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="ut-scale-in" style={{ width: 480, maxWidth: '92vw' }}>
            <Card style={{ boxShadow: 'var(--shadow-float)', maxHeight: '88vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: 'var(--grad-primary-soft)',
                    color: 'var(--magenta)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={editingId ? 'edit' : 'plus'} size={16} />
                </span>
                <h3 style={{ fontSize: 19 }}>{editingId ? 'Edit user' : 'Create user'}</h3>
              </div>
              {formError && <Banner>{formError}</Banner>}
              <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="First name">
                    <TextInput required value={form.first_name} onChange={updateForm('first_name')} />
                  </Field>
                  <Field label="Last name">
                    <TextInput required value={form.last_name} onChange={updateForm('last_name')} />
                  </Field>
                </div>
                <Field label="Email">
                  <TextInput type="email" required value={form.email} onChange={updateForm('email')} />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Phone">
                    <TextInput required value={form.phone} onChange={updateForm('phone')} />
                  </Field>
                  <Field label="Age">
                    <TextInput type="number" required value={form.age} onChange={updateForm('age')} />
                  </Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="City">
                    <TextInput required value={form.city} onChange={updateForm('city')} />
                  </Field>
                  <Field label="Role">
                    <Select value={form.type} onChange={updateForm('type')}>
                      <option value="client">Client</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </Field>
                </div>
                <Field label={editingId ? 'New password (optional)' : 'Password'}>
                  <TextInput
                    icon="lock"
                    type="password"
                    required={!editingId}
                    value={form.password}
                    onChange={updateForm('password')}
                  />
                </Field>
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <GradientButton type="submit" disabled={saving} style={{ flex: 1 }}>
                    {saving ? 'Saving…' : 'Save'}
                  </GradientButton>
                  <GhostButton type="button" onClick={() => setShowForm(false)}>
                    Cancel
                  </GhostButton>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminUsersContent />
    </ProtectedRoute>
  );
}
