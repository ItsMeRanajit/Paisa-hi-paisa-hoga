import {
  UserProfile,
  BankAccount,
  CreditCard,
  CreditTransaction,
  FutureGoal,
  BankMonthlyData,
  OptionalExpense,
  UnplannedExpense,
} from '../types/finance';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'My Workspace',
  mobileNumber: '',
  currency: '₹',
  unplannedSpendingLimit: 20000,
};

export const INITIAL_BANKS: BankAccount[] = [];

export const INITIAL_CREDIT_CARDS: CreditCard[] = [];

export const INITIAL_FUTURE_GOALS: FutureGoal[] = [];

export const INITIAL_MONTHLY_DATA: Record<string, Record<string, BankMonthlyData>> = {};

export const INITIAL_UNPLANNED_EXPENSES: UnplannedExpense[] = [];

export const INITIAL_CREDIT_TRANSACTIONS: CreditTransaction[] = [];

export const INITIAL_OPTIONAL_EXPENSES: OptionalExpense[] = [];
