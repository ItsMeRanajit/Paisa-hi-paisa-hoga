import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, Clock, Calendar, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { BankAccount, BankCalculations, OptionalExpense } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore } from '../../store/useUIStore';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { ProgressBar } from '../common/ProgressBar';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface OptionalExpensesSectionProps {
  bank: BankAccount;
  metrics: BankCalculations;
  optionalExpenses: OptionalExpense[];
  currency?: string;
}

export const OptionalExpensesSection: React.FC<OptionalExpensesSectionProps> = ({
  bank,
  metrics,
  optionalExpenses,
  currency = '₹',
}) => {
  const { activeMonth, addOptionalExpense, updateOptionalExpense, deleteOptionalExpense, toggleOptionalExpensePaid } = useFinanceStore();
  const { addToast } = useUIStore();

  // Dropdown Collapse State (closed by default)
  const [isExpanded, setIsExpanded] = useState(false);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmountSet, setNewAmountSet] = useState('');
  const [newAmountSpent, setNewAmountSpent] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<OptionalExpense | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmountSet, setEditAmountSet] = useState('');
  const [editAmountSpent, setEditAmountSpent] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Delete Confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmountSet) return;

    const setAmt = parseFloat(newAmountSet) || 0;
    const spentAmt = parseFloat(newAmountSpent) || 0;

    addOptionalExpense({
      bankId: bank.id,
      month: activeMonth,
      title: newTitle,
      amountSet: setAmt,
      amountSpent: spentAmt,
      dueDate: newDueDate || undefined,
      notes: newNotes,
      isPaid: spentAmt >= setAmt && setAmt > 0,
    });

    addToast(`Added optional expense "${newTitle}"`, 'success');
    setNewTitle('');
    setNewAmountSet('');
    setNewAmountSpent('');
    setNewDueDate('');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (item: OptionalExpense) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditAmountSet(item.amountSet.toString());
    setEditAmountSpent(item.amountSpent.toString());
    setEditDueDate(item.dueDate || '');
    setEditNotes(item.notes || '');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const setAmt = parseFloat(editAmountSet) || 0;
    const spentAmt = parseFloat(editAmountSpent) || 0;

    updateOptionalExpense(editingItem.id, {
      title: editTitle,
      amountSet: setAmt,
      amountSpent: spentAmt,
      dueDate: editDueDate || undefined,
      notes: editNotes,
      isPaid: spentAmt >= setAmt && setAmt > 0,
    });

    addToast(`Updated ${editTitle}`, 'success');
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    deleteOptionalExpense(id);
    setDeletingId(null);
    addToast('Month-specific commitment removed', 'info');
  };

  const handleTogglePaid = (item: OptionalExpense) => {
    toggleOptionalExpensePaid(item.id);
    addToast(
      !item.isPaid
        ? `Marked "${item.title}" as settled (${formatCurrency(item.amountSet, currency)})`
        : `Marked "${item.title}" as pending`,
      'info'
    );
  };

  const paidCount = optionalExpenses.filter((o) => o.isPaid || (o.amountSpent >= o.amountSet && o.amountSet > 0)).length;

  return (
    <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-4 sm:p-5 text-left space-y-3.5">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e232c] pb-3">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer group flex-1"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors">
              Month Specific Commitments
            </h3>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
              {optionalExpenses.length} {optionalExpenses.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Non-recurring commitments for {activeMonth} only (does not carry forward to future months)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Commitment</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-[#222731]"
            title={isExpanded ? 'Collapse section' : 'Expand section'}
            aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Collapsed Summary Minimal Preview */}
      {!isExpanded && (
        <div
          onClick={() => setIsExpanded(true)}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#0c0e12] px-3.5 py-2.5 border border-[#1c212b] cursor-pointer hover:border-zinc-700 transition-colors"
        >
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            <span className="text-zinc-400">
              Budgeted: <strong className="text-zinc-200">{formatCurrency(metrics.optionalTotalSet, currency)}</strong>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">
              Spent: <strong className="text-zinc-200">{formatCurrency(metrics.optionalTotalSpent, currency)}</strong>
            </span>
            <span className="text-zinc-600">•</span>
            <span className={metrics.optionalRemaining < 0 ? 'text-rose-400' : 'text-emerald-400'}>
              Remaining: <strong>{formatCurrency(metrics.optionalRemaining, currency)}</strong>
            </span>
          </div>

          <span className="text-[11px] text-zinc-400 font-sans flex items-center gap-1">
            <span>{paidCount}/{optionalExpenses.length} Settled</span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
          </span>
        </div>
      )}

      {/* Expanded Content Details */}
      {isExpanded && (
        <div className="space-y-3.5 animate-fade-in">
          {/* Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b]">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Budgeted (Set)</span>
              <p className="text-sm sm:text-base font-bold font-mono text-zinc-100 mt-0.5">
                {formatCurrency(metrics.optionalTotalSet, currency)}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Actual Spent</span>
              <p className="text-sm sm:text-base font-bold font-mono text-zinc-300 mt-0.5">
                {formatCurrency(metrics.optionalTotalSpent, currency)}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Remaining</span>
              <p className={`text-sm sm:text-base font-bold font-mono mt-0.5 ${metrics.optionalRemaining < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {formatCurrency(metrics.optionalRemaining, currency)}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Settlement Status</span>
              <div className="mt-0.5 flex items-center h-6">
                {paidCount === optionalExpenses.length && optionalExpenses.length > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> All Settled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Clock className="h-3.5 w-3.5" /> {paidCount}/{optionalExpenses.length} Settled
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Rows */}
          {optionalExpenses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#1c212b] p-6 text-center text-zinc-500 text-xs">
              No month-specific commitments logged for {bank.bankName} in {activeMonth}.
            </div>
          ) : (
            <div className="max-h-[380px] overflow-y-auto pr-1 sm:pr-1.5 space-y-2.5 overscroll-contain">
              {optionalExpenses.map((item) => {
                const isOverBudget = item.amountSpent > item.amountSet;
                const utilization = item.amountSet > 0 ? (item.amountSpent / item.amountSet) * 100 : 0;
                const isSettled = item.isPaid || (item.amountSpent >= item.amountSet && item.amountSet > 0);

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[#1c212b] bg-[#0c0e12]/60 p-3.5 hover:border-zinc-700/60 transition-all text-left space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{item.title}</span>
                          {item.dueDate && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded shrink-0">
                              <Calendar className="h-2.5 w-2.5" />
                              Due: {item.dueDate}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${
                              isSettled
                                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                                : 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                            }`}
                          >
                            {isSettled ? 'Settled' : 'Pending'}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-[11px] text-zinc-400 italic line-clamp-1">{item.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleTogglePaid(item)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                            isSettled
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50'
                              : 'bg-zinc-800 text-zinc-300 border-zinc-700/60 hover:bg-zinc-700 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{isSettled ? 'Settled' : 'Mark Settled'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-700/60"
                          title="Edit Commitment"
                          aria-label="Edit Commitment"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingId(item.id)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center bg-zinc-800/80 hover:bg-rose-950/50 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer border border-zinc-700/60 hover:border-rose-800/60"
                          title="Delete Commitment"
                          aria-label="Delete Commitment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <ProgressBar
                      value={item.amountSpent}
                      max={item.amountSet || 1}
                      height="sm"
                      showLabel
                      label={`Budget: ${formatCurrency(item.amountSet, currency)}`}
                      sublabel={`Spent: ${formatCurrency(item.amountSpent, currency)} (${formatPercentage(utilization)})`}
                      colorTheme={isOverBudget ? 'rose' : isSettled ? 'emerald' : 'amber'}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Month Specific Commitment"
        subtitle={`Non-recurring commitment for ${bank.bankName} in ${activeMonth}`}
        maxWidth="sm"
      >
        <form onSubmit={handleAddSubmit} className="space-y-3.5 text-left">
          <Input
            label="Commitment Title"
            placeholder="e.g. Car Insurance Annual Renewal, School Term Fee"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Budget (Amount Set)"
              type="number"
              prefixSymbol="₹"
              placeholder="e.g. 14500"
              value={newAmountSet}
              onChange={(e) => setNewAmountSet(e.target.value)}
              required
            />
            <Input
              label="Already Spent"
              type="number"
              prefixSymbol="₹"
              placeholder="e.g. 0 or 14500"
              value={newAmountSpent}
              onChange={(e) => setNewAmountSpent(e.target.value)}
              helperText="Optional (default 0)"
            />
          </div>

          <Input
            label="Due Date (Optional)"
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
          />

          <Input
            label="Notes / Purpose"
            placeholder="e.g. Comprehensive policy renewal before month-end"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
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
              Save Commitment
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title="Edit Month Specific Commitment"
        maxWidth="sm"
      >
        <form onSubmit={handleEditSubmit} className="space-y-3.5 text-left">
          <Input
            label="Commitment Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Budget (Amount Set)"
              type="number"
              prefixSymbol="₹"
              value={editAmountSet}
              onChange={(e) => setEditAmountSet(e.target.value)}
              required
            />
            <Input
              label="Actual Spent"
              type="number"
              prefixSymbol="₹"
              value={editAmountSpent}
              onChange={(e) => setEditAmountSpent(e.target.value)}
              required
            />
          </div>

          <Input
            label="Due Date"
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
          />

          <Input
            label="Notes"
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingItem(null)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              Save Updates
            </button>
          </div>
        </form>
      </Modal>

      {/* Deletion Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && handleDelete(deletingId)}
        title="Delete Month Specific Commitment"
        message="Are you sure you want to remove this month-specific commitment?"
      />
    </div>
  );
};
