import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/postgres';

// Singleton pattern to prevent multiple connections
let client: postgres.Sql<{}> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function getDbConnection() {
  if (!client || !db) {
    client = postgres(connectionString, {
      max: 10, // Maximum number of connections
      idle_timeout: 20, // Close idle connections after 20 seconds
      connect_timeout: 10, // Connection timeout in seconds
    });
    db = drizzle(client, { schema });
  }
  return db;
}

export { getDbConnection as db };
export * from './schema';