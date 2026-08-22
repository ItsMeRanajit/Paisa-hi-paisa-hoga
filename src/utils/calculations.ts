import {
  BankAccount,
  BankMonthlyData,
  OptionalExpense,
  UnplannedExpense,
  CreditCard,
  CreditTransaction,
  FutureGoal,
  BankCalculations,
  CreditCardCalculations,
  FinancialAlert,
} from '../types/finance';

/** Safe division utility to prevent NaN / Infinity */
export const safeDivide = (numerator: number, denominator: number): number => {
  if (!denominator || denominator === 0 || isNaN(denominator) || isNaN(numerator)) {
    return 0;
  }
  return (numerator / denominator) * 100;
};

/**
 * Calculates complete financial metrics for a single bank account for the selected month.
 * Pure function - single source of truth.
 */
export const calculateBankMetrics = (
  bank: BankAccount,
  monthData: BankMonthlyData | undefined,
  unplannedExpenses: UnplannedExpense[],
  optionalExpenses: OptionalExpense[] = [],
  unplannedLimit: number = 20000
): BankCalculations => {
  const monthlyIncome = Number(monthData?.monthlyIncome) || 0;
  const amountAtBank = Number(monthData?.amountAtBank) || 0;
  const totalSpendingPool = monthlyIncome + amountAtBank;

  // 1. Process planned expense rows
  let plannedTotalSet = 0;
  let plannedTotalSpent = 0;

  const plannedRows = (bank.plannedCategories || []).map((cat) => {
    const monthOverride = monthData?.plannedExpenseValues?.[cat.id];
    const amountSet = monthOverride?.amountSet !== undefined ? Number(monthOverride.amountSet) : Number(cat.amountSet) || 0;
    const amountSpent = Number(monthOverride?.amountSpent) || 0;
    const remaining = amountSet - amountSpent;
    const utilizationPercent = amountSet > 0 ? (amountSpent / amountSet) * 100 : 0;
    const isOverBudget = amountSpent > amountSet;

    plannedTotalSet += amountSet;
    plannedTotalSpent += amountSpent;

    return {
      masterId: cat.id,
      category: cat.category,
      amountSet,
      amountSpent,
      remaining,
      utilizationPercent,
      isOverBudget,
    };
  });

  const plannedRemaining = plannedTotalSet - plannedTotalSpent;

  // 2. Process optional expenses (One-off / Month-Specific Mandatory Commitments)
  let optionalTotalSet = 0;
  let optionalTotalSpent = 0;

  const optionalRows = optionalExpenses.filter((item) => item.bankId === bank.id);
  optionalRows.forEach((opt) => {
    optionalTotalSet += Number(opt.amountSet) || 0;
    optionalTotalSpent += Number(opt.amountSpent) || 0;
  });
  const optionalRemaining = optionalTotalSet - optionalTotalSpent;

  // 3. Remaining Bank Amount after Planned & Optional Commitments
  const remainingBankAmount = totalSpendingPool - plannedTotalSpent - optionalTotalSpent;

  // 4. Unplanned total for this bank & month
  const unplannedTotal = unplannedExpenses
    .filter((u) => u.bankId === bank.id)
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // 5. Final Net Remaining
  const finalMonthlyRemaining = totalSpendingPool - plannedTotalSpent - optionalTotalSpent - unplannedTotal;

  // Percentages based on totalSpendingPool
  const basePool = totalSpendingPool > 0 ? totalSpendingPool : (monthlyIncome > 0 ? monthlyIncome : 1);
  const plannedSpendingPercentage = safeDivide(plannedTotalSpent, basePool);
  const optionalSpendingPercentage = safeDivide(optionalTotalSpent, basePool);
  const unplannedSpendingPercentage = safeDivide(unplannedTotal, basePool);
  const totalSpendingPercentage = safeDivide(plannedTotalSpent + optionalTotalSpent + unplannedTotal, basePool);
  const remainingMoneyPercentage = safeDivide(finalMonthlyRemaining, basePool);

  // Unplanned spending limit status
  const effectiveLimit = unplannedLimit > 0 ? unplannedLimit : 20000;
  const unplannedLimitUtilization = safeDivide(unplannedTotal, effectiveLimit);

  let unplannedLimitStatus: 'normal' | 'approaching_limit' | 'limit_reached' | 'limit_exceeded' = 'normal';
  if (unplannedTotal > effectiveLimit) {
    unplannedLimitStatus = 'limit_exceeded';
  } else if (unplannedTotal === effectiveLimit && effectiveLimit > 0) {
    unplannedLimitStatus = 'limit_reached';
  } else if (unplannedLimitUtilization >= 80) {
    unplannedLimitStatus = 'approaching_limit';
  }

  const budgetUtilizationPercentage = safeDivide(plannedTotalSpent, plannedTotalSet);

  return {
    monthlyIncome,
    amountAtBank,
    totalSpendingPool,
    plannedTotalSet,
    plannedTotalSpent,
    plannedRemaining,
    optionalTotalSet,
    optionalTotalSpent,
    optionalRemaining,
    remainingBankAmount,
    unplannedTotal,
    finalMonthlyRemaining,
    plannedSpendingPercentage,
    optionalSpendingPercentage,
    unplannedSpendingPercentage,
    totalSpendingPercentage,
    remainingMoneyPercentage,
    unplannedLimit: effectiveLimit,
    unplannedLimitUtilization,
    unplannedLimitStatus,
    budgetUtilizationPercentage,
    plannedRows,
    optionalRows,
  };
};

/**
 * Calculates credit card metrics for the selected month/billing cycle.
 * Pure function - single source of truth.
 */
export const calculateCreditCardMetrics = (
  card: CreditCard,
  transactions: CreditTransaction[]
): CreditCardCalculations => {
  const creditLimit = Number(card.creditLimit) || 0;
  let essentialAmount = 0;
  let nonEssentialAmount = 0;
  let currentOutstanding = 0;

  transactions.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    currentOutstanding += amt;
    if (tx.expenseType === 'essential') {
      essentialAmount += amt;
    } else {
      nonEssentialAmount += amt;
    }
  });

  const remainingLimit = Math.max(0, creditLimit - currentOutstanding);
  const utilizationPercentage = creditLimit > 0 ? (currentOutstanding / creditLimit) * 100 : 0;

  let utilizationStatus: 'healthy_below_30_percent' | 'warning_near_30_percent' | 'high_above_30_percent' = 'healthy_below_30_percent';
  if (utilizationPercentage > 30) {
    utilizationStatus = 'high_above_30_percent';
  } else if (utilizationPercentage >= 25) {
    utilizationStatus = 'warning_near_30_percent';
  }

  const totalSpent = currentOutstanding > 0 ? currentOutstanding : 1;
  const essentialPercentage = (essentialAmount / totalSpent) * 100;
  const nonEssentialPercentage = (nonEssentialAmount / totalSpent) * 100;

  return {
    creditLimit,
    currentOutstanding,
    remainingLimit,
    utilizationPercentage,
    utilizationStatus,
    essentialAmount,
    essentialPercentage,
    nonEssentialAmount,
    nonEssentialPercentage,
    totalTransactionsCount: transactions.length,
  };
};

/**
 * Calculates goal tracking metrics.
 */
export const calculateGoalMetrics = (goal: FutureGoal, monthlySavedInCurrentMonth?: number) => {
  const target = Number(goal.targetAmount) || 1;
  const totalSaved = Number(goal.actualSaved) || 0;
  const remaining = Math.max(0, target - totalSaved);
  const completionPercentage = Math.min(100, Math.max(0, (totalSaved / target) * 100));

  const monthlyTarget = Number(goal.monthlyTarget) || 0;
  const actualSavedThisMonth = monthlySavedInCurrentMonth !== undefined ? monthlySavedInCurrentMonth : (monthlyTarget);
  const savingDifference = actualSavedThisMonth - monthlyTarget;

  let savingStatus: 'saved_more' | 'saved_exactly' | 'saved_less' = 'saved_exactly';
  if (savingDifference > 0) {
    savingStatus = 'saved_more';
  } else if (savingDifference < 0) {
    savingStatus = 'saved_less';
  }

  const isCompleted = goal.isManualSuccess || totalSaved >= target;

  return {
    target,
    totalSaved,
    remaining,
    completionPercentage,
    monthlyTarget,
    actualSavedThisMonth,
    savingDifference,
    savingStatus,
    isCompleted,
  };
};

/**
 * Aggregates all banks for the selected month to produce global command center totals.
 */
export const calculateAllBanksAggregate = (
  banks: BankAccount[],
  monthlyDataMap: Record<string, BankMonthlyData>,
  unplannedExpenses: UnplannedExpense[],
  optionalExpenses: OptionalExpense[] = [],
  globalUnplannedLimit: number = 20000
) => {
  let totalIncome = 0;
  let totalAmountAtBank = 0;
  let totalSpendingPool = 0;
  let totalPlannedSet = 0;
  let totalPlannedSpent = 0;
  let totalOptionalSet = 0;
  let totalOptionalSpent = 0;
  let totalUnplannedSpent = 0;
  let totalRemainingMoney = 0;

  const bankSummaries = banks.map((bank) => {
    const mData = monthlyDataMap[bank.id];
    const bankUnplanned = unplannedExpenses.filter((u) => u.bankId === bank.id);
    const bankOptional = optionalExpenses.filter((o) => o.bankId === bank.id);
    const metrics = calculateBankMetrics(bank, mData, bankUnplanned, bankOptional, globalUnplannedLimit);

    totalIncome += metrics.monthlyIncome;
    totalAmountAtBank += metrics.amountAtBank;
    totalSpendingPool += metrics.totalSpendingPool;
    totalPlannedSet += metrics.plannedTotalSet;
    totalPlannedSpent += metrics.plannedTotalSpent;
    totalOptionalSet += metrics.optionalTotalSet;
    totalOptionalSpent += metrics.optionalTotalSpent;
    totalUnplannedSpent += metrics.unplannedTotal;
    totalRemainingMoney += metrics.finalMonthlyRemaining;

    return {
      bank,
      metrics,
    };
  });

  const totalSpending = totalPlannedSpent + totalOptionalSpent + totalUnplannedSpent;
  const overallSavingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalSpending) / totalIncome) * 100) : 0;

  return {
    totalIncome,
    totalAmountAtBank,
    totalSpendingPool,
    totalPlannedSet,
    totalPlannedSpent,
    totalOptionalSet,
    totalOptionalSpent,
    totalUnplannedSpent,
    totalSpending,
    totalRemainingMoney,
    overallSavingsRate,
    bankSummaries,
  };
};

/**
 * Generates proactive real-time financial alerts across banks, cards, budgets, and goals.
 */
export const generateFinancialAlerts = (
  banks: BankAccount[],
  monthlyDataMap: Record<string, BankMonthlyData>,
  unplannedExpenses: UnplannedExpense[],
  optionalExpenses: OptionalExpense[] = [],
  cards: CreditCard[] = [],
  transactions: CreditTransaction[] = [],
  goals: FutureGoal[] = [],
  globalUnplannedLimit: number = 20000
): FinancialAlert[] => {
  const alerts: FinancialAlert[] = [];

  // 1. Bank Unplanned Spending Limit & Budget Overshoots
  banks.forEach((bank) => {
    const mData = monthlyDataMap[bank.id];
    const bankUnplanned = unplannedExpenses.filter((u) => u.bankId === bank.id);
    const bankOptional = optionalExpenses.filter((o) => o.bankId === bank.id);
    const metrics = calculateBankMetrics(bank, mData, bankUnplanned, bankOptional, globalUnplannedLimit);

    if (metrics.unplannedLimitStatus === 'limit_exceeded') {
      alerts.push({
        id: `alert-unplanned-exceeded-${bank.id}`,
        type: 'danger',
        title: `${bank.bankName} Unplanned Limit Exceeded`,
        message: `Spent ₹${metrics.unplannedTotal.toLocaleString()} on unplanned expenses, exceeding the limit of ₹${metrics.unplannedLimit.toLocaleString()} by ₹${(metrics.unplannedTotal - metrics.unplannedLimit).toLocaleString()}.`,
        source: 'bank',
        sourceId: bank.id,
        actionTab: 'banks',
      });
    } else if (metrics.unplannedLimitStatus === 'approaching_limit') {
      alerts.push({
        id: `alert-unplanned-warning-${bank.id}`,
        type: 'warning',
        title: `${bank.bankName} Approaching Unplanned Limit`,
        message: `Unplanned spending has reached ${metrics.unplannedLimitUtilization.toFixed(0)}% (₹${metrics.unplannedTotal.toLocaleString()} / ₹${metrics.unplannedLimit.toLocaleString()}).`,
        source: 'bank',
        sourceId: bank.id,
        actionTab: 'banks',
      });
    }

    // Over budget planned categories
    metrics.plannedRows.forEach((row) => {
      if (row.isOverBudget) {
        alerts.push({
          id: `alert-planned-over-${bank.id}-${row.masterId}`,
          type: 'danger',
          title: `${bank.bankName}: ${row.category} Over Budget`,
          message: `Spent ₹${row.amountSpent.toLocaleString()} against budget of ₹${row.amountSet.toLocaleString()} (Over by ₹${(row.amountSpent - row.amountSet).toLocaleString()}).`,
          source: 'budget',
          sourceId: bank.id,
          actionTab: 'banks',
        });
      }
    });

    // Over budget optional commitments
    metrics.optionalRows.forEach((opt) => {
      if (opt.amountSpent > opt.amountSet) {
        alerts.push({
          id: `alert-optional-over-${bank.id}-${opt.id}`,
          type: 'warning',
          title: `${bank.bankName}: ${opt.title} Over Budget`,
          message: `Optional expense "${opt.title}" exceeded budget by ₹${(opt.amountSpent - opt.amountSet).toLocaleString()}.`,
          source: 'budget',
          sourceId: bank.id,
          actionTab: 'banks',
        });
      }
    });

    // Negative remaining balance
    if (metrics.finalMonthlyRemaining < 0) {
      alerts.push({
        id: `alert-deficit-${bank.id}`,
        type: 'danger',
        title: `${bank.bankName} in Monthly Deficit`,
        message: `Total spending exceeds total fund pool by ₹${Math.abs(metrics.finalMonthlyRemaining).toLocaleString()}. Immediate rebalancing recommended.`,
        source: 'bank',
        sourceId: bank.id,
        actionTab: 'banks',
      });
    }
  });

  // 2. Credit Cards Utilization Alerts
  cards.forEach((card) => {
    const cardTxs = transactions.filter((t) => t.cardId === card.id);
    const metrics = calculateCreditCardMetrics(card, cardTxs);

    if (metrics.utilizationPercentage > 30) {
      alerts.push({
        id: `alert-card-util-${card.id}`,
        type: 'warning',
        title: `${card.cardName} High Utilization (${metrics.utilizationPercentage.toFixed(1)}%)`,
        message: `Credit card utilization is above the recommended 30% threshold (₹${metrics.currentOutstanding.toLocaleString()} / ₹${metrics.creditLimit.toLocaleString()}). May impact credit score.`,
        source: 'card',
        sourceId: card.id,
        actionTab: 'credit_cards',
      });
    }
  });

  // 3. Goals Lagging Alerts
  goals.forEach((goal) => {
    if (!goal.isManualSuccess && goal.status !== 'completed') {
      const gMetrics = calculateGoalMetrics(goal);
      if (gMetrics.savingStatus === 'saved_less') {
        alerts.push({
          id: `alert-goal-lag-${goal.id}`,
          type: 'info',
          title: `Goal Behind Schedule: ${goal.goalName}`,
          message: `Behind target by ₹${Math.abs(gMetrics.savingDifference).toLocaleString()} this month. Adjust allocations or planned expense cuts.`,
          source: 'goal',
          sourceId: goal.id,
          actionTab: 'goals',
        });
      }
    }
  });

  return alerts;
};
