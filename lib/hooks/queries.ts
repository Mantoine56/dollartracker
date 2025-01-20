import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../supabase/api';
import { useAuth } from '../../context/auth';

// Profile hooks
export function useProfile() {
  const { session, loading } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => api.getProfile(userId!),
    enabled: !!userId && !loading,
  });
}

export function useUpdateProfile() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Parameters<typeof api.updateProfile>[1]) =>
      api.updateProfile(userId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}

// Category hooks
export function useCategories() {
  const { session, loading } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['categories', userId],
    queryFn: () => api.getCategories(userId!),
    enabled: !!userId && !loading,
    staleTime: 300000, // Categories change less frequently, keep for 5 minutes
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: api.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', userId] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: (params: { categoryId: string; updates: Parameters<typeof api.updateCategory>[1] }) =>
      api.updateCategory(params.categoryId, params.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', userId] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', userId] });
    },
  });
}

// Transaction hooks
export function useTransactions(options?: Parameters<typeof api.getTransactions>[1]) {
  const { session, loading } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['transactions', userId, options],
    queryFn: () => api.getTransactions(userId!, options),
    enabled: !!userId && !loading,
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 2, // Retry failed requests twice
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: api.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['budgets', userId] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: (params: { transactionId: string; updates: Parameters<typeof api.updateTransaction>[1] }) =>
      api.updateTransaction(params.transactionId, params.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['budgets', userId] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: api.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      queryClient.invalidateQueries({ queryKey: ['budgets', userId] });
    },
  });
}

// Recurring transaction hooks
export function useRecurringTransactions() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['recurring-transactions', userId],
    queryFn: () => api.getRecurringTransactions(userId!),
    enabled: !!userId,
  });
}

export function useCreateRecurringTransaction() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: api.createRecurringTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions', userId] });
    },
  });
}

export function useUpdateRecurringTransaction() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: (params: { transactionId: string; updates: Parameters<typeof api.updateRecurringTransaction>[1] }) =>
      api.updateRecurringTransaction(params.transactionId, params.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions', userId] });
    },
  });
}

export function useDeleteRecurringTransaction() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: api.deleteRecurringTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions', userId] });
    },
  });
}

// Budget hooks
export function useBudget(month: string) {
  const { session } = useAuth();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['budgets', userId, month],
    queryFn: () => api.getBudget(userId!, month),
    enabled: !!userId,
  });
}

export function useCreateOrUpdateBudget() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;

  return useMutation({
    mutationFn: api.createOrUpdateBudget,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', userId, data.month] });
    },
  });
}
