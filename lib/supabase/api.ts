import { supabase } from './client';
import { Database } from '../types/database';

type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];
type Category = Tables['categories']['Row'];
type Transaction = Tables['transactions']['Row'];
type RecurringTransaction = Tables['recurring_transactions']['Row'];
type Budget = Tables['budgets']['Row'];

// Profile operations
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Category operations
export async function getCategories(userId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('profile_id', userId)
    .order('name');

  if (error) throw error;
  return data;
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(categoryId: string, updates: Partial<Category>) {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(categoryId: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (error) throw error;
}

// Transaction operations
export async function getTransactions(userId: string, options?: {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: 'expense' | 'income';
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('transactions')
    .select('*, categories(name, color, icon)')
    .eq('profile_id', userId)
    .order('date', { ascending: false });

  if (options?.startDate) {
    query = query.gte('date', options.startDate);
  }
  if (options?.endDate) {
    query = query.lte('date', options.endDate);
  }
  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }
  if (options?.type) {
    query = query.eq('type', options.type);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select('*, categories(name, color, icon)')
    .single();

  if (error) throw error;
  return data;
}

export async function updateTransaction(transactionId: string, updates: Partial<Transaction>) {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', transactionId)
    .select('*, categories(name, color, icon)')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTransaction(transactionId: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId);

  if (error) throw error;
}

// Recurring transaction operations
export async function getRecurringTransactions(userId: string) {
  const { data, error } = await supabase
    .from('recurring_transactions')
    .select('*, categories(name, color, icon)')
    .eq('profile_id', userId)
    .order('start_date');

  if (error) throw error;
  return data;
}

export async function createRecurringTransaction(transaction: Omit<RecurringTransaction, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('recurring_transactions')
    .insert(transaction)
    .select('*, categories(name, color, icon)')
    .single();

  if (error) throw error;
  return data;
}

export async function updateRecurringTransaction(transactionId: string, updates: Partial<RecurringTransaction>) {
  const { data, error } = await supabase
    .from('recurring_transactions')
    .update(updates)
    .eq('id', transactionId)
    .select('*, categories(name, color, icon)')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRecurringTransaction(transactionId: string) {
  const { error } = await supabase
    .from('recurring_transactions')
    .delete()
    .eq('id', transactionId);

  if (error) throw error;
}

// Budget operations
export async function getBudget(userId: string, month: string) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('profile_id', userId)
    .eq('month', month)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
  return data;
}

export async function createOrUpdateBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('budgets')
    .upsert(budget, {
      onConflict: 'profile_id,month',
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Realtime subscriptions
export function subscribeToTransactions(userId: string, callback: (payload: any) => void) {
  return supabase
    .channel('transactions')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `profile_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
}

export function subscribeToBudget(userId: string, month: string, callback: (payload: any) => void) {
  return supabase
    .channel('budgets')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'budgets',
        filter: `profile_id=eq.${userId} AND month=eq.${month}`,
      },
      callback
    )
    .subscribe();
}
