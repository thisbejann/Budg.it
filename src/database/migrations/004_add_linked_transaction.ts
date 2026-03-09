import type { SQLiteDatabase } from 'expo-sqlite';
import type { Migration } from './types';

export const migration004: Migration = {
  version: 4,
  name: '004_add_linked_transaction',
  up: async (db: SQLiteDatabase) => {
    await db.execAsync(`
      ALTER TABLE transactions ADD COLUMN linked_transaction_id INTEGER
        REFERENCES transactions(id) ON DELETE SET NULL;
    `);

    console.log('Migration 004: Added linked_transaction_id to transactions');
  },
};
