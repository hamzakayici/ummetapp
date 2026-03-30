import type { CollectionConfig } from 'payload'
import { sendExpoPushAB, sendExpoPushToAll } from '../services/expoPush'

type Status = 'draft' | 'sending' | 'sent' | 'failed'

export const PushNotifications: CollectionConfig = {
  slug: 'push_notifications',
  labels: {
    singular: 'Push Bildirim',
    plural: 'Push Bildirimleri',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'platform', 'status', 'sent_at', 'updatedAt'],
  },
  fields: [
    {
      name: 'mode',
      type: 'select',
      label: 'Gönderim Modu',
      options: [
        { label: 'Tek Mesaj', value: 'single' },
        { label: 'A/B Test', value: 'ab' },
      ],
      defaultValue: 'single',
    },
    {
      name: 'title',
      type: 'text',
      label: 'Başlık',
      required: true,
      admin: {
        condition: (_, siblingData) => (siblingData as any)?.mode !== 'ab',
      },
    },
    {
      name: 'body',
      type: 'textarea',
      label: 'Mesaj',
      required: true,
      admin: {
        condition: (_, siblingData) => (siblingData as any)?.mode !== 'ab',
      },
    },
    {
      name: 'ab',
      type: 'group',
      label: 'A/B Test Ayarları',
      admin: {
        condition: (_, siblingData) => (siblingData as any)?.mode === 'ab',
      },
      fields: [
        {
          name: 'split_percent_a',
          type: 'number',
          label: 'A Yüzdesi',
          defaultValue: 50,
          min: 0,
          max: 100,
        },
        {
          name: 'a_title',
          type: 'text',
          label: 'A Başlık',
          required: true,
        },
        {
          name: 'a_body',
          type: 'textarea',
          label: 'A Mesaj',
          required: true,
        },
        {
          name: 'a_data',
          type: 'json',
          label: 'A Data (opsiyonel)',
        },
        {
          name: 'b_title',
          type: 'text',
          label: 'B Başlık',
          required: true,
        },
        {
          name: 'b_body',
          type: 'textarea',
          label: 'B Mesaj',
          required: true,
        },
        {
          name: 'b_data',
          type: 'json',
          label: 'B Data (opsiyonel)',
        },
      ],
    },
    {
      name: 'segment',
      type: 'select',
      label: 'Hedef Kitle (Segment)',
      options: [
        { label: 'Tümü', value: 'all' },
        { label: 'Son 24 saat aktif (DAU)', value: 'active_1d' },
        { label: 'Son 7 gün aktif (WAU)', value: 'active_7d' },
        { label: 'Son 30 gün aktif (MAU)', value: 'active_30d' },
        { label: 'Son 24s belirli event yapan', value: 'event_1d' },
        { label: 'Son 7g belirli event yapan', value: 'event_7d' },
        { label: 'Son 30g belirli event yapan', value: 'event_30d' },
      ],
      defaultValue: 'all',
      admin: {
        description: 'Segmentleme için push_tokens.device_id ile app_events.device_id eşleşmesi gerekir.',
      },
    },
    {
      name: 'event_name',
      type: 'text',
      label: 'Event Adı (segment = event_*)',
      admin: {
        condition: (_, siblingData) => String((siblingData as any)?.segment || 'all').startsWith('event_'),
        description: 'Örn: screen_view, app_open, daily_goal_reached',
      },
    },
    {
      name: 'platform',
      type: 'select',
      label: 'Hedef Platform',
      options: [
        { label: 'Tümü', value: 'all' },
        { label: 'iOS', value: 'ios' },
        { label: 'Android', value: 'android' },
      ],
      defaultValue: 'all',
    },
    {
      name: 'data',
      type: 'json',
      label: 'Ek Veri (data)',
      admin: {
        description: 'Mobil uygulama içinde yönlendirme vb. için JSON gönderebilirsiniz.',
        condition: (_, siblingData) => (siblingData as any)?.mode !== 'ab',
      },
    },
    {
      name: 'send_now',
      type: 'checkbox',
      label: 'Şimdi Gönder',
      defaultValue: false,
      admin: {
        description: 'Kaydedince gönderim tetiklenir.',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Durum',
      options: [
        { label: 'Taslak', value: 'draft' },
        { label: 'Gönderiliyor', value: 'sending' },
        { label: 'Gönderildi', value: 'sent' },
        { label: 'Hata', value: 'failed' },
      ],
      defaultValue: 'draft',
      admin: { readOnly: true },
    },
    {
      name: 'sent_at',
      type: 'date',
      label: 'Gönderim Zamanı',
      admin: { readOnly: true },
    },
    {
      name: 'sent_count',
      type: 'number',
      label: 'Gönderilen Adet',
      admin: { readOnly: true },
    },
    {
      name: 'sent_count_a',
      type: 'number',
      label: 'A Gönderilen',
      admin: { readOnly: true, condition: (_, siblingData) => (siblingData as any)?.mode === 'ab' },
    },
    {
      name: 'sent_count_b',
      type: 'number',
      label: 'B Gönderilen',
      admin: { readOnly: true, condition: (_, siblingData) => (siblingData as any)?.mode === 'ab' },
    },
    {
      name: 'error',
      type: 'textarea',
      label: 'Hata',
      admin: { readOnly: true },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        const ctx = (req as any).context || ((req as any).context = {})
        if (ctx.__skipPushNotificationHook) return

        // Only trigger on create/update where send_now is checked
        const shouldSend = Boolean((doc as any).send_now)
        const status = String((doc as any).status || 'draft') as Status
        if (!shouldSend) return
        if (status === 'sent' || status === 'sending') return

        const connectionString = process.env.DATABASE_URI || ''
        if (!connectionString) return

        // mark as sending
        ctx.__skipPushNotificationHook = true
        await req.payload.update({
          collection: 'push_notifications',
          id: doc.id,
          data: { status: 'sending', error: null, sent_count: 0, sent_count_a: 0, sent_count_b: 0 },
        })

        const mode = String((doc as any).mode || 'single')
        const campaignId = `push_${String(doc.id)}`
        const common = {
          connectionString,
          platform: ((doc as any).platform as any) || 'all',
          segment: ((doc as any).segment as any) || 'all',
          eventName: String((doc as any).event_name || ''),
        }

        const res =
          mode === 'ab'
            ? await sendExpoPushAB({
                ...common,
                campaignId,
                splitPercentA: Number((doc as any)?.ab?.split_percent_a ?? 50),
                A: {
                  title: String((doc as any)?.ab?.a_title || ''),
                  body: String((doc as any)?.ab?.a_body || ''),
                  data: ((doc as any)?.ab?.a_data as any) || undefined,
                },
                B: {
                  title: String((doc as any)?.ab?.b_title || ''),
                  body: String((doc as any)?.ab?.b_body || ''),
                  data: ((doc as any)?.ab?.b_data as any) || undefined,
                },
              })
            : await sendExpoPushToAll({
                ...common,
                title: String((doc as any).title || ''),
                body: String((doc as any).body || ''),
                data: { ...(((doc as any).data as any) || {}), campaign_id: campaignId, ab: 'single' },
              })

        ctx.__skipPushNotificationHook = true
        if ((res as any).ok) {
          await req.payload.update({
            collection: 'push_notifications',
            id: doc.id,
            data: {
              status: 'sent',
              sent_at: new Date().toISOString(),
              sent_count: (res as any).sent ?? (((res as any).sentA || 0) + ((res as any).sentB || 0)),
              sent_count_a: (res as any).sentA ?? 0,
              sent_count_b: (res as any).sentB ?? 0,
              error: null,
              send_now: false,
            },
          })
        } else {
          await req.payload.update({
            collection: 'push_notifications',
            id: doc.id,
            data: {
              status: 'failed',
              error: (res as any).error,
              sent_count: (res as any).sent ?? 0,
              sent_count_a: 0,
              sent_count_b: 0,
              send_now: false,
            },
          })
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        void operation
      },
    ],
  },
}

