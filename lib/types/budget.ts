import { Database } from './supabase';

export type Budget = Database['public']['Tables']['budgets']['Row'];
export type InsertBudget = Database['public']['Tables']['budgets']['Insert'];
export type UpdateBudget = Database['public']['Tables']['budgets']['Update'];

export type PaymentFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface BudgetSummary {
  monthlyIncome: number;
  fixedExpenses: number;
  savingsTarget: number;
  spendingBudget: number;
  dailyAllowance: number;
  paymentFrequency: PaymentFrequency;
}
