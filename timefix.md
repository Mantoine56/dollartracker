# DollarTracker Time Handling Fix Plan

## Overview
This document outlines the plan to implement a UTC-first approach for time handling in the DollarTracker app, ensuring consistency with the existing database schema.

## 1. Database Schema Updates

### Create Migration File
Create a new migration file: `supabase/migrations/20250112_standardize_timestamps.sql`

```sql
-- Add timezone column to settings table (already has TIMESTAMPTZ)
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS user_timezone TEXT NOT NULL DEFAULT 'UTC';

-- Convert all TIMESTAMP columns to TIMESTAMPTZ
ALTER TABLE categories
ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';

ALTER TABLE users
ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';

ALTER TABLE budgets
ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';

-- Update budget date handling
ALTER TABLE budgets
ALTER COLUMN start_date TYPE TIMESTAMPTZ 
    USING (start_date::date + TIME '00:00:00') AT TIME ZONE 'UTC',
ALTER COLUMN end_date TYPE TIMESTAMPTZ 
    USING (end_date::date + TIME '23:59:59') AT TIME ZONE 'UTC';

-- Update daily_transactions table
ALTER TABLE daily_transactions
ALTER COLUMN transaction_time TYPE TIMESTAMPTZ USING transaction_time AT TIME ZONE 'UTC',
ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';

-- Update calculate_daily_allowance function to be timezone-aware
CREATE OR REPLACE FUNCTION calculate_daily_allowance(
    p_income_amount NUMERIC,
    p_income_frequency TEXT,
    p_fixed_expenses NUMERIC,
    p_savings_target NUMERIC,
    p_user_timezone TEXT DEFAULT 'UTC'
) RETURNS NUMERIC AS $$
DECLARE
    monthly_income NUMERIC;
    days_in_month NUMERIC;
    current_date_user TIMESTAMPTZ;
BEGIN
    -- Get current date in user's timezone
    current_date_user := CURRENT_TIMESTAMP AT TIME ZONE p_user_timezone;
    
    -- Calculate days in the current month based on user's timezone
    days_in_month := EXTRACT(DAYS FROM 
        (DATE_TRUNC('month', current_date_user) + INTERVAL '1 month - 1 day')::DATE);
    
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

-- Update daily_summary view to be timezone-aware
CREATE OR REPLACE VIEW daily_summary AS
SELECT 
    dt.user_id,
    c.id as category_id,
    c.name as category_name,
    (dt.transaction_time AT TIME ZONE COALESCE(s.user_timezone, 'UTC'))::DATE as date,
    SUM(dt.amount) as total_amount,
    COUNT(*) as transaction_count
FROM daily_transactions dt
JOIN categories c ON dt.category_id = c.id
JOIN settings s ON dt.user_id = s.user_id
GROUP BY dt.user_id, c.id, c.name, date
ORDER BY date DESC;

-- Add function to get user's current date
CREATE OR REPLACE FUNCTION get_user_current_date(p_user_timezone TEXT)
RETURNS DATE AS $$
BEGIN
    RETURN (CURRENT_TIMESTAMP AT TIME ZONE p_user_timezone)::DATE;
END;
$$ LANGUAGE plpgsql;

-- Add function to get start and end of day in UTC for a given local date
CREATE OR REPLACE FUNCTION get_day_bounds(
    p_local_date DATE,
    p_user_timezone TEXT
) RETURNS TABLE (day_start TIMESTAMPTZ, day_end TIMESTAMPTZ) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (p_local_date::TIMESTAMP AT TIME ZONE p_user_timezone) AT TIME ZONE 'UTC' as day_start,
        ((p_local_date + INTERVAL '1 day')::TIMESTAMP AT TIME ZONE p_user_timezone) AT TIME ZONE 'UTC' as day_end;
END;
$$ LANGUAGE plpgsql;

-- Update budget_summaries view to be timezone-aware
CREATE OR REPLACE VIEW budget_summaries AS
SELECT 
    b.user_id,
    b.income_amount,
    b.income_frequency,
    b.fixed_expenses,
    b.savings_target,
    b.spending_budget,
    b.daily_allowance,
    (b.start_date AT TIME ZONE COALESCE(s.user_timezone, 'UTC'))::DATE as start_date,
    (b.end_date AT TIME ZONE COALESCE(s.user_timezone, 'UTC'))::DATE as end_date
FROM budgets b
JOIN settings s ON b.user_id = s.user_id
WHERE b.end_date >= CURRENT_TIMESTAMP
ORDER BY b.start_date DESC;

COMMENT ON FUNCTION get_user_current_date IS 'Returns the current date in the user''s timezone';
COMMENT ON FUNCTION get_day_bounds IS 'Returns UTC timestamp bounds for a given local date';
COMMENT ON FUNCTION calculate_daily_allowance IS 'Calculates daily allowance considering user''s timezone';

## 2. Frontend Dependencies

### Install Required Packages
```bash
npm install date-fns-tz luxon --legacy-peer-deps
```

## 3. Time Utility Implementation

### Create Time Utility File
Create new file: `lib/utils/time.ts`

```typescript
import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';
import { DateTime } from 'luxon';

export interface TimeUtils {
  getUserTimezone(): string;
  toUTC(localDate: Date): Date;
  toLocal(utcDate: string | Date): Date;
  formatLocal(utcDate: string | Date, formatStr: string): string;
  startOfDay(date: Date): Date;
  endOfDay(date: Date): Date;
  isSameDay(date1: Date, date2: Date): boolean;
}

export const timeUtils: TimeUtils = {
  getUserTimezone: () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  },

  toUTC: (localDate: Date): Date => {
    const userTimezone = timeUtils.getUserTimezone();
    return zonedTimeToUtc(localDate, userTimezone);
  },

  toLocal: (utcDate: string | Date): Date => {
    const userTimezone = timeUtils.getUserTimezone();
    return utcToZonedTime(new Date(utcDate), userTimezone);
  },

  formatLocal: (utcDate: string | Date, formatStr: string): string => {
    const localDate = timeUtils.toLocal(utcDate);
    return format(localDate, formatStr, { timeZone: timeUtils.getUserTimezone() });
  },

  startOfDay: (date: Date): Date => {
    return DateTime.fromJSDate(date)
      .setZone(timeUtils.getUserTimezone())
      .startOf('day')
      .toJSDate();
  },

  endOfDay: (date: Date): Date => {
    return DateTime.fromJSDate(date)
      .setZone(timeUtils.getUserTimezone())
      .endOf('day')
      .toJSDate();
  },

  isSameDay: (date1: Date, date2: Date): boolean => {
    const dt1 = DateTime.fromJSDate(date1).setZone(timeUtils.getUserTimezone());
    const dt2 = DateTime.fromJSDate(date2).setZone(timeUtils.getUserTimezone());
    return dt1.hasSame(dt2, 'day');
  }
};
```

## 4. Database Service Updates

### Update Database Types
Update `types/database.ts`:

```typescript
export interface TimestampFields {
  created_at: string;
  updated_at: string;
  user_timezone: string;
}

export interface DailyTransaction extends TimestampFields {
  id: string;
  user_id: string;
  amount: number;
  category_id?: string;
  notes?: string;
  transaction_time: string; // UTC ISO string
}

export interface Budget extends TimestampFields {
  id: string;
  user_id: string;
  budget_amount: number;
  budget_period: 'daily' | 'weekly' | 'monthly';
  start_date: string; // UTC ISO string
  end_date: string; // UTC ISO string
}
```

### Update Database Service
Update `lib/database.ts`:

```typescript
import { timeUtils } from './utils/time';

export const transactionService = {
  async addTransaction(
    userId: string,
    amount: number,
    category_id?: string,
    notes?: string,
    localTransactionTime?: Date
  ): Promise<DailyTransaction | null> {
    const userTimezone = timeUtils.getUserTimezone();
    const utcTransactionTime = timeUtils.toUTC(localTransactionTime || new Date());

    const { data, error } = await supabase
      .from('daily_transactions')
      .insert({
        user_id: userId,
        amount,
        category_id,
        notes,
        transaction_time: utcTransactionTime.toISOString(),
        user_timezone: userTimezone
      })
      .select()
      .single();

    return error ? null : data;
  },

  async getDailyTransactions(userId: string, localDate: Date): Promise<DailyTransaction[]> {
    const startUtc = timeUtils.toUTC(timeUtils.startOfDay(localDate));
    const endUtc = timeUtils.toUTC(timeUtils.endOfDay(localDate));

    const { data, error } = await supabase
      .from('daily_transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('transaction_time', startUtc.toISOString())
      .lt('transaction_time', endUtc.toISOString())
      .order('transaction_time', { ascending: true });

    return error ? [] : data;
  }
};

export const budgetService = {
  async getCurrentBudget(userId: string): Promise<Budget | null> {
    const userTimezone = timeUtils.getUserTimezone();
    const nowUtc = timeUtils.toUTC(new Date());

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .lte('start_date', nowUtc.toISOString())
      .gte('end_date', nowUtc.toISOString())
      .single();

    return error ? null : data;
  }
};
```

## 5. Component Updates

### Update Home Screen
Update `app/(tabs)/index.tsx`:

```typescript
import { timeUtils } from '../../lib/utils/time';

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: transactions } = useDailyTransactions(selectedDate);

  return (
    // ... existing JSX
    <Text>
      {timeUtils.formatLocal(transaction.transaction_time, 'MMM d, yyyy h:mm a')}
    </Text>
    // ... rest of JSX
  );
}
```

### Update Transaction Form
Update `components/transactions/TransactionForm.tsx`:

```typescript
import { timeUtils } from '../../lib/utils/time';

export default function TransactionForm() {
  const [localDate, setLocalDate] = useState(new Date());

  const handleSubmit = async () => {
    await addTransaction({
      amount: parseFloat(amount),
      category_id: category,
      notes,
      transaction_time: localDate, // Will be converted to UTC in service
    });
  };
}
```

## 6. Testing Plan

### Unit Tests
Create `__tests__/utils/time.test.ts`:

```typescript
import { timeUtils } from '../../lib/utils/time';

describe('Time Utils', () => {
  test('UTC conversion maintains local time appearance', () => {
    const localDate = new Date('2025-01-12T12:00:00');
    const utcDate = timeUtils.toUTC(localDate);
    const backToLocal = timeUtils.toLocal(utcDate);
    
    expect(backToLocal.getHours()).toBe(localDate.getHours());
    expect(backToLocal.getMinutes()).toBe(localDate.getMinutes());
  });

  test('Day boundaries respect timezone', () => {
    const date = new Date('2025-01-12T00:30:00');
    const startOfDay = timeUtils.startOfDay(date);
    const endOfDay = timeUtils.endOfDay(date);
    
    expect(timeUtils.isSameDay(date, startOfDay)).toBe(true);
    expect(timeUtils.isSameDay(date, endOfDay)).toBe(true);
  });
});
```

### Integration Tests
Create `__tests__/integration/transactions.test.ts`:

```typescript
describe('Transaction Management', () => {
  test('Transactions maintain correct local time after storage', async () => {
    const localTime = new Date('2025-01-12T15:30:00');
    const transaction = await transactionService.addTransaction(
      'test-user',
      100,
      'food',
      'Test transaction',
      localTime
    );

    const retrieved = await transactionService.getDailyTransactions(
      'test-user',
      localTime
    );

    const retrievedLocalTime = timeUtils.toLocal(retrieved[0].transaction_time);
    expect(retrievedLocalTime.getHours()).toBe(localTime.getHours());
    expect(retrievedLocalTime.getMinutes()).toBe(localTime.getMinutes());
  });
});
```

## 7. Implementation Steps

1. Database Migration
- [ ] Back up existing data
- [ ] Apply UTC timezone migration
- [ ] Verify data integrity after migration

2. Frontend Updates
- [ ] Install time-handling dependencies
- [ ] Implement time utilities
- [ ] Update all components to use time utilities
- [ ] Add timezone awareness to forms and displays

3. Testing
- [ ] Run unit tests for time utilities
- [ ] Test timezone handling across components
- [ ] Verify budget calculations across timezone boundaries
- [ ] Test daylight savings transitions

4. Deployment
- [ ] Deploy database changes
- [ ] Deploy frontend updates
- [ ] Monitor for timezone-related issues

## 8. Rollback Plan

### Database Rollback
```sql
-- Revert timezone changes if needed
ALTER TABLE daily_transactions
ALTER COLUMN transaction_time TYPE TIMESTAMP,
ALTER COLUMN created_at TYPE TIMESTAMP,
ALTER COLUMN updated_at TYPE TIMESTAMP,
DROP COLUMN IF EXISTS user_timezone;

-- Similar ALTER statements for other tables
```

### Code Rollback
- Maintain git tags for pre-UTC changes
- Keep backup of timezone data

## 9. Monitoring and Validation

1. Add Logging
```typescript
const logTimeConversion = (utc: Date, local: Date, timezone: string) => {
  console.log({
    utc: utc.toISOString(),
    local: local.toISOString(),
    timezone,
    offset: local.getTimezoneOffset()
  });
};
```

2. Analytics
- Track timezone distribution
- Monitor transaction time patterns
- Alert on timezone conversion errors

## 10. Future Considerations

1. Multi-timezone Support
- Support for shared budgets across timezones
- Timezone-aware notifications
- Global spending analytics

2. Performance Optimization
- Cache timezone calculations
- Batch timezone conversions
- Optimize database queries for timezone operations
