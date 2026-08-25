'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, EmptyState, Icon, Skeleton, type IconName } from '@/components/ui';
import { api, type StatsAverageAge, type StatsCount, type StatsTopCities } from '@/lib/api';

interface StatsData {
  count: StatsCount;
  avgAge: StatsAverageAge;
  cities: StatsTopCities;
}

function StatIcon({ name }: { name: IconName }) {
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

function StatsContent() {
  const [data, setData] = useState<StatsData | null>(null);

  useEffect(() => {
    Promise.all([api.statsCount(), api.statsAverageAge(), api.statsTopCities()]).then(
      ([count, avgAge, cities]) => setData({ count, avgAge, cities })
    );
  }, []);

  const maxCount = data?.cities?.cities?.[0]?.count || 1;

  return (
    <AppLayout>
      <h1 style={{ fontSize: 23, marginBottom: 4 }}>Platform statistics</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginBottom: 22 }}>
        Public figures, computed from active accounts only.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <Card hover>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <StatIcon name="users" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
              Total active users
            </span>
          </div>
          {data ? (
            <div style={{ fontSize: 40, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              {data.count.total_users}
            </div>
          ) : (
            <Skeleton width={90} height={40} />
          )}
        </Card>
        <Card hover>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <StatIcon name="cake" />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
              Average age
            </span>
          </div>
          {data ? (
            <div style={{ fontSize: 40, fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              {data.avgAge.average_age}
            </div>
          ) : (
            <Skeleton width={90} height={40} />
          )}
        </Card>
      </div>

      <Card hover>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <StatIcon name="map-pin" />
          <h3 style={{ fontSize: 16 }}>Top 3 cities</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!data && [1, 2, 3].map((i) => <Skeleton key={i} height={16} />)}
          {data?.cities?.cities?.map((c, i) => (
            <div key={c.city}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 6 }}>
                <span style={{ fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-muted)', marginRight: 6 }}>#{i + 1}</span>
                  {c.city}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>{c.count} users</span>
              </div>
              <div style={{ height: 10, borderRadius: 'var(--radius-pill)', background: 'var(--bg-pill)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(c.count / maxCount) * 100}%`,
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--grad-primary)',
                    transition: 'width 700ms cubic-bezier(0.4,0,0.2,1)',
                  }}
                />
              </div>
            </div>
          ))}
          {data && !data?.cities?.cities?.length && (
            <EmptyState icon="map-pin" title="No city data yet" sub="Statistics will appear here once users register." />
          )}
        </div>
      </Card>
    </AppLayout>
  );
}

export default function StatsPage() {
  return (
    <ProtectedRoute>
      <StatsContent />
    </ProtectedRoute>
  );
}
