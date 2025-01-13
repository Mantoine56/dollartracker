import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/auth';
import {
  budgetService,
  transactionService,
  settingsService,
  statsService,
  rewardsService,
} from './database';
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

interface UseMutationResult<T> {
  mutate: (...args: any[]) => Promise<T | null>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Budget Hooks
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
      const budget = await budgetService.getCurrentBudget(user.id);
      setData(budget);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch budget'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget]);

  return { data, isLoading, error, refetch: fetchBudget };
}

export function useCreateBudget(): UseMutationResult<Budget> {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (
    amount: number,
    period: BudgetPeriod,
    startDate: Date
  ) => {
    if (!user?.id) return null;

    try {
      setIsLoading(true);
      setError(null);
      return await budgetService.createBudget(user.id, amount, period, startDate);
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to create budget');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return { mutate, isLoading, error };
}

/**
 * Transaction Hooks
 */
export function useDailyTransactions(date: Date): UseQueryResult<DailyTransaction[]> {
  const { user } = useAuth();
  const [data, setData] = useState<DailyTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const transactions = await transactionService.getDailyTransactions(user.id, date);
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
  }, [fetchTransactions]);

  return { data, isLoading, error, refetch: fetchTransactions };
}

export function useAddTransaction(): UseMutationResult<DailyTransaction> {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (
    amount: number,
    category?: string,
    notes?: string
  ) => {
    if (!user?.id) return null;

    try {
      setIsLoading(true);
      setError(null);
      return await transactionService.addTransaction(user.id, amount, category, notes);
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to add transaction');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return { mutate, isLoading, error };
}

/**
 * Settings Hooks
 */
export function useSettings(): UseQueryResult<Settings> {
  const { user } = useAuth();
  const [data, setData] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const settings = await settingsService.getUserSettings(user.id);
      setData(settings);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch settings'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { data, isLoading, error, refetch: fetchSettings };
}

export function useUpdateSettings(): UseMutationResult<Settings> {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (updates: Partial<Omit<Settings, 'id' | 'user_id'>>) => {
    if (!user?.id) return null;

    try {
      setIsLoading(true);
      setError(null);
      return await settingsService.updateSettings(user.id, updates);
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to update settings');
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return { mutate, isLoading, error };
}

/**
 * Stats Hooks
 */
export function useDailyStats(date: Date): UseQueryResult<Stats> {
  const { user } = useAuth();
  const [data, setData] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const stats = await statsService.getDailyStats(user.id, date);
      setData(stats);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch stats'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, date]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, isLoading, error, refetch: fetchStats };
}

/**
 * Rewards Hooks
 */
export function useBadges(): UseQueryResult<Badge[]> {
  const { user } = useAuth();
  const [data, setData] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBadges = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const badges = await rewardsService.getUserBadges(user.id);
      setData(badges);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch badges'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  return { data, isLoading, error, refetch: fetchBadges };
}

export function useMilestones(): UseQueryResult<Milestone[]> {
  const { user } = useAuth();
  const [data, setData] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMilestones = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const milestones = await rewardsService.getUserMilestones(user.id);
      setData(milestones);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch milestones'));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  return { data, isLoading, error, refetch: fetchMilestones };
}
