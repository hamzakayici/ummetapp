import React from 'react'
import { Pool } from 'pg'

type Metrics = {
  dau: number
  wau: number
  mau: number
  events24h: number
  topEvents24h: Array<{ name: string; count: number }>
  newDevices24h: number
  returningDevices24h: number
  d1Retention: number
  d7Retention: number
  cohortRows: Array<{
    cohortDate: string
    cohortSize: number
    retainedD1: number
    retainedD7: number
    rateD1: number
    rateD7: number
  }>
  sessions24h: number
  avgSessionMs24h: number
}

async function getMetrics(): Promise<Metrics> {
  const connectionString = process.env.DATABASE_URI || ''
  if (!connectionString) {
    return {
      dau: 0,
      wau: 0,
      mau: 0,
      events24h: 0,
      topEvents24h: [],
      newDevices24h: 0,
      returningDevices24h: 0,
      d1Retention: 0,
      d7Retention: 0,
      cohortRows: [],
      sessions24h: 0,
      avgSessionMs24h: 0,
    }
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('pooler.supabase.com') ? false : { rejectUnauthorized: false },
    max: 2,
  })

  try {
    const [
      { rows: baseRows },
      { rows: topRows },
      { rows: deviceRows },
      { rows: retentionRows },
      { rows: cohortRows },
      { rows: sessionRows },
    ] =
      await Promise.all([
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
      pool.query(
        `
        with first_seen as (
          select device_id, min(ts) as first_ts
          from public.app_events
          group by device_id
        ),
        active24h as (
          select distinct device_id
          from public.app_events
          where ts >= now() - interval '1 day'
        )
        select
          (select count(*) from active24h a join first_seen f on f.device_id = a.device_id where f.first_ts >= now() - interval '1 day')::int as new_devices_24h,
          (select count(*) from active24h a join first_seen f on f.device_id = a.device_id where f.first_ts < now() - interval '1 day')::int as returning_devices_24h;
        `,
      ),
      pool.query(
        `
        with first_seen as (
          select device_id, date_trunc('day', min(ts))::date as cohort_date
          from public.app_events
          group by device_id
        ),
        activity_days as (
          select distinct device_id, date_trunc('day', ts)::date as day
          from public.app_events
          where ts >= now() - interval '40 days'
        ),
        cohort_yesterday as (
          select device_id, cohort_date
          from first_seen
          where cohort_date = (current_date - 1)
        ),
        cohort_7d as (
          select device_id, cohort_date
          from first_seen
          where cohort_date = (current_date - 7)
        )
        select
          (select count(*)::int from cohort_yesterday) as cohort_1d_size,
          (select count(*)::int from cohort_yesterday c where exists (select 1 from activity_days a where a.device_id=c.device_id and a.day = c.cohort_date + 1)) as cohort_1d_retained,
          (select count(*)::int from cohort_7d) as cohort_7d_size,
          (select count(*)::int from cohort_7d c where exists (select 1 from activity_days a where a.device_id=c.device_id and a.day = c.cohort_date + 7)) as cohort_7d_retained;
        `,
      ),
      pool.query(
        `
        with first_seen as (
          select device_id, date_trunc('day', min(ts))::date as cohort_date
          from public.app_events
          group by device_id
        ),
        activity_days as (
          select distinct device_id, date_trunc('day', ts)::date as day
          from public.app_events
          where ts >= now() - interval '60 days'
        )
        select
          f.cohort_date,
          count(*)::int as cohort_size,
          count(*) filter (where exists (select 1 from activity_days a where a.device_id=f.device_id and a.day = f.cohort_date + 1))::int as retained_d1,
          count(*) filter (where exists (select 1 from activity_days a where a.device_id=f.device_id and a.day = f.cohort_date + 7))::int as retained_d7
        from first_seen f
        where f.cohort_date >= (current_date - 13)
        group by f.cohort_date
        order by f.cohort_date desc;
        `,
      ),
      pool.query(
        `
        select
          count(*)::int as sessions_24h,
          coalesce(avg(duration_ms), 0)::bigint as avg_session_ms_24h
        from public.app_sessions
        where started_at >= now() - interval '1 day'
          and duration_ms is not null
          and duration_ms > 0;
        `,
      ),
    ])

    const base = baseRows[0] || { dau: 0, wau: 0, mau: 0, events24h: 0 }
    const devices = deviceRows?.[0] || { new_devices_24h: 0, returning_devices_24h: 0 }
    const r = retentionRows?.[0] || {
      cohort_1d_size: 0,
      cohort_1d_retained: 0,
      cohort_7d_size: 0,
      cohort_7d_retained: 0,
    }

    const d1 = Number(r.cohort_1d_size || 0) > 0 ? Number(r.cohort_1d_retained || 0) / Number(r.cohort_1d_size || 1) : 0
    const d7 = Number(r.cohort_7d_size || 0) > 0 ? Number(r.cohort_7d_retained || 0) / Number(r.cohort_7d_size || 1) : 0

    return {
      dau: base.dau ?? 0,
      wau: base.wau ?? 0,
      mau: base.mau ?? 0,
      events24h: base.events24h ?? 0,
      topEvents24h: (topRows || []).map((r: any) => ({ name: String(r.name), count: Number(r.count) })),
      newDevices24h: Number(devices.new_devices_24h || 0),
      returningDevices24h: Number(devices.returning_devices_24h || 0),
      d1Retention: d1,
      d7Retention: d7,
      cohortRows: (cohortRows || []).map((row: any) => {
        const size = Number(row.cohort_size || 0)
        const retainedD1 = Number(row.retained_d1 || 0)
        const retainedD7 = Number(row.retained_d7 || 0)
        return {
          cohortDate: String(row.cohort_date),
          cohortSize: size,
          retainedD1,
          retainedD7,
          rateD1: size > 0 ? retainedD1 / size : 0,
          rateD7: size > 0 ? retainedD7 / size : 0,
        }
      }),
      sessions24h: Number(sessionRows?.[0]?.sessions_24h || 0),
      avgSessionMs24h: Number(sessionRows?.[0]?.avg_session_ms_24h || 0),
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
  const pct = (n: number) => `${Math.round(n * 1000) / 10}%`
  const fmtDuration = (ms: number) => {
    const s = Math.max(0, Math.round(ms / 1000))
    const mnt = Math.floor(s / 60)
    const sec = s % 60
    if (mnt <= 0) return `${sec}s`
    return `${mnt}dk ${sec}s`
  }

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
        <Card title="Yeni cihaz (24s)" value={m.newDevices24h} />
        <Card title="Geri dönen cihaz (24s)" value={m.returningDevices24h} />
        <Card title="Retention D+1 (dün cohort)" value={pct(m.d1Retention)} sub="Dün ilk kez gelenlerin bugün geri dönüşü" />
        <Card title="Retention D+7 (7g önce cohort)" value={pct(m.d7Retention)} sub="7 gün önce ilk kez gelenlerin bugün geri dönüşü" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginTop: 12 }}>
        <Card title="Oturum (24s)" value={m.sessions24h} />
        <Card title="Ort. oturum süresi (24s)" value={fmtDuration(m.avgSessionMs24h)} />
        <Card title="—" value="—" />
        <Card title="—" value="—" />
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

      <div
        style={{
          marginTop: 12,
          padding: 16,
          border: '1px solid var(--theme-elevation-200)',
          background: 'var(--theme-elevation-0)',
          borderRadius: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>Cohort analizi (son 14 gün)</div>
          <div style={{ fontSize: 12, opacity: 0.6 }}>D1 ve D7 retention</div>
        </div>

        {m.cohortRows.length === 0 ? (
          <div style={{ opacity: 0.7 }}>Henüz yeterli veri yok.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: 'left', opacity: 0.8 }}>
                  <th style={{ padding: '10px 8px', borderBottom: '1px solid var(--theme-elevation-200)' }}>Cohort günü</th>
                  <th style={{ padding: '10px 8px', borderBottom: '1px solid var(--theme-elevation-200)' }}>Boyut</th>
                  <th style={{ padding: '10px 8px', borderBottom: '1px solid var(--theme-elevation-200)' }}>D1</th>
                  <th style={{ padding: '10px 8px', borderBottom: '1px solid var(--theme-elevation-200)' }}>D1 %</th>
                  <th style={{ padding: '10px 8px', borderBottom: '1px solid var(--theme-elevation-200)' }}>D7</th>
                  <th style={{ padding: '10px 8px', borderBottom: '1px solid var(--theme-elevation-200)' }}>D7 %</th>
                </tr>
              </thead>
              <tbody>
                {m.cohortRows.map((r) => (
                  <tr key={r.cohortDate}>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--theme-elevation-100)' }}>
                      <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                        {r.cohortDate}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--theme-elevation-100)', fontWeight: 700 }}>
                      {r.cohortSize}
                    </td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--theme-elevation-100)' }}>{r.retainedD1}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--theme-elevation-100)' }}>{pct(r.rateD1)}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--theme-elevation-100)' }}>{r.retainedD7}</td>
                    <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--theme-elevation-100)' }}>{pct(r.rateD7)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

