import type { CollectionConfig } from 'payload';

export const SharedDhikrs: CollectionConfig = {
  slug: 'shared_dhikrs',
  labels: {
    singular: 'Ortak Zikir',
    plural: 'Ortak Zikirler',
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Zikir Başlığı',
      required: true,
    },
    {
      name: 'preset_name',
      type: 'text',
      label: 'Zikir Türü (Preset)',
      required: true,
    },
    {
      name: 'target_count',
      type: 'number',
      label: 'Hedef Sayı',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'current_count',
      type: 'number',
      label: 'Mevcut Okunan Sayı',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'share_code',
      type: 'text',
      label: 'Paylaşım Kodu (Benzersiz)',
      required: true,
      unique: true,
    },
    {
      name: 'creator_device_id',
      type: 'text',
      label: 'Oluşturan Cihaz ID (Opsiyonel)',
    },
  ],
};
