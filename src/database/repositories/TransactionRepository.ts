import { executeSql, executeSqlInsert, executeSqlUpdate } from '../index';
import { AccountRepository } from './AccountRepository';
import type { Transaction, TransactionWithDetails, TransactionType, DailyTotal, CategorySpending } from '../../types/database';
import type { TransactionFormData, TransactionFilters } from '../../types/forms';

export const TransactionRepository = {
  async getByLedger(
    ledgerId: number,
    filters?: TransactionFilters
  ): Promise<TransactionWithDetails[]> {
    let sql = `
      SELECT
        t.*,
        a.name as account_name,
        a.icon as account_icon,
        a.color as account_color,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        s.name as subcategory_name
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN subcategories s ON t.subcategory_id = s.id
      WHERE t.ledger_id = ?
    `;
    const params: any[] = [ledgerId];

    if (filters?.startDate) {
      sql += ' AND t.date >= ?';
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      sql += ' AND t.date <= ?';
      params.push(filters.endDate);
    }
    if (filters?.categoryId) {
      sql += ' AND t.category_id = ?';
      params.push(filters.categoryId);
    }
    if (filters?.accountId) {
      sql += ' AND t.account_id = ?';
      params.push(filters.accountId);
    }
    if (filters?.type) {
      sql += ' AND t.type = ?';
      params.push(filters.type);
    }

    sql += ' ORDER BY t.date DESC, t.time DESC, t.id DESC';

    return executeSql<TransactionWithDetails>(sql, params);
  },

  async getById(id: number): Promise<TransactionWithDetails | null> {
    const results = await executeSql<TransactionWithDetails>(
      `SELECT
        t.*,
        a.name as account_name,
        a.icon as account_icon,
        a.color as account_color,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        s.name as subcategory_name
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN subcategories s ON t.subcategory_id = s.id
      WHERE t.id = ?`,
      [id]
    );
    return results[0] || null;
  },

  async getByDate(ledgerId: number, date: string): Promise<TransactionWithDetails[]> {
    return this.getByLedger(ledgerId, { startDate: date, endDate: date });
  },

  async getRecent(ledgerId: number, limit: number = 10): Promise<TransactionWithDetails[]> {
    return executeSql<TransactionWithDetails>(
      `SELECT
        t.*,
        a.name as account_name,
        a.icon as account_icon,
        a.color as account_color,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        s.name as subcategory_name
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN subcategories s ON t.subcategory_id = s.id
      WHERE t.ledger_id = ?
      ORDER BY t.date DESC, t.time DESC, t.id DESC
      LIMIT ?`,
      [ledgerId, limit]
    );
  },

  async create(ledgerId: number, data: TransactionFormData): Promise<number> {
    // Insert transaction
    const transactionId = await executeSqlInsert(
      `INSERT INTO transactions
       (ledger_id, account_id, category_id, subcategory_id, amount, type, date, time, notes, receipt_image_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ledgerId,
        data.account_id,
        data.category_id || null,
        data.subcategory_id || null,
        data.amount,
        data.type,
        data.date,
        data.time || null,
        data.notes || null,
        data.receipt_image_path || null,
      ]
    );

    // Update account balance
    // For expenses: decrease balance; for income: increase balance
    const balanceChange = data.type === 'expense' ? -data.amount : data.amount;
    await AccountRepository.updateBalance(data.account_id, balanceChange);

    return transactionId;
  },

  async update(id: number, data: Partial<TransactionFormData>): Promise<void> {
    // Get original transaction for balance adjustment
    const original = await this.getById(id);
    if (!original) throw new Error('Transaction not found');

    const fields: string[] = [];
    const values: any[] = [];

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
    if (data.date !== undefined) {
      fields.push('date = ?');
      values.push(data.date);
    }
    if (data.time !== undefined) {
      fields.push('time = ?');
      values.push(data.time);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }
    if (data.receipt_image_path !== undefined) {
      fields.push('receipt_image_path = ?');
      values.push(data.receipt_image_path);
    }

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    values.push(id);

    await executeSqlUpdate(
      `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    // Adjust account balances if amount, type, or account changed
    const newAmount = data.amount ?? original.amount;
    const newType = data.type ?? original.type;
    const newAccountId = data.account_id ?? original.account_id;

    // Reverse original transaction effect on original account
    const originalBalanceChange = original.type === 'expense' ? original.amount : -original.amount;
    await AccountRepository.updateBalance(original.account_id, originalBalanceChange);

    // Apply new transaction effect on new account
    const newBalanceChange = newType === 'expense' ? -newAmount : newAmount;
    await AccountRepository.updateBalance(newAccountId, newBalanceChange);
  },

  async delete(id: number): Promise<void> {
    // Get transaction for balance adjustment
    const transaction = await this.getById(id);
    if (!transaction) throw new Error('Transaction not found');

    // Reverse the balance effect
    const balanceChange = transaction.type === 'expense' ? transaction.amount : -transaction.amount;
    await AccountRepository.updateBalance(transaction.account_id, balanceChange);

    await executeSqlUpdate('DELETE FROM transactions WHERE id = ?', [id]);
  },

  // Aggregation queries for dashboard and charts
  async getDailyTotals(
    ledgerId: number,
    startDate: string,
    endDate: string
  ): Promise<DailyTotal[]> {
    const results = await executeSql<{ date: string; type: TransactionType; total: number }>(
      `SELECT date, type, SUM(amount) as total
       FROM transactions
       WHERE ledger_id = ? AND date >= ? AND date <= ?
       GROUP BY date, type
       ORDER BY date`,
      [ledgerId, startDate, endDate]
    );

    // Group by date
    const dailyMap = new Map<string, DailyTotal>();

    for (const row of results) {
      if (!dailyMap.has(row.date)) {
        dailyMap.set(row.date, {
          date: row.date,
          income: 0,
          expense: 0,
          net: 0,
        });
      }
      const daily = dailyMap.get(row.date)!;
      if (row.type === 'income') {
        daily.income = row.total;
      } else {
        daily.expense = row.total;
      }
      daily.net = daily.income - daily.expense;
    }

    return Array.from(dailyMap.values());
  },

  async getCategorySpending(
    ledgerId: number,
    startDate: string,
    endDate: string,
    type: TransactionType = 'expense'
  ): Promise<CategorySpending[]> {
    const results = await executeSql<{
      category_id: number;
      category_name: string;
      category_icon: string;
      category_color: string;
      total_amount: number;
      transaction_count: number;
    }>(
      `SELECT
        c.id as category_id,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        SUM(t.amount) as total_amount,
        COUNT(t.id) as transaction_count
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.ledger_id = ? AND t.date >= ? AND t.date <= ? AND t.type = ?
      GROUP BY c.id
      ORDER BY total_amount DESC`,
      [ledgerId, startDate, endDate, type]
    );

    // Calculate total for percentages
    const grandTotal = results.reduce((sum, r) => sum + r.total_amount, 0);

    return results.map((r) => ({
      ...r,
      percentage: grandTotal > 0 ? (r.total_amount / grandTotal) * 100 : 0,
    }));
  },

  async getMonthlyTotals(
    ledgerId: number,
    months: number = 6
  ): Promise<{ month: string; income: number; expense: number }[]> {
    return executeSql(
      `SELECT
        strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE ledger_id = ? AND date >= date('now', '-' || ? || ' months')
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month`,
      [ledgerId, months]
    );
  },

  async getTotalForPeriod(
    ledgerId: number,
    startDate: string,
    endDate: string,
    type?: TransactionType
  ): Promise<number> {
    let sql = `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE ledger_id = ? AND date >= ? AND date <= ?`;
    const params: any[] = [ledgerId, startDate, endDate];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    const results = await executeSql<{ total: number }>(sql, params);
    return results[0].total;
  },
};
