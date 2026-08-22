import React from 'react';
import { FutureGoal, BankAccount, UserProfile } from '../../types/finance';
import { calculateGoalMetrics } from '../../utils/calculations';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { ProgressBar } from '../common/ProgressBar';

interface GoalAnalysisViewProps {
  goals: FutureGoal[];
  banks: BankAccount[];
  userProfile: UserProfile;
}

export const GoalAnalysisView: React.FC<GoalAnalysisViewProps> = ({
  goals,
  banks,
  userProfile,
}) => {
  return (
    <div className="space-y-5 text-left">
      <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-5 space-y-4">
        <div className="border-b border-[#1e232c] pb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Goals Timeline & Funding Sources
          </h4>
          <p className="text-[11px] text-zinc-400">
            Accumulated savings vs target deadlines
          </p>
        </div>

        <div className="space-y-3">
          {goals.map((goal) => {
            const metrics = calculateGoalMetrics(goal);
            const isDone = metrics.isCompleted;

            return (
              <div
                key={goal.id}
                className="rounded-xl border border-[#1c212b] bg-[#0c0e12] p-4 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-white">{goal.goalName}</h5>
                    <p className="text-[11px] text-zinc-400">{goal.description}</p>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${
                      isDone
                        ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                        : 'bg-zinc-850 text-zinc-300 border-zinc-700'
                    }`}
                  >
                    {formatPercentage(metrics.completionPercentage)} Funded
                  </span>
                </div>

                <ProgressBar
                  value={metrics.totalSaved}
                  max={metrics.target}
                  height="sm"
                  colorTheme={isDone ? 'emerald' : 'zinc'}
                />

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-1 text-zinc-400">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-500">Saved</span>
                    <p className="text-emerald-400 font-bold">{formatCurrency(metrics.totalSaved, userProfile.currency)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-500">Target</span>
                    <p className="text-zinc-200 font-bold">{formatCurrency(metrics.target, userProfile.currency)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-500">Remaining</span>
                    <p className="text-zinc-300 font-bold">{formatCurrency(metrics.remaining, userProfile.currency)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-500">Target Date</span>
                    <p className="text-zinc-300 font-bold">{goal.expectedExpenseDate}</p>
                  </div>
                </div>

                {goal.allocations && goal.allocations.length > 0 && (
                  <div className="pt-2 border-t border-[#1c212b] flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase">Sources:</span>
                    {goal.allocations.map((a) => {
                      const b = banks.find((item) => item.id === a.bankId);
                      return (
                        <span
                          key={a.id}
                          className="rounded-md bg-[#13161c] px-2 py-0.5 text-[9px] font-medium text-zinc-400 border border-[#222731]"
                        >
                          {b?.bankName}: {a.type === 'monthly_saving' ? `Save ₹${a.monthlyTarget}/mo` : `Cut ${a.plannedExpenseCategory}`}
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
    </div>
  );
};
