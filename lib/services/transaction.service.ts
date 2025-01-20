import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

export class TransactionService {
  constructor(private supabase: SupabaseClient<Database>) {}

  private calculateDailyAllowance(monthlyBudget: number): number {
    // Average days in a month (365.25/12)
    const averageDaysInMonth = 30.4375;
    return monthlyBudget / averageDaysInMonth;
  }

  async getCurrentBudget(userId: string) {
    try {
      console.log('==================== BUDGET SERVICE ====================');
      console.log('Getting current budget for user:', userId);

      const today = new Date().toISOString().split('T')[0];

      const { data: budget, error } = await this.supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .lte('start_date', today)
        .gte('end_date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching budget:', error);
        return null;
      }

      if (budget) {
        // Calculate daily allowance from monthly spending budget
        const dailyAllowance = this.calculateDailyAllowance(budget.spending_budget);
        console.log('Budget details:', {
          ...budget,
          daily_allowance: dailyAllowance,
        });
        
        return {
          ...budget,
          daily_allowance: dailyAllowance,
        };
      }

      return null;
    } catch (error) {
      console.error('Error in getCurrentBudget:', error);
      return null;
    }
  }

  async getDailyTransactions(userId: string, date: Date) {
    try {
      console.log('==================== TRANSACTION SERVICE ====================');
      console.log('1. Fetching transactions for date:', date.toISOString());
      console.log('User ID:', userId);

      // First get transactions
      const { data: transactions, error: txError } = await this.supabase
        .from('daily_transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('transaction_time', date.toISOString().split('T')[0])
        .lte('transaction_time', new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('transaction_time', { ascending: false });

      if (txError) {
        throw new Error(`Error fetching transactions: ${txError.message}`);
      }

      if (!transactions?.length) {
        console.log('No transactions found');
        return [];
      }

      // Get unique category IDs
      const categoryIds = [...new Set(transactions.map(tx => tx.category_id))];
      console.log('2. Category IDs found:', categoryIds);

      // Fetch categories
      const { data: categories, error: catError } = await this.supabase
        .from('categories')
        .select('id, name, icon')
        .in('id', categoryIds);

      console.log('3. Categories query result:', { categories, error: catError });

      if (catError) {
        throw new Error(`Error fetching categories: ${catError.message}`);
      }

      if (!categories) {
        throw new Error('No categories data returned');
      }

      // Map categories to transactions
      const categoriesMap = new Map(categories.map(cat => [cat.id, cat]));
      const result = transactions.map(tx => ({
        ...tx,
        category: categoriesMap.get(tx.category_id) || null
      }));

      console.log('4. Final result with categories:', result);
      return result;
    } catch (error) {
      console.error('Error in getDailyTransactions:', error);
      throw error;
    }
  }
}

// Factory function to create the service
export const createTransactionService = (supabase: SupabaseClient<Database>) => {
  return new TransactionService(supabase);
};
