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

  // ==========================================
  // SHEET 1: Planned & Optional Expenses (Itemized)
  // ==========================================
  const plannedAndOptionalHeaders = [
    'Bank Account',
    'Expense Type',
    'Category / Commitment Title',
    'Budget Set (INR)',
    'Amount Spent (INR)',
    'Remaining Balance (INR)',
    'Utilization %',
    'Due Date / Schedule',
    'Status',
    'Notes / Purpose',
  ];

  const plannedAndOptionalRows: any[] = [];

  // Planned rows from all banks
  aggregate.bankSummaries.forEach(({ bank, metrics }) => {
    metrics.plannedRows.forEach((row) => {
      plannedAndOptionalRows.push([
        bank.bankName,
        'Planned Recurring',
        row.category,
        row.amountSet,
        row.amountSpent,
        row.remaining,
        `${row.utilizationPercent.toFixed(1)}%`,
        'Monthly Recurring',
        row.isOverBudget ? 'OVER BUDGET' : row.remaining === 0 ? 'EXACT' : 'WITHIN BUDGET',
        'Recurring monthly budget',
      ]);
    });
  });

  // Optional (1-off) rows from all banks
  activeOptional.forEach((item) => {
    const bank = banks.find((b) => b.id === item.bankId);
    const remaining = item.amountSet - item.amountSpent;
    const utilization = item.amountSet > 0 ? (item.amountSpent / item.amountSet) * 100 : 0;
    const isSettled = item.isPaid || (item.amountSpent >= item.amountSet && item.amountSet > 0);

    plannedAndOptionalRows.push([
      bank ? bank.bankName : item.bankId,
      'Optional (1-Off Mandatory)',
      item.title,
      item.amountSet,
      item.amountSpent,
      remaining,
      `${utilization.toFixed(1)}%`,
      item.dueDate || 'Current Month',
      isSettled ? 'SETTLED / PAID' : 'PAYMENT PENDING',
      item.notes || 'Month-specific mandatory commitment',
    ]);
  });

  const wsPlanned = XLSX.utils.aoa_to_sheet([
    ['PLANNED & OPTIONAL EXPENSES BREAKDOWN', `Month: ${formatMonthDisplay(activeMonth)}`],
    [],
    plannedAndOptionalHeaders,
    ...(plannedAndOptionalRows.length > 0 ? plannedAndOptionalRows : [['No planned or optional expenses recorded', '', '', '', '', '', '', '', '', '']]),
  ]);
  wsPlanned['!cols'] = [
    { wch: 22 },
    { wch: 26 },
    { wch: 32 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 15 },
    { wch: 20 },
    { wch: 18 },
    { wch: 36 },
  ];
  XLSX.utils.book_append_sheet(wb, wsPlanned, 'Planned & 1-Off Expenses');

  // ==========================================
  // SHEET 2: Unplanned Expenses (Itemized)
  // ==========================================
  const unplannedHeaders = [
    'Bank Account',
    'Transaction Date',
    'Day of Month',
    'Expense Description',
    'Amount (INR)',
    'Notes / Memo',
  ];

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
    ['UNPLANNED & VARIABLE EXPENSES LOG', `Month: ${formatMonthDisplay(activeMonth)}`],
    [],
    unplannedHeaders,
    ...(unplannedRows.length > 0 ? unplannedRows : [['No unplanned expenses recorded for this month', '', '', '', '', '']]),
  ]);
  wsUnplanned['!cols'] = [
    { wch: 22 },
    { wch: 20 },
    { wch: 14 },
    { wch: 36 },
    { wch: 16 },
    { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, wsUnplanned, 'Unplanned Expenses');

  // ==========================================
  // SHEET 3: Credit Card Transactions (Itemized)
  // ==========================================
  const creditTxHeaders = [
    'Credit Card',
    'Transaction Date',
    'Day',
    'Expense Category',
    'Transaction Description',
    'Expense Classification',
    'Amount Charged (INR)',
  ];

  const creditTxRows = activeCardTxs.map((tx) => {
    const card = creditCards.find((c) => c.id === tx.cardId);
    return [
      card ? card.cardName : tx.cardId,
      tx.date,
      tx.day,
      tx.category,
      tx.description,
      tx.expenseType === 'essential' ? 'Essential (Needs)' : 'Non-Essential (Wants)',
      tx.amount,
    ];
  });

  const wsCreditTxs = XLSX.utils.aoa_to_sheet([
    ['CREDIT CARD CHARGES & TRANSACTIONS', `Month: ${formatMonthDisplay(activeMonth)}`],
    [],
    creditTxHeaders,
    ...(creditTxRows.length > 0 ? creditTxRows : [['No credit card transactions logged this month', '', '', '', '', '', '']]),
  ]);
  wsCreditTxs['!cols'] = [
    { wch: 24 },
    { wch: 18 },
    { wch: 8 },
    { wch: 22 },
    { wch: 36 },
    { wch: 24 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsCreditTxs, 'Card Expenses');

  // ==========================================
  // SHEET 4: Bank Balances & Fund Pools
  // ==========================================
  const bankSummaryHeaders = [
    'Bank Account',
    'Account Nickname',
    'Monthly Income (INR)',
    'Starting Balance (INR)',
    'Total Spending Pool (INR)',
    'Planned Spent (INR)',
    'Optional Spent (INR)',
    'Unplanned Spent (INR)',
    'Total Outflow (INR)',
    'Remaining Bank Balance (INR)',
    'Outflow % of Pool',
    'Unplanned Limit Status',
  ];

  const bankSummaryRows = aggregate.bankSummaries.map(({ bank, metrics }) => {
    const totalOutflow = metrics.plannedTotalSpent + metrics.optionalTotalSpent + metrics.unplannedTotal;
    return [
      bank.bankName,
      bank.nickname,
      metrics.monthlyIncome,
      metrics.amountAtBank,
      metrics.totalSpendingPool,
      metrics.plannedTotalSpent,
      metrics.optionalTotalSpent,
      metrics.unplannedTotal,
      totalOutflow,
      metrics.finalMonthlyRemaining,
      `${metrics.totalSpendingPercentage.toFixed(1)}%`,
      metrics.unplannedLimitStatus.toUpperCase().replace('_', ' '),
    ];
  });

  const wsBankSummary = XLSX.utils.aoa_to_sheet([
    ['BANK ACCOUNTS, BALANCES & FUND POOLS', `Month: ${formatMonthDisplay(activeMonth)}`],
    [],
    bankSummaryHeaders,
    ...bankSummaryRows,
  ]);
  wsBankSummary['!cols'] = [
    { wch: 24 },
    { wch: 20 },
    { wch: 20 },
    { wch: 22 },
    { wch: 24 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
    { wch: 26 },
    { wch: 18 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, wsBankSummary, 'Bank Balances');

  // ==========================================
  // SHEET 5: Credit Cards Summary
  // ==========================================
  const creditSummaryHeaders = [
    'Credit Card',
    'Issuer',
    'Credit Limit (INR)',
    'Current Outstanding (INR)',
    'Available Limit (INR)',
    'Utilization %',
    'Credit Health Status (<30%)',
    'Essential Spending (INR)',
    'Non-Essential Spending (INR)',
    'Last Bill Payment Date',
    'Last Payment Amount (INR)',
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
      card.lastPaymentAmount || 0,
    ];
  });

  const wsCreditSummary = XLSX.utils.aoa_to_sheet([
    ['CREDIT CARDS UTILIZATION & EXPOSURE', `Month: ${formatMonthDisplay(activeMonth)}`],
    [],
    creditSummaryHeaders,
    ...creditSummaryRows,
  ]);
  wsCreditSummary['!cols'] = [
    { wch: 24 },
    { wch: 16 },
    { wch: 18 },
    { wch: 24 },
    { wch: 20 },
    { wch: 14 },
    { wch: 24 },
    { wch: 22 },
    { wch: 26 },
    { wch: 22 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, wsCreditSummary, 'Credit Summary');

  // ==========================================
  // SHEET 6: Future Goals & Allocations
  // ==========================================
  const goalHeaders = [
    'Goal Name',
    'Target Amount (INR)',
    'Total Saved (INR)',
    'Remaining Amount (INR)',
    'Funded %',
    'Target Date',
    'Monthly Target (INR)',
    'Status',
    'Bank Allocations / Funding Strategy',
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

  const wsGoals = XLSX.utils.aoa_to_sheet([
    ['FUTURE GOALS & MULTI-BANK SAVING COMMITMENTS', `Report Month: ${formatMonthDisplay(activeMonth)}`],
    [],
    goalHeaders,
    ...goalRows,
  ]);
  wsGoals['!cols'] = [
    { wch: 28 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 12 },
    { wch: 16 },
    { wch: 20 },
    { wch: 16 },
    { wch: 55 },
  ];
  XLSX.utils.book_append_sheet(wb, wsGoals, 'Future Goals');

  // ==========================================
  // SHEET 7: Monthly Executive Summary
  // ==========================================
  const monthlySummaryData = [
    ['PERSONAL FINANCE COMMAND CENTER - EXECUTIVE REPORT'],
    [`User: ${userProfile.name}`, `Mobile: ${userProfile.mobileNumber}`],
    [`Report Month: ${formatMonthDisplay(activeMonth)} (${activeMonth})`, `Generated At: ${new Date().toLocaleString()}`],
    [],
    ['Executive Summary Metric', 'Amount (INR)', 'Percentage of Total Fund Pool'],
    ['Total Monthly Income', aggregate.totalIncome, '—'],
    ['Total Reserves / Starting Bank Balances', aggregate.totalAmountAtBank, '—'],
    ['Total Spending Pool (Income + Reserves)', aggregate.totalSpendingPool, '100.0%'],
    ['Total Planned Expenses Spent', aggregate.totalPlannedSpent, `${((aggregate.totalPlannedSpent / (aggregate.totalSpendingPool || 1)) * 100).toFixed(1)}%`],
    ['Total Optional (1-Off Commitments) Spent', aggregate.totalOptionalSpent, `${((aggregate.totalOptionalSpent / (aggregate.totalSpendingPool || 1)) * 100).toFixed(1)}%`],
    ['Total Unplanned Expenses Spent', aggregate.totalUnplannedSpent, `${((aggregate.totalUnplannedSpent / (aggregate.totalSpendingPool || 1)) * 100).toFixed(1)}%`],
    ['Total Combined Outflow (Planned + Optional + Unplanned)', aggregate.totalSpending, `${((aggregate.totalSpending / (aggregate.totalSpendingPool || 1)) * 100).toFixed(1)}%`],
    ['Final Net Remaining Reserves in Banks', aggregate.totalRemainingMoney, `${((aggregate.totalRemainingMoney / (aggregate.totalSpendingPool || 1)) * 100).toFixed(1)}%`],
    ['Overall Monthly Savings Rate (vs Income)', `${aggregate.overallSavingsRate.toFixed(1)}%`, '—'],
    [],
    ['Risk & Governance Parameters', 'Value', 'Standard'],
    ['Unplanned Spending Alert Limit', userProfile.unplannedSpendingLimit, 'Monthly Threshold'],
    ['Credit Card Safe Utilization Target', '< 30.0%', 'Safe Credit Bureau Standard'],
  ];

  const wsMonthly = XLSX.utils.aoa_to_sheet(monthlySummaryData);
  wsMonthly['!cols'] = [{ wch: 50 }, { wch: 22 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsMonthly, 'Executive Summary');

  // Export workbook
  const filename = `Finance_Command_Center_${activeMonth}_Report.xlsx`;
  XLSX.writeFile(wb, filename);
};
