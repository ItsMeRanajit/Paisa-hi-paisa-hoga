import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  UserProfile,
  BankAccount,
  CreditCard,
  CreditTransaction,
  FutureGoal,
  BankMonthlyData,
  OptionalExpense,
  UnplannedExpense,
  NavigationTab,
  PlannedExpenseMaster,
  GoalAllocation,
  GoalAllocationInput,
} from '../types/finance';
import {
  INITIAL_USER_PROFILE,
  INITIAL_BANKS,
  INITIAL_CREDIT_CARDS,
  INITIAL_FUTURE_GOALS,
  INITIAL_MONTHLY_DATA,
  INITIAL_OPTIONAL_EXPENSES,
  INITIAL_UNPLANNED_EXPENSES,
  INITIAL_CREDIT_TRANSACTIONS,
} from '../utils/mockData';
import { getCurrentMonthString, formatDayWithMonth } from '../utils/formatters';

interface FinanceState {
  userProfile: UserProfile;
  activeMonth: string; // 'YYYY-MM'
  activeTab: NavigationTab;
  selectedBankId: string | null;
  selectedCardId: string | null;

  banks: BankAccount[];
  monthlyData: Record<string, Record<string, BankMonthlyData>>; // month -> bankId -> data
  optionalExpenses: OptionalExpense[];
  unplannedExpenses: UnplannedExpense[];

  creditCards: CreditCard[];
  creditTransactions: CreditTransaction[];

  goals: FutureGoal[];

  // Actions
  setActiveMonth: (month: string) => void;
  setActiveTab: (tab: NavigationTab) => void;
  setSelectedBankId: (bankId: string | null) => void;
  setSelectedCardId: (cardId: string | null) => void;

  updateUserProfile: (profile: Partial<UserProfile>) => void;

  // Banks CRUD & Monthly Fund Pool
  addBank: (bank: Omit<BankAccount, 'id' | 'createdAt'>) => string;
  updateBank: (bankId: string, updates: Partial<BankAccount>) => void;
  deleteBank: (bankId: string) => void;
  updateMonthlyFundPool: (bankId: string, month: string, monthlyIncome: number, amountAtBank: number) => void;

  // Planned Expenses
  addPlannedCategoryToBank: (bankId: string, category: string, defaultAmount: number) => void;
  updatePlannedCategoryInBank: (bankId: string, categoryId: string, updates: Partial<PlannedExpenseMaster>) => void;
  deletePlannedCategoryFromBank: (bankId: string, categoryId: string) => void;
  reorderPlannedCategories: (bankId: string, categoryIds: string[]) => void;
  updatePlannedSpent: (bankId: string, month: string, masterId: string, amountSpent: number, amountSetOverride?: number) => void;
  addPlannedSpend: (bankId: string, month: string, masterId: string, amountToAdd: number) => void;

  // Optional Expenses (Month-Specific One-off Must-Spend Commitments)
  addOptionalExpense: (expense: Omit<OptionalExpense, 'id' | 'createdAt'>) => string;
  updateOptionalExpense: (id: string, updates: Partial<OptionalExpense>) => void;
  deleteOptionalExpense: (id: string) => void;
  toggleOptionalExpensePaid: (id: string) => void;

  // Unplanned Expenses
  addUnplannedExpense: (expense: { bankId: string; month: string; day: number; description: string; amount: number; notes?: string }) => void;
  updateUnplannedExpense: (id: string, updates: Partial<UnplannedExpense>) => void;
  deleteUnplannedExpense: (id: string) => void;

  // Credit Cards
  addCreditCard: (card: Omit<CreditCard, 'id' | 'createdAt'>) => string;
  updateCreditCard: (cardId: string, updates: Partial<CreditCard>) => void;
  deleteCreditCard: (cardId: string) => void;
  addCreditTransaction: (tx: { cardId: string; month: string; date: string; day: number; category: string; description: string; amount: number; expenseType: 'essential' | 'non_essential' }) => void;
  updateCreditTransaction: (txId: string, updates: Partial<CreditTransaction>) => void;
  deleteCreditTransaction: (txId: string) => void;
  recordCardPayment: (cardId: string, paymentAmount: number, paymentDate: string) => void;

  // Future Goals
  addGoal: (goal: Omit<FutureGoal, 'id' | 'createdAt'>) => string;
  updateGoal: (goalId: string, updates: Partial<FutureGoal>) => void;
  deleteGoal: (goalId: string) => void;
  toggleGoalSuccess: (goalId: string) => void;
  updateGoalSavedAmount: (goalId: string, actualSaved: number) => void;
  addGoalAllocation: (goalId: string, allocation: GoalAllocationInput) => void;
  removeGoalAllocation: (goalId: string, allocationId: string) => void;

  // System & Reset
  resetToMockData: () => void;
  clearAllData: () => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      userProfile: INITIAL_USER_PROFILE,
      activeMonth: getCurrentMonthString(),
      activeTab: 'home',
      selectedBankId: INITIAL_BANKS[0]?.id || null,
      selectedCardId: INITIAL_CREDIT_CARDS[0]?.id || null,

      banks: INITIAL_BANKS,
      monthlyData: INITIAL_MONTHLY_DATA,
      optionalExpenses: INITIAL_OPTIONAL_EXPENSES,
      unplannedExpenses: INITIAL_UNPLANNED_EXPENSES,

      creditCards: INITIAL_CREDIT_CARDS,
      creditTransactions: INITIAL_CREDIT_TRANSACTIONS,

      goals: INITIAL_FUTURE_GOALS,

      setActiveMonth: (month) => set({ activeMonth: month }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSelectedBankId: (bankId) => set({ selectedBankId: bankId }),
      setSelectedCardId: (cardId) => set({ selectedCardId: cardId }),

      updateUserProfile: (updates) =>
        set((state) => ({ userProfile: { ...state.userProfile, ...updates } })),

      addBank: (bankData) => {
        const newId = `bank-${Date.now()}`;
        const newBank: BankAccount = {
          ...bankData,
          id: newId,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          banks: [...state.banks, newBank],
          selectedBankId: newId,
        }));

        return newId;
      },

      updateBank: (bankId, updates) =>
        set((state) => ({
          banks: state.banks.map((b) => (b.id === bankId ? { ...b, ...updates } : b)),
        })),

      deleteBank: (bankId) =>
        set((state) => {
          const remainingBanks = state.banks.filter((b) => b.id !== bankId);
          return {
            banks: remainingBanks,
            selectedBankId: state.selectedBankId === bankId ? remainingBanks[0]?.id || null : state.selectedBankId,
            unplannedExpenses: state.unplannedExpenses.filter((u) => u.bankId !== bankId),
            optionalExpenses: state.optionalExpenses.filter((o) => o.bankId !== bankId),
          };
        }),

      updateMonthlyFundPool: (bankId, month, monthlyIncome, amountAtBank) =>
        set((state) => {
          const monthRecords = state.monthlyData[month] || {};
          const currentBankMonth = monthRecords[bankId] || {
            bankId,
            month,
            monthlyIncome: 0,
            amountAtBank: 0,
            plannedExpenseValues: {},
            unplannedExpenseIds: [],
          };

          return {
            monthlyData: {
              ...state.monthlyData,
              [month]: {
                ...monthRecords,
                [bankId]: {
                  ...currentBankMonth,
                  monthlyIncome: Number(monthlyIncome) || 0,
                  amountAtBank: Number(amountAtBank) || 0,
                },
              },
            },
          };
        }),

      addPlannedCategoryToBank: (bankId, category, defaultAmount) =>
        set((state) => {
          const newCatId = `cat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          const newCat: PlannedExpenseMaster = {
            id: newCatId,
            category,
            amountSet: Number(defaultAmount) || 0,
          };

          return {
            banks: state.banks.map((b) =>
              b.id === bankId
                ? { ...b, plannedCategories: [...(b.plannedCategories || []), newCat] }
                : b
            ),
          };
        }),

      updatePlannedCategoryInBank: (bankId, categoryId, updates) =>
        set((state) => ({
          banks: state.banks.map((b) => {
            if (b.id !== bankId) return b;
            return {
              ...b,
              plannedCategories: (b.plannedCategories || []).map((cat) =>
                cat.id === categoryId ? { ...cat, ...updates } : cat
              ),
            };
          }),
        })),

      deletePlannedCategoryFromBank: (bankId, categoryId) =>
        set((state) => ({
          banks: state.banks.map((b) =>
            b.id === bankId
              ? { ...b, plannedCategories: (b.plannedCategories || []).filter((c) => c.id !== categoryId) }
              : b
          ),
        })),

      reorderPlannedCategories: (bankId, categoryIds) =>
        set((state) => ({
          banks: state.banks.map((b) => {
            if (b.id !== bankId) return b;
            const catMap = new Map((b.plannedCategories || []).map((c) => [c.id, c]));
            const reordered = categoryIds.map((id) => catMap.get(id)).filter(Boolean) as PlannedExpenseMaster[];
            return { ...b, plannedCategories: reordered };
          }),
        })),

      updatePlannedSpent: (bankId, month, masterId, amountSpent, amountSetOverride) =>
        set((state) => {
          const monthRecords = state.monthlyData[month] || {};
          const currentBankMonth = monthRecords[bankId] || {
            bankId,
            month,
            monthlyIncome: 0,
            amountAtBank: 0,
            plannedExpenseValues: {},
            unplannedExpenseIds: [],
          };

          const existingVal = currentBankMonth.plannedExpenseValues[masterId] || { amountSpent: 0 };
          const updatedValues = {
            ...currentBankMonth.plannedExpenseValues,
            [masterId]: {
              ...existingVal,
              amountSpent: Number(amountSpent) || 0,
              ...(amountSetOverride !== undefined ? { amountSet: Number(amountSetOverride) } : {}),
            },
          };

          return {
            monthlyData: {
              ...state.monthlyData,
              [month]: {
                ...monthRecords,
                [bankId]: {
                  ...currentBankMonth,
                  plannedExpenseValues: updatedValues,
                },
              },
            },
          };
        }),

      addPlannedSpend: (bankId, month, masterId, amountToAdd) =>
        set((state) => {
          const monthRecords = state.monthlyData[month] || {};
          const currentBankMonth = monthRecords[bankId] || {
            bankId,
            month,
            monthlyIncome: 0,
            amountAtBank: 0,
            plannedExpenseValues: {},
            unplannedExpenseIds: [],
          };

          const existingVal = currentBankMonth.plannedExpenseValues[masterId] || { amountSpent: 0 };
          const newSpent = (Number(existingVal.amountSpent) || 0) + (Number(amountToAdd) || 0);

          const updatedValues = {
            ...currentBankMonth.plannedExpenseValues,
            [masterId]: {
              ...existingVal,
              amountSpent: newSpent,
            },
          };

          return {
            monthlyData: {
              ...state.monthlyData,
              [month]: {
                ...monthRecords,
                [bankId]: {
                  ...currentBankMonth,
                  plannedExpenseValues: updatedValues,
                },
              },
            },
          };
        }),

      // Optional Expenses (Month-Specific One-off Commitments)
      addOptionalExpense: (expenseData) => {
        const newId = `opt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const newOpt: OptionalExpense = {
          ...expenseData,
          id: newId,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          optionalExpenses: [newOpt, ...state.optionalExpenses],
        }));

        return newId;
      },

      updateOptionalExpense: (id, updates) =>
        set((state) => ({
          optionalExpenses: state.optionalExpenses.map((o) =>
            o.id === id ? { ...o, ...updates } : o
          ),
        })),

      deleteOptionalExpense: (id) =>
        set((state) => ({
          optionalExpenses: state.optionalExpenses.filter((o) => o.id !== id),
        })),

      toggleOptionalExpensePaid: (id) =>
        set((state) => ({
          optionalExpenses: state.optionalExpenses.map((o) => {
            if (o.id !== id) return o;
            const willBePaid = !o.isPaid;
            return {
              ...o,
              isPaid: willBePaid,
              amountSpent: willBePaid && o.amountSpent === 0 ? o.amountSet : o.amountSpent,
            };
          }),
        })),

      // Unplanned Expenses
      addUnplannedExpense: ({ bankId, month, day, description, amount, notes = '' }) =>
        set((state) => {
          const newId = `unp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          const fullDate = formatDayWithMonth(day, month);
          const newExpense: UnplannedExpense = {
            id: newId,
            bankId,
            month,
            day,
            fullDate,
            description,
            amount: Number(amount) || 0,
            notes,
            createdAt: new Date().toISOString(),
          };

          return {
            unplannedExpenses: [newExpense, ...state.unplannedExpenses],
          };
        }),

      updateUnplannedExpense: (id, updates) =>
        set((state) => ({
          unplannedExpenses: state.unplannedExpenses.map((item) => {
            if (item.id !== id) return item;
            const day = updates.day !== undefined ? updates.day : item.day;
            const month = updates.month || item.month;
            const fullDate = formatDayWithMonth(day, month);
            return {
              ...item,
              ...updates,
              day,
              fullDate,
            };
          }),
        })),

      deleteUnplannedExpense: (id) =>
        set((state) => ({
          unplannedExpenses: state.unplannedExpenses.filter((item) => item.id !== id),
        })),

      // Credit Cards
      addCreditCard: (cardData) => {
        const newId = `card-${Date.now()}`;
        const newCard: CreditCard = {
          ...cardData,
          id: newId,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          creditCards: [...state.creditCards, newCard],
          selectedCardId: newId,
        }));

        return newId;
      },

      updateCreditCard: (cardId, updates) =>
        set((state) => ({
          creditCards: state.creditCards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
        })),

      deleteCreditCard: (cardId) =>
        set((state) => {
          const remainingCards = state.creditCards.filter((c) => c.id !== cardId);
          return {
            creditCards: remainingCards,
            selectedCardId: state.selectedCardId === cardId ? remainingCards[0]?.id || null : state.selectedCardId,
            creditTransactions: state.creditTransactions.filter((t) => t.cardId !== cardId),
          };
        }),

      addCreditTransaction: ({ cardId, month, date, day, category, description, amount, expenseType }) =>
        set((state) => {
          const newId = `ctx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          const newTx: CreditTransaction = {
            id: newId,
            cardId,
            month,
            date,
            day,
            category,
            description,
            amount: Number(amount) || 0,
            expenseType,
            createdAt: new Date().toISOString(),
          };

          return {
            creditTransactions: [newTx, ...state.creditTransactions],
          };
        }),

      updateCreditTransaction: (txId, updates) =>
        set((state) => ({
          creditTransactions: state.creditTransactions.map((t) =>
            t.id === txId ? { ...t, ...updates } : t
          ),
        })),

      deleteCreditTransaction: (txId) =>
        set((state) => ({
          creditTransactions: state.creditTransactions.filter((t) => t.id !== txId),
        })),

      recordCardPayment: (cardId, paymentAmount, paymentDate) =>
        set((state) => ({
          creditCards: state.creditCards.map((c) =>
            c.id === cardId
              ? {
                  ...c,
                  lastPaymentAmount: Number(paymentAmount) || 0,
                  lastPaymentDate: paymentDate,
                }
              : c
          ),
        })),

      // Future Goals
      addGoal: (goalData) => {
        const newId = `goal-${Date.now()}`;
        const newGoal: FutureGoal = {
          ...goalData,
          id: newId,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          goals: [...state.goals, newGoal],
        }));

        return newId;
      },

      updateGoal: (goalId, updates) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === goalId ? { ...g, ...updates } : g)),
        })),

      deleteGoal: (goalId) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== goalId),
        })),

      toggleGoalSuccess: (goalId) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  isManualSuccess: !g.isManualSuccess,
                  status: !g.isManualSuccess ? 'completed' : 'in_progress',
                }
              : g
          ),
        })),

      updateGoalSavedAmount: (goalId, actualSaved) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  actualSaved: Number(actualSaved) || 0,
                  status: Number(actualSaved) >= g.targetAmount ? 'completed' : 'in_progress',
                }
              : g
          ),
        })),

      addGoalAllocation: (goalId, allocation) =>
        set((state) => {
          const newAllocId = `alloc-${Date.now()}`;
          const fullAlloc = { ...allocation, id: newAllocId } as GoalAllocation;
          return {
            goals: state.goals.map((g) =>
              g.id === goalId
                ? { ...g, allocations: [...(g.allocations || []), fullAlloc] }
                : g
            ),
          };
        }),

      removeGoalAllocation: (goalId, allocationId) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId
              ? { ...g, allocations: (g.allocations || []).filter((a) => a.id !== allocationId) }
              : g
          ),
        })),

      resetToMockData: () =>
        set({
          userProfile: INITIAL_USER_PROFILE,
          activeMonth: getCurrentMonthString(),
          banks: INITIAL_BANKS,
          monthlyData: INITIAL_MONTHLY_DATA,
          optionalExpenses: INITIAL_OPTIONAL_EXPENSES,
          unplannedExpenses: INITIAL_UNPLANNED_EXPENSES,
          creditCards: INITIAL_CREDIT_CARDS,
          creditTransactions: INITIAL_CREDIT_TRANSACTIONS,
          goals: INITIAL_FUTURE_GOALS,
          selectedBankId: INITIAL_BANKS[0]?.id || null,
          selectedCardId: INITIAL_CREDIT_CARDS[0]?.id || null,
        }),

      clearAllData: () =>
        set({
          banks: [],
          monthlyData: {},
          optionalExpenses: [],
          unplannedExpenses: [],
          creditCards: [],
          creditTransactions: [],
          goals: [],
          selectedBankId: null,
          selectedCardId: null,
        }),
    }),
    {
      name: 'finance-command-center-storage-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
