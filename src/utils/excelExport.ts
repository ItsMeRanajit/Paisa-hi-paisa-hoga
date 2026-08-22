import * as XLSX from 'xlsx';
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
import {
  calculateCreditCardMetrics,
  calculateGoalMetrics,
  calculateAllBanksAggregate,
} from './calculations';
import { formatMonthDisplay } from './formatters';

export const exportFinancialWorkbook = ({
  userProfile,
  activeMonth,
  banks,
  monthlyData,
  optionalExpenses = [],
  unplannedExpenses = [],
  creditCards,
  creditTransactions,
  goals,
}: {
  userProfile: UserProfile;
  activeMonth: string;
  banks: BankAccount[];
  monthlyData: Record<string, BankMonthlyData>;
  optionalExpenses?: OptionalExpense[];
  unplannedExpenses: UnplannedExpense[];
  creditCards: CreditCard[];
  creditTransactions: CreditTransaction[];
  goals: FutureGoal[];
}) => {
  const wb = XLSX.utils.book_new();

  // Aggregate metrics for active month
  const activeUnplanned = unplannedExpenses.filter((u) => u.month === activeMonth);
  const activeOptional = optionalExpenses.filter((o) => o.month === activeMonth);
  const activeCardTxs = creditTransactions.filter((t) => t.month === activeMonth);

  const aggregate = calculateAllBanksAggregate(
    banks,
    monthlyData,
    activeUnplanned,
    activeOptional,
    userProfile.unplannedSpendingLimit
  );

  // 1. Sheet: Monthly Summary
  const monthlySummaryData = [
    ['PERSONAL FINANCE COMMAND CENTER - MONTHLY REPORT'],
    [`User: ${userProfile.name}`, `Mobile: ${userProfile.mobileNumber}`],
    [`Report Month: ${formatMonthDisplay(activeMonth)} (${activeMonth})`, `Generated At: ${new Date().toLocaleString()}`],
    [],
    ['Key Metric', 'Amount (INR)', 'Percentage of Fund Pool'],
    ['Total Monthly Income', aggregate.totalIncome, '—'],
    ['Total Amount at Banks (Starting Balance)', aggregate.totalAmountAtBank, '—'],
    ['Total Spending Pool (Income + Bank Amount)', aggregate.totalSpendingPool, '100.0%'],
    ['Total Planned Expenses Budgeted', aggregate.totalPlannedSet, `${((aggregate.totalPlannedSet / (aggregate.totalSpendingPool || 1)) * 100).toFixed(1)}%`],
    ['Total Planned Expenses Spent', aggregate.totalPlannedSpent, `${((aggregate.totalPlannedSpent / (aggregate.totalSpendingPool || 1)) * 100).toFixed(1)}%`],
    ['Total Optional (1-Off Commitments) Budgeted', aggregate.totalOptionalSet, `${((aggregate.totalOptionalSet / (aggregate.totalSpendingPool || 1)) * 100).toFixed(1)}%`],
    ['Total Optional (1-Off Commitments) Spent', aggregate.totalOptionalSpent, `${((aggregate.totalOptionalSpent / (aggregate.totalSpendingPool || 1)) * 100).toFixed(1)}%`],
    ['Total Unplanned Expenses Spent', aggregate.totalUnplannedSpent, `${((aggregate.totalUnplannedSpent / (aggregate.totalSpendingPool || 1)) * 100).toFixed(1)}%`],
    ['Total Outflow (Planned + Optional + Unplanned)', aggregate.totalSpending, `${((aggregate.totalSpending / (aggregate.totalSpendingPool || 1)) * 100).toFixed(1)}%`],
    ['Final Net Remaining Money in Banks', aggregate.totalRemainingMoney, `${((aggregate.totalRemainingMoney / (aggregate.totalSpendingPool || 1)) * 100).toFixed(1)}%`],
    ['Overall Monthly Savings Rate (vs Income)', `${aggregate.overallSavingsRate.toFixed(1)}%`, '—'],
    [],
    ['Configuration & Parameters'],
    ['Unplanned Spending Alert Limit', userProfile.unplannedSpendingLimit, 'Monthly Threshold'],
    ['Credit Card Safe Utilization Target', '< 30.0%', 'RBI / Credit Bureau Standard'],
  ];

  const wsMonthly = XLSX.utils.aoa_to_sheet(monthlySummaryData);
  wsMonthly['!cols'] = [{ wch: 45 }, { wch: 22 }, { wch: 26 }];
  XLSX.utils.book_append_sheet(wb, wsMonthly, 'Monthly Summary');

  // 2. Sheet: Bank Summary
  const bankSummaryHeaders = [
    'Bank Name',
    'Nickname',
    'Monthly Income',
    'Amount at Bank',
    'Total Fund Pool',
    'Planned Budget',
    'Planned Spent',
    'Optional Budget',
    'Optional Spent',
    'Remaining (After Planned & Optional)',
    'Unplanned Spent',
    'Final Net Remaining',
    'Unplanned Limit Status',
    'Total Spending %',
  ];

  const bankSummaryRows = aggregate.bankSummaries.map(({ bank, metrics }) => [
    bank.bankName,
    bank.nickname,
    metrics.monthlyIncome,
    metrics.amountAtBank,
    metrics.totalSpendingPool,
    metrics.plannedTotalSet,
    metrics.plannedTotalSpent,
    metrics.optionalTotalSet,
    metrics.optionalTotalSpent,
    metrics.remainingBankAmount,
    metrics.unplannedTotal,
    metrics.finalMonthlyRemaining,
    metrics.unplannedLimitStatus.toUpperCase(),
    `${metrics.totalSpendingPercentage.toFixed(1)}%`,
  ]);

  const wsBankSummary = XLSX.utils.aoa_to_sheet([bankSummaryHeaders, ...bankSummaryRows]);
  wsBankSummary['!cols'] = [
    { wch: 24 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 22 },
    { wch: 16 },
    { wch: 20 },
    { wch: 24 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsBankSummary, 'Bank Summary');

  // 3. Sheet: Planned Expenses
  const plannedHeaders = [
    'Bank Name',
    'Expense Category',
    'Amount Set (Budget)',
    'Amount Spent',
    'Remaining Budget',
    'Utilization %',
    'Status',
  ];

  const plannedRows: any[] = [];
  aggregate.bankSummaries.forEach(({ bank, metrics }) => {
    metrics.plannedRows.forEach((row) => {
      plannedRows.push([
        bank.bankName,
        row.category,
        row.amountSet,
        row.amountSpent,
        row.remaining,
        `${row.utilizationPercent.toFixed(1)}%`,
        row.isOverBudget ? 'OVER BUDGET' : row.remaining === 0 ? 'EXACT' : 'WITHIN BUDGET',
      ]);
    });
  });

  const wsPlanned = XLSX.utils.aoa_to_sheet([plannedHeaders, ...plannedRows]);
  wsPlanned['!cols'] = [
    { wch: 22 },
    { wch: 28 },
    { wch: 20 },
    { wch: 16 },
    { wch: 18 },
    { wch: 15 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPlanned, 'Planned Expenses');

  // 4. Sheet: Optional Expenses (One-Off / Month-Specific Mandatory Commitments)
  const optionalHeaders = [
    'Bank Name',
    'Commitment Title',
    'Budget Set',
    'Actual Spent',
    'Remaining',
    'Due Date',
    'Payment Status',
    'Notes / Purpose',
  ];

  const optionalRows: any[] = activeOptional.map((item) => {
    const bank = banks.find((b) => b.id === item.bankId);
    const isSettled = item.isPaid || (item.amountSpent >= item.amountSet && item.amountSet > 0);
    return [
      bank ? bank.bankName : item.bankId,
      item.title,
      item.amountSet,
      item.amountSpent,
      item.amountSet - item.amountSpent,
      item.dueDate || '—',
      isSettled ? 'PAID / SETTLED' : 'PENDING',
      item.notes || '—',
    ];
  });

  const wsOptional = XLSX.utils.aoa_to_sheet([
    optionalHeaders,
    ...(optionalRows.length > 0 ? optionalRows : [['No optional commitments for this month', '', '', '', '', '', '', '']]),
  ]);
  wsOptional['!cols'] = [
    { wch: 22 },
    { wch: 32 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 35 },
  ];
  XLSX.utils.book_append_sheet(wb, wsOptional, 'Optional Expenses');

  // 5. Sheet: Unplanned Expenses
  const unplannedHeaders = ['Bank Name', 'Date', 'Day', 'Expense Description', 'Amount', 'Notes'];
  const unplannedRows = activeUnplanned.map((item) => {
    const bank = banks.find((b) => b.id === item.bankId);
    return [
      bank ? bank.bankName : item.bankId,
      item.fullDate,
      item.day,
      item.description,
      item.amount,
      item.notes || '—',
    ];
  });

  const wsUnplanned = XLSX.utils.aoa_to_sheet([
    unplannedHeaders,
    ...(unplannedRows.length > 0 ? unplannedRows : [['No unplanned expenses recorded for this month', '', '', '', '', '']]),
  ]);
  wsUnplanned['!cols'] = [{ wch: 22 }, { wch: 18 }, { wch: 8 }, { wch: 35 }, { wch: 15 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsUnplanned, 'Unplanned Expenses');

  // 6. Sheet: Credit Cards (Transactions)
  const creditTxHeaders = ['Card Name', 'Date', 'Category', 'Description', 'Expense Classification', 'Amount'];
  const creditTxRows = activeCardTxs.map((tx) => {
    const card = creditCards.find((c) => c.id === tx.cardId);
    return [
      card ? card.cardName : tx.cardId,
      tx.date,
      tx.category,
      tx.description,
      tx.expenseType === 'essential' ? 'Essential Spending' : 'Non-Essential Spending',
      tx.amount,
    ];
  });

  const wsCreditTxs = XLSX.utils.aoa_to_sheet([
    creditTxHeaders,
    ...(creditTxRows.length > 0 ? creditTxRows : [['No credit card transactions logged this month', '', '', '', '', '']]),
  ]);
  wsCreditTxs['!cols'] = [{ wch: 24 }, { wch: 14 }, { wch: 20 }, { wch: 35 }, { wch: 24 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsCreditTxs, 'Credit Cards');

  // 7. Sheet: Credit Summary
  const creditSummaryHeaders = [
    'Card Name',
    'Issuer',
    'Credit Limit',
    'Current Outstanding',
    'Remaining Limit',
    'Utilization %',
    'Utilization Status',
    'Essential Spending',
    'Non-Essential Spending',
    'Last Payment Date',
    'Last Payment Amount',
  ];

  const creditSummaryRows = creditCards.map((card) => {
    const cardTxs = activeCardTxs.filter((t) => t.cardId === card.id);
    const metrics = calculateCreditCardMetrics(card, cardTxs);

    return [
      card.cardName,
      card.issuer,
      metrics.creditLimit,
      metrics.currentOutstanding,
      metrics.remainingLimit,
      `${metrics.utilizationPercentage.toFixed(1)}%`,
      metrics.utilizationStatus === 'healthy_below_30_percent'
        ? 'Healthy (< 30%)'
        : metrics.utilizationStatus === 'warning_near_30_percent'
        ? 'Warning (25-30%)'
        : 'HIGH RISK (> 30%)',
      metrics.essentialAmount,
      metrics.nonEssentialAmount,
      card.lastPaymentDate || '—',
      card.lastPaymentAmount || '—',
    ];
  });

  const wsCreditSummary = XLSX.utils.aoa_to_sheet([creditSummaryHeaders, ...creditSummaryRows]);
  wsCreditSummary['!cols'] = [
    { wch: 24 },
    { wch: 16 },
    { wch: 16 },
    { wch: 20 },
    { wch: 16 },
    { wch: 14 },
    { wch: 20 },
    { wch: 18 },
    { wch: 22 },
    { wch: 18 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsCreditSummary, 'Credit Summary');

  // 8. Sheet: Future Goals
  const goalHeaders = [
    'Goal Name',
    'Target Amount',
    'Total Saved',
    'Remaining Target',
    'Progress %',
    'Target Date',
    'Monthly Target',
    'Status',
    'Allocated Bank Strategies',
  ];

  const goalRows = goals.map((goal) => {
    const metrics = calculateGoalMetrics(goal);
    const allocSummary = (goal.allocations || [])
      .map((a) => {
        const b = banks.find((item) => item.id === a.bankId);
        return a.type === 'monthly_saving'
          ? `${b?.bankName || 'Bank'}: Direct Save ₹${a.monthlyTarget}/mo`
          : `${b?.bankName || 'Bank'}: Cut ${a.plannedExpenseCategory} by ₹${a.monthlyReductionAmount}/mo`;
      })
      .join(' | ');

    return [
      goal.goalName,
      metrics.target,
      metrics.totalSaved,
      metrics.remaining,
      `${metrics.completionPercentage.toFixed(1)}%`,
      goal.expectedExpenseDate,
      goal.monthlyTarget,
      metrics.isCompleted ? 'COMPLETED' : 'IN PROGRESS',
      allocSummary || 'No bank allocations',
    ];
  });

  const wsGoals = XLSX.utils.aoa_to_sheet([goalHeaders, ...goalRows]);
  wsGoals['!cols'] = [
    { wch: 26 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 50 },
  ];
  XLSX.utils.book_append_sheet(wb, wsGoals, 'Future Goals');

  // Export workbook
  const filename = `Finance_Command_Center_${activeMonth}_Report.xlsx`;
  XLSX.writeFile(wb, filename);
};
