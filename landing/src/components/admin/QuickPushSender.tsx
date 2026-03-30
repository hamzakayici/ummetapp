/* eslint-disable react/no-unescaped-entities */
'use client'

import React, { useMemo, useState } from 'react'

type Segment =
  | 'all'
  | 'active_1d'
  | 'active_7d'
  | 'active_30d'
  | 'event_1d'
  | 'event_7d'
  | 'event_30d'

type Platform = 'all' | 'ios' | 'android'

export default function QuickPushSender() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [segment, setSegment] = useState<Segment>('all')
  const [eventName, setEventName] = useState('')
  const [platform, setPlatform] = useState<Platform>('all')
  const [route, setRoute] = useState('')
  const [pathname, setPathname] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const needsEventName = useMemo(() => segment.startsWith('event_'), [segment])

  async function send() {
    const t = title.trim()
    const b = body.trim()

    if (!t || !b) {
      setResult({ ok: false, msg: 'Başlık ve mesaj zorunlu.' })
      return
    }
    if (needsEventName && !eventName.trim()) {
      setResult({ ok: false, msg: 'Event segment için event adı zorunlu.' })
      return
    }

    const data: Record<string, unknown> = {}
    if (route.trim()) data.route = route.trim()
    if (pathname.trim()) data.pathname = pathname.trim()

    setSending(true)
    setResult(null)
    try {
      const res = await fetch('/api/push_notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: t,
          body: b,
          mode: 'single',
          segment,
          event_name: needsEventName ? eventName.trim() : '',
          platform,
          data,
          send_now: true,
        }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        setResult({ ok: false, msg: `Gönderim başarısız (HTTP ${res.status}). ${text.slice(0, 140)}` })
        return
      }

      setResult({ ok: true, msg: 'Gönderim kuyruğa alındı. Durumu Push Bildirimleri listesinden görebilirsin.' })
      setTitle('')
      setBody('')
      setRoute('')
      setPathname('')
      setEventName('')
      setSegment('all')
      setPlatform('all')
    } catch (e: any) {
      setResult({ ok: false, msg: e?.message ? String(e.message) : 'Beklenmeyen hata.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
        <h2 style={{ margin: '8px 0 12px' }}>Hızlı Push Gönder</h2>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Dashboard'dan 10 saniyede gönder</div>
      </div>

      <div
        style={{
          padding: 16,
          border: '1px solid var(--theme-elevation-200)',
          background: 'var(--theme-elevation-0)',
          borderRadius: 8,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Başlık</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Yeni özellik yayında"
              style={{ padding: 10, borderRadius: 8, border: '1px solid var(--theme-elevation-200)' }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Platform</div>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              style={{ padding: 10, borderRadius: 8, border: '1px solid var(--theme-elevation-200)' }}
            >
              <option value="all">Tümü</option>
              <option value="ios">iOS</option>
              <option value="android">Android</option>
            </select>
          </label>
        </div>

        <label style={{ display: 'grid', gap: 6, marginTop: 12 }}>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Mesaj</div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Kısa ve net mesaj…"
            rows={3}
            style={{ padding: 10, borderRadius: 8, border: '1px solid var(--theme-elevation-200)', resize: 'vertical' }}
          />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Segment</div>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value as Segment)}
              style={{ padding: 10, borderRadius: 8, border: '1px solid var(--theme-elevation-200)' }}
            >
              <option value="all">Tümü</option>
              <option value="active_1d">Son 24 saat aktif (DAU)</option>
              <option value="active_7d">Son 7 gün aktif (WAU)</option>
              <option value="active_30d">Son 30 gün aktif (MAU)</option>
              <option value="event_1d">Son 24s belirli event yapan</option>
              <option value="event_7d">Son 7g belirli event yapan</option>
              <option value="event_30d">Son 30g belirli event yapan</option>
            </select>
          </label>

          <label style={{ display: 'grid', gap: 6, opacity: needsEventName ? 1 : 0.6 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Event adı (opsiyonel/segment)</div>
            <input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Örn: daily_goal_reached"
              disabled={!needsEventName}
              style={{ padding: 10, borderRadius: 8, border: '1px solid var(--theme-elevation-200)' }}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Route (push tıklayınca)</div>
            <input
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="Örn: /dhikr"
              style={{ padding: 10, borderRadius: 8, border: '1px solid var(--theme-elevation-200)' }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Pathname (alternatif)</div>
            <input
              value={pathname}
              onChange={(e) => setPathname(e.target.value)}
              placeholder="Örn: /more"
              style={{ padding: 10, borderRadius: 8, border: '1px solid var(--theme-elevation-200)' }}
            />
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14 }}>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Not: Token yoksa gönderim başarısız olur. Durumu "Push Bildirimleri" listesinde görürsün.
          </div>
          <button
            type="button"
            onClick={send}
            disabled={sending}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid var(--theme-elevation-200)',
              background: sending ? 'var(--theme-elevation-50)' : 'var(--theme-elevation-100)',
              cursor: sending ? 'not-allowed' : 'pointer',
              fontWeight: 700,
            }}
          >
            {sending ? 'Gönderiliyor…' : 'Gönder'}
          </button>
        </div>

        {result ? (
          <div
            style={{
              marginTop: 12,
              padding: 10,
              borderRadius: 10,
              border: '1px solid var(--theme-elevation-200)',
              background: result.ok ? 'rgba(64,192,87,0.10)' : 'rgba(243,87,87,0.08)',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
              {result.ok ? 'Başarılı' : 'Hata'}
            </div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>{result.msg}</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

