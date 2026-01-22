import { executeSql, executeSqlInsert, executeSqlUpdate } from '../index';
import type { TransactionTemplate, TransactionTemplateWithDetails } from '../../types/database';
import type { TransactionTemplateFormData } from '../../types/forms';

export const TemplateRepository = {
  async getByLedger(ledgerId: number): Promise<TransactionTemplateWithDetails[]> {
    return executeSql<TransactionTemplateWithDetails>(
      `SELECT
        t.*,
        a.name as account_name,
        c.name as category_name,
        s.name as subcategory_name
      FROM transaction_templates t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN subcategories s ON t.subcategory_id = s.id
      WHERE t.ledger_id = ?
      ORDER BY t.usage_count DESC, t.name`,
      [ledgerId]
    );
  },

  async getPopular(ledgerId: number, limit: number = 5): Promise<TransactionTemplateWithDetails[]> {
    return executeSql<TransactionTemplateWithDetails>(
      `SELECT
        t.*,
        a.name as account_name,
        c.name as category_name,
        s.name as subcategory_name
      FROM transaction_templates t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN subcategories s ON t.subcategory_id = s.id
      WHERE t.ledger_id = ?
      ORDER BY t.usage_count DESC, t.last_used_at DESC
      LIMIT ?`,
      [ledgerId, limit]
    );
  },

  async getById(id: number): Promise<TransactionTemplateWithDetails | null> {
    const results = await executeSql<TransactionTemplateWithDetails>(
      `SELECT
        t.*,
        a.name as account_name,
        c.name as category_name,
        s.name as subcategory_name
      FROM transaction_templates t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN subcategories s ON t.subcategory_id = s.id
      WHERE t.id = ?`,
      [id]
    );
    return results[0] || null;
  },

  async create(ledgerId: number, data: TransactionTemplateFormData): Promise<number> {
    const id = await executeSqlInsert(
      `INSERT INTO transaction_templates
       (ledger_id, name, account_id, category_id, subcategory_id, amount, type, notes, icon, color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ledgerId,
        data.name,
        data.account_id || null,
        data.category_id || null,
        data.subcategory_id || null,
        data.amount || null,
        data.type,
        data.notes || null,
        data.icon,
        data.color,
      ]
    );
    return id;
  },

  async update(id: number, data: Partial<TransactionTemplateFormData>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.account_id !== undefined) {
      fields.push('account_id = ?');
      values.push(data.account_id);
    }
    if (data.category_id !== undefined) {
      fields.push('category_id = ?');
      values.push(data.category_id);
    }
    if (data.subcategory_id !== undefined) {
      fields.push('subcategory_id = ?');
      values.push(data.subcategory_id);
    }
    if (data.amount !== undefined) {
      fields.push('amount = ?');
      values.push(data.amount);
    }
    if (data.type !== undefined) {
      fields.push('type = ?');
      values.push(data.type);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
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
      `UPDATE transaction_templates SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  async incrementUsage(id: number): Promise<void> {
    await executeSqlUpdate(
      `UPDATE transaction_templates
       SET usage_count = usage_count + 1, last_used_at = datetime('now'), updated_at = datetime('now')
       WHERE id = ?`,
      [id]
    );
  },

  async delete(id: number): Promise<void> {
    await executeSqlUpdate('DELETE FROM transaction_templates WHERE id = ?', [id]);
  },
};
