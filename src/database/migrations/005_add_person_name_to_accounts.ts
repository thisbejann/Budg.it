import type { Migration } from './types';

export const migration005: Migration = {
  version: 5,
  name: '005_add_person_name_to_accounts',
  up: async (db) => {
    await db.execAsync(`ALTER TABLE accounts ADD COLUMN person_name TEXT`);

    // Backfill existing accounts from persons table
    await db.execAsync(`
      UPDATE accounts SET person_name = (
        SELECT p.name FROM persons p WHERE p.id = accounts.person_id
      ) WHERE person_id IS NOT NULL
    `);
  },
};
