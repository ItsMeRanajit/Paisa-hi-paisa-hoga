import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { calculateAllBanksAggregate, generateFinancialAlerts } from '../../utils/calculations';
import { FundPoolSummary } from './FundPoolSummary';
import { FinancialAlertsBanner } from './FinancialAlertsBanner';
import { BankSnapshotGrid } from './BankSnapshotGrid';
import { CreditCardSnapshot } from './CreditCardSnapshot';
import { GoalSnapshot } from './GoalSnapshot';

export const DashboardHome: React.FC = () => {
  const {
    banks,
    monthlyData,
    optionalExpenses,
    unplannedExpenses,
    creditCards,
    creditTransactions,
    goals,
    activeMonth,
    userProfile,
  } = useFinanceStore();

  const monthBankData = monthlyData[activeMonth] || {};
  const activeUnplanned = unplannedExpenses.filter((u) => u.month === activeMonth);
  const activeOptional = optionalExpenses.filter((o) => o.month === activeMonth);
  const activeCardTxs = creditTransactions.filter((t) => t.month === activeMonth);

  const aggregate = calculateAllBanksAggregate(
    banks,
    monthBankData,
    activeUnplanned,
    activeOptional,
    userProfile.unplannedSpendingLimit
  );

  const alerts = generateFinancialAlerts(
    banks,
    monthBankData,
    activeUnplanned,
    activeOptional,
    creditCards,
    activeCardTxs,
    goals,
    userProfile.unplannedSpendingLimit
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. Alerts Banner (If any) */}
      <FinancialAlertsBanner alerts={alerts} />

      {/* 2. Top Net Worth / Fund Pool Hero & Summary Metrics */}
      <FundPoolSummary
        totalIncome={aggregate.totalIncome}
        totalAmountAtBank={aggregate.totalAmountAtBank}
        totalSpendingPool={aggregate.totalSpendingPool}
        totalPlannedSpent={aggregate.totalPlannedSpent}
        totalOptionalSpent={aggregate.totalOptionalSpent}
        totalUnplannedSpent={aggregate.totalUnplannedSpent}
        totalRemainingMoney={aggregate.totalRemainingMoney}
        overallSavingsRate={aggregate.overallSavingsRate}
        currency={userProfile.currency}
      />

      {/* 3. Bank Workspaces Grid */}
      <BankSnapshotGrid />

      {/* 4. Credit Cards Snapshot */}
      <CreditCardSnapshot />

      {/* 5. Future Goals Snapshot */}
      <GoalSnapshot />
    </div>
  );
};
