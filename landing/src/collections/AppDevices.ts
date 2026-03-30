import type { CollectionConfig } from 'payload'

export const AppDevices: CollectionConfig = {
  slug: 'app_devices',
  labels: {
    singular: 'Cihaz',
    plural: 'Cihazlar',
  },
  admin: {
    useAsTitle: 'device_id',
    defaultColumns: ['device_id', 'platform', 'app_version', 'last_seen_at', 'createdAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'device_id',
      type: 'text',
      label: 'Device ID',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'platform',
      type: 'select',
      label: 'Platform',
      options: [
        { label: 'iOS', value: 'ios' },
        { label: 'Android', value: 'android' },
        { label: 'Web', value: 'web' },
        { label: 'Diğer', value: 'other' },
      ],
      defaultValue: 'other',
      index: true,
    },
    {
      name: 'app_version',
      type: 'text',
      label: 'App Version',
      index: true,
    },
    {
      name: 'first_seen_at',
      type: 'date',
      label: 'First Seen',
    },
    {
      name: 'last_seen_at',
      type: 'date',
      label: 'Last Seen',
      index: true,
    },
  ],
}

