import { Database } from './database';

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  is_system: boolean;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category_id: string | null;
  notes: string | null;
  transaction_time: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionFormData {
  amount: string;
  category_id: string | null;
  notes?: string;
  transaction_time?: Date;
}

export interface TransactionWithCategory extends Transaction {
  category?: Category;
}
