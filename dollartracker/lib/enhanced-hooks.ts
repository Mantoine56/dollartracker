import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/auth';
import {
  budgetService,
  transactionService,
  settingsService,
  statsService,
  rewardsService,
} from './database';
import { cacheManager } from './cache';
import type {
  Budget,
  DailyTransaction,
  Settings,
  Stats,
  Badge,
  Milestone,
  BudgetPeriod,
} from '../types/database';

interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseMutationResult<T, TVariables> {
  mutate: (variables: TVariables) => Promise<T | null>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Enhanced Budget Hooks
 */
export function useCurrentBudget(): UseQueryResult<Budget> {
  const { user } = useAuth();
  const [data, setData] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBudget = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      // Check cache first
      const cacheKey = `budgets:${user.id}:current`;
      const cachedData = await cacheManager.get<Budget>(cacheKey);
      
      if (cachedData) {
        setData(cachedData);
        setIsLoading(false);
        return;
      }

      const budget = await budgetService.getCurrentBudget(user.id);
      if (budget) {
        cacheManager.set(cacheKey, budget, { realtimeEnabled: true });
        setData(budget);
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch budget'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBudget();
    return () => {
      if (user?.id) {
        cacheManager.delete(`budgets:${user.id}:current`);
      }
    };
  }, [fetchBudget, user?.id]);

  return { data, isLoading, error, refetch: fetchBudget };
}

interface CreateBudgetVariables {
  amount: number;
  period: BudgetPeriod;
  startDate: Date;
}

export function useCreateBudget(): UseMutationResult<Budget, CreateBudgetVariables> {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  const mutate = useCallback(async ({ amount, period, startDate }: CreateBudgetVariables) => {
    if (!user?.id) return null;

    try {
      setIsLoading(true);
      setError(null);

      // Optimistically update the cache
      const cacheKey = `budgets:${user.id}:current`;
      const optimisticBudget: Budget = {
        id: 'temp-id',
        user_id: user.id,
        budget_amount: amount,
        budget_period: period,
        start_date: startDate.toISOString(),
        end_date: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      cacheManager.set(cacheKey, optimisticBudget);

      const result = await budgetService.createBudget(user.id, amount, period, startDate);
      
      if (result) {
        cacheManager.set(cacheKey, result, { realtimeEnabled: true });
        return result;
      }

      // If failed, revert optimistic update
      cacheManager.delete(cacheKey);
      return null;
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to create budget');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return { mutate, isLoading, error, reset };
}

/**
 * Enhanced Transaction Hooks
 */
interface AddTransactionVariables {
  amount: number;
  category?: string;
  notes?: string;
}

export function useAddTransaction(): UseMutationResult<DailyTransaction, AddTransactionVariables> {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const optimisticIdCounter = useRef(0);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  const mutate = useCallback(async ({ amount, category, notes }: AddTransactionVariables) => {
    if (!user?.id) return null;

    const today = new Date();
    const cacheKey = `transactions:${user.id}:${today.toISOString().split('T')[0]}`;
    const optimisticId = `temp-${optimisticIdCounter.current++}`;

    try {
      setIsLoading(true);
      setError(null);

      // Create optimistic transaction
      const optimisticTransaction: DailyTransaction = {
        id: optimisticId,
        user_id: user.id,
        amount,
        category: category || null,
        notes: notes || null,
        transaction_time: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update cache optimistically
      const cachedTransactions = await cacheManager.get<DailyTransaction[]>(cacheKey) || [];
      cacheManager.set(cacheKey, [optimisticTransaction, ...cachedTransactions]);

      // Perform actual mutation
      const result = await transactionService.addTransaction(user.id, amount, category, notes);

      if (result) {
        // Update cache with real data
        const updatedTransactions = (cachedTransactions || [])
          .filter(t => t.id !== optimisticId)
          .concat(result);
        cacheManager.set(cacheKey, updatedTransactions, { realtimeEnabled: true });
        return result;
      }

      // If failed, revert optimistic update
      cacheManager.set(cacheKey, cachedTransactions);
      return null;
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to add transaction');
      setError(error);
      // Revert optimistic update on error
      const cachedTransactions = await cacheManager.get<DailyTransaction[]>(cacheKey) || [];
      cacheManager.set(cacheKey, cachedTransactions.filter(t => t.id !== optimisticId));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return { mutate, isLoading, error, reset };
}

export function useDailyTransactions(date: Date): UseQueryResult<DailyTransaction[]> {
  const { user } = useAuth();
  const [data, setData] = useState<DailyTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;

    const cacheKey = `transactions:${user.id}:${date.toISOString().split('T')[0]}`;

    try {
      setIsLoading(true);
      
      // Check cache first
      const cachedData = await cacheManager.get<DailyTransaction[]>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setIsLoading(false);
        return;
      }

      const transactions = await transactionService.getDailyTransactions(user.id, date);
      cacheManager.set(cacheKey, transactions, { realtimeEnabled: true });
      setData(transactions);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch transactions'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, date]);

  useEffect(() => {
    fetchTransactions();
    return () => {
      if (user?.id) {
        cacheManager.delete(`transactions:${user.id}:${date.toISOString().split('T')[0]}`);
      }
    };
  }, [fetchTransactions, user?.id, date]);

  return { data, isLoading, error, refetch: fetchTransactions };
}

// ... Similar enhancements for other hooks ...
