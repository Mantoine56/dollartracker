import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  subscription?: RealtimeChannel;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  realtimeEnabled?: boolean;
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > (this.defaultTTL);
    if (isExpired) {
      this.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const existing = this.cache.get(key);
    if (existing?.subscription) {
      // Keep existing subscription if it exists
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        subscription: existing.subscription,
      });
    } else {
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
      });
    }

    if (options.realtimeEnabled) {
      this.setupRealtimeSubscription(key, data);
    }
  }

  delete(key: string): void {
    const entry = this.cache.get(key);
    if (entry?.subscription) {
      entry.subscription.unsubscribe();
    }
    this.cache.delete(key);
  }

  clear(): void {
    for (const [key] of this.cache) {
      this.delete(key);
    }
  }

  private setupRealtimeSubscription<T>(key: string, data: T): void {
    // Extract table name from cache key (e.g., "budgets:userId" -> "budgets")
    const tableName = key.split(':')[0];
    
    const subscription = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        (payload) => {
          const entry = this.cache.get(key);
          if (!entry) return;

          // Update cache based on the change type
          switch (payload.eventType) {
            case 'INSERT':
              if (Array.isArray(entry.data)) {
                this.set(key, [...entry.data, payload.new]);
              }
              break;
            case 'UPDATE':
              if (Array.isArray(entry.data)) {
                this.set(key, entry.data.map(item => 
                  item.id === payload.new.id ? payload.new : item
                ));
              } else if (entry.data?.id === payload.new.id) {
                this.set(key, payload.new);
              }
              break;
            case 'DELETE':
              if (Array.isArray(entry.data)) {
                this.set(key, entry.data.filter(item => 
                  item.id !== payload.old.id
                ));
              } else if (entry.data?.id === payload.old.id) {
                this.delete(key);
              }
              break;
          }
        }
      )
      .subscribe();

    // Store the subscription with the cache entry
    const existingEntry = this.cache.get(key);
    if (existingEntry) {
      existingEntry.subscription = subscription;
    }
  }
}

export const cacheManager = new CacheManager();
