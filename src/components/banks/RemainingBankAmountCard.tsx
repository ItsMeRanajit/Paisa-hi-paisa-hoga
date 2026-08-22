import React from 'react';
import { BankCalculations } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface RemainingBankAmountCardProps {
  metrics: BankCalculations;
  currency?: string;
}

export const RemainingBankAmountCard: React.FC<RemainingBankAmountCardProps> = ({
  metrics,
  currency = '₹',
}) => {
  const isHealthy = metrics.remainingBankAmount >= 0;
  const percentageOfPool = ((metrics.remainingBankAmount / (metrics.totalSpendingPool || 1)) * 100);

  return (
    <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-4.5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Section 3: Remaining Balance (After Planned & Optional Commitments)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Pool ({formatCurrency(metrics.totalSpendingPool, currency)}) − Planned ({formatCurrency(metrics.plannedTotalSpent, currency)})
            {metrics.optionalTotalSpent > 0 && ` − Optional (${formatCurrency(metrics.optionalTotalSpent, currency)})`}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className={`text-xl sm:text-2xl font-bold font-mono ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(metrics.remainingBankAmount, currency)}
          </p>
          <p className="text-[11px] text-zinc-400">
            {formatPercentage(percentageOfPool)} of fund pool remaining
          </p>
        </div>
      </div>
    </div>
  );
};
