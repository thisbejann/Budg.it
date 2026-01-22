import { executeSql, executeSqlInsert, executeSqlUpdate } from '../index';
import { AccountRepository } from './AccountRepository';
import type { Transfer, TransferWithDetails } from '../../types/database';
import type { TransferFormData } from '../../types/forms';

export const TransferRepository = {
  async getByLedger(ledgerId: number): Promise<TransferWithDetails[]> {
    return executeSql<TransferWithDetails>(
      `SELECT
        t.*,
        fa.name as from_account_name,
        fa.icon as from_account_icon,
        ta.name as to_account_name,
        ta.icon as to_account_icon
      FROM transfers t
      LEFT JOIN accounts fa ON t.from_account_id = fa.id
      LEFT JOIN accounts ta ON t.to_account_id = ta.id
      WHERE t.ledger_id = ?
      ORDER BY t.date DESC, t.time DESC, t.id DESC`,
      [ledgerId]
    );
  },

  async getById(id: number): Promise<TransferWithDetails | null> {
    const results = await executeSql<TransferWithDetails>(
      `SELECT
        t.*,
        fa.name as from_account_name,
        fa.icon as from_account_icon,
        ta.name as to_account_name,
        ta.icon as to_account_icon
      FROM transfers t
      LEFT JOIN accounts fa ON t.from_account_id = fa.id
      LEFT JOIN accounts ta ON t.to_account_id = ta.id
      WHERE t.id = ?`,
      [id]
    );
    return results[0] || null;
  },

  async create(ledgerId: number, data: TransferFormData): Promise<number> {
    // Insert transfer
    const transferId = await executeSqlInsert(
      `INSERT INTO transfers
       (ledger_id, from_account_id, to_account_id, amount, fee, date, time, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ledgerId,
        data.from_account_id,
        data.to_account_id,
        data.amount,
        data.fee || 0,
        data.date,
        data.time || null,
        data.notes || null,
      ]
    );

    // Update account balances
    // From account: subtract amount + fee
    const totalDeduction = data.amount + (data.fee || 0);
    await AccountRepository.updateBalance(data.from_account_id, -totalDeduction);

    // To account: add amount (fee is not transferred)
    await AccountRepository.updateBalance(data.to_account_id, data.amount);

    return transferId;
  },

  async update(id: number, data: Partial<TransferFormData>): Promise<void> {
    // Get original transfer for balance adjustment
    const original = await this.getById(id);
    if (!original) throw new Error('Transfer not found');

    const fields: string[] = [];
    const values: any[] = [];

    if (data.from_account_id !== undefined) {
      fields.push('from_account_id = ?');
      values.push(data.from_account_id);
    }
    if (data.to_account_id !== undefined) {
      fields.push('to_account_id = ?');
      values.push(data.to_account_id);
    }
    if (data.amount !== undefined) {
      fields.push('amount = ?');
      values.push(data.amount);
    }
    if (data.fee !== undefined) {
      fields.push('fee = ?');
      values.push(data.fee);
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

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    values.push(id);

    await executeSqlUpdate(
      `UPDATE transfers SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    // Reverse original transfer effects
    const originalTotalDeduction = original.amount + original.fee;
    await AccountRepository.updateBalance(original.from_account_id, originalTotalDeduction);
    await AccountRepository.updateBalance(original.to_account_id, -original.amount);

    // Apply new transfer effects
    const newFromAccount = data.from_account_id ?? original.from_account_id;
    const newToAccount = data.to_account_id ?? original.to_account_id;
    const newAmount = data.amount ?? original.amount;
    const newFee = data.fee ?? original.fee;
    const newTotalDeduction = newAmount + newFee;

    await AccountRepository.updateBalance(newFromAccount, -newTotalDeduction);
    await AccountRepository.updateBalance(newToAccount, newAmount);
  },

  async delete(id: number): Promise<void> {
    // Get transfer for balance adjustment
    const transfer = await this.getById(id);
    if (!transfer) throw new Error('Transfer not found');

    // Reverse the balance effects
    const totalDeduction = transfer.amount + transfer.fee;
    await AccountRepository.updateBalance(transfer.from_account_id, totalDeduction);
    await AccountRepository.updateBalance(transfer.to_account_id, -transfer.amount);

    await executeSqlUpdate('DELETE FROM transfers WHERE id = ?', [id]);
  },
};
