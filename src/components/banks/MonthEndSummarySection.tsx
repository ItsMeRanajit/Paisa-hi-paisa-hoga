import React from 'react';
import { BankAccount, BankCalculations } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { DonutChart, ChartSegment } from '../charts/DonutChart';
import { ProgressBar } from '../common/ProgressBar';

interface MonthEndSummarySectionProps {
  bank: BankAccount;
  metrics: BankCalculations;
  currency?: string;
}

export const MonthEndSummarySection: React.FC<MonthEndSummarySectionProps> = ({
  bank,
  metrics,
  currency = '₹',
}) => {
  const isHealthy = metrics.finalMonthlyRemaining >= 0;

  const chartSegments: ChartSegment[] = [
    {
      id: 'planned',
      label: 'Planned',
      value: metrics.plannedTotalSpent,
      color: '#94a3b8', // Slate
    },
    {
      id: 'optional',
      label: 'Optional (One-off)',
      value: metrics.optionalTotalSpent,
      color: '#c084fc', // Soft Purple
    },
    {
      id: 'unplanned',
      label: 'Unplanned',
      value: metrics.unplannedTotal,
      color: '#fbbf24', // Warm Amber
    },
    {
      id: 'remaining',
      label: 'Net Remaining',
      value: Math.max(0, metrics.finalMonthlyRemaining),
      color: '#34d399', // Soft Sage
    },
  ];

  return (
    <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-5 text-left space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e232c] pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Month-End Financial Reconciliation
          </h3>
          <p className="text-[11px] text-zinc-400">Complete outflow distribution for {bank.bankName}</p>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            isHealthy
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
              : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
          }`}
        >
          {isHealthy ? 'Surplus' : 'Deficit'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left: Summary Metrics */}
        <div className="lg:col-span-7 space-y-3">
          <div className="rounded-xl bg-[#0c0e12] p-4 border border-[#1c212b] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Total Fund Pool</span>
              <span className="font-mono font-bold text-white">
                {formatCurrency(metrics.totalSpendingPool, currency)}
              </span>
            </div>

            <div className="flex items-center justify-between text-zinc-300">
              <span>− Planned Outflow</span>
              <span className="font-mono">
                {formatCurrency(metrics.plannedTotalSpent, currency)} ({formatPercentage(metrics.plannedSpendingPercentage)})
              </span>
            </div>

            {metrics.optionalTotalSpent > 0 && (
              <div className="flex items-center justify-between text-purple-300">
                <span>− Optional (One-Off) Outflow</span>
                <span className="font-mono">
                  {formatCurrency(metrics.optionalTotalSpent, currency)} ({formatPercentage(metrics.optionalSpendingPercentage)})
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-zinc-300">
              <span>− Unplanned Outflow</span>
              <span className="font-mono">
                {formatCurrency(metrics.unplannedTotal, currency)} ({formatPercentage(metrics.unplannedSpendingPercentage)})
              </span>
            </div>

            <div className="border-t border-[#1e232c] pt-2 flex items-center justify-between">
              <span className="font-semibold uppercase tracking-wider text-zinc-300">
                Final Net Remaining
              </span>
              <span
                className={`font-mono text-base font-bold ${
                  isHealthy ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(metrics.finalMonthlyRemaining, currency)}
              </span>
            </div>
          </div>

          {/* 4 Metric Progress Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#0c0e12] p-2.5 border border-[#1c212b]">
              <div className="flex justify-between text-[10px] font-semibold uppercase text-zinc-400">
                <span>Planned %</span>
                <span className="text-zinc-300 font-mono">{formatPercentage(metrics.plannedSpendingPercentage)}</span>
              </div>
              <ProgressBar value={metrics.plannedSpendingPercentage} height="sm" colorTheme="zinc" className="mt-1" />
            </div>

            <div className="rounded-xl bg-[#0c0e12] p-2.5 border border-[#1c212b]">
              <div className="flex justify-between text-[10px] font-semibold uppercase text-purple-300">
                <span>Optional %</span>
                <span className="text-purple-300 font-mono">{formatPercentage(metrics.optionalSpendingPercentage)}</span>
              </div>
              <ProgressBar value={metrics.optionalSpendingPercentage} height="sm" colorTheme="purple" className="mt-1" />
            </div>

            <div className="rounded-xl bg-[#0c0e12] p-2.5 border border-[#1c212b]">
              <div className="flex justify-between text-[10px] font-semibold uppercase text-amber-400">
                <span>Unplanned %</span>
                <span className="text-amber-400 font-mono">{formatPercentage(metrics.unplannedSpendingPercentage)}</span>
              </div>
              <ProgressBar value={metrics.unplannedSpendingPercentage} height="sm" colorTheme="amber" className="mt-1" />
            </div>

            <div className="rounded-xl bg-[#0c0e12] p-2.5 border border-[#1c212b]">
              <div className="flex justify-between text-[10px] font-semibold uppercase text-zinc-400">
                <span>Net Remaining %</span>
                <span className={`font-mono ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatPercentage(metrics.remainingMoneyPercentage)}
                </span>
              </div>
              <ProgressBar
                value={Math.max(0, metrics.remainingMoneyPercentage)}
                height="sm"
                colorTheme={isHealthy ? 'emerald' : 'rose'}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Right: Pool Distribution Chart */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 rounded-xl bg-[#0c0e12] border border-[#1c212b]">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Pool Outflow Distribution
          </h4>
          <DonutChart
            segments={chartSegments}
            totalLabel="Total Pool"
            totalValue={metrics.totalSpendingPool}
            size={160}
            strokeWidth={18}
            currency={currency}
          />
        </div>
      </div>
    </div>
  );
};
