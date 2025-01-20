import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/auth';
import { useSupabase } from '../context/supabase';
import { createTransactionService } from './services/transaction.service';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
  const { supabase, isReady } = useSupabase();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['budgets', user?.id, 'current'],
    queryFn: async () => {
      if (!user?.id || !isReady) return null;
      const service = createTransactionService(supabase);
      return service.getCurrentBudget(user.id);
    },
    enabled: !!user?.id && isReady,
  });
}

interface CreateBudgetVariables {
  amount: number;
  period: BudgetPeriod;
  startDate: Date;
}

export function useCreateBudget(): UseMutationResult<Budget, CreateBudgetVariables> {
  const { user } = useAuth();
  const { supabase, isReady } = useSupabase();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (variables: CreateBudgetVariables) => {
      if (!user?.id || !isReady) return null;
      const service = createTransactionService(supabase);
      return service.createBudget(user.id, variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['budgets']);
    },
  });

  return {
    mutate: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Enhanced Transaction Hooks
 */
interface AddTransactionVariables {
  amount: number;
  category_id?: string;
  notes?: string;
  date?: Date;
}

export function useAddTransaction(): UseMutationResult<DailyTransaction, AddTransactionVariables> {
  const { user } = useAuth();
  const { supabase, isReady } = useSupabase();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (variables: AddTransactionVariables) => {
      if (!user?.id || !isReady) return null;
      const service = createTransactionService(supabase);
      return service.addTransaction(user.id, variables);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions']);
      queryClient.invalidateQueries(['stats']);
    },
  });

  return {
    mutate: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

export function useDailyTransactions(date: Date): UseQueryResult<DailyTransaction[]> {
  const { user } = useAuth();
  const { supabase, isReady } = useSupabase();

  return useQuery({
    queryKey: ['transactions', user?.id, date.toISOString()],
    queryFn: async () => {
      if (!user?.id || !isReady) return null;
      const service = createTransactionService(supabase);
      return service.getDailyTransactions(user.id, date);
    },
    enabled: !!user?.id && isReady,
  });
}

// Enhanced Stats Hooks
export function useSpendingByTimeframe(
  timeframe: 'week' | 'month' | 'custom',
  startDate?: Date,
  endDate?: Date
): UseQueryResult<Stats['spending_by_timeframe']> {
  const { user } = useAuth();
  const { supabase, isReady } = useSupabase();

  return useQuery({
    queryKey: ['stats', user?.id, 'spending_by_timeframe', timeframe, startDate, endDate],
    queryFn: async () => {
      if (!user?.id || !isReady) return null;
      const service = createTransactionService(supabase);
      const data = await service.getSpendingByTimeframe(user.id, timeframe, startDate, endDate);
      return data || { labels: [], datasets: [{ data: [] }] };
    },
    enabled: !!user?.id && isReady,
  });
}

export function useSpendingByCategory(
  timeframe: 'week' | 'month' | 'custom',
  startDate?: Date,
  endDate?: Date
): UseQueryResult<Stats['spending_by_category']> {
  const { user } = useAuth();
  const { supabase, isReady } = useSupabase();

  return useQuery({
    queryKey: ['stats', user?.id, 'spending_by_category', timeframe, startDate, endDate],
    queryFn: async () => {
      if (!user?.id || !isReady) return null;
      const service = createTransactionService(supabase);
      const data = await service.getSpendingByCategory(user.id, timeframe, startDate, endDate);
      return data || { labels: [], datasets: [{ data: [] }] };
    },
    enabled: !!user?.id && isReady,
  });
}

export function useDailySpendingPatterns(): UseQueryResult<Stats['daily_patterns']> {
  const { user } = useAuth();
  const { supabase, isReady } = useSupabase();

  return useQuery({
    queryKey: ['stats', user?.id, 'daily_patterns'],
    queryFn: async () => {
      if (!user?.id || !isReady) return null;
      const service = createTransactionService(supabase);
      const data = await service.getDailySpendingPatterns(user.id);
      return data || { labels: [], datasets: [{ data: [] }] };
    },
    enabled: !!user?.id && isReady,
  });
}
