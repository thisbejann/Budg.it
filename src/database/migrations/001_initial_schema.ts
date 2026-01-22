import type { SQLiteDatabase } from 'expo-sqlite';
import type { Migration } from './types';

export const migration001: Migration = {
  version: 1,
  name: '001_initial_schema',
  up: async (db: SQLiteDatabase) => {
    // Ledgers table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ledgers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT DEFAULT 'wallet',
        color TEXT DEFAULT '#6366f1',
        is_default INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // Persons table (for owed/debt tracking)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS persons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // Accounts table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ledger_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        account_type TEXT NOT NULL CHECK(account_type IN ('debit', 'credit', 'owed', 'debt')),
        initial_balance REAL DEFAULT 0,
        current_balance REAL DEFAULT 0,
        credit_limit REAL,
        person_id INTEGER,
        icon TEXT DEFAULT 'banknote',
        color TEXT DEFAULT '#22c55e',
        is_active INTEGER DEFAULT 1,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE CASCADE,
        FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE SET NULL
      );
    `);

    // Categories table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
        is_system INTEGER DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // Subcategories table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS subcategories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        icon TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      );
    `);

    // Transactions table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ledger_id INTEGER NOT NULL,
        account_id INTEGER NOT NULL,
        category_id INTEGER,
        subcategory_id INTEGER,
        amount REAL NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
        date TEXT NOT NULL,
        time TEXT,
        notes TEXT,
        receipt_image_path TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL
      );
    `);

    // Transfers table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transfers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ledger_id INTEGER NOT NULL,
        from_account_id INTEGER NOT NULL,
        to_account_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        fee REAL DEFAULT 0,
        date TEXT NOT NULL,
        time TEXT,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE CASCADE,
        FOREIGN KEY (from_account_id) REFERENCES accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE CASCADE
      );
    `);

    // Transaction templates table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transaction_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ledger_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        account_id INTEGER,
        category_id INTEGER,
        subcategory_id INTEGER,
        amount REAL,
        type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
        notes TEXT,
        icon TEXT DEFAULT 'bookmark',
        color TEXT DEFAULT '#8b5cf6',
        usage_count INTEGER DEFAULT 0,
        last_used_at TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL
      );
    `);

    // Create indexes for better query performance
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_transactions_ledger_date
      ON transactions(ledger_id, date);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_transactions_account
      ON transactions(account_id);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_transactions_category
      ON transactions(category_id);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_accounts_ledger
      ON accounts(ledger_id);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_transfers_ledger_date
      ON transfers(ledger_id, date);
    `);

    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_subcategories_category
      ON subcategories(category_id);
    `);

    console.log('Migration 001: Initial schema created');
  },
};
