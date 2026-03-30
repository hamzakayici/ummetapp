import type { CollectionConfig } from 'payload';

export const Announcements: CollectionConfig = {
  slug: 'announcements',
  labels: {
    singular: 'Duyuru',
    plural: 'Duyurular',
  },
  admin: {
    useAsTitle: 'title',
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
  ],
};
