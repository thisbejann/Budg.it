import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

let database: SQLite.SQLiteDatabase | null = null;

const DATABASE_NAME = 'budget_tracker.db';

export type { SQLiteDatabase } from 'expo-sqlite';

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) {
    return database;
  }

  try {
    database = await SQLite.openDatabaseAsync(DATABASE_NAME);

    // Enable foreign keys
    await database.execAsync('PRAGMA foreign_keys = ON;');

    // Run migrations
    await runMigrations(database);

    console.log('Database opened successfully');
    return database;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  if (database) {
    await database.closeAsync();
    database = null;
    console.log('Database closed');
  }
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!database) {
    return openDatabase();
  }
  return database;
}

// Helper function to execute SQL and return results
export async function executeSql<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<T>(sql, params);
  return results;
}

// Helper function to execute SQL and return insert id
export async function executeSqlInsert(
  sql: string,
  params: any[] = []
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(sql, params);
  return result.lastInsertRowId;
}

// Helper function to execute SQL for updates/deletes
export async function executeSqlUpdate(
  sql: string,
  params: any[] = []
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(sql, params);
  return result.changes;
}

// Transaction helper
export async function executeTransaction<T>(
  callback: (db: SQLite.SQLiteDatabase) => Promise<T>
): Promise<T> {
  const db = await getDatabase();
  let result: T;
  await db.withTransactionAsync(async () => {
    result = await callback(db);
  });
  return result!;
}
