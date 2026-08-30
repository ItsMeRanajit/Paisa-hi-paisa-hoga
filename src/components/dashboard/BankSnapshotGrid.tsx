import React from 'react';
import { Landmark, ArrowUpRight } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { calculateBankMetrics } from '../../utils/calculations';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { ProgressBar } from '../common/ProgressBar';

export const BankSnapshotGrid: React.FC = () => {
  const {
    banks,
    monthlyData,
    optionalExpenses,
    unplannedExpenses,
    activeMonth,
    userProfile,
    setSelectedBankId,
    setActiveTab,
  } = useFinanceStore();

  const handleBankClick = (bankId: string) => {
    setSelectedBankId(bankId);
    setActiveTab('banks');
  };

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-zinc-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Bank Accounts ({banks.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('banks')}
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          View All <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {banks.map((bank) => {
          const mData = monthlyData[activeMonth]?.[bank.id];
          const bankUnplanned = unplannedExpenses.filter(
            (u) => u.bankId === bank.id && u.month === activeMonth
          );
          const bankOptional = optionalExpenses.filter(
            (o) => o.bankId === bank.id && o.month === activeMonth
          );
          const metrics = calculateBankMetrics(
            bank,
            mData,
            bankUnplanned,
            bankOptional,
            userProfile.unplannedSpendingLimit
          );

          const totalSpent = metrics.plannedTotalSpent + metrics.optionalTotalSpent + metrics.unplannedTotal;
          const isDeficit = metrics.finalMonthlyRemaining < 0;

          return (
            <div
              key={bank.id}
              onClick={() => handleBankClick(bank.id)}
              className="group rounded-2xl border border-[#222731] bg-[#13161c] p-4 transition-all hover:border-[#2d3340] hover:bg-[#161a22] cursor-pointer text-left space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {bank.bankName}
                  </h4>
                  <p className="text-[11px] text-zinc-400">{bank.nickname}</p>
                </div>
                <span className="rounded-md bg-[#0c0e12] px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-[#1c212b]">
                  {bank.accountNumberMasked || '••••'}
                </span>
              </div>

              {/* Fund Pool vs Remaining */}
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#0c0e12] p-2.5 border border-[#1c212b]">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-400">Fund Pool</span>
                  <p className="text-sm font-bold font-mono text-white">
                    {formatCurrency(metrics.totalSpendingPool)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-400">Remaining</span>
                  <p className={`text-sm font-bold font-mono ${isDeficit ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {formatCurrency(metrics.finalMonthlyRemaining)}
                  </p>
                </div>
              </div>

              {/* 3 Categories Breakdown (Planned, Commitments, Unplanned) */}
              <div className="space-y-2 rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b]">
                {/* Planned */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                      Planned
                    </span>
                    <span className="font-mono text-zinc-300">
                      <strong className="text-white font-bold">{formatCurrency(metrics.plannedTotalSpent)}</strong>
                      <span className="text-zinc-500"> / {formatCurrency(metrics.plannedTotalSet)}</span>
                    </span>
                  </div>
                  <div className="h-1 w-full bg-zinc-850 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          metrics.plannedTotalSet > 0
                            ? (metrics.plannedTotalSpent / metrics.plannedTotalSet) * 100
                            : 0,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Month Specific Commitments */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
                      Commitments
                    </span>
                    <span className="font-mono text-zinc-300">
                      <strong className="text-white font-bold">{formatCurrency(metrics.optionalTotalSpent)}</strong>
                      <span className="text-zinc-500"> / {formatCurrency(metrics.optionalTotalSet)}</span>
                    </span>
                  </div>
                  <div className="h-1 w-full bg-zinc-850 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          metrics.optionalTotalSet > 0
                            ? (metrics.optionalTotalSpent / metrics.optionalTotalSet) * 100
                            : 0,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Unplanned */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                      Unplanned
                    </span>
                    <span className="font-mono text-zinc-300">
                      <strong className="text-white font-bold">{formatCurrency(metrics.unplannedTotal)}</strong>
                      <span className="text-zinc-500"> / {formatCurrency(metrics.unplannedLimit)}</span>
                    </span>
                  </div>
                  <div className="h-1 w-full bg-zinc-850 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        metrics.unplannedLimitStatus === 'limit_exceeded' ? 'bg-rose-500' : 'bg-amber-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          metrics.unplannedLimit > 0
                            ? (metrics.unplannedTotal / metrics.unplannedLimit) * 100
                            : 0,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Total Spending Pool Progress */}
              <ProgressBar
                value={totalSpent}
                max={metrics.totalSpendingPool || 1}
                height="sm"
                showLabel
                label="Pool Outflow"
                sublabel={`${formatCurrency(totalSpent)} (${formatPercentage(metrics.totalSpendingPercentage)})`}
                colorTheme={isDeficit ? 'rose' : metrics.totalSpendingPercentage > 85 ? 'amber' : 'emerald'}
              />
            </div>
          );
        })}

        {banks.length === 0 && (
          <div className="col-span-full py-8 text-center rounded-2xl border border-dashed border-[#222731] bg-[#101318]/40 text-xs text-zinc-500">
            No bank accounts configured yet. Go to Profile / Settings to add an account.
          </div>
        )}
      </div>
    </div>
  );
};
