import React, { useState } from 'react';
import { Target, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { FutureGoal, GoalAllocationType } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore } from '../../store/useUIStore';
import { GoalCard } from './GoalCard';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';
import { Input, Select } from '../common/Input';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { StatCard } from '../common/StatCard';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

export const GoalsPage: React.FC = () => {
  const {
    goals,
    banks,
    userProfile,
    addGoal,
    updateGoal,
    deleteGoal,
    addGoalAllocation,
  } = useFinanceStore();

  const { addToast } = useUIStore();

  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  // Add / Edit Goal Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FutureGoal | null>(null);
  const [goalName, setGoalName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [monthlyTarget, setMonthlyTarget] = useState('');
  const [actualSaved, setActualSaved] = useState('');

  // Add Allocation Modal
  const [selectedGoalForAlloc, setSelectedGoalForAlloc] = useState<FutureGoal | null>(null);
  const [allocType, setAllocType] = useState<GoalAllocationType>('monthly_saving');
  const [allocBankId, setAllocBankId] = useState(banks[0]?.id || '');
  const [allocAmount, setAllocAmount] = useState('');
  const [allocCategory, setAllocCategory] = useState('');
  const [allocPurpose, setAllocPurpose] = useState('');

  // Delete Confirm
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);

  const filteredGoals = goals.filter((g) => {
    if (filter === 'in_progress') return !g.isManualSuccess && g.actualSaved < g.targetAmount;
    if (filter === 'completed') return g.isManualSuccess || g.actualSaved >= g.targetAmount;
    return true;
  });

  const totalTargetAllGoals = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSavedAllGoals = goals.reduce((sum, g) => sum + g.actualSaved, 0);
  const totalMonthlyCommitment = goals.reduce((sum, g) => sum + g.monthlyTarget, 0);

  const handleOpenCreateGoal = () => {
    setEditingGoal(null);
    setGoalName('');
    setGoalDescription('');
    setTargetAmount('');
    setExpectedDate(new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setMonthlyTarget('');
    setActualSaved('0');
    setIsGoalModalOpen(true);
  };

  const handleOpenEditGoal = (goal: FutureGoal) => {
    setEditingGoal(goal);
    setGoalName(goal.goalName);
    setGoalDescription(goal.description);
    setTargetAmount(goal.targetAmount.toString());
    setExpectedDate(goal.expectedExpenseDate);
    setMonthlyTarget(goal.monthlyTarget.toString());
    setActualSaved(goal.actualSaved.toString());
    setIsGoalModalOpen(true);
  };

  const handleGoalFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName || !targetAmount || !expectedDate) return;

    const target = parseFloat(targetAmount) || 0;
    const monthly = parseFloat(monthlyTarget) || Math.round(target / 10);
    const saved = parseFloat(actualSaved) || 0;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        goalName,
        description: goalDescription,
        targetAmount: target,
        expectedExpenseDate: expectedDate,
        monthlyTarget: monthly,
        actualSaved: saved,
      });
      addToast(`Updated goal: ${goalName}`, 'success');
    } else {
      addGoal({
        goalName,
        description: goalDescription,
        targetAmount: target,
        expectedExpenseDate: expectedDate,
        monthlyTarget: monthly,
        actualSaved: saved,
        isManualSuccess: false,
        status: 'in_progress',
        allocations: [],
      });
      addToast(`Created goal: ${goalName}`, 'success');
    }

    setIsGoalModalOpen(false);
  };

  const handleOpenAddAllocation = (goal: FutureGoal) => {
    setSelectedGoalForAlloc(goal);
    setAllocType('monthly_saving');
    setAllocBankId(banks[0]?.id || '');
    setAllocAmount((goal.monthlyTarget || 5000).toString());
    const firstBank = banks[0];
    setAllocCategory(firstBank?.plannedCategories[0]?.category || 'Grocery');
    setAllocPurpose(`Funding for ${goal.goalName}`);
  };

  const handleAllocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalForAlloc || !allocBankId || !allocAmount) return;

    const amount = parseFloat(allocAmount) || 0;

    if (allocType === 'monthly_saving') {
      addGoalAllocation(selectedGoalForAlloc.id, {
        type: 'monthly_saving',
        bankId: allocBankId,
        monthlyTarget: amount,
        purpose: allocPurpose || 'Direct monthly saving',
        expectedExpenseDate: selectedGoalForAlloc.expectedExpenseDate,
      });
    } else {
      addGoalAllocation(selectedGoalForAlloc.id, {
        type: 'planned_expense_cut',
        bankId: allocBankId,
        plannedExpenseCategory: allocCategory || 'Grocery',
        monthlyReductionAmount: amount,
        purpose: allocPurpose || `Budget cut from ${allocCategory}`,
        expectedExpenseDate: selectedGoalForAlloc.expectedExpenseDate,
      });
    }

    addToast(`Added bank allocation for ${selectedGoalForAlloc.goalName}`, 'success');
    setSelectedGoalForAlloc(null);
  };

  const handleDelete = (id: string) => {
    deleteGoal(id);
    setDeletingGoalId(null);
    addToast('Goal deleted', 'info');
  };

  const selectedBankForAlloc = banks.find((b) => b.id === allocBankId);

  return (
    <div className="space-y-6 sm:space-y-7 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-zinc-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Future Financial Goals
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Link long-term targets to monthly savings and budget reductions
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateGoal}
          className="flex items-center gap-1.5 rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create Goal</span>
        </button>
      </div>

      {/* 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          title="Total Target Amount"
          value={formatCurrency(totalTargetAllGoals, userProfile.currency)}
          subtitle={`${goals.length} target goals`}
          icon={Target}
        />

        <StatCard
          title="Total Saved"
          value={formatCurrency(totalSavedAllGoals, userProfile.currency)}
          subtitle={`${formatPercentage((totalSavedAllGoals / (totalTargetAllGoals || 1)) * 100)} funded`}
          icon={Sparkles}
        />

        <StatCard
          title="Monthly Commitment"
          value={formatCurrency(totalMonthlyCommitment, userProfile.currency)}
          subtitle="Required savings"
          icon={TrendingUp}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#1e232c] pb-2.5">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            filter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          All ({goals.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('in_progress')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            filter === 'in_progress' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          In Progress ({goals.filter((g) => !g.isManualSuccess && g.actualSaved < g.targetAmount).length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            filter === 'completed' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Achieved ({goals.filter((g) => g.isManualSuccess || g.actualSaved >= g.targetAmount).length})
        </button>
      </div>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No Goals Found"
          description="Create a future goal to start planning your savings with automated bank allocations."
          actionLabel="Create Goal"
          onAction={handleOpenCreateGoal}
        />
      ) : (
        <div className="space-y-3.5">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              banks={banks}
              currency={userProfile.currency}
              onEdit={handleOpenEditGoal}
              onDelete={(id) => setDeletingGoalId(id)}
              onAddAllocation={handleOpenAddAllocation}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title={editingGoal ? 'Edit Goal' : 'Create Future Goal'}
        subtitle="Set target amount and timeline"
        maxWidth="md"
      >
        <form onSubmit={handleGoalFormSubmit} className="space-y-3.5 text-left">
          <Input
            label="Goal Name"
            placeholder="e.g. Goa Vacation, Laptop Upgrade"
            value={goalName}
            onChange={(e) => setGoalName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Description (Optional)"
            placeholder="e.g. Beach trip with family"
            value={goalDescription}
            onChange={(e) => setGoalDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Amount"
              type="number"
              prefixSymbol="₹"
              placeholder="e.g. 85000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              required
            />
            <Input
              label="Target Date"
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Monthly Saving Target"
              type="number"
              prefixSymbol="₹"
              placeholder="e.g. 15000"
              value={monthlyTarget}
              onChange={(e) => setMonthlyTarget(e.target.value)}
              helperText="Target set aside monthly"
              required
            />
            <Input
              label="Saved Till Date"
              type="number"
              prefixSymbol="₹"
              placeholder="e.g. 25000"
              value={actualSaved}
              onChange={(e) => setActualSaved(e.target.value)}
              helperText="Existing progress"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsGoalModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              {editingGoal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Allocation Modal */}
      <Modal
        isOpen={Boolean(selectedGoalForAlloc)}
        onClose={() => setSelectedGoalForAlloc(null)}
        title={`Add Allocation for ${selectedGoalForAlloc?.goalName}`}
        maxWidth="md"
      >
        <form onSubmit={handleAllocationSubmit} className="space-y-3.5 text-left">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#0b0d11] p-1 border border-[#222731]">
            <button
              type="button"
              onClick={() => setAllocType('monthly_saving')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                allocType === 'monthly_saving' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Direct Monthly Saving
            </button>
            <button
              type="button"
              onClick={() => setAllocType('planned_expense_cut')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                allocType === 'planned_expense_cut' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Planned Expense Cut
            </button>
          </div>

          <Select
            label="Assigned Bank Account"
            value={allocBankId}
            onChange={(e) => {
              setAllocBankId(e.target.value);
              const b = banks.find((item) => item.id === e.target.value);
              if (b && b.plannedCategories[0]) {
                setAllocCategory(b.plannedCategories[0].category);
              }
            }}
            options={banks.map((b) => ({ value: b.id, label: `${b.bankName} (${b.nickname})` }))}
          />

          {allocType === 'monthly_saving' ? (
            <Input
              label="Monthly Saving Amount"
              type="number"
              prefixSymbol="₹"
              placeholder="e.g. 10000"
              value={allocAmount}
              onChange={(e) => setAllocAmount(e.target.value)}
              required
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Category to Cut"
                value={allocCategory}
                onChange={(e) => setAllocCategory(e.target.value)}
                options={
                  selectedBankForAlloc?.plannedCategories.map((c) => ({
                    value: c.category,
                    label: `${c.category} (Budget: ₹${c.amountSet})`,
                  })) || [{ value: 'Grocery', label: 'Grocery' }]
                }
              />
              <Input
                label="Monthly Cut Amount"
                type="number"
                prefixSymbol="₹"
                placeholder="e.g. 1500"
                value={allocAmount}
                onChange={(e) => setAllocAmount(e.target.value)}
                required
              />
            </div>
          )}

          <Input
            label="Strategy Note (Optional)"
            placeholder="e.g. Cut dining out"
            value={allocPurpose}
            onChange={(e) => setAllocPurpose(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSelectedGoalForAlloc(null)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              Attach Allocation
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingGoalId)}
        onClose={() => setDeletingGoalId(null)}
        onConfirm={() => deletingGoalId && handleDelete(deletingGoalId)}
        title="Delete Future Goal"
        message="Are you sure you want to remove this financial goal?"
      />
    </div>
  );
};
