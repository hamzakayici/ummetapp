import type { CollectionConfig } from 'payload'

export const AppSessions: CollectionConfig = {
  slug: 'app_sessions',
  labels: {
    singular: 'Oturum',
    plural: 'Oturumlar',
  },
  admin: {
    useAsTitle: 'session_id',
    defaultColumns: ['session_id', 'device_id', 'started_at', 'ended_at', 'duration_ms', 'createdAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'session_id',
      type: 'text',
      label: 'Session ID',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'device_id',
      type: 'text',
      label: 'Device ID',
      required: true,
      index: true,
    },
    {
      name: 'started_at',
      type: 'date',
      label: 'Started At',
      required: true,
      index: true,
    },
    {
      name: 'ended_at',
      type: 'date',
      label: 'Ended At',
      index: true,
    },
    {
      name: 'duration_ms',
      type: 'number',
      label: 'Duration (ms)',
    },
    {
      name: 'app_version',
      type: 'text',
      label: 'App Version',
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
    },
  ],
}

