import React from 'react';
import { Target, ArrowRight, Scissors, PiggyBank } from 'lucide-react';
import { BankAccount, FutureGoal } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { useFinanceStore } from '../../store/useFinanceStore';

interface BankGoalRemindersSectionProps {
  bank: BankAccount;
  goals: FutureGoal[];
  currency?: string;
}

export const BankGoalRemindersSection: React.FC<BankGoalRemindersSectionProps> = ({
  bank,
  goals,
  currency = '₹',
}) => {
  const { setActiveTab } = useFinanceStore();

  const relevantAllocations: Array<{
    goal: FutureGoal;
    allocation: typeof goals[0]['allocations'][0];
  }> = [];

  goals.forEach((goal) => {
    (goal.allocations || []).forEach((alloc) => {
      if (alloc.bankId === bank.id) {
        relevantAllocations.push({ goal, allocation: alloc });
      }
    });
  });

  if (relevantAllocations.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-4.5 text-left space-y-3">
      <div className="flex items-center justify-between border-b border-[#1e232c] pb-2.5">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-zinc-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Goal Commitments for {bank.bankName}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('goals')}
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <span>All Goals</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {relevantAllocations.map(({ goal, allocation }) => {
          const isMonthlySaving = allocation.type === 'monthly_saving';

          return (
            <div
              key={allocation.id}
              onClick={() => setActiveTab('goals')}
              className="rounded-xl border border-[#1c212b] bg-[#0c0e12] p-3 text-left hover:border-zinc-700/60 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
                    {isMonthlySaving ? <PiggyBank className="h-3 w-3" /> : <Scissors className="h-3 w-3" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{goal.goalName}</h4>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {isMonthlySaving ? 'Monthly Saving' : 'Budget Cut'}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold font-mono text-zinc-200">
                  {isMonthlySaving
                    ? formatCurrency(allocation.monthlyTarget, currency)
                    : `−${formatCurrency(allocation.monthlyReductionAmount, currency)}`}
                </span>
              </div>

              <div className="mt-1.5 text-[11px] text-zinc-300">
                {isMonthlySaving ? (
                  <p>Save <strong>{formatCurrency(allocation.monthlyTarget, currency)}</strong> this month.</p>
                ) : (
                  <p>
                    Reduce <strong>{allocation.plannedExpenseCategory}</strong> budget by{' '}
                    <strong>{formatCurrency(allocation.monthlyReductionAmount, currency)}</strong>.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
