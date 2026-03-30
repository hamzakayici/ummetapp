import { Pool } from 'pg'

type PushTargetPlatform = 'all' | 'ios' | 'android'

type ExpoPushMessage = {
  to: string
  title?: string
  body?: string
  data?: Record<string, unknown>
  sound?: 'default' | null
  priority?: 'default' | 'normal' | 'high'
  channelId?: string
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function getTokens({
  connectionString,
  platform,
}: {
  connectionString: string
  platform: PushTargetPlatform
}): Promise<string[]> {
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('pooler.supabase.com') ? false : { rejectUnauthorized: false },
    max: 2,
  })

  try {
    const where = platform === 'all' ? '' : 'where platform = $1'
    const params = platform === 'all' ? [] : [platform]
    const { rows } = await pool.query(
      `select expo_push_token from public.push_tokens ${where} order by updated_at desc limit 20000;`,
      params as any,
    )
    return (rows || [])
      .map((r: any) => String(r?.expo_push_token || ''))
      .filter(Boolean)
      // Expo token format check (basic)
      .filter((t) => t.startsWith('ExponentPushToken[') || t.startsWith('ExpoPushToken['))
  } finally {
    await pool.end()
  }
}

export async function sendExpoPushToAll({
  connectionString,
  title,
  body,
  data,
  platform = 'all',
}: {
  connectionString: string
  title: string
  body: string
  data?: Record<string, unknown>
  platform?: PushTargetPlatform
}) {
  const tokens = await getTokens({ connectionString, platform })
  if (tokens.length === 0) {
    return { ok: false as const, sent: 0, error: 'push_tokens tablosunda geçerli expo_push_token bulunamadı.' }
  }

  // Expo recommends max 100 messages per request.
  const batches = chunk(tokens, 100)

  let sent = 0
  const errors: string[] = []

  for (const batch of batches) {
    const messages: ExpoPushMessage[] = batch.map((to) => ({
      to,
      title,
      body,
      data,
      sound: 'default',
      priority: 'high',
      // For Android channels, if needed later:
      // channelId: 'default',
    }))

    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    })

    if (!res.ok) {
      errors.push(`Expo push HTTP ${res.status}`)
      continue
    }

    const json: any = await res.json().catch(() => null)
    const dataArr: any[] = Array.isArray(json?.data) ? json.data : []
    sent += dataArr.length

    for (const item of dataArr) {
      if (item?.status === 'error') {
        const msg = String(item?.message || 'unknown error')
        errors.push(msg)
      }
    }
  }

  if (errors.length > 0) {
    return { ok: false as const, sent, error: errors.slice(0, 5).join(' | ') }
  }

  return { ok: true as const, sent }
}

