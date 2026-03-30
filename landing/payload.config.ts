import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { tr } from '@payloadcms/translations/languages/tr';
import path from 'path';
import { fileURLToPath } from 'url';

import { Users } from './src/collections/Users';
import { SharedDhikrs } from './src/collections/SharedDhikrs';
import { PushTokens } from './src/collections/PushTokens';
import { PushNotifications } from './src/collections/PushNotifications';
import { Announcements } from './src/collections/Announcements';
import { AppSettings } from './src/collections/AppSettings';
import { AppDevices } from './src/collections/AppDevices';
import { AppSessions } from './src/collections/AppSessions';
import { AppEvents } from './src/collections/AppEvents';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

const payloadSecret =
  process.env.PAYLOAD_SECRET || (isProd ? '' : 'dev-payload-secret-change-me');

const databaseURI = process.env.DATABASE_URI || '';

if (!payloadSecret) {
  throw new Error(
    'PAYLOAD_SECRET eksik. `landing/.env` içine PAYLOAD_SECRET ekleyin (production ortamında zorunlu).',
  );
}

if (!databaseURI) {
  throw new Error(
    'DATABASE_URI eksik. `landing/.env` içine Postgres connection string olarak DATABASE_URI ekleyin.',
  );
}

export default buildConfig({
  i18n: {
    supportedLanguages: { tr },
    fallbackLanguage: 'tr',
  },
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: ['/src/components/admin/AnalyticsDashboard', '/src/components/admin/QuickPushSender'],
    },
  },
  collections: [
    Users,
    SharedDhikrs,
    PushTokens,
    PushNotifications,
    Announcements,
    AppSettings,
    AppDevices,
    AppSessions,
    AppEvents,
  ],
  editor: lexicalEditor(),
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseURI,
      connectionTimeoutMillis: 20_000,
      keepAlive: true,
      max: 5,
      // Supabase pooler endpoint may not accept SSL from pg client in some setups.
      // For direct DB connections, keep SSL enabled but skip CA validation.
      ssl: databaseURI.includes('pooler.supabase.com') ? false : { rejectUnauthorized: false },
    },
    // Dev ortamında drizzle "pushDevSchema" interaktif prompt açabiliyor (rename/create soruları).
    // Varsayılan olarak kapalı tutuyoruz. Gerekirse tek seferlik schema oluşturmak için:
    // PAYLOAD_DB_PUSH=true PAYLOAD_FORCE_DRIZZLE_PUSH=true
    push: process.env.PAYLOAD_DB_PUSH === 'true',
  }),
});
