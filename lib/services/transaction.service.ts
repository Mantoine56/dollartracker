import { supabase } from '../supabase';

export const transactionService = {
  async getDailyTransactions(userId: string, date: Date) {
    try {
      console.log('==================== TRANSACTION SERVICE ====================');
      console.log('1. Fetching transactions for date:', date.toISOString());
      console.log('User ID:', userId);

      // First get transactions
      const { data: transactions, error: txError } = await supabase
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
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name, icon')
        .in('id', categoryIds);

      console.log('3. Categories query result:', { categories, error: catError });

      if (catError) {
        throw new Error(`Error fetching categories: ${catError.message}`);
      }

      // Map categories to transactions
      const categoriesMap = new Map(categories?.map(cat => [cat.id, cat]) || []);
      const result = transactions.map(tx => ({
        ...tx,
        category: categoriesMap.get(tx.category_id) || null
      }));

      console.log('4. Final result with categories:', result);
      console.log('==================== END TRANSACTION SERVICE ====================');

      return result;
    } catch (error) {
      console.error('Error in getDailyTransactions:', error);
      return [];
    }
  },
};
