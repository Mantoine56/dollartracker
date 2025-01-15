-- Dollartracker App Schema for Supabase

/**
 * Database Schema with TypeScript Support
 * Last Updated: January 6, 2025
 * 
 * Key Features:
 * - User-specific categories with default system categories
 * - Transaction tracking with category associations
 * - Budget management
 * - Rewards and milestones system
 * - User settings and preferences
 */

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE spending_limits ENABLE ROW LEVEL SECURITY;

-- Categories table for transaction categorization
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL, -- MaterialCommunityIcons name
    color TEXT,
    is_system BOOLEAN DEFAULT FALSE, -- Indicates if this is a default category
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Note: Default categories are now created per-user via Edge Function
-- When a new user signs up, the following default categories are automatically added:
-- 1. Food (icon: food)
-- 2. Entertainment (icon: movie)
-- 3. Shopping (icon: cart)
-- 4. Transport (icon: car)
-- 5. Bills (icon: file-document)
-- 6. Health (icon: medical-bag)
-- 7. Other (icon: dots-horizontal)

-- Each category is created with:
-- - Unique UUID
-- - User's ID as foreign key
-- - Category name
-- - MaterialCommunityIcons icon name
-- - is_system set to true for default categories

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- For securely storing hashed passwords
    name TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Settings table for user preferences
CREATE TABLE settings (
    id UUID PRIMARY KEY REFERENCES users(id),
    user_id UUID REFERENCES users(id),
    theme TEXT NOT NULL CHECK (theme IN ('light', 'dark', 'system')),
    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    custom_budget_period TEXT,
    export_preferences JSONB,
    email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies for settings
CREATE POLICY settings_select_policy ON settings 
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY settings_insert_policy ON settings 
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY settings_update_policy ON settings 
    FOR UPDATE USING (user_id = auth.uid());

-- Add trigger for settings updated_at
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions for settings
GRANT ALL ON settings TO authenticated;

COMMENT ON TABLE settings IS 'Stores user preferences including theme, notifications, and export settings';
COMMENT ON COLUMN settings.theme IS 'User interface theme preference (light, dark, or system)';
COMMENT ON COLUMN settings.notifications_enabled IS 'Whether push notifications are enabled';
COMMENT ON COLUMN settings.email_notifications_enabled IS 'Whether email notifications are enabled';
COMMENT ON COLUMN settings.custom_budget_period IS 'Custom budget period settings';
COMMENT ON COLUMN settings.export_preferences IS 'JSON object containing export format preferences';

-- Update budgets table to include new fields
DROP TABLE IF EXISTS budgets;
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    income_amount NUMERIC NOT NULL,
    income_frequency TEXT CHECK (income_frequency IN ('weekly', 'biweekly', 'monthly')) NOT NULL,
    fixed_expenses NUMERIC NOT NULL,
    savings_target NUMERIC NOT NULL,
    spending_budget NUMERIC NOT NULL,
    daily_allowance NUMERIC NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_amounts CHECK (
        income_amount > 0 AND
        fixed_expenses >= 0 AND
        savings_target >= 0 AND
        spending_budget >= 0 AND
        daily_allowance >= 0 AND
        (fixed_expenses + savings_target) <= income_amount
    )
);

-- Add indexes for better query performance
CREATE INDEX budgets_user_id_idx ON budgets(user_id);
CREATE INDEX budgets_date_range_idx ON budgets(user_id, start_date, end_date);

-- Add RLS policies for budgets
CREATE POLICY budgets_select_policy ON budgets 
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY budgets_insert_policy ON budgets 
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY budgets_update_policy ON budgets 
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY budgets_delete_policy ON budgets 
    FOR DELETE USING (user_id = auth.uid());

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON budgets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add function to calculate daily allowance
CREATE OR REPLACE FUNCTION calculate_daily_allowance(
    p_income_amount NUMERIC,
    p_income_frequency TEXT,
    p_fixed_expenses NUMERIC,
    p_savings_target NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
    monthly_income NUMERIC;
    days_in_month NUMERIC := 30.4375; -- Average days in a month
BEGIN
    -- Convert income to monthly
    CASE p_income_frequency
        WHEN 'weekly' THEN monthly_income := p_income_amount * 52 / 12
        WHEN 'biweekly' THEN monthly_income := p_income_amount * 26 / 12
        ELSE monthly_income := p_income_amount
    END;
    
    -- Calculate and return daily allowance
    RETURN (monthly_income - p_fixed_expenses - p_savings_target) / days_in_month;
END;
$$ LANGUAGE plpgsql;

-- Add view for budget summaries
CREATE OR REPLACE VIEW budget_summaries AS
SELECT 
    user_id,
    income_amount,
    income_frequency,
    fixed_expenses,
    savings_target,
    spending_budget,
    daily_allowance,
    start_date,
    end_date
FROM budgets
WHERE end_date >= CURRENT_DATE
ORDER BY start_date DESC;

-- Grant permissions
GRANT SELECT ON budget_summaries TO authenticated;
GRANT ALL ON budgets TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_daily_allowance TO authenticated;

COMMENT ON TABLE budgets IS 'Stores user budget information including income, expenses, and calculated allowances';
COMMENT ON VIEW budget_summaries IS 'Provides a summary view of active budgets for users';
COMMENT ON FUNCTION calculate_daily_allowance IS 'Calculates daily spending allowance based on income, expenses, and savings';

CREATE TABLE daily_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_time TIMESTAMP NOT NULL DEFAULT NOW(),
    amount NUMERIC NOT NULL CHECK (amount > 0), -- Ensure positive amount
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    earned_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    milestone_name TEXT NOT NULL,
    milestone_date DATE NOT NULL,
    progress_percentage NUMERIC DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_spent NUMERIC NOT NULL,
    total_remaining NUMERIC NOT NULL,
    category_breakdown JSONB DEFAULT '{}'::JSONB, -- Stores breakdown of spending by category
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reward_name TEXT NOT NULL,
    reward_description TEXT,
    level INT DEFAULT 1 CHECK (level >= 1), -- Adds levels to rewards
    personalized_message TEXT, -- Stores custom messages for users
    earned_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE spending_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    period TEXT CHECK (period IN ('daily', 'weekly', 'monthly')) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transaction Category View
CREATE OR REPLACE VIEW transaction_with_category AS
SELECT 
    t.*,
    c.name as category_name,
    c.icon as category_icon,
    c.color as category_color
FROM daily_transactions t
LEFT JOIN categories c ON t.category_id = c.id;

-- Helper Views and Functions

-- View for summarizing daily transactions
CREATE OR REPLACE VIEW daily_summary AS
SELECT 
    user_id,
    date(transaction_time) AS date,
    SUM(amount) AS total_spent,
    COUNT(*) as transaction_count
FROM daily_transactions
GROUP BY user_id, date(transaction_time);

-- Function to calculate daily allowance
CREATE OR REPLACE FUNCTION calculate_daily_allowance(
    p_user_id UUID,
    p_date DATE
)
RETURNS NUMERIC AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger for updating updated_at fields
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON budgets
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_daily_transactions_updated_at
BEFORE UPDATE ON daily_transactions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON settings
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Row Level Security Policies
CREATE POLICY users_select_policy ON users FOR SELECT USING (id = current_user_id());
CREATE POLICY users_update_policy ON users FOR UPDATE USING (id = current_user_id());
CREATE POLICY budgets_select_policy ON budgets FOR SELECT USING (user_id = current_user_id());
CREATE POLICY budgets_insert_policy ON budgets FOR INSERT WITH CHECK (user_id = current_user_id());
CREATE POLICY budgets_update_policy ON budgets FOR UPDATE USING (user_id = current_user_id());
CREATE POLICY budgets_delete_policy ON budgets FOR DELETE USING (user_id = current_user_id());
CREATE POLICY daily_transactions_select_policy ON daily_transactions FOR SELECT USING (user_id = current_user_id());
CREATE POLICY daily_transactions_insert_policy ON daily_transactions FOR INSERT WITH CHECK (user_id = current_user_id());
CREATE POLICY daily_transactions_update_policy ON daily_transactions FOR UPDATE USING (user_id = current_user_id());
CREATE POLICY daily_transactions_delete_policy ON daily_transactions FOR DELETE USING (user_id = current_user_id());
CREATE POLICY badges_select_policy ON badges FOR SELECT USING (user_id = current_user_id());
CREATE POLICY milestones_select_policy ON milestones FOR SELECT USING (user_id = current_user_id());
CREATE POLICY settings_select_policy ON settings FOR SELECT USING (user_id = current_user_id());
CREATE POLICY settings_insert_policy ON settings FOR INSERT WITH CHECK (user_id = current_user_id());
CREATE POLICY settings_update_policy ON settings FOR UPDATE USING (user_id = current_user_id());
CREATE POLICY stats_select_policy ON stats FOR SELECT USING (user_id = current_user_id());
CREATE POLICY rewards_select_policy ON rewards FOR SELECT USING (user_id = current_user_id());
CREATE POLICY categories_select_policy ON categories FOR SELECT USING (user_id = current_user_id());
CREATE POLICY categories_insert_policy ON categories FOR INSERT WITH CHECK (user_id = current_user_id());
CREATE POLICY categories_update_policy ON categories FOR UPDATE USING (user_id = current_user_id());
CREATE POLICY categories_delete_policy ON categories FOR DELETE USING (user_id = current_user_id());
CREATE POLICY spending_limits_select_policy ON spending_limits FOR SELECT USING (user_id = current_user_id());
CREATE POLICY spending_limits_insert_policy ON spending_limits FOR INSERT WITH CHECK (user_id = current_user_id());
CREATE POLICY spending_limits_update_policy ON spending_limits FOR UPDATE USING (user_id = current_user_id());
CREATE POLICY spending_limits_delete_policy ON spending_limits FOR DELETE USING (user_id = current_user_id());

-- Analytics Views

-- Daily spending by category
CREATE OR REPLACE VIEW category_spending_daily AS
SELECT 
    dt.user_id,
    c.id as category_id,
    c.name as category_name,
    date(dt.transaction_time) as date,
    SUM(dt.amount) as total_amount,
    COUNT(*) as transaction_count
FROM daily_transactions dt
LEFT JOIN categories c ON dt.category_id = c.id
GROUP BY dt.user_id, c.id, c.name, date(dt.transaction_time);

-- Monthly spending trends
CREATE OR REPLACE VIEW monthly_spending_trends AS
SELECT 
    user_id,
    date_trunc('month', transaction_time) as month,
    SUM(amount) as total_spent,
    COUNT(*) as transaction_count,
    AVG(amount) as average_transaction
FROM daily_transactions
GROUP BY user_id, date_trunc('month', transaction_time);

-- Budget vs Actual spending
CREATE OR REPLACE VIEW budget_vs_actual AS
SELECT 
    b.user_id,
    b.id as budget_id,
    b.budget_amount,
    b.start_date,
    b.end_date,
    COALESCE(SUM(dt.amount), 0) as actual_spent,
    COUNT(dt.id) as transaction_count,
    CASE 
        WHEN b.end_date > NOW() THEN
            (CURRENT_DATE - b.start_date::date)::float / 
            (b.end_date::date - b.start_date::date)::float
        ELSE 1
    END as period_progress,
    CASE 
        WHEN b.end_date > NOW() THEN
            COALESCE(SUM(dt.amount), 0) / 
            ((CURRENT_DATE - b.start_date::date)::float / 
             (b.end_date::date - b.start_date::date)::float * b.budget_amount)
        ELSE COALESCE(SUM(dt.amount), 0) / b.budget_amount
    END as spending_ratio
FROM budgets b
LEFT JOIN daily_transactions dt ON 
    dt.user_id = b.user_id AND 
    dt.transaction_time >= b.start_date AND 
    dt.transaction_time <= b.end_date
GROUP BY b.user_id, b.id, b.budget_amount, b.start_date, b.end_date;

-- Category spending limits analysis
CREATE OR REPLACE VIEW category_limits_status AS
SELECT 
    sl.user_id,
    c.name as category_name,
    sl.amount as limit_amount,
    sl.period,
    COALESCE(SUM(dt.amount), 0) as spent_amount,
    CASE sl.period
        WHEN 'daily' THEN sl.amount
        WHEN 'weekly' THEN sl.amount / 7
        WHEN 'monthly' THEN sl.amount / 30
    END as daily_limit,
    COALESCE(SUM(dt.amount), 0) / sl.amount as limit_usage_ratio
FROM spending_limits sl
JOIN categories c ON sl.category_id = c.id
LEFT JOIN daily_transactions dt ON 
    dt.category_id = c.id AND
    dt.user_id = sl.user_id AND
    CASE sl.period
        WHEN 'daily' THEN dt.transaction_time::date = CURRENT_DATE
        WHEN 'weekly' THEN dt.transaction_time >= date_trunc('week', CURRENT_DATE)
        WHEN 'monthly' THEN dt.transaction_time >= date_trunc('month', CURRENT_DATE)
    END
GROUP BY sl.user_id, c.name, sl.amount, sl.period;
