import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, ChevronDown, ChevronUp, Eye, Search } from 'lucide-react';
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

  // Dropdown Collapse State (closed by default)
  const [isExpanded, setIsExpanded] = useState(false);

  // Spacious View All Unplanned Modal
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dayInput, setDayInput] = useState(new Date().getDate().toString());
  const [descInput, setDescInput] = useState('');
  const [amountInput, setAmountInput] = useState('');

  // Editing state
  const [editingExpense, setEditingExpense] = useState<UnplannedExpense | null>(null);
  const [editDay, setEditDay] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');

  // Deletion confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descInput.trim() || !amountInput) return;

    const amt = parseFloat(amountInput) || 0;
    addUnplannedExpense({
      bankId: bank.id,
      month: activeMonth,
      day: parseInt(dayInput, 10) || 1,
      description: descInput.trim(),
      amount: amt,
    });

    addToast(`Added unplanned expense of ₹${amt.toLocaleString()}`, 'success');
    setDescInput('');
    setAmountInput('');
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (item: UnplannedExpense) => {
    setEditingExpense(item);
    setEditDay(item.day.toString());
    setEditDesc(item.description);
    setEditAmount(item.amount.toString());
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    updateUnplannedExpense(editingExpense.id, {
      day: parseInt(editDay, 10) || 1,
      description: editDesc.trim(),
      amount: parseFloat(editAmount) || 0,
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

  // Filtered list for the spacious modal
  const filteredModalExpenses = unplannedExpenses.filter((item) => {
    if (!modalSearchQuery.trim()) return true;
    const q = modalSearchQuery.toLowerCase();
    return (
      item.description.toLowerCase().includes(q) ||
      (item.notes && item.notes.toLowerCase().includes(q)) ||
      (item.fullDate && item.fullDate.toLowerCase().includes(q))
    );
  });

  return (
    <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-4 sm:p-5 text-left space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e232c] pb-3">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="cursor-pointer group flex-1"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white transition-colors">
              Section 4: Unplanned Expenses
            </h3>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
              {unplannedExpenses.length} {unplannedExpenses.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Ad-hoc and variable spending tracked by day
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Expense</span>
          </button>

          <button
            type="button"
            onClick={() => setIsViewAllModalOpen(true)}
            className="p-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-[#222731]"
            title="View Breakdown"
            aria-label="View Breakdown"
          >
            <Eye className="h-4 w-4" />
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
              Spent: <strong className="text-zinc-200">{formatCurrency(metrics.unplannedTotal)}</strong>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">
              Limit: <strong className="text-zinc-200">{formatCurrency(metrics.unplannedLimit)}</strong>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">
              Usage: <strong className={metrics.unplannedLimitStatus === 'limit_exceeded' ? 'text-rose-400' : 'text-emerald-400'}>
                {formatPercentage(metrics.unplannedLimitUtilization)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-medium border ${limitBadgeStyles[metrics.unplannedLimitStatus]}`}>
              {limitBadgeText[metrics.unplannedLimitStatus]}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
          </div>
        </div>
      )}

      {/* Expanded Content Details */}
      {isExpanded && (
        <div className="space-y-3.5 animate-fade-in">
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
        </div>
      )}

      {/* ============================================================ */}
      {/* SPACIOUS POPUP MODAL: View All Unplanned Expenses Breakdown */}
      {/* ============================================================ */}
      <Modal
        isOpen={isViewAllModalOpen}
        onClose={() => setIsViewAllModalOpen(false)}
        title={`All Unplanned Expenses: ${bank.bankName}`}
        subtitle={`Complete breakdown of variable spending for ${activeMonth}`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-left">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-3 gap-2.5 rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b]">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Total Unplanned Spent</span>
              <p className="text-base font-bold font-mono text-white mt-0.5">
                {formatCurrency(metrics.unplannedTotal)}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Spending Limit</span>
              <p className="text-base font-bold font-mono text-zinc-300 mt-0.5">
                {formatCurrency(metrics.unplannedLimit)}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Limit Status</span>
              <div className="mt-0.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${limitBadgeStyles[metrics.unplannedLimitStatus]}`}>
                  {limitBadgeText[metrics.unplannedLimitStatus]} ({formatPercentage(metrics.unplannedLimitUtilization)})
                </span>
              </div>
            </div>
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

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by description or notes..."
              value={modalSearchQuery}
              onChange={(e) => setModalSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-[#0c0e12] pl-8.5 pr-3 py-2 text-xs text-white border border-[#1c212b] placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          {/* Detailed Transactions List */}
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {filteredModalExpenses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#1c212b] p-6 text-center text-zinc-500 text-xs">
                {modalSearchQuery ? 'No unplanned expenses match your search.' : `No unplanned expenses logged for ${bank.bankName} in ${activeMonth}.`}
              </div>
            ) : (
              filteredModalExpenses.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#1c212b] bg-[#0c0e12]/60 p-2.5 hover:border-zinc-700/60 transition-all text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded shrink-0">
                      <Calendar className="h-2.5 w-2.5" />
                      {item.fullDate}
                    </span>
                    <div className="min-w-0">
                      <span className="text-zinc-200 font-semibold truncate block">{item.description}</span>
                      {item.notes && <span className="text-[10px] text-zinc-400 italic truncate block">{item.notes}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono font-bold text-white pr-1">{formatCurrency(item.amount)}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-700/60"
                      title="Edit Expense"
                      aria-label="Edit Expense"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(item.id)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center bg-zinc-800/80 hover:bg-rose-950/50 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer border border-zinc-700/60 hover:border-rose-800/60"
                      title="Delete Expense"
                      aria-label="Delete Expense"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsViewAllModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Unplanned Expense"
        subtitle={`Tracking for ${bank.bankName} in ${activeMonth}`}
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
                helperText="1-31"
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Amount"
                type="number"
                prefixSymbol="₹"
                placeholder="2500"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <Input
            label="Description"
            placeholder="e.g. Car battery repair, Doctor visit"
            value={descInput}
            onChange={(e) => setDescInput(e.target.value)}
            required
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
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold shadow-xs"
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
