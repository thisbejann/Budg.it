import type { TransactionType, AccountType, CategoryType } from './database';

// Form data types for creating/updating entities

export interface LedgerFormData {
  name: string;
  description?: string;
  icon: string;
  color: string;
}

export interface PersonFormData {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface AccountFormData {
  name: string;
  account_type: AccountType;
  initial_balance: number;
  credit_limit?: number;
  statement_date?: number;
  due_date?: number;
  payment_due_days?: number;
  person_id?: number;
  icon: string;
  color: string;
  notes?: string;
}

export interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
}

export interface SubcategoryFormData {
  category_id: number;
  name: string;
  icon?: string;
}

export interface TransactionFormData {
  account_id: number;
  category_id?: number;
  subcategory_id?: number;
  amount: number;
  type: TransactionType;
  date: string;
  time?: string;
  notes?: string;
  receipt_image_path?: string;
}

export interface TransferFormData {
  from_account_id: number;
  to_account_id: number;
  amount: number;
  fee?: number;
  date: string;
  time?: string;
  notes?: string;
}

export interface TransactionTemplateFormData {
  name: string;
  account_id?: number;
  category_id?: number;
  subcategory_id?: number;
  amount?: number;
  type: TransactionType;
  notes?: string;
  icon: string;
  color: string;
}

// Filter types
export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  accountId?: number;
  type?: TransactionType;
}

export interface ChartFilters {
  startDate: string;
  endDate: string;
  categoryIds?: number[];
  accountIds?: number[];
}
