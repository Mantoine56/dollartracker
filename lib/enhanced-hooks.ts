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
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['budgets', user?.id, 'current'],
    queryFn: async () => {
      if (!user?.id) return null;
      return budgetService.getCurrentBudget(user.id);
    },
    enabled: !!user?.id,
  });
}

interface CreateBudgetVariables {
  amount: number;
  period: BudgetPeriod;
  startDate: Date;
}

export function useCreateBudget(): UseMutationResult<Budget, CreateBudgetVariables> {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, period, startDate }: CreateBudgetVariables) => {
      if (!user?.id) return null;
      return budgetService.createBudget(user.id, amount, period, startDate);
    },
    onSuccess: () => {
      // Invalidate and refetch budget queries
      queryClient.invalidateQueries({ queryKey: ['budgets', user?.id, 'current'] });
    },
  });
}

/**
 * Enhanced Transaction Hooks
 */
export interface AddTransactionVariables {
  amount: number;
  category_id?: string;
  notes?: string;
  date?: Date;
}

export function useAddTransaction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, category_id, notes, date }: AddTransactionVariables) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return transactionService.addTransaction(user.id, amount, category_id, notes, date) as Promise<DailyTransaction>;
    },
    onSuccess: () => {
      // Invalidate and refetch transactions queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // Also invalidate budget query since it affects daily allowance
      queryClient.invalidateQueries({ queryKey: ['budgets', user?.id, 'current'] });
    },
  });
}

export function useDailyTransactions(date: Date) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['transactions', date.toISOString()],
    queryFn: async () => {
      if (!user?.id) return [];
      return transactionService.getDailyTransactions(user.id, date);
    },
    enabled: !!user?.id,
  });
}

/**
 * Enhanced Stats Hooks
 */
export function useSpendingByTimeframe(timeframe: 'week' | 'month' | 'custom', startDate?: Date, endDate?: Date) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['spending', user?.id, timeframe, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      if (!user?.id) return null;
      return statsService.getSpendingByTimeframe(user.id, timeframe, startDate, endDate);
    },
    enabled: !!user?.id,
  });
}

export function useSpendingByCategory(timeframe: 'week' | 'month' | 'custom', startDate?: Date, endDate?: Date) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['spending-by-category', user?.id, timeframe, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      if (!user?.id) return null;
      return statsService.getSpendingByCategory(user.id, timeframe, startDate, endDate);
    },
    enabled: !!user?.id,
  });
}

export function useDailySpendingPatterns() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['spending-patterns', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return statsService.getDailySpendingPatterns(user.id);
    },
    enabled: !!user?.id,
  });
}

// ... Similar enhancements for other hooks ...
