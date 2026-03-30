import type { CollectionConfig } from 'payload';

export const AppSettings: CollectionConfig = {
  slug: 'app_settings',
  labels: {
    singular: 'Uygulama Ayarı',
    plural: 'Uygulama Ayarları',
  },
  admin: {
    useAsTitle: 'key',
  },
  fields: [
    {
      name: 'key',
      type: 'text',
      label: 'Ayar Anahtarı (Key)',
      required: true,
      unique: true,
    },
    {
      name: 'value',
      type: 'text',
      label: 'Değer (Value)',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Açıklama',
    },
  ],
};
