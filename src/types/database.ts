// Database entity types for Budget Tracker

export type AccountType = 'debit' | 'credit' | 'owed' | 'debt';
export type TransactionType = 'expense' | 'income';
export type CategoryType = 'expense' | 'income';

export interface Ledger {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: number;
  ledger_id: number;
  name: string;
  account_type: AccountType;
  initial_balance: number;
  current_balance: number;
  credit_limit: number | null;
  person_id: number | null;
  icon: string;
  color: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccountWithPerson extends Account {
  person_name: string | null;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  is_system: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

export interface Transaction {
  id: number;
  ledger_id: number;
  account_id: number;
  category_id: number | null;
  subcategory_id: number | null;
  amount: number;
  type: TransactionType;
  date: string;
  time: string | null;
  notes: string | null;
  receipt_image_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithDetails extends Transaction {
  account_name: string;
  account_icon: string;
  account_color: string;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
  subcategory_name: string | null;
}

export interface Transfer {
  id: number;
  ledger_id: number;
  from_account_id: number;
  to_account_id: number;
  amount: number;
  fee: number;
  date: string;
  time: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransferWithDetails extends Transfer {
  from_account_name: string;
  from_account_icon: string;
  to_account_name: string;
  to_account_icon: string;
}

export interface TransactionTemplate {
  id: number;
  ledger_id: number;
  name: string;
  account_id: number | null;
  category_id: number | null;
  subcategory_id: number | null;
  amount: number | null;
  type: TransactionType;
  notes: string | null;
  icon: string;
  color: string;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionTemplateWithDetails extends TransactionTemplate {
  account_name: string | null;
  category_name: string | null;
  subcategory_name: string | null;
}

// View types
export interface AccountBalance {
  id: number;
  name: string;
  account_type: AccountType;
  initial_balance: number;
  current_balance: number;
  credit_limit: number | null;
  available_balance: number;
  ledger_name: string;
  person_name: string | null;
}

export interface MonthlySummary {
  ledger_id: number;
  month: string;
  type: TransactionType;
  total_amount: number;
  transaction_count: number;
}

// Aggregation types for charts
export interface CategorySpending {
  category_id: number;
  category_name: string;
  category_icon: string;
  category_color: string;
  total_amount: number;
  percentage: number;
  transaction_count: number;
}

export interface DailyTotal {
  date: string;
  income: number;
  expense: number;
  net: number;
}

export interface MonthlyComparison {
  month: string;
  income: number;
  expense: number;
}
