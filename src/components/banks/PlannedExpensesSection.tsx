import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  PlusCircle,
  Calendar,
  Layers,
  Repeat,
  CheckCircle,
  FileText,
  Eye,
  X,
} from 'lucide-react';
import { BankAccount, BankCalculations, ExpensePaymentType, RecurringSpendEntry, PortionSpendEntry } from '../../types/finance';
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
    addRecurringPlannedSpend,
    deleteRecurringPlannedSpend,
    addPortionPlannedSpend,
    deletePortionPlannedSpend,
    addPlannedCategoryToBank,
    updatePlannedCategoryInBank,
    deletePlannedCategoryFromBank,
  } = useFinanceStore();

  const { addToast } = useUIStore();

  // Add Category Modal State
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<ExpensePaymentType>('recurring');

  // Single-category Quick Recurring Spend Modal (for adding micro-payments quickly)
  const [quickRecurringRow, setQuickRecurringRow] = useState<typeof metrics.plannedRows[0] | null>(null);
  const [recurringDate, setRecurringDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurringDesc, setRecurringDesc] = useState('');
  const [recurringAmount, setRecurringAmount] = useState('');

  // Single-category Quick Portion Modal (for adding installments)
  const [quickPortionRow, setQuickPortionRow] = useState<typeof metrics.plannedRows[0] | null>(null);
  const [portionDate, setPortionDate] = useState(new Date().toISOString().split('T')[0]);
  const [portionLabel, setPortionLabel] = useState('');
  const [portionAmount, setPortionAmount] = useState('');

  // Spacious Recurring Details Modal
  const [viewingRecurringRow, setViewingRecurringRow] = useState<typeof metrics.plannedRows[0] | null>(null);

  // Spacious Portion Details Modal
  const [viewingPortionRow, setViewingPortionRow] = useState<typeof metrics.plannedRows[0] | null>(null);

  // One-time payment quick pay modal
  const [quickOneTimeRow, setQuickOneTimeRow] = useState<typeof metrics.plannedRows[0] | null>(null);
  const [oneTimeAmount, setOneTimeAmount] = useState('');

  // Edit Category Modal State
  const [editingRow, setEditingRow] = useState<typeof metrics.plannedRows[0] | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editAmountSet, setEditAmountSet] = useState('');
  const [editAmountSpent, setEditAmountSpent] = useState('');
  const [editCategoryType, setEditCategoryType] = useState<ExpensePaymentType>('recurring');

  // Deletion confirm
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  // Sync state when metrics change if viewing row is open
  const activeViewingRecurring = metrics.plannedRows.find((r) => r.masterId === viewingRecurringRow?.masterId);
  const activeViewingPortion = metrics.plannedRows.find((r) => r.masterId === viewingPortionRow?.masterId);

  const handleAddCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const amount = parseFloat(newCategoryAmount) || 0;
    addPlannedCategoryToBank(bank.id, newCategoryName.trim(), amount, newCategoryType);
    addToast(`Added planned category "${newCategoryName.trim()}" (${newCategoryType.replace('_', ' ')})`, 'success');
    setNewCategoryName('');
    setNewCategoryAmount('');
    setNewCategoryType('recurring');
    setIsAddCatModalOpen(false);
  };

  const handleQuickRecurringSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRecurringRow || !recurringDesc.trim() || !recurringAmount) return;

    const amt = parseFloat(recurringAmount) || 0;
    addRecurringPlannedSpend(bank.id, activeMonth, quickRecurringRow.masterId, {
      date: recurringDate,
      description: recurringDesc.trim(),
      amount: amt,
    });

    addToast(`Added payment of ₹${amt.toLocaleString()} to ${quickRecurringRow.category}`, 'success');
    setRecurringDesc('');
    setRecurringAmount('');
    setQuickRecurringRow(null);
  };

  const handleDeleteRecurringEntry = (masterId: string, entryId: string) => {
    deleteRecurringPlannedSpend(bank.id, activeMonth, masterId, entryId);
    addToast('Payment entry removed', 'info');
  };

  const handleQuickPortionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPortionRow || !portionAmount) return;

    const amt = parseFloat(portionAmount) || 0;
    addPortionPlannedSpend(bank.id, activeMonth, quickPortionRow.masterId, {
      date: portionDate,
      label: portionLabel.trim() || undefined,
      amount: amt,
    });

    addToast(`Recorded portion of ₹${amt.toLocaleString()} for ${quickPortionRow.category}`, 'success');
    setPortionLabel('');
    setPortionAmount('');
    setQuickPortionRow(null);
  };

  const handleDeletePortionEntry = (masterId: string, portionId: string) => {
    deletePortionPlannedSpend(bank.id, activeMonth, masterId, portionId);
    addToast('Portion entry removed', 'info');
  };

  const handleQuickOneTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickOneTimeRow || !oneTimeAmount) return;

    const amt = parseFloat(oneTimeAmount) || 0;
    updatePlannedSpent(bank.id, activeMonth, quickOneTimeRow.masterId, amt);
    addToast(`Updated ${quickOneTimeRow.category} spend to ₹${amt.toLocaleString()}`, 'success');
    setOneTimeAmount('');
    setQuickOneTimeRow(null);
  };

  const handleOpenEdit = (row: typeof metrics.plannedRows[0]) => {
    setEditingRow(row);
    setEditCategoryName(row.category);
    setEditAmountSet(row.amountSet.toString());
    setEditAmountSpent(row.amountSpent.toString());
    setEditCategoryType(row.paymentType || 'recurring');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    const newSet = parseFloat(editAmountSet) || 0;
    const newSpent = parseFloat(editAmountSpent) || 0;

    updatePlannedCategoryInBank(bank.id, editingRow.masterId, {
      category: editCategoryName.trim(),
      amountSet: newSet,
      paymentType: editCategoryType,
    });

    updatePlannedSpent(bank.id, activeMonth, editingRow.masterId, newSpent, newSet);

    addToast(`Updated ${editCategoryName.trim()}`, 'success');
    setEditingRow(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    deletePlannedCategoryFromBank(bank.id, categoryId);
    setDeletingCatId(null);
    addToast('Planned category removed', 'info');
  };

  const typeBadges = {
    recurring: {
      label: 'Recurring',
      icon: Repeat,
      style: 'bg-indigo-950/50 text-indigo-300 border-indigo-800/50',
    },
    in_portions: {
      label: 'In Portions',
      icon: Layers,
      style: 'bg-purple-950/50 text-purple-300 border-purple-800/50',
    },
    one_time: {
      label: 'One-time',
      icon: CheckCircle,
      style: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50',
    },
  };

  return (
    <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-4 sm:p-5 text-left space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e232c] pb-3.5">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Section 2: Planned Expenses
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Recurring budgets carry forward month after month automatically until closed; spent amounts track {activeMonth}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
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
        <div className="text-center py-6 text-zinc-500 text-xs rounded-xl border border-dashed border-[#1c212b]">
          No planned categories configured for {bank.bankName} yet. Click &quot;Add Category&quot; to begin.
        </div>
      ) : (
        <div className="max-h-[420px] overflow-y-auto pr-1 sm:pr-1.5 space-y-3 overscroll-contain">
          {metrics.plannedRows.map((row) => {
            const badge = typeBadges[row.paymentType || 'recurring'];
            const BadgeIcon = badge.icon;
            const recCount = row.recurringEntries?.length || 0;
            const portionCount = row.portionEntries?.length || 0;

            return (
              <div
                key={row.masterId}
                className="rounded-xl border border-[#1c212b] bg-[#0c0e12]/60 p-3.5 hover:border-zinc-700/60 transition-all text-left space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-white truncate">{row.category}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border shrink-0 ${badge.style}`}>
                      <BadgeIcon className="h-2.5 w-2.5" />
                      {badge.label}
                    </span>
                  </div>

                  {/* Actions according to Payment Type */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Recurring Type Actions */}
                    {row.paymentType === 'recurring' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setQuickRecurringRow(row);
                            setRecurringDesc('');
                            setRecurringAmount('');
                          }}
                          className="h-7 w-7 rounded-lg flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-indigo-300 hover:text-white transition-colors cursor-pointer border border-zinc-700/60"
                          title="Add Spend"
                          aria-label="Add Spend"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewingRecurringRow(row)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-700/60"
                          title={`View History (${recCount})`}
                          aria-label={`View History (${recCount})`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}

                    {/* In Portions Type Actions */}
                    {row.paymentType === 'in_portions' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setQuickPortionRow(row);
                            setPortionLabel(`Portion ${portionCount + 1}`);
                            setPortionAmount('');
                          }}
                          className="h-7 w-7 rounded-lg flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-purple-300 hover:text-white transition-colors cursor-pointer border border-zinc-700/60"
                          title="Add Portion"
                          aria-label="Add Portion"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewingPortionRow(row)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-700/60"
                          title={`View Portions (${portionCount})`}
                          aria-label={`View Portions (${portionCount})`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}

                    {/* One-time Type Actions */}
                    {row.paymentType === 'one_time' && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuickOneTimeRow(row);
                          setOneTimeAmount(row.amountSpent ? row.amountSpent.toString() : row.amountSet.toString());
                        }}
                        className="h-7 w-7 rounded-lg flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-emerald-300 hover:text-white transition-colors cursor-pointer border border-zinc-700/60"
                        title={row.amountSpent >= row.amountSet && row.amountSet > 0 ? 'Update Spend' : 'Pay / Set Spent'}
                        aria-label="Pay or Set Spent"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* Edit Category / Budget */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(row)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer border border-zinc-700/60"
                      title="Edit Category"
                      aria-label="Edit Category"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete Category */}
                    <button
                      type="button"
                      onClick={() => setDeletingCatId(row.masterId)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center bg-zinc-800/80 hover:bg-rose-950/50 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer border border-zinc-700/60 hover:border-rose-800/60"
                      title="Delete category"
                      aria-label="Delete category"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <ProgressBar
                  value={row.amountSpent}
                  max={row.amountSet || 1}
                  height="sm"
                  colorTheme={row.isOverBudget ? 'rose' : row.utilizationPercent > 85 ? 'amber' : 'emerald'}
                />

                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-0.5">
                  <span>
                    Budget: <strong className="text-zinc-200">{formatCurrency(row.amountSet)}</strong>
                  </span>
                  <span>
                    Spent: <strong className="text-zinc-200">{formatCurrency(row.amountSpent)}</strong> ({formatPercentage(row.utilizationPercent)})
                  </span>
                  <span className={row.remaining < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    {row.remaining < 0 ? 'Deficit: ' : 'Remaining: '}
                    {formatCurrency(Math.abs(row.remaining))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: Spacious Recurring Spend Breakdown Popup */}
      {/* ============================================================ */}
      <Modal
        isOpen={Boolean(viewingRecurringRow)}
        onClose={() => setViewingRecurringRow(null)}
        title={`Recurring Breakdown: ${activeViewingRecurring?.category || ''}`}
        subtitle={`Granular smaller payments logged for ${activeMonth}`}
        maxWidth="lg"
      >
        {activeViewingRecurring && (
          <div className="space-y-4 text-left">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-3 gap-2.5 rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b]">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Monthly Budget</span>
                <p className="text-base font-bold font-mono text-white mt-0.5">
                  {formatCurrency(activeViewingRecurring.amountSet)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Total Spent ({activeViewingRecurring.recurringEntries?.length || 0} entries)
                </span>
                <p className="text-base font-bold font-mono text-indigo-400 mt-0.5">
                  {formatCurrency(activeViewingRecurring.amountSpent)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Remaining Budget</span>
                <p className={`text-base font-bold font-mono mt-0.5 ${activeViewingRecurring.remaining < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {formatCurrency(activeViewingRecurring.remaining)}
                </p>
              </div>
            </div>

            <ProgressBar
              value={activeViewingRecurring.amountSpent}
              max={activeViewingRecurring.amountSet || 1}
              height="sm"
              showLabel
              label="Budget Utilization"
              sublabel={`${formatPercentage(activeViewingRecurring.utilizationPercent)} used`}
              colorTheme={activeViewingRecurring.isOverBudget ? 'rose' : 'indigo'}
            />

            {/* Detailed Payments Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 px-1">
                <span>All Recurring Payments</span>
                <span>{activeViewingRecurring.recurringEntries?.length || 0} transactions</span>
              </div>

              {(!activeViewingRecurring.recurringEntries || activeViewingRecurring.recurringEntries.length === 0) ? (
                <div className="rounded-xl border border-dashed border-[#1c212b] p-6 text-center text-zinc-500 text-xs">
                  No smaller payments recorded yet for {activeViewingRecurring.category} in {activeMonth}.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {activeViewingRecurring.recurringEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[#1c212b] bg-[#0c0e12]/60 p-2.5 hover:border-zinc-700/60 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded shrink-0">
                          <Calendar className="h-2.5 w-2.5" />
                          {entry.date}
                        </span>
                        <span className="text-zinc-200 font-medium truncate">{entry.description}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-bold text-white">{formatCurrency(entry.amount)}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecurringEntry(activeViewingRecurring.masterId, entry.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete payment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingRecurringRow(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 2: Spacious Portions Installment Breakdown Popup */}
      {/* ============================================================ */}
      <Modal
        isOpen={Boolean(viewingPortionRow)}
        onClose={() => setViewingPortionRow(null)}
        title={`Portions Breakdown: ${activeViewingPortion?.category || ''}`}
        subtitle={`Large chunk payments / installments recorded for ${activeMonth}`}
        maxWidth="lg"
      >
        {activeViewingPortion && (
          <div className="space-y-4 text-left">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-3 gap-2.5 rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b]">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Total Expense Set</span>
                <p className="text-base font-bold font-mono text-white mt-0.5">
                  {formatCurrency(activeViewingPortion.amountSet)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Total Paid ({activeViewingPortion.portionEntries?.length || 0} portions)
                </span>
                <p className="text-base font-bold font-mono text-purple-400 mt-0.5">
                  {formatCurrency(activeViewingPortion.amountSpent)}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Remaining to Pay</span>
                <p className={`text-base font-bold font-mono mt-0.5 ${activeViewingPortion.remaining < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {formatCurrency(activeViewingPortion.remaining)}
                </p>
              </div>
            </div>

            <ProgressBar
              value={activeViewingPortion.amountSpent}
              max={activeViewingPortion.amountSet || 1}
              height="sm"
              showLabel
              label="Payment Progress"
              sublabel={`${formatPercentage(activeViewingPortion.utilizationPercent)} settled`}
              colorTheme={activeViewingPortion.amountSpent >= activeViewingPortion.amountSet ? 'emerald' : 'purple'}
            />

            {/* Detailed Portions Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 px-1">
                <span>Recorded Portions</span>
                <span>{activeViewingPortion.portionEntries?.length || 0} portions logged</span>
              </div>

              {(!activeViewingPortion.portionEntries || activeViewingPortion.portionEntries.length === 0) ? (
                <div className="rounded-xl border border-dashed border-[#1c212b] p-6 text-center text-zinc-500 text-xs">
                  No portions logged yet for {activeViewingPortion.category}.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {activeViewingPortion.portionEntries.map((portion, idx) => (
                    <div
                      key={portion.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[#1c212b] bg-[#0c0e12]/60 p-2.5 hover:border-zinc-700/60 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-950/60 text-purple-300 border border-purple-800/40 shrink-0">
                          Portion #{portion.portionNumber || idx + 1}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded shrink-0">
                          {portion.date}
                        </span>
                        <span className="text-zinc-200 font-medium truncate">{portion.label || `Portion ${idx + 1}`}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-bold text-white">{formatCurrency(portion.amount)}</span>
                        <button
                          type="button"
                          onClick={() => handleDeletePortionEntry(activeViewingPortion.masterId, portion.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete portion"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingPortionRow(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 3: Quick Add Recurring Spend for Single Row */}
      {/* ============================================================ */}
      <Modal
        isOpen={Boolean(quickRecurringRow)}
        onClose={() => setQuickRecurringRow(null)}
        title={`Add Spend: ${quickRecurringRow?.category}`}
        subtitle={`Record smaller payment for ${quickRecurringRow?.category}`}
        maxWidth="sm"
      >
        <form onSubmit={handleQuickRecurringSubmit} className="space-y-3.5 text-left">
          <Input
            label="Date"
            type="date"
            value={recurringDate}
            onChange={(e) => setRecurringDate(e.target.value)}
            required
          />

          <Input
            label="Description"
            placeholder="e.g. Swiggy order, Fuel refill, Auto fare"
            value={recurringDesc}
            onChange={(e) => setRecurringDesc(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Amount (₹)"
            type="number"
            prefixSymbol="₹"
            placeholder="e.g. 350"
            value={recurringAmount}
            onChange={(e) => setRecurringAmount(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setQuickRecurringRow(null)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-semibold shadow-xs"
            >
              Save Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 4: Quick Add Portion for Single Row */}
      {/* ============================================================ */}
      <Modal
        isOpen={Boolean(quickPortionRow)}
        onClose={() => setQuickPortionRow(null)}
        title={`Add Portion: ${quickPortionRow?.category}`}
        subtitle={`Record chunk payment / installment`}
        maxWidth="sm"
      >
        <form onSubmit={handleQuickPortionSubmit} className="space-y-3.5 text-left">
          <Input
            label="Date"
            type="date"
            value={portionDate}
            onChange={(e) => setPortionDate(e.target.value)}
            required
          />

          <Input
            label="Portion Label / Note"
            placeholder="e.g. 1st installment, Down payment"
            value={portionLabel}
            onChange={(e) => setPortionLabel(e.target.value)}
            autoFocus
          />

          <Input
            label="Portion Amount (₹)"
            type="number"
            prefixSymbol="₹"
            placeholder="e.g. 10000"
            value={portionAmount}
            onChange={(e) => setPortionAmount(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setQuickPortionRow(null)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 text-xs font-semibold shadow-xs"
            >
              Save Portion
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 5: Quick One-Time Payment Set */}
      {/* ============================================================ */}
      <Modal
        isOpen={Boolean(quickOneTimeRow)}
        onClose={() => setQuickOneTimeRow(null)}
        title={`Pay / Set Spent: ${quickOneTimeRow?.category}`}
        subtitle={`One-time full payment tracking for ${activeMonth}`}
        maxWidth="sm"
      >
        <form onSubmit={handleQuickOneTimeSubmit} className="space-y-3.5 text-left">
          <Input
            label="Total Spent Amount"
            type="number"
            prefixSymbol="₹"
            value={oneTimeAmount}
            onChange={(e) => setOneTimeAmount(e.target.value)}
            helperText={`Budget set: ${formatCurrency(quickOneTimeRow?.amountSet || 0)}`}
            required
            autoFocus
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setQuickOneTimeRow(null)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold shadow-xs"
            >
              Save Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL 6: Add Category with Payment Type Selection */}
      {/* ============================================================ */}
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
            placeholder="e.g. Food & Dining, Travel, House Rent, College Fees"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Default Monthly Budget Target"
            type="number"
            prefixSymbol="₹"
            placeholder="e.g. 15000"
            value={newCategoryAmount}
            onChange={(e) => setNewCategoryAmount(e.target.value)}
            helperText="Persists across future months automatically"
            required
          />

          <Select
            label="Payment Type"
            value={newCategoryType}
            onChange={(e) => setNewCategoryType(e.target.value as ExpensePaymentType)}
            options={[
              { value: 'recurring', label: 'Recurring (Add smaller amounts over time with Date & Description)' },
              { value: 'in_portions', label: 'In Portions (Pay in larger installment chunks e.g. 10k, 10k, 10k)' },
              { value: 'one_time', label: 'One-time (Pay the whole amount at once)' },
            ]}
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

      {/* ============================================================ */}
      {/* MODAL 7: Edit Category & Type Modal */}
      {/* ============================================================ */}
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

          <Select
            label="Payment Type"
            value={editCategoryType}
            onChange={(e) => setEditCategoryType(e.target.value as ExpensePaymentType)}
            options={[
              { value: 'recurring', label: 'Recurring (Smaller amounts over time)' },
              { value: 'in_portions', label: 'In Portions (Installment chunks)' },
              { value: 'one_time', label: 'One-time (Full single payment)' },
            ]}
          />

          {editCategoryType === 'one_time' && (
            <Input
              label={`Total Spent in ${activeMonth}`}
              type="number"
              prefixSymbol="₹"
              value={editAmountSpent}
              onChange={(e) => setEditAmountSpent(e.target.value)}
              helperText="Current month spent amount"
              required
            />
          )}

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
