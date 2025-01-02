-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing views first
DROP VIEW IF EXISTS daily_summary CASCADE;

-- Drop existing tables to recreate with correct references
DROP TABLE IF EXISTS daily_transactions CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create tables
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    budget_amount NUMERIC NOT NULL,
    budget_period TEXT CHECK (budget_period IN ('monthly', 'weekly', 'biweekly')) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_time TIMESTAMP NOT NULL DEFAULT NOW(),
    amount NUMERIC NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    milestone_name TEXT NOT NULL,
    milestone_date DATE NOT NULL,
    progress_percentage NUMERIC DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    earned_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT CHECK (theme IN ('light', 'dark')) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    custom_budget_period TEXT CHECK (custom_budget_period IN ('monthly', 'weekly', 'biweekly')) DEFAULT 'monthly',
    export_preferences TEXT CHECK (export_preferences IN ('CSV', 'PDF')) DEFAULT 'CSV',
    email_notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DO $$ 
BEGIN
    -- Categories policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own categories') THEN
        CREATE POLICY "Users can view own categories" ON categories
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own categories') THEN
        CREATE POLICY "Users can manage own categories" ON categories
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Budgets policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own budgets') THEN
        CREATE POLICY "Users can view own budgets" ON budgets
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own budgets') THEN
        CREATE POLICY "Users can manage own budgets" ON budgets
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Transactions policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own transactions') THEN
        CREATE POLICY "Users can view own transactions" ON daily_transactions
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own transactions') THEN
        CREATE POLICY "Users can manage own transactions" ON daily_transactions
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Milestones policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own milestones') THEN
        CREATE POLICY "Users can view own milestones" ON milestones
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own milestones') THEN
        CREATE POLICY "Users can manage own milestones" ON milestones
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Badges policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own badges') THEN
        CREATE POLICY "Users can view own badges" ON badges
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own badges') THEN
        CREATE POLICY "Users can manage own badges" ON badges
            FOR ALL USING (auth.uid() = user_id);
    END IF;

    -- Settings policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own settings') THEN
        CREATE POLICY "Users can view own settings" ON settings
            FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own settings') THEN
        CREATE POLICY "Users can manage own settings" ON settings
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create default categories if they don't exist
INSERT INTO categories (name, icon, color, is_system)
SELECT name, icon, color, is_system
FROM (VALUES
    ('Food', 'food', '#4CAF50', true),
    ('Shopping', 'cart', '#2196F3', true),
    ('Transport', 'car', '#FF9800', true),
    ('Bills', 'file-document', '#9C27B0', true),
    ('Entertainment', 'movie', '#E91E63', true),
    ('Health', 'medical-bag', '#00BCD4', true),
    ('Travel', 'airplane', '#795548', true),
    ('Other', 'dots-horizontal', '#607D8B', true)
) AS default_categories(name, icon, color, is_system)
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE is_system = true
);

-- Create helper function
CREATE OR REPLACE FUNCTION calculate_daily_allowance(
    p_user_id UUID,
    p_date DATE
) RETURNS NUMERIC AS $$
DECLARE
    v_budget_amount NUMERIC;
    v_days_remaining INTEGER;
    v_total_spent NUMERIC;
BEGIN
    -- Get the current active budget
    SELECT budget_amount
    INTO v_budget_amount
    FROM budgets
    WHERE user_id = p_user_id
    AND start_date <= p_date
    AND end_date >= p_date;

    -- Calculate days remaining in the budget period
    SELECT (end_date - p_date)::INTEGER
    INTO v_days_remaining
    FROM budgets
    WHERE user_id = p_user_id
    AND start_date <= p_date
    AND end_date >= p_date;

    -- Get total spent in the current period
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_spent
    FROM daily_transactions
    WHERE user_id = p_user_id
    AND date(transaction_time) <= p_date
    AND date(transaction_time) >= (
        SELECT start_date
        FROM budgets
        WHERE user_id = p_user_id
        AND start_date <= p_date
        AND end_date >= p_date
    );

    -- Return daily allowance
    RETURN CASE 
        WHEN v_days_remaining > 0 THEN
            (v_budget_amount - v_total_spent) / v_days_remaining
        ELSE 0
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;