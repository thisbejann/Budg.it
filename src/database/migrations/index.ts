import type { SQLiteDatabase } from 'expo-sqlite';
import type { Migration } from './types';
import { migration001 } from './001_initial_schema';
import { migration002 } from './002_seed_categories';
import { migration003 } from './003_add_credit_card_dates';

// Register all migrations in order
const migrations: Migration[] = [
  migration001,
  migration002,
  migration003,
];

// Create migrations tracking table
async function createMigrationsTable(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

// Get current migration version
async function getCurrentVersion(db: SQLiteDatabase): Promise<number> {
  const results = await db.getAllAsync<{ version: number | null }>(
    'SELECT MAX(version) as version FROM schema_migrations'
  );
  return results[0]?.version || 0;
}

// Record that a migration was applied
async function recordMigration(
  db: SQLiteDatabase,
  migration: Migration
): Promise<void> {
  await db.runAsync(
    'INSERT INTO schema_migrations (version, name) VALUES (?, ?)',
    [migration.version, migration.name]
  );
}

// Run all pending migrations
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await createMigrationsTable(db);

  const currentVersion = await getCurrentVersion(db);
  console.log(`Current database version: ${currentVersion}`);

  const pendingMigrations = migrations.filter(
    (m) => m.version > currentVersion
  );

  if (pendingMigrations.length === 0) {
    console.log('No pending migrations');
    return;
  }

  console.log(`Running ${pendingMigrations.length} migration(s)...`);

  for (const migration of pendingMigrations) {
    console.log(`Running migration: ${migration.name}`);
    try {
      await migration.up(db);
      await recordMigration(db, migration);
      console.log(`Migration ${migration.name} completed`);
    } catch (error) {
      console.error(`Migration ${migration.name} failed:`, error);
      throw error;
    }
  }

  console.log('All migrations completed');
}

export * from './types';
