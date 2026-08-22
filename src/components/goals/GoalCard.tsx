import React, { useState } from 'react';
import { CheckCircle2, Edit2, Trash2, Plus, Calendar, Scissors, PiggyBank } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FutureGoal, BankAccount } from '../../types/finance';
import { calculateGoalMetrics } from '../../utils/calculations';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { ProgressBar } from '../common/ProgressBar';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore } from '../../store/useUIStore';

interface GoalCardProps {
  goal: FutureGoal;
  banks: BankAccount[];
  currency?: string;
  onEdit: (goal: FutureGoal) => void;
  onDelete: (goalId: string) => void;
  onAddAllocation: (goal: FutureGoal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  banks,
  currency = '₹',
  onEdit,
  onDelete,
  onAddAllocation,
}) => {
  const { toggleGoalSuccess, updateGoalSavedAmount, removeGoalAllocation } = useFinanceStore();
  const { addToast } = useUIStore();

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositVal, setDepositVal] = useState('');

  const metrics = calculateGoalMetrics(goal);
  const isCompleted = goal.isManualSuccess || metrics.completionPercentage >= 100;

  const handleToggleSuccess = () => {
    toggleGoalSuccess(goal.id);
    if (!goal.isManualSuccess) {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
      });
      addToast(`🎉 Goal achieved: ${goal.goalName}!`, 'success');
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deposit = parseFloat(depositVal) || 0;
    if (!deposit) return;

    const newTotal = (goal.actualSaved || 0) + deposit;
    updateGoalSavedAmount(goal.id, newTotal);

    if (newTotal >= goal.targetAmount && !goal.isManualSuccess) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    addToast(`Added ₹${deposit.toLocaleString()} toward ${goal.goalName}`, 'success');
    setDepositVal('');
    setIsDepositOpen(false);
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-all text-left ${
        isCompleted
          ? 'border-emerald-900/40 bg-[#121815]'
          : 'border-[#222731] bg-[#13161c] hover:border-zinc-700/60'
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3.5">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight truncate">{goal.goalName}</h3>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/50 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-800/40">
                Achieved
              </span>
            )}
          </div>
          {goal.description && <p className="text-xs text-zinc-400">{goal.description}</p>}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 pt-0.5">
            <Calendar className="h-3 w-3 text-zinc-400" />
            <span>Target: <strong>{goal.expectedExpenseDate}</strong></span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleSuccess}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
              isCompleted
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{isCompleted ? 'Achieved' : 'Mark Achieved'}</span>
          </button>

          <button
            type="button"
            onClick={() => onEdit(goal)}
            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            title="Edit"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(goal.id)}
            className="p-1.5 rounded-lg text-zinc-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Progress & Target */}
      <div className="space-y-2 my-3.5 rounded-xl bg-[#0c0e12] p-3.5 border border-[#1c212b]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase text-zinc-400">Total Saved</span>
            <p className="text-lg font-bold font-mono text-emerald-400">
              {formatCurrency(metrics.totalSaved, currency)}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-semibold uppercase text-zinc-400">Target</span>
            <p className="text-lg font-bold font-mono text-white">
              {formatCurrency(metrics.target, currency)}
            </p>
          </div>
        </div>

        <ProgressBar
          value={metrics.totalSaved}
          max={metrics.target}
          height="sm"
          showLabel
          label={`Progress (${formatPercentage(metrics.completionPercentage)})`}
          sublabel={`Remaining: ${formatCurrency(metrics.remaining, currency)}`}
          colorTheme={isCompleted ? 'emerald' : 'zinc'}
        />

        {!isDepositOpen ? (
          <div className="pt-1.5 flex justify-between items-center text-xs">
            <span className="text-zinc-400">
              Monthly target: <strong className="text-zinc-200 font-mono">{formatCurrency(goal.monthlyTarget, currency)}/mo</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsDepositOpen(true)}
              className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>Log Deposit</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleDepositSubmit} className="pt-1.5 flex items-center gap-2 animate-fade-in">
            <input
              type="number"
              placeholder="Amount (e.g. 5000)"
              className="w-full rounded-xl bg-[#13161c] border border-zinc-600 px-3 py-1.5 text-xs text-white focus:outline-none font-mono"
              value={depositVal}
              onChange={(e) => setDepositVal(e.target.value)}
              autoFocus
              required
            />
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-3 py-1.5 text-xs font-semibold shrink-0 cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsDepositOpen(false)}
              className="text-xs text-zinc-400 hover:text-zinc-200 px-2 shrink-0 cursor-pointer"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* Multi-Bank Allocations */}
      <div className="space-y-2 pt-2 border-t border-[#1c212b]">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Bank Allocations ({goal.allocations?.length || 0})
          </h4>
          <button
            type="button"
            onClick={() => onAddAllocation(goal)}
            className="text-[11px] font-medium text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            <span>Add Bank Source</span>
          </button>
        </div>

        {(!goal.allocations || goal.allocations.length === 0) ? (
          <p className="text-xs text-zinc-400 italic py-0.5">
            No bank-specific allocations attached.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {goal.allocations.map((alloc) => {
              const bank = banks.find((b) => b.id === alloc.bankId);
              const isMonthlySaving = alloc.type === 'monthly_saving';

              return (
                <div
                  key={alloc.id}
                  className="group flex items-start justify-between gap-2 rounded-xl bg-[#0c0e12] p-2.5 border border-[#1c212b] text-left hover:border-zinc-700/60 transition-all"
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
                      {isMonthlySaving ? <PiggyBank className="h-3 w-3" /> : <Scissors className="h-3 w-3" />}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-semibold text-white truncate">
                        {bank?.bankName || 'Bank'}
                      </p>
                      <p className="text-[11px] text-zinc-300">
                        {isMonthlySaving ? (
                          <span>Save <strong>{formatCurrency(alloc.monthlyTarget, currency)}/mo</strong></span>
                        ) : (
                          <span>Cut <strong>{alloc.plannedExpenseCategory}</strong> by <strong>{formatCurrency(alloc.monthlyReductionAmount, currency)}/mo</strong></span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeGoalAllocation(goal.id, alloc.id)}
                    className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
