import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { BankAccount, BankCalculations, UserProfile } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { BarChart, BarChartItem } from '../charts/BarChart';
import { ProgressBar } from '../common/ProgressBar';
import { Select } from '../common/Input';

interface BankAnalysisViewProps {
  banks: BankAccount[];
  bankSummaries: Array<{ bank: BankAccount; metrics: BankCalculations }>;
  userProfile: UserProfile;
  activeMonth: string;
  isSingleBankView?: boolean;
}

export const BankAnalysisView: React.FC<BankAnalysisViewProps> = ({
  banks,
  bankSummaries,
  userProfile,
  isSingleBankView = false,
}) => {
  const [selectedBankId, setSelectedBankId] = useState(banks[0]?.id || '');

  const activeBankSummary = bankSummaries.find((b) => b.bank.id === selectedBankId) || bankSummaries[0];

  const bankSpendingBarItems: BarChartItem[] = bankSummaries.map(({ bank, metrics }) => ({
    id: bank.id,
    label: bank.bankName,
    primaryValue: metrics.plannedTotalSpent + metrics.unplannedTotal,
    secondaryValue: metrics.totalSpendingPool,
    primaryLabel: 'Spent',
    secondaryLabel: 'Pool',
    primaryColor: '#a1a1aa',
    secondaryColor: '#27272a',
  }));

  const allPlannedRows = bankSummaries.flatMap(({ bank, metrics }) =>
    metrics.plannedRows.map((r) => ({ ...r, bankName: bank.bankName }))
  );

  const overBudgetCategories = allPlannedRows.filter((r) => r.isOverBudget);
  const underBudgetCategories = allPlannedRows.filter((r) => !r.isOverBudget && r.amountSpent > 0);

  return (
    <div className="space-y-5 text-left">
      {isSingleBankView && (
        <div className="flex items-center gap-3">
          <Select
            label="Select Bank Workspace"
            value={selectedBankId}
            onChange={(e) => setSelectedBankId(e.target.value)}
            options={banks.map((b) => ({ value: b.id, label: `${b.bankName} (${b.nickname})` }))}
          />
        </div>
      )}

      {!isSingleBankView ? (
        <>
          {/* Comparison Bar Chart */}
          <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-5 space-y-3.5">
            <div className="border-b border-[#1e232c] pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Outflow vs Fund Pool per Bank
              </h4>
              <p className="text-[11px] text-zinc-400">Total spending relative to available pool</p>
            </div>

            <BarChart items={bankSpendingBarItems} currency={userProfile.currency} />
          </div>

          {/* Budget Diagnostic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Over Budget */}
            <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-4.5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-300">
                  Over-Budget Categories ({overBudgetCategories.length})
                </h4>
              </div>

              {overBudgetCategories.length === 0 ? (
                <p className="text-xs text-zinc-500 py-2">✓ All categories within budget limits.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {overBudgetCategories.map((cat) => (
                    <div key={`${cat.bankName}-${cat.masterId}`} className="rounded-xl bg-[#0c0e12] p-2.5 border border-rose-950/40 text-xs">
                      <div className="flex justify-between font-medium text-white">
                        <span>{cat.category} ({cat.bankName})</span>
                        <span className="text-rose-400 font-mono">+{formatCurrency(cat.amountSpent - cat.amountSet, userProfile.currency)}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                        <span>Budget: {formatCurrency(cat.amountSet, userProfile.currency)}</span>
                        <span>Spent: {formatCurrency(cat.amountSpent, userProfile.currency)} ({formatPercentage(cat.utilizationPercent)})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Under Budget */}
            <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-4.5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  Well-Managed Categories ({underBudgetCategories.length})
                </h4>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {underBudgetCategories.slice(0, 6).map((cat) => (
                  <div key={`${cat.bankName}-${cat.masterId}`} className="rounded-xl bg-[#0c0e12] p-2.5 border border-[#1c212b] text-xs">
                    <div className="flex justify-between font-medium text-white">
                      <span>{cat.category} ({cat.bankName})</span>
                      <span className="text-emerald-400 font-mono">−{formatCurrency(cat.remaining, userProfile.currency)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                      <span>Budget: {formatCurrency(cat.amountSet, userProfile.currency)}</span>
                      <span>Spent: {formatCurrency(cat.amountSpent, userProfile.currency)} ({formatPercentage(cat.utilizationPercent)})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : activeBankSummary ? (
        <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e232c] pb-3">
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                {activeBankSummary.bank.bankName} Analysis
              </h4>
              <p className="text-[11px] text-zinc-400">Budget category adherence</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Remaining: {formatCurrency(activeBankSummary.metrics.finalMonthlyRemaining, userProfile.currency)}
            </span>
          </div>

          <div className="space-y-2.5">
            {activeBankSummary.metrics.plannedRows.map((row) => (
              <div key={row.masterId} className="space-y-1 rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b]">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-zinc-200">{row.category}</span>
                  <span className={row.isOverBudget ? 'text-rose-400 font-mono' : 'text-emerald-400 font-mono'}>
                    {formatCurrency(row.amountSpent, userProfile.currency)} / {formatCurrency(row.amountSet, userProfile.currency)} ({formatPercentage(row.utilizationPercent)})
                  </span>
                </div>
                <ProgressBar
                  value={row.amountSpent}
                  max={row.amountSet || 1}
                  height="sm"
                  colorTheme={row.isOverBudget ? 'rose' : row.utilizationPercent > 85 ? 'amber' : 'emerald'}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
