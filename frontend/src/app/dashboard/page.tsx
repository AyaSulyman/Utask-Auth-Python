'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Badge, Card, Icon, Skeleton, type IconName } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { api, type StatsAverageAge, type StatsCount, type StatsTopCities } from '@/lib/api';

interface DashboardStats {
  count: StatsCount;
  avgAge: StatsAverageAge;
  cities: StatsTopCities;
}

function IconBadge({ name }: { name: IconName }) {
  return (
    <span
      style={{
        width: 30,
        height: 30,
        borderRadius: 9,
        background: 'var(--grad-primary-soft)',
        color: 'var(--magenta)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={name} size={15} />
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  loading,
}: {
  icon: IconName;
  label: string;
  value?: number;
  loading: boolean;
}) {
  return (
    <Card hover>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <IconBadge name={icon} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
      </div>
      {loading ? (
        <Skeleton width={70} height={30} />
      ) : (
        <div style={{ fontSize: 30, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          {value ?? '—'}
        </div>
      )}
    </Card>
  );
}

function DashboardContent() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    Promise.all([api.statsCount(), api.statsAverageAge(), api.statsTopCities()])
      .then(([count, avgAge, cities]) => setStats({ count, avgAge, cities }))
      .catch(() => setStats(null));
  }, []);

  return (
    <AppLayout>
      <div
        className="ut-mesh"
        style={{
          background: 'var(--grad-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '30px 34px',
          color: '#fff',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            right: -70,
            bottom: -90,
          }}
        />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 13.5, opacity: 0.85, fontWeight: 600, marginBottom: 6 }}>
            Good to see you, {user?.first_name}
          </div>
          <h1 style={{ fontSize: 26, marginBottom: 8 }}>
            {isAdmin ? 'Here is what’s happening across uTask' : 'Have a good day'}
          </h1>
          <Badge tone={isAdmin ? 'admin' : 'client'} icon={isAdmin ? 'shield' : 'user'}>
            {user?.type}
          </Badge>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        <StatCard icon="users" label="Active users" value={stats?.count?.total_users} loading={!stats} />
        <StatCard icon="cake" label="Average age" value={stats?.avgAge?.average_age} loading={!stats} />
        <Card hover>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <IconBadge name="map-pin" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
              Top cities
            </span>
          </div>
          {stats?.cities?.cities?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.cities.cities.map((c) => (
                <div key={c.city} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span>{c.city}</span>
                  <span style={{ fontWeight: 700, color: 'var(--magenta)' }}>{c.count}</span>
                </div>
              ))}
            </div>
          ) : !stats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Skeleton height={14} />
              <Skeleton height={14} width="80%" />
              <Skeleton height={14} width="60%" />
            </div>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No data yet</span>
          )}
        </Card>
      </div>

      <div style={{ marginTop: 24 }}>
        <Card hover>
          <h3 style={{ fontSize: 17, marginBottom: 10 }}>Your account</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
            You&apos;re signed in as <strong>{user?.email}</strong> based in {user?.city}. Visit
            &quot;My Profile&quot; to update your details at any time
            {isAdmin ? ', or head to "Manage Users" to administer client and admin accounts.' : '.'}
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
