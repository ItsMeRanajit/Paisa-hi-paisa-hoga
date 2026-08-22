export type NavigationTab = 'home' | 'banks' | 'credit_cards' | 'goals' | 'analysis' | 'profile';

export interface UserProfile {
  name: string;
  mobileNumber: string;
  currency: string;
  unplannedSpendingLimit: number;
}

export interface BankAccount {
  id: string;
  bankName: string;
  nickname: string;
  accountNumberMasked?: string;
  color: string;
  plannedCategories: PlannedExpenseMaster[]; // Master planned categories & default amounts for this bank
  createdAt: string;
}

export interface PlannedExpenseMaster {
  id: string;
  category: string;
  amountSet: number; // default budget amount
}

export interface PlannedExpenseMonthValue {
  masterId: string;
  category: string; // snapshot/override
  amountSet: number; // override if changed for specific month
  amountSpent: number;
}

export interface OptionalExpense {
  id: string;
  bankId: string;
  month: string; // 'YYYY-MM'
  title: string;
  amountSet: number;
  amountSpent: number;
  dueDate?: string; // e.g. "2026-08-25" or day number
  notes?: string;
  isPaid: boolean;
  createdAt: string;
}

export interface UnplannedExpense {
  id: string;
  bankId: string;
  month: string; // 'YYYY-MM'
  day: number; // 1 to 31
  fullDate: string; // e.g. "14 August 2026"
  description: string;
  amount: number;
  notes: string;
  createdAt: string;
}

export interface BankMonthlyData {
  bankId: string;
  month: string; // 'YYYY-MM'
  monthlyIncome: number;
  amountAtBank: number;
  plannedExpenseValues: Record<string, { amountSet?: number; amountSpent: number }>; // keyed by masterId
  unplannedExpenseIds: string[];
}

export interface CreditCard {
  id: string;
  cardName: string;
  issuer: string;
  nickname: string;
  creditLimit: number;
  billingCycleStart: number; // Day of month (e.g. 12)
  billingCycleEnd: number; // Day of month (e.g. 11)
  cardColor: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  createdAt: string;
}

export type CreditExpenseType = 'essential' | 'non_essential';

export interface CreditTransaction {
  id: string;
  cardId: string;
  month: string; // 'YYYY-MM'
  date: string; // formatted e.g. "12 Aug 2026"
  day: number;
  category: string;
  description: string;
  amount: number;
  expenseType: CreditExpenseType;
  createdAt: string;
}

export type GoalAllocationType = 'monthly_saving' | 'planned_expense_cut';

export interface MonthlySavingAllocation {
  id: string;
  type: 'monthly_saving';
  bankId: string;
  monthlyTarget: number;
  purpose: string;
  expectedExpenseDate: string;
}

export interface PlannedExpenseCutAllocation {
  id: string;
  type: 'planned_expense_cut';
  bankId: string;
  plannedExpenseCategory: string;
  monthlyReductionAmount: number;
  purpose: string;
  expectedExpenseDate: string;
}

export type GoalAllocation = MonthlySavingAllocation | PlannedExpenseCutAllocation;
export type GoalAllocationInput = Omit<MonthlySavingAllocation, 'id'> | Omit<PlannedExpenseCutAllocation, 'id'>;

export type GoalStatus = 'in_progress' | 'completed' | 'on_track' | 'lagging';

export interface FutureGoal {
  id: string;
  goalName: string;
  description: string;
  targetAmount: number;
  expectedExpenseDate: string;
  monthlyTarget: number;
  actualSaved: number;
  isManualSuccess: boolean;
  status: GoalStatus;
  allocations: GoalAllocation[];
  createdAt: string;
}

export interface GoalMonthlyRecord {
  goalId: string;
  month: string; // 'YYYY-MM'
  actualSavedThisMonth: number;
  isCompletedThisMonth?: boolean;
}

export interface FinancialAlert {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  source: 'bank' | 'card' | 'goal' | 'budget';
  sourceId?: string;
  actionTab?: NavigationTab;
}

export interface BankCalculations {
  monthlyIncome: number;
  amountAtBank: number;
  totalSpendingPool: number;
  plannedTotalSet: number;
  plannedTotalSpent: number;
  plannedRemaining: number;
  optionalTotalSet: number;
  optionalTotalSpent: number;
  optionalRemaining: number;
  remainingBankAmount: number; // totalSpendingPool - plannedTotalSpent - optionalTotalSpent
  unplannedTotal: number;
  finalMonthlyRemaining: number; // totalSpendingPool - plannedTotalSpent - optionalTotalSpent - unplannedTotal
  plannedSpendingPercentage: number;
  optionalSpendingPercentage: number;
  unplannedSpendingPercentage: number;
  totalSpendingPercentage: number;
  remainingMoneyPercentage: number;
  unplannedLimit: number;
  unplannedLimitUtilization: number;
  unplannedLimitStatus: 'normal' | 'approaching_limit' | 'limit_reached' | 'limit_exceeded';
  budgetUtilizationPercentage: number;
  plannedRows: Array<{
    masterId: string;
    category: string;
    amountSet: number;
    amountSpent: number;
    remaining: number;
    utilizationPercent: number;
    isOverBudget: boolean;
  }>;
  optionalRows: OptionalExpense[];
}

export interface AggregateBankCalculations {
  totalIncome: number;
  totalAmountAtBank: number;
  totalSpendingPool: number;
  totalPlannedSpent: number;
  totalPlannedSet: number;
  totalOptionalSpent: number;
  totalOptionalSet: number;
  totalUnplannedSpent: number;
  totalRemainingMoney: number;
  overallSavingsRate: number;
}

export interface CreditCardCalculations {
  creditLimit: number;
  currentOutstanding: number;
  remainingLimit: number;
  utilizationPercentage: number;
  utilizationStatus: 'healthy_below_30_percent' | 'warning_near_30_percent' | 'high_above_30_percent';
  essentialAmount: number;
  essentialPercentage: number;
  nonEssentialAmount: number;
  nonEssentialPercentage: number;
  totalTransactionsCount: number;
}
