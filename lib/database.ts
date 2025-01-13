import { supabase } from './supabase';
import type {
  Budget,
  DailyTransaction,
  Badge,
  Milestone,
  Settings,
  Stats,
  Reward,
  BudgetPeriod,
} from '../types/database';

/**
 * Budget Management
 */
export const budgetService = {
  async getCurrentBudget(userId: string): Promise<Budget | null> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .single();

    if (error) {
      console.error('Error fetching current budget:', error);
      return null;
    }

    if (!data) return null;

    // Calculate days in period and elapsed days
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    const currentDate = new Date();
    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(daysInPeriod - elapsedDays, 1);

    // Get total spent amount in the period
    const { data: periodTransactions, error: transactionError } = await supabase
      .from('daily_transactions')
      .select('amount')
      .eq('user_id', userId)
      .gte('transaction_time', startDate.toISOString())
      .lte('transaction_time', currentDate.toISOString());

    if (transactionError) {
      console.error('Error fetching period transactions:', transactionError);
      return null;
    }

    const totalSpent = periodTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
    const remainingBudget = data.spending_budget - totalSpent;
    
    // Calculate daily allowance based on remaining budget and days
    const dailyAllowance = remainingBudget / remainingDays;

    return {
      ...data,
      daily_allowance: dailyAllowance
    };
  },

  async createBudget(
    userId: string,
    amount: number,
    period: BudgetPeriod,
    startDate: Date
  ): Promise<Budget | null> {
    const endDate = new Date(startDate);
    switch (period) {
      case 'weekly':
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'biweekly':
        endDate.setDate(startDate.getDate() + 14);
        break;
      case 'monthly':
        endDate.setMonth(startDate.getMonth() + 1);
        break;
    }

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: userId,
        budget_amount: amount,
        budget_period: period,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating budget:', error);
      return null;
    }

    return data;
  },

  async updateBudget(
    budgetId: string,
    updates: Partial<Omit<Budget, 'id' | 'user_id'>>
  ): Promise<Budget | null> {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', budgetId)
      .select()
      .single();

    if (error) {
      console.error('Error updating budget:', error);
      return null;
    }

    return data;
  },
};

/**
 * Transaction Management
 */
export const transactionService = {
  async addTransaction(
    userId: string,
    amount: number,
    category_id?: string,
    notes?: string,
    transaction_time?: Date
  ): Promise<DailyTransaction | null> {
    // Skip user verification since the user is already authenticated through Supabase Auth
    // If they have a valid session, they exist in auth.users
    const { data, error } = await supabase
      .from('daily_transactions')
      .insert({
        user_id: userId,
        amount,
        category_id,
        notes,
        transaction_time: transaction_time || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }

    return data;
  },

  async getDailyTransactions(userId: string, date: Date): Promise<DailyTransaction[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('Fetching transactions for date:', date.toISOString());
    const { data, error } = await supabase
      .from('daily_transactions')
      .select(`
        id,
        amount,
        category_id,
        transaction_time,
        notes,
        category:categories!daily_transactions_category_id_fkey (
          id,
          name,
          icon
        )
      `)
      .eq('user_id', userId)
      .gte('transaction_time', startOfDay.toISOString())
      .lte('transaction_time', endOfDay.toISOString())
      .order('transaction_time', { ascending: false });

    if (error) {
      console.error('Error fetching daily transactions:', error);
      return [];
    }

    console.log('Raw transaction data:', JSON.stringify(data, null, 2));
    return data || [];
  },

  async getTransactionsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DailyTransaction[]> {
    const { data, error } = await supabase
      .from('daily_transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('transaction_time', startDate.toISOString())
      .lte('transaction_time', endDate.toISOString())
      .order('transaction_time', { ascending: false });

    if (error) {
      console.error('Error fetching transactions by date range:', error);
      return [];
    }

    return data || [];
  },
};

/**
 * Settings Management
 */
export const settingsService = {
  async getUserSettings(userId: string): Promise<Settings | null> {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }

    return data;
  },

  async updateSettings(
    userId: string,
    updates: Partial<Omit<Settings, 'id' | 'user_id'>>
  ): Promise<Settings | null> {
    const { data, error } = await supabase
      .from('settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      return null;
    }

    return data;
  },
};

/**
 * Stats Management
 */
export const statsService = {
  async getDailyStats(userId: string, date: Date): Promise<Stats | null> {
    const { data, error } = await supabase
      .from('stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date.toISOString().split('T')[0])
      .single();

    if (error) {
      console.error('Error fetching daily stats:', error);
      return null;
    }

    return data;
  },

  async updateStats(statsId: string, updates: Partial<Omit<Stats, 'id' | 'user_id'>>): Promise<Stats | null> {
    const { data, error } = await supabase
      .from('stats')
      .update(updates)
      .eq('id', statsId)
      .select()
      .single();

    if (error) {
      console.error('Error updating stats:', error);
      return null;
    }

    return data;
  },

  async getSpendingByTimeframe(userId: string, timeframe: 'week' | 'month' | 'custom', startDate?: Date, endDate?: Date) {
    const now = new Date();
    let queryStartDate: Date;
    let queryEndDate: Date = now;

    if (timeframe === 'week') {
      queryStartDate = new Date(now);
      queryStartDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'month') {
      queryStartDate = new Date(now);
      queryStartDate.setMonth(now.getMonth() - 1);
    } else {
      queryStartDate = startDate || new Date(now.setMonth(now.getMonth() - 1));
      queryEndDate = endDate || now;
    }

    const { data, error } = await supabase
      .from('daily_transactions')
      .select(`
        amount,
        transaction_time,
        categories (
          name,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .gte('transaction_time', queryStartDate.toISOString())
      .lte('transaction_time', queryEndDate.toISOString())
      .order('transaction_time', { ascending: true });

    if (error) {
      console.error('Error fetching spending data:', error);
      return null;
    }

    return data;
  },

  async getSpendingByCategory(userId: string, timeframe: 'week' | 'month' | 'custom', startDate?: Date, endDate?: Date) {
    const now = new Date();
    let queryStartDate: Date;
    let queryEndDate: Date = now;

    if (timeframe === 'week') {
      queryStartDate = new Date(now);
      queryStartDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'month') {
      queryStartDate = new Date(now);
      queryStartDate.setMonth(now.getMonth() - 1);
    } else {
      queryStartDate = startDate || new Date(now.setMonth(now.getMonth() - 1));
      queryEndDate = endDate || now;
    }

    const { data, error } = await supabase
      .rpc('get_spending_by_category', {
        p_user_id: userId,
        p_start_date: queryStartDate.toISOString(),
        p_end_date: queryEndDate.toISOString()
      });

    if (error) {
      console.error('Error fetching category spending:', error);
      return null;
    }

    return data;
  },

  async getDailySpendingPatterns(userId: string) {
    const { data, error } = await supabase
      .rpc('get_daily_spending_patterns', {
        p_user_id: userId
      });

    if (error) {
      console.error('Error fetching spending patterns:', error);
      return null;
    }

    return data;
  }
};

/**
 * Rewards and Badges Management
 */
export const rewardsService = {
  async getUserBadges(userId: string): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }

    return data || [];
  },

  async awardBadge(
    userId: string,
    name: string,
    description?: string,
    milestoneId?: string
  ): Promise<Badge | null> {
    const { data, error } = await supabase
      .from('badges')
      .insert({
        user_id: userId,
        name,
        description,
        milestone_id: milestoneId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error awarding badge:', error);
      return null;
    }

    return data;
  },

  async getUserMilestones(userId: string): Promise<Milestone[]> {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('user_id', userId)
      .order('milestone_date', { ascending: false });

    if (error) {
      console.error('Error fetching user milestones:', error);
      return [];
    }

    return data || [];
  },

  async createMilestone(
    userId: string,
    name: string,
    date: Date,
    progress: number = 0
  ): Promise<Milestone | null> {
    const { data, error } = await supabase
      .from('milestones')
      .insert({
        user_id: userId,
        milestone_name: name,
        milestone_date: date.toISOString(),
        progress_percentage: progress,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating milestone:', error);
      return null;
    }

    return data;
  },
};
