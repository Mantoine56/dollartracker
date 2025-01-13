import { z } from 'zod';
import { PaymentFrequency } from '../types/budget';

export const budgetSchema = {
  income: z.object({
    amount: z
      .number({
        required_error: 'Monthly income is required',
        invalid_type_error: 'Monthly income must be a number',
      })
      .positive('Income must be greater than 0')
      .max(1000000, 'Income seems unusually high'),
    frequency: z.enum(['weekly', 'biweekly', 'monthly'] as const, {
      required_error: 'Payment frequency is required',
    }),
  }),

  expenses: z.object({
    fixedExpenses: z
      .number({
        required_error: 'Fixed expenses amount is required',
        invalid_type_error: 'Fixed expenses must be a number',
      })
      .min(0, 'Fixed expenses cannot be negative')
      .max(1000000, 'Expenses amount seems unusually high'),
    savingsTarget: z
      .number({
        required_error: 'Savings target is required',
        invalid_type_error: 'Savings target must be a number',
      })
      .min(0, 'Savings target cannot be negative')
      .max(1000000, 'Savings target seems unusually high'),
  }).refine(
    (data) => {
      const total = data.fixedExpenses + data.savingsTarget;
      return total >= 0 && total <= 1000000;
    },
    {
      message: 'Combined expenses and savings cannot exceed $1,000,000',
    }
  ),
};

export type IncomeSchema = z.infer<typeof budgetSchema.income>;
export type ExpensesSchema = z.infer<typeof budgetSchema.expenses>;
