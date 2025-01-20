import { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth';
import { useSupabase } from '../../context/supabase';
import { createTransactionService } from '../services/transaction.service';
import type { Transaction } from '../../types/transactions';

export function useTransactions(date: Date) {
  const { user } = useAuth();
  const { supabase, isReady } = useSupabase();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isReady || !user?.id) return;

    const fetchTransactions = async () => {
      try {
        const service = createTransactionService(supabase);
        const data = await service.getDailyTransactions(user.id, date);
        setTransactions(data);
      } catch (e) {
        console.error('Error fetching transactions:', e);
        setError(e instanceof Error ? e : new Error('Failed to fetch transactions'));
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchTransactions();
  }, [user?.id, date, supabase, isReady]);

  return { transactions, isLoading, error };
}
