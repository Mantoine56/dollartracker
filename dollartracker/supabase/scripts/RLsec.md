-- Row level security

-- Enable Row Level Security for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Budgets table policies
CREATE POLICY "Users can view their own budgets"
    ON budgets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budgets"
    ON budgets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
    ON budgets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
    ON budgets FOR DELETE
    USING (auth.uid() = user_id);

-- Daily transactions policies
CREATE POLICY "Users can view their own transactions"
    ON daily_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
    ON daily_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
    ON daily_transactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
    ON daily_transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Badges policies
CREATE POLICY "Users can view their own badges"
    ON badges FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Only system can create badges"
    ON badges FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Milestones policies
CREATE POLICY "Users can view their own milestones"
    ON milestones FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Only system can create milestones"
    ON milestones FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can view their own settings"
    ON settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their settings"
    ON settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Stats policies
CREATE POLICY "Users can view their own stats"
    ON stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Only system can create stats"
    ON stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Rewards policies
CREATE POLICY "Users can view their own rewards"
    ON rewards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Only system can create rewards"
    ON rewards FOR INSERT
    WITH CHECK (auth.uid() = user_id); 