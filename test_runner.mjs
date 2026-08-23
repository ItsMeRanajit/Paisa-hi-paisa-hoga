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

console.log('--- RUNNING FINANCIAL CALCULATIONS & INTEGRITY TESTS ---');

// Test Fixtures
const sampleBank = {
  id: 'bank-test-01',
  bankName: 'HDFC Bank',
  nickname: 'Salary Account',
  accountNumberMasked: '•••• 4092',
  color: '#004c8f',
  createdAt: '2026-01-01',
  plannedCategories: [
    { id: 'cat-rent', category: 'House Rent', amountSet: 32000 },
    { id: 'cat-grocery', category: 'Grocery & Supermarket', amountSet: 12000 },
    { id: 'cat-sip', category: 'SIP & Mutual Funds', amountSet: 25000 },
    { id: 'cat-bills', category: 'Utilities', amountSet: 21000 },
  ],
};

const sampleMonthData = {
  bankId: 'bank-test-01',
  month: '2026-08',
  monthlyIncome: 145000,
  amountAtBank: 35000,
  plannedExpenseValues: {
    'cat-rent': { amountSet: 32000, amountSpent: 32000 },
    'cat-grocery': { amountSet: 12000, amountSpent: 11500 },
    'cat-sip': { amountSet: 25000, amountSpent: 25000 },
    'cat-bills': { amountSet: 21000, amountSpent: 18249 },
  },
  unplannedExpenseIds: [],
};

const sampleUnplanned = [
  { id: 'u1', bankId: 'bank-test-01', month: '2026-08', day: 5, description: 'Medical', amount: 4200 },
  { id: 'u2', bankId: 'bank-test-01', month: '2026-08', day: 12, description: 'Repair', amount: 2500 },
  { id: 'u3', bankId: 'bank-test-01', month: '2026-08', day: 18, description: 'Gifts', amount: 1850 },
];

const sampleOptional = [
  { id: 'opt1', bankId: 'bank-test-01', month: '2026-08', title: 'Car Insurance', amountSet: 14500, amountSpent: 14500, isPaid: true },
];

// Test 1: Bank Metrics
const hdfcMetrics = calculateBankMetrics(sampleBank, sampleMonthData, sampleUnplanned, sampleOptional, 18000);

// Total spending pool = 145000 + 35000 = 180000
assert(hdfcMetrics.totalSpendingPool === 180000, 'Total spending pool is 180,000');

// Planned total set = 90,000, Planned spent = 86,749
assert(hdfcMetrics.plannedTotalSet === 90000, 'Planned total budget set is 90,000');
assert(hdfcMetrics.plannedTotalSpent === 86749, `Planned spent is 86,749 (got ${hdfcMetrics.plannedTotalSpent})`);

// Optional total set = 14,500, Optional spent = 14,500
assert(hdfcMetrics.optionalTotalSet === 14500, 'Optional total set is 14,500');
assert(hdfcMetrics.optionalTotalSpent === 14500, 'Optional total spent is 14,500');

// Remaining bank amount after planned & optional = 180000 - 86749 - 14500 = 78,751
assert(hdfcMetrics.remainingBankAmount === 78751, `Remaining bank amount after planned & optional is 78,751 (got ${hdfcMetrics.remainingBankAmount})`);

// Unplanned total = 4200 + 2500 + 1850 = 8550
assert(hdfcMetrics.unplannedTotal === 8550, `Unplanned total is 8,550 (got ${hdfcMetrics.unplannedTotal})`);

// Final monthly remaining = 180000 - 86749 - 14500 - 8550 = 70,201
assert(hdfcMetrics.finalMonthlyRemaining === 70201, `Final net remaining is 70,201 (got ${hdfcMetrics.finalMonthlyRemaining})`);

// Test 2: Credit Card Metrics
const sampleCard = {
  id: 'card-01',
  cardName: 'Regalia Gold',
  issuer: 'HDFC Bank',
  creditLimit: 350000,
  billingCycleStart: 12,
  billingCycleEnd: 11,
};
const sampleCardTxs = [
  { id: 'tx1', cardId: 'card-01', month: '2026-08', amount: 7300, expenseType: 'essential' },
  { id: 'tx2', cardId: 'card-01', month: '2026-08', amount: 23200, expenseType: 'non_essential' },
];

const regaliaMetrics = calculateCreditCardMetrics(sampleCard, sampleCardTxs);

assert(regaliaMetrics.currentOutstanding === 30500, `Card outstanding is 30,500 (got ${regaliaMetrics.currentOutstanding})`);
assert(regaliaMetrics.utilizationPercentage < 30, 'Card utilization is healthy (< 30%)');
assert(regaliaMetrics.essentialAmount === 7300, 'Card essential amount is 7,300');
assert(regaliaMetrics.nonEssentialAmount === 23200, 'Card non-essential amount is 23,200');

// Test 3: Goal Tracking Metrics
const sampleGoal = {
  id: 'goal-01',
  goalName: 'Goa Trip',
  targetAmount: 85000,
  actualSaved: 55000,
  monthlyTarget: 10000,
  expectedExpenseDate: '2026-12-31',
};
const goaMetrics = calculateGoalMetrics(sampleGoal);
assert(goaMetrics.target === 85000, 'Goal target is 85,000');
assert(goaMetrics.remaining === 30000, 'Goal remaining is 30,000');
assert(Math.round(goaMetrics.completionPercentage) === 65, 'Goal completion is ~65%');

// Test 4: Formatters
assert(formatCurrency(70201) === '₹70,201', 'formatCurrency formats 70201 as ₹70,201');
assert(formatMonthDisplay('2026-08') === 'August 2026', 'formatMonthDisplay formats 2026-08 as August 2026');
assert(formatDayWithMonth(14, '2026-08') === '14 August 2026', 'formatDayWithMonth formats 14 as 14 August 2026');

// Test 5: All Banks Aggregation with Optional Expenses
const sampleMonthlyDataMap = {
  'bank-test-01': sampleMonthData,
};
const aggregate = calculateAllBanksAggregate(
  [sampleBank],
  sampleMonthlyDataMap,
  sampleUnplanned,
  sampleOptional,
  18000
);

assert(aggregate.totalIncome === 145000, `Total income is 145,000 (got ${aggregate.totalIncome})`);
assert(aggregate.totalAmountAtBank === 35000, `Total starting balance is 35,000 (got ${aggregate.totalAmountAtBank})`);
assert(aggregate.totalSpendingPool === 180000, `Total spending pool is 180,000 (got ${aggregate.totalSpendingPool})`);
assert(aggregate.totalOptionalSpent === 14500, `Total optional spent is 14,500 (got ${aggregate.totalOptionalSpent})`);

// Test 6: Zero Spends Simulation (Empty All Expenses)
const zeroSpendMonthData = {
  bankId: sampleBank.id,
  month: '2026-08',
  monthlyIncome: 145000,
  amountAtBank: 35000,
  plannedExpenseValues: {
    'cat-rent': { amountSet: 32000, amountSpent: 0 },
    'cat-grocery': { amountSet: 12000, amountSpent: 0 },
    'cat-sip': { amountSet: 25000, amountSpent: 0 },
    'cat-bills': { amountSet: 21000, amountSpent: 0 },
  },
  unplannedExpenseIds: [],
};

const zeroMetrics = calculateBankMetrics(sampleBank, zeroSpendMonthData, [], [], 18000);
assert(zeroMetrics.plannedTotalSpent === 0, 'Zero spent simulation has 0 planned spent');
assert(zeroMetrics.unplannedTotal === 0, 'Zero spent simulation has 0 unplanned spent');
assert(zeroMetrics.optionalTotalSpent === 0, 'Zero spent simulation has 0 optional spent');
assert(zeroMetrics.finalMonthlyRemaining === 180000, 'Zero spent simulation leaves full 180,000 remaining');
assert(zeroMetrics.plannedTotalSet === 90000, 'Zero spent simulation preserves full planned category budget');

console.log(`\nTEST RESULTS: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
