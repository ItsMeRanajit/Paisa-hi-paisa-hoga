import React from 'react';
import { Landmark, ArrowUpRight, Plus } from 'lucide-react';
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

  const handleAddBank = () => {
    setActiveTab('profile');
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
              className="group rounded-2xl border border-[#222731] bg-[#13161c] p-4.5 transition-all hover:border-[#2d3340] hover:bg-[#161a22] cursor-pointer text-left"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
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
              <div className="grid grid-cols-2 gap-2 my-3 rounded-xl bg-[#0c0e12] p-2.5 border border-[#1c212b]">
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

              {/* Spending Progress */}
              <ProgressBar
                value={totalSpent}
                max={metrics.totalSpendingPool || 1}
                height="sm"
                showLabel
                label="Total Spent"
                sublabel={`${formatCurrency(totalSpent)} (${formatPercentage(metrics.totalSpendingPercentage)})`}
                colorTheme={isDeficit ? 'rose' : metrics.totalSpendingPercentage > 85 ? 'amber' : 'emerald'}
              />
            </div>
          );
        })}

        {/* Add Bank Button Card */}
        <button
          type="button"
          onClick={handleAddBank}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#222731] bg-[#101318]/50 p-6 text-center hover:border-zinc-700 hover:bg-[#13161c] transition-all cursor-pointer group min-h-[150px]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700 mb-2">
            <Plus className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-zinc-300">Add Account</span>
          <span className="text-[10px] text-zinc-400 mt-0.5">Configure bank & budgets</span>
        </button>
      </div>
    </div>
  );
};
