import { supabase } from '../supabase';
import { InsertBudget, Budget, BudgetSummary } from '../types/budget';

export class BudgetError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BudgetError';
  }
}

export async function createBudget(budgetSummary: BudgetSummary): Promise<Budget> {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new BudgetError('User not authenticated');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const budgetData: InsertBudget = {
      user_id: user.data.user.id,
      monthly_income: budgetSummary.monthlyIncome,
      fixed_expenses: budgetSummary.fixedExpenses,
      savings_target: budgetSummary.savingsTarget,
      spending_budget: budgetSummary.spendingBudget,
      budget_period: budgetSummary.paymentFrequency,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };

    const { data, error } = await supabase
      .from('budgets')
      .insert(budgetData)
      .select()
      .single();

    if (error) throw new BudgetError(error.message);
    if (!data) throw new BudgetError('Failed to create budget');

    return data;
  } catch (error) {
    if (error instanceof BudgetError) throw error;
    throw new BudgetError('Failed to create budget');
  }
}

export async function getCurrentBudget(): Promise<Budget | null> {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new BudgetError('User not authenticated');

    const { data, error } = await supabase
      .from('budgets')
      .select()
      .eq('user_id', user.data.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw new BudgetError(error.message);
    return data;
  } catch (error) {
    if (error instanceof BudgetError) throw error;
    throw new BudgetError('Failed to fetch budget');
  }
}

export async function updateBudget(id: string, budgetSummary: BudgetSummary): Promise<Budget> {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new BudgetError('User not authenticated');

    const { data, error } = await supabase
      .from('budgets')
      .update({
        monthly_income: budgetSummary.monthlyIncome,
        fixed_expenses: budgetSummary.fixedExpenses,
        savings_target: budgetSummary.savingsTarget,
        spending_budget: budgetSummary.spendingBudget,
        budget_period: budgetSummary.paymentFrequency,
      })
      .eq('id', id)
      .eq('user_id', user.data.user.id)
      .select()
      .single();

    if (error) throw new BudgetError(error.message);
    if (!data) throw new BudgetError('Failed to update budget');

    return data;
  } catch (error) {
    if (error instanceof BudgetError) throw error;
    throw new BudgetError('Failed to update budget');
  }
}
