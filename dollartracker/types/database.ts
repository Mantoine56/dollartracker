import { Database } from '@supabase/supabase-js';

export type BudgetPeriod = 'monthly' | 'weekly' | 'biweekly';
export type ThemeType = 'light' | 'dark';
export type ExportPreference = 'CSV' | 'PDF';

export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  budget_amount: number;
  budget_period: BudgetPeriod;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface DailyTransaction {
  id: string;
  user_id: string;
  transaction_time: string;
  amount: number;
  category: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  milestone_id: string | null;
  earned_at: string;
}

export interface Milestone {
  id: string;
  user_id: string;
  milestone_name: string;
  milestone_date: string;
  progress_percentage: number;
  created_at: string;
}

export interface Settings {
  id: string;
  user_id: string;
  theme: ThemeType;
  notifications_enabled: boolean;
  custom_budget_period: BudgetPeriod;
  export_preferences: ExportPreference;
  email_notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Stats {
  id: string;
  user_id: string;
  date: string;
  total_spent: number;
  total_remaining: number;
  category_breakdown: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface Reward {
  id: string;
  user_id: string;
  reward_name: string;
  reward_description: string | null;
  level: number;
  personalized_message: string | null;
  earned_at: string;
}

export interface DailySummary {
  user_id: string;
  date: string;
  total_spent: number;
}

// Database type definition for Supabase
export interface Schema {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id'>>;
      };
      budgets: {
        Row: Budget;
        Insert: Omit<Budget, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Budget, 'id'>>;
      };
      daily_transactions: {
        Row: DailyTransaction;
        Insert: Omit<DailyTransaction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DailyTransaction, 'id'>>;
      };
      badges: {
        Row: Badge;
        Insert: Omit<Badge, 'id' | 'earned_at'>;
        Update: Partial<Omit<Badge, 'id'>>;
      };
      milestones: {
        Row: Milestone;
        Insert: Omit<Milestone, 'id' | 'created_at'>;
        Update: Partial<Omit<Milestone, 'id'>>;
      };
      settings: {
        Row: Settings;
        Insert: Omit<Settings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Settings, 'id'>>;
      };
      stats: {
        Row: Stats;
        Insert: Omit<Stats, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Stats, 'id'>>;
      };
      rewards: {
        Row: Reward;
        Insert: Omit<Reward, 'id' | 'earned_at'>;
        Update: Partial<Omit<Reward, 'id'>>;
      };
    };
    Views: {
      daily_summary: {
        Row: DailySummary;
      };
    };
    Functions: {
      update_timestamp: {
        Args: Record<string, never>;
        Returns: unknown;
      };
    };
  };
}

// Export the typed database client
export type TypedSupabaseClient = Database<Schema>;
