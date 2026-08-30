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
    <div className="space-y-3.5 text-left">
      {/* Primary Calm Hero Card */}
      <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-4 sm:p-5 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Total Spending Pool ({formatPercentage(overallSavingsRate)} Savings Rate)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              {formatCurrency(totalSpendingPool, currency)}
            </h2>
            <p className="text-[11px] text-zinc-400 flex items-center gap-2 pt-0.5">
              <span>Income: <strong className="text-zinc-200">{formatCurrency(totalIncome, currency)}</strong></span>
              <span>•</span>
              <span>Reserves: <strong className="text-zinc-200">{formatCurrency(totalAmountAtBank, currency)}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#0c0e12] px-3.5 py-2.5 rounded-xl border border-[#1c212b] self-start md:self-auto">
            <div>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Net Remaining</span>
              <p className={`text-lg sm:text-xl font-bold font-mono ${totalRemainingMoney >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(totalRemainingMoney, currency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
        <StatCard
          title="Income"
          value={formatCurrency(totalIncome, currency)}
          subtitle="All accounts"
          icon={TrendingUp}
          compact
        />

        <StatCard
          title="Planned"
          value={formatCurrency(totalPlannedSpent, currency)}
          subtitle="Fixed budgets"
          icon={Wallet}
          compact
        />

        <StatCard
          title="Month Commitments"
          value={formatCurrency(totalOptionalSpent, currency)}
          subtitle="1-month target"
          icon={Sparkles}
          compact
        />

        <StatCard
          title="Unplanned"
          value={formatCurrency(totalUnplannedSpent, currency)}
          subtitle="Variable spend"
          icon={TrendingDown}
          compact
        />

        <StatCard
          title="Total Outflow"
          value={formatCurrency(totalSpent, currency)}
          subtitle={`${((totalSpent / (totalSpendingPool || 1)) * 100).toFixed(1)}% of pool`}
          icon={PiggyBank}
          compact
        />
      </div>
    </div>
  );
};
