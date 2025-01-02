# Budget Setup Implementation Plan

## Overview
The budget setup process focuses on determining the user's disposable income for daily spending. It calculates this by subtracting fixed expenses and savings goals from total income, resulting in a daily spending allowance.

## Components Structure

### 1. Budget Wizard Modal
```
/app/modals/
  budget-wizard/
    _layout.tsx           # Modal configuration
    index.tsx            # Wizard container
    components/
      income-setup.tsx   # Income details
      spending-setup.tsx # Fixed expenses and savings
      budget-review.tsx  # Final review and confirmation
    hooks/
      use-budget-wizard.ts
    types/
      wizard-types.ts
```

## Database Updates

### 1. Simplify Budget Table
```sql
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    monthly_income NUMERIC NOT NULL,
    fixed_expenses NUMERIC NOT NULL,
    savings_target NUMERIC NOT NULL,
    spending_budget NUMERIC NOT NULL, -- This is what we'll use for daily allowance
    budget_period TEXT CHECK (budget_period IN ('monthly', 'weekly', 'biweekly')) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Wizard Flow

### Step 1: Income Setup
- Monthly Income Input
  - "What's your monthly income?"
  - For variable income: "What's your average monthly income over the last 3 months?"
- Income Frequency
  - "How often do you get paid?" (weekly/biweekly/monthly)
  - Used for budget period alignment, not calculations

### Step 2: Fixed Expenses & Savings
- Single Input for Total Fixed Expenses
  - "What's your total monthly fixed expenses? (rent, bills, subscriptions, etc.)"
- Savings Target
  - "How much would you like to save each month?"

### Step 3: Budget Review & Confirmation
- Summary showing:
  - Monthly Income
  - Fixed Expenses
  - Savings Target
  - Available for Daily Spending
  - Calculated Daily Allowance
- Option to adjust any values
- Clear visualization of daily spending allowance

## Technical Implementation

### 1. State Management
```typescript
interface BudgetWizardState {
  step: number;
  income: {
    amount: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
  };
  expenses: number;
  savings: number;
  calculatedBudget: {
    monthlySpendingBudget: number;
    dailyAllowance: number;
  };
}
```

### 2. Budget Calculations
```typescript
function calculateDailyAllowance(
  monthlyIncome: number,
  fixedExpenses: number,
  savingsTarget: number,
  daysInPeriod: number
): number {
  const availableForSpending = monthlyIncome - fixedExpenses - savingsTarget;
  return availableForSpending / daysInPeriod;
}
```

### 3. Validation Rules
- All numeric inputs must be positive
- Fixed expenses + savings cannot exceed income
- Minimum spending budget of $1/day required

## UI/UX Considerations

### 1. Input Format
- Currency input with proper formatting
- Large, clear numeric keypad
- Immediate feedback on remaining budget

### 2. Visual Feedback
- Progress indicator
- Real-time daily allowance calculation
- Clear error states
- Success animations

## Integration Points

### 1. Account Creation
```typescript
export function useSignUpFlow() {
  const router = useRouter();
  
  const onSignUpComplete = () => {
    router.push("/modals/budget-wizard");
  };
}
```

### 2. Settings Access
```typescript
export function BudgetSettings() {
  const router = useRouter();
  
  const updateBudget = () => {
    router.push("/modals/budget-wizard?mode=edit");
  };
}
```

## Testing Strategy

### 1. Unit Tests
- Budget calculations
- Input validation
- State management

### 2. Integration Tests
- Complete wizard flow
- Database updates
- Navigation

### 3. E2E Tests
- Full setup process
- Budget updates
- Daily allowance display

## Performance Considerations

### 1. Optimizations
- Memoized calculations
- Debounced updates
- Efficient form state

### 2. Analytics
- Completion rate
- Average setup time
- Common adjustment points
