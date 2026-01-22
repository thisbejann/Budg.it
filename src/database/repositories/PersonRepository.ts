import { executeSql, executeSqlInsert, executeSqlUpdate } from '../index';
import type { Person } from '../../types/database';
import type { PersonFormData } from '../../types/forms';

export const PersonRepository = {
  async getAll(): Promise<Person[]> {
    return executeSql<Person>(
      'SELECT * FROM persons ORDER BY name'
    );
  },

  async getById(id: number): Promise<Person | null> {
    const results = await executeSql<Person>(
      'SELECT * FROM persons WHERE id = ?',
      [id]
    );
    return results[0] || null;
  },

  async search(query: string): Promise<Person[]> {
    return executeSql<Person>(
      `SELECT * FROM persons
       WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?
       ORDER BY name`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
  },

  async create(data: PersonFormData): Promise<number> {
    const id = await executeSqlInsert(
      `INSERT INTO persons (name, phone, email, notes)
       VALUES (?, ?, ?, ?)`,
      [data.name, data.phone || null, data.email || null, data.notes || null]
    );
    return id;
  },

  async update(id: number, data: Partial<PersonFormData>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.phone !== undefined) {
      fields.push('phone = ?');
      values.push(data.phone);
    }
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    values.push(id);

    await executeSqlUpdate(
      `UPDATE persons SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  async delete(id: number): Promise<void> {
    await executeSqlUpdate('DELETE FROM persons WHERE id = ?', [id]);
  },

  // Get persons with their total owed/debt amounts
  async getWithBalances(): Promise<
    (Person & { total_owed: number; total_debt: number })[]
  > {
    return executeSql(
      `SELECT
        p.*,
        COALESCE(SUM(CASE WHEN a.account_type = 'owed' THEN a.current_balance ELSE 0 END), 0) as total_owed,
        COALESCE(SUM(CASE WHEN a.account_type = 'debt' THEN a.current_balance ELSE 0 END), 0) as total_debt
      FROM persons p
      LEFT JOIN accounts a ON p.id = a.person_id AND a.is_active = 1
      GROUP BY p.id
      ORDER BY p.name`
    );
  },
};
