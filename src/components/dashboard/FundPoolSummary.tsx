import React from 'react';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Sparkles } from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface FundPoolSummaryProps {
  totalIncome: number;
  totalAmountAtBank: number;
  totalSpendingPool: number;
  totalPlannedSpent: number;
  totalOptionalSpent?: number;
  totalUnplannedSpent: number;
  totalRemainingMoney: number;
  overallSavingsRate: number;
  currency?: string;
}

export const FundPoolSummary: React.FC<FundPoolSummaryProps> = ({
  totalIncome,
  totalAmountAtBank,
  totalSpendingPool,
  totalPlannedSpent,
  totalOptionalSpent = 0,
  totalUnplannedSpent,
  totalRemainingMoney,
  overallSavingsRate,
  currency = '₹',
}) => {
  const totalSpent = totalPlannedSpent + totalOptionalSpent + totalUnplannedSpent;

  return (
    <div className="space-y-4 text-left">
      {/* Primary Calm Hero Card */}
      <div className="rounded-3xl border border-[#222731] bg-[#13161c] p-5 sm:p-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Total Spending Pool ({formatPercentage(overallSavingsRate)} Savings Rate)
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
              {formatCurrency(totalSpendingPool, currency)}
            </h2>
            <p className="text-xs text-zinc-400 flex items-center gap-2 pt-0.5">
              <span>Income: <strong className="text-zinc-200">{formatCurrency(totalIncome, currency)}</strong></span>
              <span>•</span>
              <span>Reserves: <strong className="text-zinc-200">{formatCurrency(totalAmountAtBank, currency)}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#0c0e12] px-4 py-3 rounded-2xl border border-[#1c212b]">
            <div>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Net Remaining</span>
              <p className={`text-xl sm:text-2xl font-bold font-mono ${totalRemainingMoney >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(totalRemainingMoney, currency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          title="Income"
          value={formatCurrency(totalIncome, currency)}
          subtitle="All accounts"
          icon={TrendingUp}
        />

        <StatCard
          title="Planned"
          value={formatCurrency(totalPlannedSpent, currency)}
          subtitle="Fixed budgets"
          icon={Wallet}
        />

        <StatCard
          title="Optional (1-Off)"
          value={formatCurrency(totalOptionalSpent, currency)}
          subtitle="Month commitments"
          icon={Sparkles}
        />

        <StatCard
          title="Unplanned"
          value={formatCurrency(totalUnplannedSpent, currency)}
          subtitle="Variable spend"
          icon={TrendingDown}
        />

        <StatCard
          title="Total Outflow"
          value={formatCurrency(totalSpent, currency)}
          subtitle={`${((totalSpent / (totalSpendingPool || 1)) * 100).toFixed(1)}% of pool`}
          icon={PiggyBank}
        />
      </div>
    </div>
  );
};
