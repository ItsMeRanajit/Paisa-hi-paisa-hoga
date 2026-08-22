import React, { useState } from 'react';
import { BarChart2, Download } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore } from '../../store/useUIStore';
import {
  calculateBankMetrics,
  calculateCreditCardMetrics,
  calculateAllBanksAggregate,
} from '../../utils/calculations';
import { ScopeSelector, AnalysisScope } from './ScopeSelector';
import { FinancialHealthScore } from './FinancialHealthScore';
import { BankAnalysisView } from './BankAnalysisView';
import { CreditCardAnalysisView } from './CreditCardAnalysisView';
import { GoalAnalysisView } from './GoalAnalysisView';
import { LineTrendChart } from '../charts/LineTrendChart';
import { exportFinancialWorkbook } from '../../utils/excelExport';

export const AnalysisDashboard: React.FC = () => {
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

  const { addToast } = useUIStore();
  const [scope, setScope] = useState<AnalysisScope>('overall_financial_health');

  const currentMonthMap = monthlyData[activeMonth] || {};
  const currentMonthUnplanned = unplannedExpenses.filter((u) => u.month === activeMonth);
  const currentMonthOptional = optionalExpenses.filter((o) => o.month === activeMonth);

  const aggregate = calculateAllBanksAggregate(
    banks,
    currentMonthMap,
    currentMonthUnplanned,
    currentMonthOptional,
    userProfile.unplannedSpendingLimit
  );

  const bankSummaries = banks.map((bank) => {
    const mData = currentMonthMap[bank.id];
    const bUnplanned = currentMonthUnplanned.filter((u) => u.bankId === bank.id);
    const bOptional = currentMonthOptional.filter((o) => o.bankId === bank.id);
    const metrics = calculateBankMetrics(bank, mData, bUnplanned, bOptional, userProfile.unplannedSpendingLimit);
    return { bank, metrics };
  });

  const cardCalculations = creditCards.map((card) => {
    const cardTxs = creditTransactions.filter((t) => t.cardId === card.id && t.month === activeMonth);
    return calculateCreditCardMetrics(card, cardTxs);
  });

  const maxCardUtilization = cardCalculations.length > 0
    ? Math.max(...cardCalculations.map((c) => c.utilizationPercentage))
    : 0;

  const overBudgetCategoriesCount = bankSummaries.reduce(
    (count, b) => count + b.metrics.plannedRows.filter((r) => r.isOverBudget).length,
    0
  );

  const unplannedRatio = aggregate.totalSpendingPool > 0
    ? (aggregate.totalUnplannedSpent / aggregate.totalSpendingPool) * 100
    : 0;

  const handleExport = () => {
    try {
      exportFinancialWorkbook({
        userProfile,
        activeMonth,
        banks,
        monthlyData: currentMonthMap,
        optionalExpenses: currentMonthOptional,
        unplannedExpenses,
        creditCards,
        creditTransactions,
        goals,
      });
      addToast(`Downloaded Excel analysis for ${activeMonth}`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export report', 'danger');
    }
  };

  const trendData = [
    { label: 'Jun', income: 195000, spending: 128000, savings: 67000 },
    { label: 'Jul', income: 200000, spending: 135000, savings: 65000 },
    {
      label: 'Aug',
      income: aggregate.totalIncome,
      spending: aggregate.totalPlannedSpent + aggregate.totalOptionalSpent + aggregate.totalUnplannedSpent,
      savings: Math.max(0, aggregate.totalRemainingMoney),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-zinc-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Financial Analysis
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Diagnostics for {activeMonth}
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer self-start sm:self-auto border border-zinc-700/60"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Excel</span>
        </button>
      </div>

      {/* Scope Selector */}
      <ScopeSelector currentScope={scope} onSelectScope={setScope} />

      {/* Scope 1: Overall Financial Health */}
      {scope === 'overall_financial_health' && (
        <div className="space-y-5">
          <FinancialHealthScore
            savingsRate={aggregate.overallSavingsRate}
            unplannedRatio={unplannedRatio}
            maxCardUtilization={maxCardUtilization}
            overBudgetCategoriesCount={overBudgetCategoriesCount}
            totalPool={aggregate.totalSpendingPool}
            totalRemaining={aggregate.totalRemainingMoney}
            currency={userProfile.currency}
          />

          <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-5">
            <LineTrendChart data={trendData} currency={userProfile.currency} />
          </div>
        </div>
      )}

      {/* Scope 2: All Banks Aggregate */}
      {scope === 'all_banks' && (
        <BankAnalysisView
          banks={banks}
          bankSummaries={bankSummaries}
          userProfile={userProfile}
          activeMonth={activeMonth}
          isSingleBankView={false}
        />
      )}

      {/* Scope 3: Single Bank Workspace */}
      {scope === 'individual_bank' && (
        <BankAnalysisView
          banks={banks}
          bankSummaries={bankSummaries}
          userProfile={userProfile}
          activeMonth={activeMonth}
          isSingleBankView={true}
        />
      )}

      {/* Scope 4: Credit Cards Exposure */}
      {scope === 'all_credit_cards' && (
        <CreditCardAnalysisView
          creditCards={creditCards}
          creditTransactions={creditTransactions}
          userProfile={userProfile}
          activeMonth={activeMonth}
        />
      )}

      {/* Scope 5: Future Goals Timeline */}
      {scope === 'future_goals' && (
        <GoalAnalysisView
          goals={goals}
          banks={banks}
          userProfile={userProfile}
        />
      )}
    </div>
  );
};
