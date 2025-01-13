export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          monthly_income: number
          savings_goal: number
          theme_preference: 'light' | 'dark' | 'system'
          currency: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          monthly_income?: number
          savings_goal?: number
          theme_preference?: 'light' | 'dark' | 'system'
          currency?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          monthly_income?: number
          savings_goal?: number
          theme_preference?: 'light' | 'dark' | 'system'
          currency?: string
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          color: string
          icon: string
          budget_amount: number
          profile_id: string
          type: 'expense' | 'income'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          color: string
          icon: string
          budget_amount: number
          profile_id: string
          type: 'expense' | 'income'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          color?: string
          icon?: string
          budget_amount?: number
          profile_id?: string
          type?: 'expense' | 'income'
        }
      }
      transactions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          amount: number
          description: string | null
          category_id: string
          profile_id: string
          date: string
          type: 'expense' | 'income'
          recurring_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          amount: number
          description?: string | null
          category_id: string
          profile_id: string
          date?: string
          type: 'expense' | 'income'
          recurring_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          amount?: number
          description?: string | null
          category_id?: string
          profile_id?: string
          date?: string
          type?: 'expense' | 'income'
          recurring_id?: string | null
        }
      }
      recurring_transactions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          amount: number
          description: string | null
          category_id: string
          profile_id: string
          frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
          start_date: string
          end_date: string | null
          last_generated: string | null
          type: 'expense' | 'income'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          amount: number
          description?: string | null
          category_id: string
          profile_id: string
          frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
          start_date: string
          end_date?: string | null
          last_generated?: string | null
          type: 'expense' | 'income'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          amount?: number
          description?: string | null
          category_id?: string
          profile_id?: string
          frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
          start_date?: string
          end_date?: string | null
          last_generated?: string | null
          type?: 'expense' | 'income'
        }
      }
      budgets: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          profile_id: string
          month: string
          savings_goal: number
          total_income: number
          total_expenses: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          profile_id: string
          month: string
          savings_goal: number
          total_income: number
          total_expenses: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          profile_id?: string
          month?: string
          savings_goal?: number
          total_income?: number
          total_expenses?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
