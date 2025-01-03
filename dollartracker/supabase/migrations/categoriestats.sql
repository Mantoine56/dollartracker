CREATE OR REPLACE FUNCTION get_spending_by_category(
    p_user_id UUID,
    p_start_date TIMESTAMP DEFAULT NOW() - INTERVAL '365 days',
    p_end_date TIMESTAMP DEFAULT NOW()
) RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    category_icon TEXT,
    category_color TEXT,
    total_amount NUMERIC,
    transaction_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id AS category_id,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        SUM(dt.amount) AS total_amount,
        COUNT(dt.id) AS transaction_count
    FROM 
        public.daily_transactions dt
    JOIN 
        public.categories c ON dt.category_id = c.id
    WHERE 
        dt.user_id = p_user_id
        AND dt.transaction_time BETWEEN COALESCE(p_start_date, NOW() - INTERVAL '365 days') AND COALESCE(p_end_date, NOW())
    GROUP BY 
        c.id
    ORDER BY 
        total_amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_daily_spending_patterns(
    p_user_id UUID,
    p_start_date TIMESTAMP DEFAULT NOW() - INTERVAL '365 days',
    p_end_date TIMESTAMP DEFAULT NOW()
) RETURNS TABLE (
    day_of_week TEXT,
    hour_of_day INTEGER,
    total_amount NUMERIC,
    transaction_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(dt.transaction_time, 'Day') AS day_of_week,
        EXTRACT(HOUR FROM dt.transaction_time)::INTEGER AS hour_of_day,
        SUM(dt.amount) AS total_amount,
        COUNT(dt.id) AS transaction_count
    FROM 
        public.daily_transactions dt
    WHERE 
        dt.user_id = p_user_id
        AND dt.transaction_time BETWEEN COALESCE(p_start_date, NOW() - INTERVAL '365 days') AND COALESCE(p_end_date, NOW())
    GROUP BY 
        TO_CHAR(dt.transaction_time, 'Day'),
        EXTRACT(HOUR FROM dt.transaction_time)
    ORDER BY 
        CASE 
            WHEN TO_CHAR(dt.transaction_time, 'Day') = 'Sunday   ' THEN 1
            WHEN TO_CHAR(dt.transaction_time, 'Day') = 'Monday   ' THEN 2
            WHEN TO_CHAR(dt.transaction_time, 'Day') = 'Tuesday  ' THEN 3
            WHEN TO_CHAR(dt.transaction_time, 'Day') = 'Wednesday' THEN 4
            WHEN TO_CHAR(dt.transaction_time, 'Day') = 'Thursday ' THEN 5
            WHEN TO_CHAR(dt.transaction_time, 'Day') = 'Friday   ' THEN 6
            WHEN TO_CHAR(dt.transaction_time, 'Day') = 'Saturday ' THEN 7
        END,
        hour_of_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_spending_by_category(UUID, TIMESTAMP, TIMESTAMP) TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_spending_patterns(UUID, TIMESTAMP, TIMESTAMP) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_daily_transactions_user_id ON public.daily_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_transactions_transaction_time ON public.daily_transactions(transaction_time);