import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/postgres';

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

async function main() {
  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations completed!');
  await client.end();
}

main().catch((err) => {
  console.error('Migration failed!', err);
  process.exit(1);
});