-- First, drop existing policies if any exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can create their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.daily_transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.daily_transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.daily_transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.daily_transactions;
DROP POLICY IF EXISTS "Users can view their own badges" ON public.badges;
DROP POLICY IF EXISTS "Only system can create badges" ON public.badges;
DROP POLICY IF EXISTS "Users can view their own milestones" ON public.milestones;
DROP POLICY IF EXISTS "Only system can create milestones" ON public.milestones;
DROP POLICY IF EXISTS "Users can view their own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can create their settings" ON public.settings;
DROP POLICY IF EXISTS "Users can view their own stats" ON public.stats;
DROP POLICY IF EXISTS "Only system can create stats" ON public.stats;
DROP POLICY IF EXISTS "Users can view their own rewards" ON public.rewards;
DROP POLICY IF EXISTS "Only system can create rewards" ON public.rewards;

-- Enable Row Level Security for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Budgets table policies
CREATE POLICY "Users can view their own budgets"
    ON public.budgets
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budgets"
    ON public.budgets
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
    ON public.budgets
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
    ON public.budgets
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Daily transactions policies
CREATE POLICY "Users can view their own transactions"
    ON public.daily_transactions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
    ON public.daily_transactions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
    ON public.daily_transactions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
    ON public.daily_transactions
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Badges policies
CREATE POLICY "Users can view their own badges"
    ON public.badges
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can manage badges"
    ON public.badges
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Milestones policies
CREATE POLICY "Users can view their own milestones"
    ON public.milestones
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can manage milestones"
    ON public.milestones
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Settings policies
CREATE POLICY "Users can view their own settings"
    ON public.settings
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON public.settings
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their settings"
    ON public.settings
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Stats policies
CREATE POLICY "Users can view their own stats"
    ON public.stats
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can manage stats"
    ON public.stats
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Rewards policies
CREATE POLICY "Users can view their own rewards"
    ON public.rewards
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can manage rewards"
    ON public.rewards
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true); 