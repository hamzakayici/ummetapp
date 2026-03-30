import type { CollectionConfig } from 'payload'

export const AppEvents: CollectionConfig = {
  slug: 'app_events',
  labels: {
    singular: 'Event',
    plural: 'Eventler',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'device_id', 'session_id', 'ts', 'createdAt'],
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Event Name',
      required: true,
      index: true,
    },
    {
      name: 'ts',
      type: 'date',
      label: 'Timestamp',
      required: true,
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
      name: 'session_id',
      type: 'text',
      label: 'Session ID',
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
    {
      name: 'app_version',
      type: 'text',
      label: 'App Version',
      index: true,
    },
    {
      name: 'pathname',
      type: 'text',
      label: 'Pathname',
      index: true,
    },
    {
      name: 'props',
      type: 'json',
      label: 'Props',
    },
  ],
}

