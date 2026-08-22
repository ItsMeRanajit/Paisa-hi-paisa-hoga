import {
  calculateBankMetrics,
  calculateCreditCardMetrics,
  calculateGoalMetrics,
  calculateAllBanksAggregate,
  generateFinancialAlerts,
} from './src/utils/calculations.js';
import {
  formatCurrency,
  formatPercentage,
  formatMonthDisplay,
  formatDayWithMonth,
  getOffsetMonth,
} from './src/utils/formatters.js';
import {
  INITIAL_BANKS,
  INITIAL_CREDIT_CARDS,
  INITIAL_FUTURE_GOALS,
  INITIAL_MONTHLY_DATA,
  INITIAL_OPTIONAL_EXPENSES,
  INITIAL_UNPLANNED_EXPENSES,
  INITIAL_CREDIT_TRANSACTIONS,
  INITIAL_USER_PROFILE,
} from './src/utils/mockData.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- RUNNING FINANCIAL CALCULATIONS & INTEGRITY TESTS (WITH OPTIONAL EXPENSES) ---');

// Test 1: Bank Metrics for HDFC Bank in Aug 2026
const hdfcBank = INITIAL_BANKS[0];
const hdfcMonthData = INITIAL_MONTHLY_DATA['2026-08']['bank-hdfc-01'];
const hdfcUnplanned = INITIAL_UNPLANNED_EXPENSES.filter(
  (u) => u.bankId === hdfcBank.id && u.month === '2026-08'
);
const hdfcOptional = INITIAL_OPTIONAL_EXPENSES.filter(
  (o) => o.bankId === hdfcBank.id && o.month === '2026-08'
);

const hdfcMetrics = calculateBankMetrics(hdfcBank, hdfcMonthData, hdfcUnplanned, hdfcOptional, 18000);

// Total spending pool = 145000 + 35000 = 180000
assert(hdfcMetrics.totalSpendingPool === 180000, 'HDFC Total spending pool is 180,000');

// Planned total set = 90,000, Planned spent = 86,749
assert(hdfcMetrics.plannedTotalSet === 90000, 'HDFC Planned total budget set is 90,000');
assert(hdfcMetrics.plannedTotalSpent === 86749, `HDFC Planned spent is 86,749 (got ${hdfcMetrics.plannedTotalSpent})`);

// Optional total set = 14,500, Optional spent = 14,500
assert(hdfcMetrics.optionalTotalSet === 14500, 'HDFC Optional total set is 14,500');
assert(hdfcMetrics.optionalTotalSpent === 14500, 'HDFC Optional total spent is 14,500');

// Remaining bank amount after planned & optional = 180000 - 86749 - 14500 = 78,751
assert(hdfcMetrics.remainingBankAmount === 78751, `HDFC Remaining bank amount after planned & optional is 78,751 (got ${hdfcMetrics.remainingBankAmount})`);

// Unplanned total = 4200 + 2500 + 1850 = 8550
assert(hdfcMetrics.unplannedTotal === 8550, `HDFC Unplanned total is 8,550 (got ${hdfcMetrics.unplannedTotal})`);

// Final monthly remaining = 180000 - 86749 - 14500 - 8550 = 70,201
assert(hdfcMetrics.finalMonthlyRemaining === 70201, `HDFC Final net remaining is 70,201 (got ${hdfcMetrics.finalMonthlyRemaining})`);

// Test 2: Credit Card Metrics
const regaliaCard = INITIAL_CREDIT_CARDS[0];
const regaliaTxs = INITIAL_CREDIT_TRANSACTIONS.filter((t) => t.cardId === regaliaCard.id);
const regaliaMetrics = calculateCreditCardMetrics(regaliaCard, regaliaTxs);

assert(regaliaMetrics.currentOutstanding === 30500, `Regalia outstanding is 30,500 (got ${regaliaMetrics.currentOutstanding})`);
assert(regaliaMetrics.utilizationPercentage < 30, 'Regalia utilization is healthy (< 30%)');
assert(regaliaMetrics.essentialAmount === 7300, 'Regalia essential amount is 7,300');
assert(regaliaMetrics.nonEssentialAmount === 23200, 'Regalia non-essential amount is 23,200');

// Test 3: Goal Tracking Metrics
const goaGoal = INITIAL_FUTURE_GOALS[0];
const goaMetrics = calculateGoalMetrics(goaGoal);
assert(goaMetrics.target === 85000, 'Goa Goal target is 85,000');
assert(goaMetrics.remaining === 30000, 'Goa Goal remaining is 30,000');
assert(Math.round(goaMetrics.completionPercentage) === 65, 'Goa Goal completion is ~65%');

// Test 4: Formatters
assert(formatCurrency(70201) === '₹70,201', 'formatCurrency formats 70201 as ₹70,201');
assert(formatMonthDisplay('2026-08') === 'August 2026', 'formatMonthDisplay formats 2026-08 as August 2026');
assert(formatDayWithMonth(14, '2026-08') === '14 August 2026', 'formatDayWithMonth formats 14 as 14 August 2026');

// Test 5: All Banks Aggregation with Optional Expenses
const aggregate = calculateAllBanksAggregate(
  INITIAL_BANKS,
  INITIAL_MONTHLY_DATA['2026-08'],
  INITIAL_UNPLANNED_EXPENSES.filter((u) => u.month === '2026-08'),
  INITIAL_OPTIONAL_EXPENSES.filter((o) => o.month === '2026-08'),
  18000
);

assert(aggregate.totalIncome === 208000, `Total income is 208,000 (got ${aggregate.totalIncome})`);
assert(aggregate.totalAmountAtBank === 232000, `Total starting balance is 232,000 (got ${aggregate.totalAmountAtBank})`);
assert(aggregate.totalSpendingPool === 440000, `Total spending pool is 440,000 (got ${aggregate.totalSpendingPool})`);
// Optional total across 3 banks = 14500 + 6000 + 4500 = 25,000
assert(aggregate.totalOptionalSpent === 25000, `Total optional spent across all banks is 25,000 (got ${aggregate.totalOptionalSpent})`);

console.log(`\nTEST RESULTS: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
