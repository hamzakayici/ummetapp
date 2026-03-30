import type { CollectionConfig } from 'payload'
import { sendExpoPushToAll } from '../services/expoPush'

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
    { name: 'title', type: 'text', label: 'Başlık', required: true },
    { name: 'body', type: 'textarea', label: 'Mesaj', required: true },
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
          data: { status: 'sending', error: null, sent_count: 0 },
        })

        const res = await sendExpoPushToAll({
          connectionString,
          title: String((doc as any).title || ''),
          body: String((doc as any).body || ''),
          data: ((doc as any).data as any) || undefined,
          platform: ((doc as any).platform as any) || 'all',
        })

        ctx.__skipPushNotificationHook = true
        if (res.ok) {
          await req.payload.update({
            collection: 'push_notifications',
            id: doc.id,
            data: {
              status: 'sent',
              sent_at: new Date().toISOString(),
              sent_count: res.sent,
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
              error: res.error,
              sent_count: res.sent ?? 0,
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

