import { createContext, useContext, useReducer, ReactNode } from 'react';
import { createBudget, updateBudget, getCurrentBudget, BudgetError } from '../../../../lib/services/budget-service';
import { BudgetSummary, PaymentFrequency } from '../../../../lib/types/budget';

interface BudgetState {
  income: {
    amount: number;
    frequency: PaymentFrequency;
  };
  fixedExpenses: number;
  savingsTarget: number;
  spendingBudget: number;
  dailyAllowance: number;
  error: string | null;
  isLoading: boolean;
}

type BudgetAction =
  | { type: 'SET_INCOME'; payload: { amount: number; frequency: PaymentFrequency } }
  | { type: 'SET_EXPENSES_AND_SAVINGS'; payload: { expenses: number; savings: number } }
  | { type: 'CALCULATE_BUDGET' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SAVE_BUDGET_SUCCESS' };

const initialState: BudgetState = {
  income: {
    amount: 0,
    frequency: 'monthly',
  },
  fixedExpenses: 0,
  savingsTarget: 0,
  spendingBudget: 0,
  dailyAllowance: 0,
  error: null,
  isLoading: false,
};

function calculateDailyAllowance(monthlySpendingBudget: number): number {
  const averageDaysInMonth = 30.4375;
  return monthlySpendingBudget / averageDaysInMonth;
}

function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
  console.log('Budget reducer:', { action, currentState: state });
  
  switch (action.type) {
    case 'SET_INCOME': {
      console.log('Setting income:', action.payload);
      return {
        ...state,
        income: {
          amount: action.payload.amount,
          frequency: action.payload.frequency,
        },
        error: null,
      };
    }
    
    case 'SET_EXPENSES_AND_SAVINGS': {
      console.log('Setting expenses and savings:', action.payload);
      return {
        ...state,
        fixedExpenses: action.payload.expenses,
        savingsTarget: action.payload.savings,
        error: null,
      };
    }
    
    case 'CALCULATE_BUDGET': {
      const spendingBudget = state.income.amount - state.fixedExpenses - state.savingsTarget;
      console.log('Calculating budget:', {
        income: state.income.amount,
        expenses: state.fixedExpenses,
        savings: state.savingsTarget,
        spendingBudget,
      });
      
      return {
        ...state,
        spendingBudget: Math.max(0, spendingBudget),
        dailyAllowance: calculateDailyAllowance(Math.max(0, spendingBudget)),
        error: null,
      };
    }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'SAVE_BUDGET_SUCCESS':
      return {
        ...state,
        isLoading: false,
        error: null,
      };
    
    default:
      return state;
  }
}

interface BudgetContextValue {
  state: BudgetState;
  dispatch: React.Dispatch<BudgetAction>;
  saveBudget: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  const saveBudget = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const budgetSummary: BudgetSummary = {
        monthlyIncome: state.income.amount,
        fixedExpenses: state.fixedExpenses,
        savingsTarget: state.savingsTarget,
        spendingBudget: state.spendingBudget,
        dailyAllowance: state.dailyAllowance,
        paymentFrequency: state.income.frequency,
      };

      const currentBudget = await getCurrentBudget();
      
      if (currentBudget) {
        await updateBudget(currentBudget.id, budgetSummary);
      } else {
        await createBudget(budgetSummary);
      }

      dispatch({ type: 'SAVE_BUDGET_SUCCESS' });
    } catch (error) {
      const message = error instanceof BudgetError ? error.message : 'Failed to save budget';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  return (
    <BudgetContext.Provider value={{ state, dispatch, saveBudget }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}

export default BudgetProvider;
