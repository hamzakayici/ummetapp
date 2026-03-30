import type { CollectionConfig } from 'payload';
import { Pool } from 'pg';

async function getAnnouncementOpens({
  connectionString,
  announcementId,
}: {
  connectionString: string;
  announcementId: string;
}): Promise<{ opensTotal: number; uniqueDevices: number; opens24h: number }> {
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('pooler.supabase.com') ? false : { rejectUnauthorized: false },
    max: 2,
  });

  try {
    const { rows } = await pool.query(
      `
      select
        count(*)::int as opens_total,
        count(distinct device_id)::int as unique_devices,
        count(*) filter (where ts >= now() - interval '1 day')::int as opens_24h
      from public.app_events
      where name = 'announcement_open'
        and props->>'id' = $1;
      `,
      [announcementId],
    );
    const r: any = rows?.[0] || {};
    return {
      opensTotal: Number(r.opens_total || 0),
      uniqueDevices: Number(r.unique_devices || 0),
      opens24h: Number(r.opens_24h || 0),
    };
  } finally {
    await pool.end();
  }
}

export const Announcements: CollectionConfig = {
  slug: 'announcements',
  labels: {
    singular: 'Duyuru',
    plural: 'Duyurular',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'active', 'opens_total', 'unique_devices', 'opens_24h', 'updatedAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Duyuru Başlığı',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      label: 'İçerik',
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Aktif Mi?',
      defaultValue: true,
    },
    {
      name: 'type',
      type: 'select',
      label: 'Tür',
      options: [
        { label: 'Bilgi', value: 'info' },
        { label: 'Uyarı', value: 'warning' },
        { label: 'Güncelleme', value: 'update' },
      ],
      defaultValue: 'info',
    },
    {
      name: 'opens_total',
      type: 'number',
      label: 'Açılma (Toplam)',
      admin: { readOnly: true },
    },
    {
      name: 'unique_devices',
      type: 'number',
      label: 'Açan Cihaz (Unique)',
      admin: { readOnly: true },
    },
    {
      name: 'opens_24h',
      type: 'number',
      label: 'Açılma (24s)',
      admin: { readOnly: true },
    },
  ],
  hooks: {
    afterRead: [
      async ({ doc }) => {
        const connectionString = process.env.DATABASE_URI || '';
        if (!connectionString) return doc;
        if (!(doc as any)?.id) return doc;

        const { opensTotal, uniqueDevices, opens24h } = await getAnnouncementOpens({
          connectionString,
          announcementId: String((doc as any).id),
        });

        (doc as any).opens_total = opensTotal;
        (doc as any).unique_devices = uniqueDevices;
        (doc as any).opens_24h = opens24h;
        return doc;
      },
    ],
  },
};
