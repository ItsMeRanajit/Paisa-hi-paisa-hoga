import React from 'react';
import { Target, ArrowUpRight } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { calculateGoalMetrics } from '../../utils/calculations';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { ProgressBar } from '../common/ProgressBar';

export const GoalSnapshot: React.FC = () => {
  const { goals, banks, setActiveTab } = useFinanceStore();

  if (goals.length === 0) return null;

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-zinc-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Future Goals ({goals.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('goals')}
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          View Commitments <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {goals.map((goal) => {
          const metrics = calculateGoalMetrics(goal);
          const isDone = metrics.isCompleted;

          return (
            <div
              key={goal.id}
              onClick={() => setActiveTab('goals')}
              className="rounded-2xl border border-[#222731] bg-[#13161c] p-4.5 transition-all hover:border-[#2d3340] hover:bg-[#161a22] cursor-pointer text-left"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-sm font-bold text-white tracking-tight truncate">
                    {goal.goalName}
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Target Date: {goal.expectedExpenseDate}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                    isDone
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                      : 'bg-zinc-800/60 text-zinc-300 border-zinc-700/50'
                  }`}
                >
                  {formatPercentage(metrics.completionPercentage)}
                </span>
              </div>

              {/* Progress */}
              <div className="my-2.5">
                <ProgressBar
                  value={metrics.totalSaved}
                  max={metrics.target}
                  height="sm"
                  colorTheme={isDone ? 'emerald' : 'zinc'}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-[#1c212b]">
                <span className="text-emerald-400 font-medium">
                  {formatCurrency(metrics.totalSaved)} saved
                </span>
                <span className="text-zinc-400">
                  Target: {formatCurrency(metrics.target)}
                </span>
              </div>

              {/* Bank Allocation Badges */}
              {goal.allocations && goal.allocations.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {goal.allocations.map((alloc) => {
                    const bank = banks.find((b) => b.id === alloc.bankId);
                    return (
                      <span
                        key={alloc.id}
                        className="rounded-md bg-[#0c0e12] px-2 py-0.5 text-[9px] font-medium text-zinc-400 border border-[#1c212b]"
                      >
                        {bank?.bankName || 'Bank'}:{' '}
                        {alloc.type === 'monthly_saving'
                          ? `₹${alloc.monthlyTarget.toLocaleString()}/mo`
                          : `Cut ₹${alloc.monthlyReductionAmount.toLocaleString()}/mo`}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
