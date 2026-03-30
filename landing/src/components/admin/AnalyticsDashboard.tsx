import React from 'react'
import { Pool } from 'pg'

type Metrics = {
  dau: number
  wau: number
  mau: number
  events24h: number
  topEvents24h: Array<{ name: string; count: number }>
}

async function getMetrics(): Promise<Metrics> {
  const connectionString = process.env.DATABASE_URI || ''
  if (!connectionString) {
    return { dau: 0, wau: 0, mau: 0, events24h: 0, topEvents24h: [] }
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('pooler.supabase.com') ? false : { rejectUnauthorized: false },
    max: 2,
  })

  try {
    const [{ rows: baseRows }, { rows: topRows }] = await Promise.all([
      pool.query(
        `
        with e as (
          select device_id, ts
          from public.app_events
          where ts >= now() - interval '30 days'
        )
        select
          (select count(distinct device_id) from e where ts >= now() - interval '1 day')::int as dau,
          (select count(distinct device_id) from e where ts >= now() - interval '7 days')::int as wau,
          (select count(distinct device_id) from e where ts >= now() - interval '30 days')::int as mau,
          (select count(*) from public.app_events where ts >= now() - interval '1 day')::int as "events24h";
        `,
      ),
      pool.query(
        `
        select name, count(*)::int as count
        from public.app_events
        where ts >= now() - interval '1 day'
        group by name
        order by count desc
        limit 8;
        `,
      ),
    ])

    const base = baseRows[0] || { dau: 0, wau: 0, mau: 0, events24h: 0 }
    return {
      dau: base.dau ?? 0,
      wau: base.wau ?? 0,
      mau: base.mau ?? 0,
      events24h: base.events24h ?? 0,
      topEvents24h: (topRows || []).map((r: any) => ({ name: String(r.name), count: Number(r.count) })),
    }
  } finally {
    await pool.end()
  }
}

function Card({ title, value, sub }: { title: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 16,
        border: '1px solid var(--theme-elevation-200)',
        background: 'var(--theme-elevation-0)',
        borderRadius: 8,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>{value}</div>
      {sub ? <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>{sub}</div> : null}
    </div>
  )
}

export default async function AnalyticsDashboard() {
  const m = await getMetrics()

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
        <h2 style={{ margin: '8px 0 12px' }}>Uygulama Metrikleri</h2>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Son güncelleme: {new Date().toLocaleString('tr-TR')}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        <Card title="DAU (24s)" value={m.dau} />
        <Card title="WAU (7g)" value={m.wau} />
        <Card title="MAU (30g)" value={m.mau} />
        <Card title="Event (son 24s)" value={m.events24h} />
      </div>

      <div
        style={{
          marginTop: 12,
          padding: 16,
          border: '1px solid var(--theme-elevation-200)',
          background: 'var(--theme-elevation-0)',
          borderRadius: 8,
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>En çok event (son 24s)</div>
        {m.topEvents24h.length === 0 ? (
          <div style={{ opacity: 0.7 }}>Henüz veri yok.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
            {m.topEvents24h.map((e) => (
              <div
                key={e.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: 10,
                  borderRadius: 8,
                  border: '1px solid var(--theme-elevation-100)',
                  background: 'var(--theme-elevation-50)',
                }}
              >
                <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                  {e.name}
                </div>
                <div style={{ fontWeight: 700 }}>{e.count}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

