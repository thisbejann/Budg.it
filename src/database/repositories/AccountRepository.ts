import { executeSql, executeSqlInsert, executeSqlUpdate } from '../index';
import type { Account, AccountWithPerson, AccountType, AccountBalance } from '../../types/database';
import type { AccountFormData } from '../../types/forms';

export const AccountRepository = {
  async getAllByLedger(ledgerId: number): Promise<AccountWithPerson[]> {
    return executeSql<AccountWithPerson>(
      `SELECT a.*, p.name as person_name
       FROM accounts a
       LEFT JOIN persons p ON a.person_id = p.id
       WHERE a.ledger_id = ? AND a.is_active = 1
       ORDER BY a.account_type, a.name`,
      [ledgerId]
    );
  },

  async getByType(ledgerId: number, accountType: AccountType): Promise<AccountWithPerson[]> {
    return executeSql<AccountWithPerson>(
      `SELECT a.*, p.name as person_name
       FROM accounts a
       LEFT JOIN persons p ON a.person_id = p.id
       WHERE a.ledger_id = ? AND a.account_type = ? AND a.is_active = 1
       ORDER BY a.name`,
      [ledgerId, accountType]
    );
  },

  async getById(id: number): Promise<AccountWithPerson | null> {
    const results = await executeSql<AccountWithPerson>(
      `SELECT a.*, p.name as person_name
       FROM accounts a
       LEFT JOIN persons p ON a.person_id = p.id
       WHERE a.id = ?`,
      [id]
    );
    return results[0] || null;
  },

  async create(ledgerId: number, data: AccountFormData): Promise<number> {
    const id = await executeSqlInsert(
      `INSERT INTO accounts
       (ledger_id, name, account_type, initial_balance, current_balance, credit_limit, person_id, icon, color, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ledgerId,
        data.name,
        data.account_type,
        data.initial_balance,
        data.initial_balance, // current_balance starts as initial_balance
        data.credit_limit || null,
        data.person_id || null,
        data.icon,
        data.color,
        data.notes || null,
      ]
    );
    return id;
  },

  async update(id: number, data: Partial<AccountFormData>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.account_type !== undefined) {
      fields.push('account_type = ?');
      values.push(data.account_type);
    }
    if (data.initial_balance !== undefined) {
      fields.push('initial_balance = ?');
      values.push(data.initial_balance);
    }
    if (data.credit_limit !== undefined) {
      fields.push('credit_limit = ?');
      values.push(data.credit_limit);
    }
    if (data.person_id !== undefined) {
      fields.push('person_id = ?');
      values.push(data.person_id);
    }
    if (data.icon !== undefined) {
      fields.push('icon = ?');
      values.push(data.icon);
    }
    if (data.color !== undefined) {
      fields.push('color = ?');
      values.push(data.color);
    }
    if (data.notes !== undefined) {
      fields.push('notes = ?');
      values.push(data.notes);
    }

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    values.push(id);

    await executeSqlUpdate(
      `UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  async updateBalance(id: number, amount: number): Promise<void> {
    await executeSqlUpdate(
      `UPDATE accounts SET current_balance = current_balance + ?, updated_at = datetime('now') WHERE id = ?`,
      [amount, id]
    );
  },

  async setBalance(id: number, balance: number): Promise<void> {
    await executeSqlUpdate(
      `UPDATE accounts SET current_balance = ?, updated_at = datetime('now') WHERE id = ?`,
      [balance, id]
    );
  },

  async deactivate(id: number): Promise<void> {
    await executeSqlUpdate(
      `UPDATE accounts SET is_active = 0, updated_at = datetime('now') WHERE id = ?`,
      [id]
    );
  },

  async delete(id: number): Promise<void> {
    await executeSqlUpdate('DELETE FROM accounts WHERE id = ?', [id]);
  },

  async getTotalByType(ledgerId: number, accountType: AccountType): Promise<number> {
    const results = await executeSql<{ total: number }>(
      `SELECT COALESCE(SUM(current_balance), 0) as total
       FROM accounts
       WHERE ledger_id = ? AND account_type = ? AND is_active = 1`,
      [ledgerId, accountType]
    );
    return results[0].total;
  },

  async getBalanceSummary(ledgerId: number): Promise<{
    debit: number;
    credit: number;
    owed: number;
    debt: number;
    netWorth: number;
  }> {
    const results = await executeSql<{ account_type: AccountType; total: number }>(
      `SELECT account_type, COALESCE(SUM(current_balance), 0) as total
       FROM accounts
       WHERE ledger_id = ? AND is_active = 1
       GROUP BY account_type`,
      [ledgerId]
    );

    const summary = {
      debit: 0,
      credit: 0,
      owed: 0,
      debt: 0,
      netWorth: 0,
    };

    for (const row of results) {
      summary[row.account_type] = row.total;
    }

    // Net worth = assets (debit + owed) - liabilities (credit balance used + debt)
    summary.netWorth = summary.debit + summary.owed - summary.credit - summary.debt;

    return summary;
  },
};
