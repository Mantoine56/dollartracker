import { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth';
import { supabase } from '../supabase';
import { Category } from '../../types/transactions';
import { cacheManager } from '../cache';

export function useCategories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.id) return;

      try {
        const cacheKey = `categories:${user.id}`;
        const cached = await cacheManager.get<Category[]>(cacheKey);
        
        if (cached) {
          setCategories(cached);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;

        cacheManager.set(cacheKey, data, { realtimeEnabled: true });
        setCategories(data);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to fetch categories'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [user?.id]);

  return { categories, isLoading, error };
}
