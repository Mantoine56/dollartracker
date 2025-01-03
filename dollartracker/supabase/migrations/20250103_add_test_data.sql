-- Add test transactions to existing categories
WITH category_ids AS (
    SELECT id, name 
    FROM categories 
    WHERE user_id = 'b6fa2930-db15-4d3b-b46a-1233ae848173'::uuid
        AND is_system = true
)
INSERT INTO daily_transactions (user_id, transaction_time, amount, category_id, notes)
SELECT 
    'b6fa2930-db15-4d3b-b46a-1233ae848173'::uuid,
    timestamp '2024-01-01' + (random() * (timestamp '2024-12-31' - timestamp '2024-01-01')),
    (random() * 100 + 10)::numeric(10,2),
    id,
    'Test transaction for ' || name
FROM category_ids
CROSS JOIN generate_series(1, 5);  -- 5 transactions per category
