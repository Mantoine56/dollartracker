import { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth';
import { useSupabase } from '../../context/supabase';
import { Category } from '../../types/transactions';
import { cacheManager } from '../cache';

export function useCategories() {
  const { user } = useAuth();
  const { supabase, isReady } = useSupabase();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isReady || !user?.id) return;

    const fetchCategories = async () => {
      try {
        const cacheKey = `categories:${user.id}`;
        const cached = await cacheManager.get<Category[]>(cacheKey);
        
        if (cached) {
          setCategories(cached);
          setIsLoading(false);
          return;
        }

        const { data, error: queryError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (queryError) throw queryError;
        if (!data) throw new Error('No data returned from categories query');

        cacheManager.set(cacheKey, data, { realtimeEnabled: true });
        setCategories(data);
      } catch (e) {
        console.error('Error fetching categories:', e);
        setError(e instanceof Error ? e : new Error('Failed to fetch categories'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [user?.id, supabase, isReady]);

  return { categories, isLoading, error };
}
