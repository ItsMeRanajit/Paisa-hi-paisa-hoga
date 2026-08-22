import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, Calendar } from 'lucide-react';
import { CreditCard, CreditTransaction, CreditExpenseType } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore } from '../../store/useUIStore';
import { formatCurrency, formatDayWithMonth } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { Input, Select } from '../common/Input';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface TransactionsSectionProps {
  card: CreditCard;
  transactions: CreditTransaction[];
  activeMonth: string;
  currency?: string;
}

export const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  card,
  transactions,
  activeMonth,
  currency = '₹',
}) => {
  const { addCreditTransaction, updateCreditTransaction, deleteCreditTransaction } = useFinanceStore();
  const { addToast } = useUIStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dayInput, setDayInput] = useState(new Date().getDate().toString());
  const [categoryInput, setCategoryInput] = useState('Dining');
  const [descInput, setDescInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [expenseType, setExpenseType] = useState<CreditExpenseType>('non_essential');

  // Edit state
  const [editingTx, setEditingTx] = useState<CreditTransaction | null>(null);
  const [editDay, setEditDay] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<CreditExpenseType>('non_essential');

  // Deletion confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descInput || !amountInput) return;

    const dayNum = parseInt(dayInput, 10) || 1;
    addCreditTransaction({
      cardId: card.id,
      month: activeMonth,
      date: formatDayWithMonth(dayNum, activeMonth),
      day: dayNum,
      category: categoryInput,
      description: descInput,
      amount: parseFloat(amountInput) || 0,
      expenseType,
    });

    addToast(`Added card charge of ₹${parseFloat(amountInput).toLocaleString()}`, 'success');
    setDescInput('');
    setAmountInput('');
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (tx: CreditTransaction) => {
    setEditingTx(tx);
    setEditDay(tx.day.toString());
    setEditCategory(tx.category);
    setEditDesc(tx.description);
    setEditAmount(tx.amount.toString());
    setEditType(tx.expenseType);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    const dayNum = parseInt(editDay, 10) || 1;
    updateCreditTransaction(editingTx.id, {
      day: dayNum,
      date: formatDayWithMonth(dayNum, activeMonth),
      category: editCategory,
      description: editDesc,
      amount: parseFloat(editAmount) || 0,
      expenseType: editType,
    });

    addToast('Updated credit card transaction', 'success');
    setEditingTx(null);
  };

  const handleDelete = (id: string) => {
    deleteCreditTransaction(id);
    setDeletingId(null);
    addToast('Transaction removed', 'info');
  };

  return (
    <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-5 text-left space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e232c] pb-3.5">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Billing Cycle Transactions ({transactions.length})
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Classified into Essential (Needs) & Non-Essential (Wants)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Transaction</span>
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#1c212b] p-6 text-center text-zinc-500 text-xs">
          No transactions logged for this billing cycle.
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-[#1c212b] bg-[#0c0e12]/60 p-3 hover:border-zinc-700/60 transition-all text-left"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded">
                    <Calendar className="h-2.5 w-2.5" />
                    {tx.date}
                  </span>
                  <span className="text-xs font-semibold text-zinc-200 truncate">{tx.description}</span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.2 rounded-full border ${
                      tx.expenseType === 'essential'
                        ? 'bg-sky-950/40 text-sky-300 border-sky-800/40'
                        : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                    }`}
                  >
                    {tx.expenseType === 'essential' ? 'Essential' : 'Non-Essential'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">Category: {tx.category}</p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-xs sm:text-sm font-bold font-mono text-zinc-200">
                  {formatCurrency(tx.amount, currency)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(tx)}
                    className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(tx.id)}
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
        title="Add Transaction"
        subtitle={`Charging on ${card.cardName}`}
        maxWidth="sm"
      >
        <form onSubmit={handleAddSubmit} className="space-y-3.5 text-left">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Day of Month"
              type="number"
              min={1}
              max={31}
              value={dayInput}
              onChange={(e) => setDayInput(e.target.value)}
              required
            />
            <Input
              label="Amount"
              type="number"
              prefixSymbol="₹"
              placeholder="e.g. 4200"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Category"
              placeholder="e.g. Dining, Travel"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              required
            />
            <Select
              label="Classification"
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value as CreditExpenseType)}
              options={[
                { value: 'essential', label: 'Essential (Needs)' },
                { value: 'non_essential', label: 'Non-Essential (Wants)' },
              ]}
            />
          </div>

          <Input
            label="Description"
            placeholder="e.g. Flight ticket on MakeMyTrip"
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
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editingTx)}
        onClose={() => setEditingTx(null)}
        title="Edit Transaction"
        maxWidth="sm"
      >
        <form onSubmit={handleEditSubmit} className="space-y-3.5 text-left">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Day"
              type="number"
              min={1}
              max={31}
              value={editDay}
              onChange={(e) => setEditDay(e.target.value)}
              required
            />
            <Input
              label="Amount"
              type="number"
              prefixSymbol="₹"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Category"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              required
            />
            <Select
              label="Classification"
              value={editType}
              onChange={(e) => setEditType(e.target.value as CreditExpenseType)}
              options={[
                { value: 'essential', label: 'Essential (Needs)' },
                { value: 'non_essential', label: 'Non-Essential (Wants)' },
              ]}
            />
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
              onClick={() => setEditingTx(null)}
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
        title="Delete Transaction"
        message="Are you sure you want to remove this transaction from the card balance?"
      />
    </div>
  );
};
