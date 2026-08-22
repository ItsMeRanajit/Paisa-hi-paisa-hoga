import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, AlertCircle, PlusCircle, DollarSign } from 'lucide-react';
import { BankAccount, BankCalculations } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore } from '../../store/useUIStore';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { ProgressBar } from '../common/ProgressBar';
import { Modal } from '../common/Modal';
import { Input, Select } from '../common/Input';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface PlannedExpensesSectionProps {
  bank: BankAccount;
  metrics: BankCalculations;
}

export const PlannedExpensesSection: React.FC<PlannedExpensesSectionProps> = ({ bank, metrics }) => {
  const {
    activeMonth,
    updatePlannedSpent,
    addPlannedSpend,
    addPlannedCategoryToBank,
    updatePlannedCategoryInBank,
    deletePlannedCategoryFromBank,
  } = useFinanceStore();

  const { addToast } = useUIStore();

  // Add Category Modal State
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState('');

  // Quick Log Spend Modal State (Add spend onto category)
  const [isLogSpendModalOpen, setIsLogSpendModalOpen] = useState(false);
  const [logSpendMasterId, setLogSpendMasterId] = useState(metrics.plannedRows[0]?.masterId || '');
  const [logSpendAmount, setLogSpendAmount] = useState('');
  const [logSpendMode, setLogSpendMode] = useState<'add_to_existing' | 'set_exact'>('add_to_existing');

  // Single-category "+ Add Spend" quick modal
  const [quickSpendTargetRow, setQuickSpendTargetRow] = useState<typeof metrics.plannedRows[0] | null>(null);
  const [quickSpendAddAmount, setQuickSpendAddAmount] = useState('');

  // Edit Category / Spent Modal State
  const [editingRow, setEditingRow] = useState<typeof metrics.plannedRows[0] | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editAmountSet, setEditAmountSet] = useState('');
  const [editAmountSpent, setEditAmountSpent] = useState('');

  // Quick inline spent editing
  const [inlineSpentId, setInlineSpentId] = useState<string | null>(null);
  const [inlineSpentVal, setInlineSpentVal] = useState('');

  // Deletion confirm
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  const handleAddCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    const amount = parseFloat(newCategoryAmount) || 0;
    addPlannedCategoryToBank(bank.id, newCategoryName, amount);
    addToast(`Added planned category "${newCategoryName}"`, 'success');
    setNewCategoryName('');
    setNewCategoryAmount('');
    setIsAddCatModalOpen(false);
  };

  const handleLogSpendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCat = metrics.plannedRows.find((r) => r.masterId === logSpendMasterId);
    if (!targetCat || !logSpendAmount) return;

    const amt = parseFloat(logSpendAmount) || 0;

    if (logSpendMode === 'add_to_existing') {
      addPlannedSpend(bank.id, activeMonth, targetCat.masterId, amt);
      addToast(`Added ₹${amt.toLocaleString()} to ${targetCat.category}`, 'success');
    } else {
      updatePlannedSpent(bank.id, activeMonth, targetCat.masterId, amt);
      addToast(`Set ${targetCat.category} spent amount to ₹${amt.toLocaleString()}`, 'success');
    }

    setLogSpendAmount('');
    setIsLogSpendModalOpen(false);
  };

  const handleQuickSpendAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSpendTargetRow || !quickSpendAddAmount) return;

    const amt = parseFloat(quickSpendAddAmount) || 0;
    addPlannedSpend(bank.id, activeMonth, quickSpendTargetRow.masterId, amt);
    addToast(`Added ₹${amt.toLocaleString()} to ${quickSpendTargetRow.category}`, 'success');

    setQuickSpendAddAmount('');
    setQuickSpendTargetRow(null);
  };

  const handleOpenEdit = (row: typeof metrics.plannedRows[0]) => {
    setEditingRow(row);
    setEditCategoryName(row.category);
    setEditAmountSet(row.amountSet.toString());
    setEditAmountSpent(row.amountSpent.toString());
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    const newSet = parseFloat(editAmountSet) || 0;
    const newSpent = parseFloat(editAmountSpent) || 0;

    updatePlannedCategoryInBank(bank.id, editingRow.masterId, {
      category: editCategoryName,
      amountSet: newSet,
    });

    updatePlannedSpent(bank.id, activeMonth, editingRow.masterId, newSpent, newSet);

    addToast(`Updated ${editCategoryName}`, 'success');
    setEditingRow(null);
  };

  const handleSaveInlineSpent = (masterId: string) => {
    const newSpent = parseFloat(inlineSpentVal) || 0;
    updatePlannedSpent(bank.id, activeMonth, masterId, newSpent);
    setInlineSpentId(null);
    addToast('Updated spent amount', 'success');
  };

  const handleDeleteCategory = (categoryId: string) => {
    deletePlannedCategoryFromBank(bank.id, categoryId);
    setDeletingCatId(null);
    addToast('Planned category removed', 'info');
  };

  return (
    <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-5 text-left space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e232c] pb-3.5">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Section 2: Planned Expenses
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Fixed budgets persist across months; spent amounts track {activeMonth}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {metrics.plannedRows.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setLogSpendMasterId(metrics.plannedRows[0]?.masterId || '');
                setIsLogSpendModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Log Spend</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAddCatModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-3 gap-2.5 rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b]">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Total Budget</span>
          <p className="text-sm sm:text-base font-bold font-mono text-zinc-100 mt-0.5">
            {formatCurrency(metrics.plannedTotalSet)}
          </p>
        </div>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Total Spent</span>
          <p className="text-sm sm:text-base font-bold font-mono text-zinc-300 mt-0.5">
            {formatCurrency(metrics.plannedTotalSpent)}
          </p>
        </div>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Remaining</span>
          <p className={`text-sm sm:text-base font-bold font-mono mt-0.5 ${metrics.plannedRemaining < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {formatCurrency(metrics.plannedRemaining)}
          </p>
        </div>
      </div>

      {/* Category Rows */}
      {metrics.plannedRows.length === 0 ? (
        <div className="text-center py-6 text-zinc-500 text-xs">
          No planned categories configured for this bank yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {metrics.plannedRows.map((row) => (
            <div
              key={row.masterId}
              className="rounded-xl border border-[#1c212b] bg-[#0c0e12]/60 p-3 hover:border-zinc-700/60 transition-all text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-200">{row.category}</span>
                  {row.isOverBudget && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-950/40 px-2 py-0.2 text-[10px] font-medium text-rose-300 border border-rose-800/40">
                      <AlertCircle className="h-2.5 w-2.5" />
                      Over by {formatCurrency(row.amountSpent - row.amountSet)}
                    </span>
                  )}
                </div>

                {/* In-row action controls */}
                <div className="flex items-center gap-1.5">
                  {/* Dedicated + Add Spend Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setQuickSpendTargetRow(row);
                      setQuickSpendAddAmount('');
                    }}
                    className="flex items-center gap-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 px-2 py-1 text-[11px] font-medium text-zinc-200 hover:text-white transition-colors cursor-pointer"
                    title="Add spend to this category"
                  >
                    <Plus className="h-3 w-3 text-zinc-400" />
                    <span>Add Spend</span>
                  </button>

                  {/* Inline Spent Edit */}
                  {inlineSpentId === row.masterId ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        className="w-20 rounded-lg bg-[#13161c] px-2 py-0.5 text-xs font-mono text-white border border-zinc-500 focus:outline-none"
                        value={inlineSpentVal}
                        onChange={(e) => setInlineSpentVal(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveInlineSpent(row.masterId)}
                        className="rounded-lg bg-zinc-700 p-1 text-white hover:bg-zinc-600 cursor-pointer"
                        title="Save"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setInlineSpentId(row.masterId);
                        setInlineSpentVal(row.amountSpent.toString());
                      }}
                      className="rounded-lg bg-zinc-800/60 px-2 py-1 text-[11px] font-mono text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer"
                      title="Click to directly edit spent total"
                    >
                      Spent: {formatCurrency(row.amountSpent)} ✎
                    </button>
                  )}

                  {/* Edit Category / Budget */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(row)}
                    className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                    title="Edit category name and budget"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>

                  {/* Delete Category */}
                  <button
                    type="button"
                    onClick={() => setDeletingCatId(row.masterId)}
                    className="p-1 rounded-lg text-zinc-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete category"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <ProgressBar
                value={row.amountSpent}
                max={row.amountSet || 1}
                height="sm"
                colorTheme={row.isOverBudget ? 'rose' : row.utilizationPercent > 85 ? 'amber' : 'emerald'}
              />

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
                <span>Budget: {formatCurrency(row.amountSet)}</span>
                <span className={row.remaining < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  {row.remaining < 0 ? 'Deficit: ' : 'Remaining: '}
                  {formatCurrency(Math.abs(row.remaining))} ({formatPercentage(row.utilizationPercent)})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Spend Add Modal for a Single Category */}
      <Modal
        isOpen={Boolean(quickSpendTargetRow)}
        onClose={() => setQuickSpendTargetRow(null)}
        title={`Add Spend: ${quickSpendTargetRow?.category}`}
        subtitle={`Current spent: ${formatCurrency(quickSpendTargetRow?.amountSpent || 0)} / Budget: ${formatCurrency(quickSpendTargetRow?.amountSet || 0)}`}
        maxWidth="sm"
      >
        <form onSubmit={handleQuickSpendAddSubmit} className="space-y-3.5 text-left">
          <Input
            label="Amount to Add"
            type="number"
            prefixSymbol="₹"
            placeholder="e.g. 1500"
            value={quickSpendAddAmount}
            onChange={(e) => setQuickSpendAddAmount(e.target.value)}
            helperText={`Will increase total spent to ${formatCurrency((quickSpendTargetRow?.amountSpent || 0) + (parseFloat(quickSpendAddAmount) || 0))}`}
            required
            autoFocus
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setQuickSpendTargetRow(null)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              Add Spend
            </button>
          </div>
        </form>
      </Modal>

      {/* Global Log Planned Spend Modal */}
      <Modal
        isOpen={isLogSpendModalOpen}
        onClose={() => setIsLogSpendModalOpen(false)}
        title="Log Planned Category Spend"
        subtitle={`Recording for ${bank.bankName} (${activeMonth})`}
        maxWidth="sm"
      >
        <form onSubmit={handleLogSpendSubmit} className="space-y-3.5 text-left">
          <Select
            label="Select Planned Category"
            value={logSpendMasterId}
            onChange={(e) => setLogSpendMasterId(e.target.value)}
            options={metrics.plannedRows.map((r) => ({
              value: r.masterId,
              label: `${r.category} (Spent: ₹${r.amountSpent} / Budget: ₹${r.amountSet})`,
            }))}
          />

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#0b0d11] p-1 border border-[#222731]">
            <button
              type="button"
              onClick={() => setLogSpendMode('add_to_existing')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                logSpendMode === 'add_to_existing' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              + Add to Spent
            </button>
            <button
              type="button"
              onClick={() => setLogSpendMode('set_exact')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                logSpendMode === 'set_exact' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Set Total Spent
            </button>
          </div>

          <Input
            label={logSpendMode === 'add_to_existing' ? 'Amount to Add' : 'New Total Spent Amount'}
            type="number"
            prefixSymbol="₹"
            placeholder="e.g. 2500"
            value={logSpendAmount}
            onChange={(e) => setLogSpendAmount(e.target.value)}
            required
            autoFocus
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsLogSpendModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              Save Spend
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddCatModalOpen}
        onClose={() => setIsAddCatModalOpen(false)}
        title="Add Planned Category"
        subtitle={`Budget template for ${bank.bankName}`}
        maxWidth="sm"
      >
        <form onSubmit={handleAddCatSubmit} className="space-y-3.5 text-left">
          <Input
            label="Category Name"
            placeholder="e.g. Grocery, Electricity, SIP"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Default Monthly Budget"
            type="number"
            prefixSymbol="₹"
            placeholder="e.g. 10000"
            value={newCategoryAmount}
            onChange={(e) => setNewCategoryAmount(e.target.value)}
            helperText="Persists across all future months"
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddCatModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              Create Category
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={Boolean(editingRow)}
        onClose={() => setEditingRow(null)}
        title="Edit Category & Budget"
        maxWidth="sm"
      >
        <form onSubmit={handleEditSubmit} className="space-y-3.5 text-left">
          <Input
            label="Category Name"
            value={editCategoryName}
            onChange={(e) => setEditCategoryName(e.target.value)}
            required
          />

          <Input
            label="Budget (Amount Set)"
            type="number"
            prefixSymbol="₹"
            value={editAmountSet}
            onChange={(e) => setEditAmountSet(e.target.value)}
            helperText="Default budget allocation"
            required
          />

          <Input
            label={`Total Spent in ${activeMonth}`}
            type="number"
            prefixSymbol="₹"
            value={editAmountSpent}
            onChange={(e) => setEditAmountSpent(e.target.value)}
            helperText="Current month spent amount"
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingRow(null)}
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
        isOpen={Boolean(deletingCatId)}
        onClose={() => setDeletingCatId(null)}
        onConfirm={() => deletingCatId && handleDeleteCategory(deletingCatId)}
        title="Delete Planned Category"
        message="Are you sure you want to remove this planned category?"
      />
    </div>
  );
};
