import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

const url = 'postgresql://electric:proxy_password@127.0.0.1:65432/electric';

if (!url) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({
  connectionString: url,
});

const db = drizzle(pool, {});

const migrateMe = async () => {
  await migrate(db, {
    migrationsFolder: './db/migrations',
  });
};
migrateMe();
