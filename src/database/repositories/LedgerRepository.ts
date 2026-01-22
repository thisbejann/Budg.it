import { executeSql, executeSqlInsert, executeSqlUpdate } from '../index';
import type { Ledger } from '../../types/database';
import type { LedgerFormData } from '../../types/forms';

export const LedgerRepository = {
  async getAll(): Promise<Ledger[]> {
    return executeSql<Ledger>(
      'SELECT * FROM ledgers ORDER BY is_default DESC, name ASC'
    );
  },

  async getById(id: number): Promise<Ledger | null> {
    const results = await executeSql<Ledger>(
      'SELECT * FROM ledgers WHERE id = ?',
      [id]
    );
    return results[0] || null;
  },

  async getDefault(): Promise<Ledger | null> {
    const results = await executeSql<Ledger>(
      'SELECT * FROM ledgers WHERE is_default = 1 LIMIT 1'
    );
    return results[0] || null;
  },

  async create(data: LedgerFormData): Promise<number> {
    const id = await executeSqlInsert(
      `INSERT INTO ledgers (name, description, icon, color)
       VALUES (?, ?, ?, ?)`,
      [data.name, data.description || null, data.icon, data.color]
    );
    return id;
  },

  async createDefault(name: string = 'Personal'): Promise<number> {
    const id = await executeSqlInsert(
      `INSERT INTO ledgers (name, icon, color, is_default)
       VALUES (?, 'wallet', '#6366f1', 1)`,
      [name]
    );
    return id;
  },

  async update(id: number, data: Partial<LedgerFormData>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }
    if (data.icon !== undefined) {
      fields.push('icon = ?');
      values.push(data.icon);
    }
    if (data.color !== undefined) {
      fields.push('color = ?');
      values.push(data.color);
    }

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    values.push(id);

    await executeSqlUpdate(
      `UPDATE ledgers SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  async setDefault(id: number): Promise<void> {
    // Remove default from all ledgers
    await executeSqlUpdate('UPDATE ledgers SET is_default = 0');
    // Set the new default
    await executeSqlUpdate(
      'UPDATE ledgers SET is_default = 1 WHERE id = ?',
      [id]
    );
  },

  async delete(id: number): Promise<void> {
    await executeSqlUpdate('DELETE FROM ledgers WHERE id = ?', [id]);
  },

  async hasAny(): Promise<boolean> {
    const results = await executeSql<{ count: number }>(
      'SELECT COUNT(*) as count FROM ledgers'
    );
    return results[0].count > 0;
  },
};
