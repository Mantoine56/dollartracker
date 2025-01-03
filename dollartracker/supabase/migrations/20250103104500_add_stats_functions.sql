-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_spending_by_category(UUID, TIMESTAMP, TIMESTAMP);
DROP FUNCTION IF EXISTS public.get_spending_by_category(UUID);
DROP FUNCTION IF EXISTS public.get_daily_spending_patterns(UUID, TIMESTAMP, TIMESTAMP);
DROP FUNCTION IF EXISTS public.get_daily_spending_patterns(UUID);

-- Create function to get spending by category
CREATE OR REPLACE FUNCTION public.get_spending_by_category(
    p_user_id UUID,
    p_start_date TIMESTAMP DEFAULT NULL,
    p_end_date TIMESTAMP DEFAULT NULL
) RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    category_icon TEXT,
    category_color TEXT,
    total_amount NUMERIC,
    transaction_count BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_start_date TIMESTAMP;
    v_end_date TIMESTAMP;
BEGIN
    -- Set default date range if not provided
    v_start_date := COALESCE(p_start_date, NOW() - INTERVAL '365 days');
    v_end_date := COALESCE(p_end_date, NOW());

    RETURN QUERY
    WITH user_transactions AS (
        SELECT dt.* 
        FROM daily_transactions dt
        WHERE dt.user_id = p_user_id
            AND dt.transaction_time >= v_start_date
            AND dt.transaction_time <= v_end_date
    )
    SELECT 
        c.id as category_id,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        COALESCE(SUM(ut.amount), 0) as total_amount,
        COUNT(ut.id) as transaction_count
    FROM categories c
    LEFT JOIN user_transactions ut ON ut.category_id = c.id
    WHERE (c.user_id = p_user_id OR c.user_id IS NULL)  -- Handle both legacy and new categories
        AND c.is_system = true
    GROUP BY c.id, c.name, c.icon, c.color
    HAVING COUNT(ut.id) > 0  -- Only show categories with transactions
    ORDER BY total_amount DESC;
END;
$$;

-- Create function to get daily spending patterns
CREATE OR REPLACE FUNCTION public.get_daily_spending_patterns(
    p_user_id UUID,
    p_start_date TIMESTAMP DEFAULT NULL,
    p_end_date TIMESTAMP DEFAULT NULL
) RETURNS TABLE (
    day_of_week TEXT,
    hour_of_day INTEGER,
    total_amount NUMERIC,
    transaction_count BIGINT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_start_date TIMESTAMP;
    v_end_date TIMESTAMP;
BEGIN
    -- Set default date range if not provided
    v_start_date := COALESCE(p_start_date, NOW() - INTERVAL '365 days');
    v_end_date := COALESCE(p_end_date, NOW());

    RETURN QUERY
    SELECT 
        to_char(transaction_time, 'Day') as day_of_week,
        EXTRACT(HOUR FROM transaction_time)::INTEGER as hour_of_day,
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(id) as transaction_count
    FROM daily_transactions
    WHERE user_id = p_user_id
        AND transaction_time >= v_start_date
        AND transaction_time <= v_end_date
    GROUP BY 
        to_char(transaction_time, 'Day'),
        EXTRACT(HOUR FROM transaction_time)
    ORDER BY 
        MIN(EXTRACT(DOW FROM transaction_time)),
        hour_of_day;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_spending_by_category TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_spending_patterns TO authenticated;
