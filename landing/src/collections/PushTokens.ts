import type { CollectionConfig } from 'payload';

export const PushTokens: CollectionConfig = {
  slug: 'push_tokens',
  labels: {
    singular: 'Push Token',
    plural: 'Push Tokenları',
  },
  admin: {
    useAsTitle: 'expo_push_token',
    defaultColumns: ['expo_push_token', 'platform', 'app_version', 'last_seen_at', 'updatedAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'expo_push_token',
      type: 'text',
      label: 'Expo Push Token',
      required: true,
      unique: true,
    },
    {
      name: 'platform',
      type: 'select',
      label: 'Platform',
      options: [
        { label: 'iOS', value: 'ios' },
        { label: 'Android', value: 'android' },
        { label: 'Web', value: 'web' },
      ],
      defaultValue: 'ios',
    },
    {
      name: 'device_id',
      type: 'text',
      label: 'Device ID',
      admin: {
        description: 'Mobil analytics ile aynı device_id. Segmentleme için kullanılır.',
      },
    },
    {
      name: 'app_version',
      type: 'text',
      label: 'App Version',
    },
    {
      name: 'last_seen_at',
      type: 'date',
      label: 'Son Görülme',
    },
  ],
};
