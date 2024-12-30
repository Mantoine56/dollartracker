-- Dollartracker App Schema for Supabase

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- For securely storing hashed passwords
    name TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    budget_amount NUMERIC NOT NULL,
    budget_period TEXT CHECK (budget_period IN ('monthly', 'weekly', 'biweekly')) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE daily_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_time TIMESTAMP NOT NULL DEFAULT NOW(),
    amount NUMERIC NOT NULL,
    category TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    milestone_name TEXT NOT NULL,
    milestone_date DATE NOT NULL,
    progress_percentage NUMERIC DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    earned_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    theme TEXT CHECK (theme IN ('light', 'dark')) DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    custom_budget_period TEXT CHECK (custom_budget_period IN ('monthly', 'weekly', 'biweekly')) DEFAULT 'monthly',
    export_preferences TEXT CHECK (export_preferences IN ('CSV', 'PDF')) DEFAULT 'CSV',
    email_notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
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

-- Helper Views and Functions
-- View for summarizing daily transactions
CREATE VIEW daily_summary AS
SELECT 
    user_id,
    date(transaction_time) AS date,
    SUM(amount) AS total_spent
FROM daily_transactions
GROUP BY user_id, date(transaction_time);

-- Triggers for updating updated_at fields
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