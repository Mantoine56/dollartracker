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

## Implementation Status Update

### Completed Features
- [x] Budget Wizard UI
  - [x] Income Setup Screen
    - [x] Monthly income input with validation
    - [x] Payment frequency selection
    - [x] Real-time income conversion
  - [x] Spending Setup Screen
    - [x] Fixed expenses input with validation
    - [x] Monthly savings target with validation
    - [x] Real-time budget validation
  - [x] Budget Review Screen
    - [x] Summary cards for fixed expenses and savings
    - [x] Monthly spending budget calculation
    - [x] Daily allowance calculation
    - [x] Consistent UI with proper spacing
- [x] State Management
  - [x] Budget context with reducer
  - [x] Proper state persistence
  - [x] Type-safe actions and state
- [x] Navigation
  - [x] Proper modal setup
  - [x] Step-based navigation
  - [x] Progress indicator
- [x] Validation & Error Handling
  - [x] Income validation
  - [x] Expenses and savings validation
  - [x] Error messages and UI feedback
- [x] Supabase Integration
  - [x] Created budget service
  - [x] Added error handling
  - [x] Implemented loading states
  - [x] Connected to budget context

### Next Steps
1. Analytics & Insights
   - [ ] Add budget usage tracking
   - [ ] Implement spending trends
   - [ ] Add budget adjustment recommendations

2. UI Enhancements
   - [ ] Add animations for transitions
   - [ ] Implement haptic feedback
   - [ ] Add success celebration on completion

3. Additional Features
   - [ ] Budget history tracking
   - [ ] Category-based budget allocation
   - [ ] Budget adjustment workflow

## Technical Details

### State Structure
```typescript
interface BudgetState {
  income: {
    amount: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
  };
  fixedExpenses: number;
  savingsTarget: number;
  spendingBudget: number;
  dailyAllowance: number;
  isLoading: boolean;
  error: string | null;
}
```

### Key Components
1. `BudgetProvider`: Context provider for budget state
2. `IncomeSetup`: Handles income input and frequency
3. `SpendingSetup`: Manages expenses and savings
4. `BudgetReview`: Displays summary and saves budget

### Validation Rules
1. Income Validation
   - Must be greater than 0
   - Must be a valid number
   - Proper frequency conversion

2. Expenses & Savings Validation
   - Cannot exceed monthly income
   - Must be valid numbers
   - Real-time total calculation

3. Budget Calculations
   - Monthly spending = Income - Fixed Expenses - Savings
   - Daily allowance = Monthly spending / days in month

### UI/UX Considerations
1. Layout
   - All content visible without scrolling
   - Consistent card sizes and spacing
   - Clear visual hierarchy

2. Navigation
   - Back/Continue buttons always visible
   - Clear progress indication
   - Smooth transitions

3. Error Handling
   - Inline validation
   - Clear error messages
   - Proper error states

4. Accessibility
   - Proper contrast
   - Clear labels
   - Keyboard navigation support

## Changelog

### January 2, 2025 - Implementation Started

#### Completed
- [x] Initial Modal Structure Setup
  - [x] Created budget wizard layout with Expo Router
  - [x] Set up modal presentation with slide animation
  - [x] Added progress bar and step navigation
  - [x] Created initial Income Setup screen

- [x] State Management
  - [x] Created budget context with TypeScript interfaces
  - [x] Implemented reducer for state management
  - [x] Added daily allowance calculations

- [x] Basic Components
  - [x] Income Setup Screen with frequency selection
  - [x] Spending Setup Screen with validation
  - [x] Budget Review Screen with summary
  - [x] Connected components to budget context

- [x] Supabase Integration
  - [x] Created budget service
  - [x] Added error handling
  - [x] Implemented loading states
  - [x] Connected to budget context

- [x] Form Validation & UI Polish
  - [x] Added Zod schemas for input validation
  - [x] Implemented currency formatting
  - [x] Added animations with react-native-reanimated
  - [x] Added settings page access
  - [x] Improved error handling and feedback

#### Next Up
- [ ] Testing Implementation
  - [ ] Unit tests for calculations and validation
  - [ ] Integration tests for wizard flow
  - [ ] E2E tests with Supabase

#### Backlog
- [ ] Analytics Integration
- [ ] Error Boundary Setup
- [ ] Accessibility Improvements
