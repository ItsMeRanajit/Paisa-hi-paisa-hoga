import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { BankAccount, BankCalculations, UnplannedExpense } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore } from '../../store/useUIStore';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { ProgressBar } from '../common/ProgressBar';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface UnplannedExpensesSectionProps {
  bank: BankAccount;
  metrics: BankCalculations;
  unplannedExpenses: UnplannedExpense[];
}

export const UnplannedExpensesSection: React.FC<UnplannedExpensesSectionProps> = ({
  bank,
  metrics,
  unplannedExpenses,
}) => {
  const { activeMonth, addUnplannedExpense, updateUnplannedExpense, deleteUnplannedExpense } = useFinanceStore();
  const { addToast } = useUIStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dayInput, setDayInput] = useState(new Date().getDate().toString());
  const [descInput, setDescInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  // Editing state
  const [editingExpense, setEditingExpense] = useState<UnplannedExpense | null>(null);
  const [editDay, setEditDay] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Deletion confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descInput || !amountInput) return;

    addUnplannedExpense({
      bankId: bank.id,
      month: activeMonth,
      day: parseInt(dayInput, 10) || 1,
      description: descInput,
      amount: parseFloat(amountInput) || 0,
      notes: notesInput,
    });

    addToast(`Added unplanned expense of ₹${parseFloat(amountInput).toLocaleString()}`, 'success');
    setDescInput('');
    setAmountInput('');
    setNotesInput('');
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (item: UnplannedExpense) => {
    setEditingExpense(item);
    setEditDay(item.day.toString());
    setEditDesc(item.description);
    setEditAmount(item.amount.toString());
    setEditNotes(item.notes || '');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    updateUnplannedExpense(editingExpense.id, {
      day: parseInt(editDay, 10) || 1,
      description: editDesc,
      amount: parseFloat(editAmount) || 0,
      notes: editNotes,
    });

    addToast('Updated unplanned expense', 'success');
    setEditingExpense(null);
  };

  const handleDelete = (id: string) => {
    deleteUnplannedExpense(id);
    setDeletingId(null);
    addToast('Deleted unplanned expense', 'info');
  };

  const limitBadgeStyles = {
    normal: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
    approaching_limit: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
    limit_reached: 'bg-rose-950/40 text-rose-300 border-rose-800/40',
    limit_exceeded: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
  };

  const limitBadgeText = {
    normal: 'In Limit',
    approaching_limit: 'Near Limit (≥80%)',
    limit_reached: 'Limit Reached',
    limit_exceeded: 'Limit Exceeded',
  };

  return (
    <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-5 text-left space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e232c] pb-3.5">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Section 4: Unplanned Expenses
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Ad-hoc and variable spending tracked by day
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Limit status & real-time total summary */}
      <div className="rounded-xl bg-[#0c0e12] p-3.5 border border-[#1c212b] space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Total Unplanned</span>
            <p className="text-lg font-bold font-mono text-zinc-100 mt-0.5">
              {formatCurrency(metrics.unplannedTotal)}
            </p>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${limitBadgeStyles[metrics.unplannedLimitStatus]}`}>
            {limitBadgeText[metrics.unplannedLimitStatus]}
          </span>
        </div>

        <ProgressBar
          value={metrics.unplannedTotal}
          max={metrics.unplannedLimit}
          height="sm"
          showLabel
          label={`Limit: ${formatCurrency(metrics.unplannedLimit)}`}
          sublabel={`${formatPercentage(metrics.unplannedLimitUtilization)} used`}
          colorTheme={metrics.unplannedLimitStatus === 'limit_exceeded' ? 'rose' : metrics.unplannedLimitStatus === 'approaching_limit' ? 'amber' : 'emerald'}
        />
      </div>

      {/* Expenses Table */}
      {unplannedExpenses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#1c212b] p-6 text-center text-zinc-500 text-xs">
          No unplanned expenses logged for {bank.bankName} in {activeMonth}.
        </div>
      ) : (
        <div className="space-y-2">
          {unplannedExpenses.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-[#1c212b] bg-[#0c0e12]/60 p-3 hover:border-zinc-700/60 transition-all text-left"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded">
                    <Calendar className="h-2.5 w-2.5" />
                    {item.fullDate}
                  </span>
                  <span className="text-xs font-semibold text-zinc-200 truncate">{item.description}</span>
                </div>
                {item.notes && (
                  <p className="text-[11px] text-zinc-400 italic line-clamp-1">{item.notes}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 shrink-0">
                <span className="text-xs sm:text-sm font-bold font-mono text-zinc-200">
                  {formatCurrency(item.amount)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(item.id)}
                    className="p-1 rounded-lg text-zinc-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Unplanned Expense"
        subtitle={`Logged on ${bank.bankName} for ${activeMonth}`}
        maxWidth="sm"
      >
        <form onSubmit={handleAddSubmit} className="space-y-3.5 text-left">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Input
                label="Day"
                type="number"
                min={1}
                max={31}
                value={dayInput}
                onChange={(e) => setDayInput(e.target.value)}
                helperText="1 - 31"
                required
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Amount"
                type="number"
                prefixSymbol="₹"
                placeholder="e.g. 1850"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <Input
            label="Description"
            placeholder="e.g. Vehicle tire repair"
            value={descInput}
            onChange={(e) => setDescInput(e.target.value)}
            required
          />

          <Input
            label="Notes (Optional)"
            placeholder="e.g. Emergency repair"
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              Save Expense
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editingExpense)}
        onClose={() => setEditingExpense(null)}
        title="Edit Unplanned Expense"
        maxWidth="sm"
      >
        <form onSubmit={handleEditSubmit} className="space-y-3.5 text-left">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Input
                label="Day"
                type="number"
                min={1}
                max={31}
                value={editDay}
                onChange={(e) => setEditDay(e.target.value)}
                required
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Amount"
                type="number"
                prefixSymbol="₹"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <Input
            label="Description"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            required
          />

          <Input
            label="Notes"
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingExpense(null)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Deletion Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && handleDelete(deletingId)}
        title="Delete Unplanned Expense"
        message="Are you sure you want to remove this record?"
      />
    </div>
  );
};
