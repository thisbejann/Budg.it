import type { Migration } from './types';

export const migration003: Migration = {
  version: 3,
  name: '003_add_credit_card_dates',
  up: async (db) => {
    await db.execAsync(`ALTER TABLE accounts ADD COLUMN statement_date INTEGER`);
    await db.execAsync(`ALTER TABLE accounts ADD COLUMN due_date INTEGER`);
    await db.execAsync(`ALTER TABLE accounts ADD COLUMN payment_due_days INTEGER`);
  },
};
