import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore } from '../../store/useUIStore';
import { Modal } from '../common/Modal';
import { Input, Select } from '../common/Input';
import { CreditExpenseType } from '../../types/finance';
import { formatDayWithMonth } from '../../utils/formatters';

export const QuickActionModal: React.FC = () => {
  const { isQuickAddOpen, quickAddType, closeQuickAdd, addToast } = useUIStore();
  const {
    activeMonth,
    banks,
    creditCards,
    goals,
    addPlannedSpend,
    updatePlannedSpent,
    addOptionalExpense,
    addUnplannedExpense,
    addCreditTransaction,
    updateGoalSavedAmount,
  } = useFinanceStore();

  const [activeTab, setActiveTab] = useState<'planned' | 'optional' | 'unplanned' | 'credit_tx' | 'goal_saving'>('planned');

  // Planned Spend Form State
  const [plannedBankId, setPlannedBankId] = useState(banks[0]?.id || '');
  const [plannedMasterId, setPlannedMasterId] = useState(banks[0]?.plannedCategories[0]?.id || '');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [plannedMode, setPlannedMode] = useState<'add' | 'set'>('add');

  // Optional Expense Form State
  const [optionalBankId, setOptionalBankId] = useState(banks[0]?.id || '');
  const [optionalTitle, setOptionalTitle] = useState('');
  const [optionalSet, setOptionalSet] = useState('');
  const [optionalSpent, setOptionalSpent] = useState('');
  const [optionalDueDate, setOptionalDueDate] = useState('');
  const [optionalNotes, setOptionalNotes] = useState('');

  // Unplanned Form State
  const [bankId, setBankId] = useState(banks[0]?.id || '');
  const [day, setDay] = useState(new Date().getDate().toString());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  // Credit Card Form State
  const [cardId, setCardId] = useState(creditCards[0]?.id || '');
  const [cardCategory, setCardCategory] = useState('Shopping');
  const [cardDescription, setCardDescription] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [expenseType, setExpenseType] = useState<CreditExpenseType>('non_essential');

  // Goal Deposit Form State
  const [goalId, setGoalId] = useState(goals[0]?.id || '');
  const [goalDepositAmount, setGoalDepositAmount] = useState('');

  const currentTab = quickAddType || activeTab;

  const currentPlannedBank = banks.find((b) => b.id === plannedBankId) || banks[0];

  const handlePlannedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plannedBankId || !plannedMasterId || !plannedAmount) {
      addToast('Please fill all required fields', 'warning');
      return;
    }

    const amt = parseFloat(plannedAmount) || 0;
    const cat = currentPlannedBank?.plannedCategories.find((c) => c.id === plannedMasterId);

    if (plannedMode === 'add') {
      addPlannedSpend(plannedBankId, activeMonth, plannedMasterId, amt);
      addToast(`Added ₹${amt.toLocaleString()} to ${cat?.category || 'Planned Expense'}`, 'success');
    } else {
      updatePlannedSpent(plannedBankId, activeMonth, plannedMasterId, amt);
      addToast(`Set ${cat?.category || 'Planned Expense'} spent to ₹${amt.toLocaleString()}`, 'success');
    }

    setPlannedAmount('');
    closeQuickAdd();
  };

  const handleOptionalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optionalBankId || !optionalTitle || !optionalSet) {
      addToast('Please fill all required fields', 'warning');
      return;
    }

    const setAmt = parseFloat(optionalSet) || 0;
    const spentAmt = parseFloat(optionalSpent) || 0;

    addOptionalExpense({
      bankId: optionalBankId,
      month: activeMonth,
      title: optionalTitle,
      amountSet: setAmt,
      amountSpent: spentAmt,
      dueDate: optionalDueDate || undefined,
      notes: optionalNotes,
      isPaid: spentAmt >= setAmt && setAmt > 0,
    });

    addToast(`Added optional commitment "${optionalTitle}"`, 'success');
    setOptionalTitle('');
    setOptionalSet('');
    setOptionalSpent('');
    setOptionalDueDate('');
    setOptionalNotes('');
    closeQuickAdd();
  };

  const handleUnplannedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankId || !description || !amount) {
      addToast('Please fill all required fields', 'warning');
      return;
    }

    addUnplannedExpense({
      bankId,
      month: activeMonth,
      day: parseInt(day, 10) || 1,
      description,
      amount: parseFloat(amount) || 0,
      notes,
    });

    addToast(`Recorded ₹${parseFloat(amount).toLocaleString()} unplanned expense`, 'success');
    setDescription('');
    setAmount('');
    setNotes('');
    closeQuickAdd();
  };

  const handleCreditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardId || !cardDescription || !cardAmount) {
      addToast('Please fill all required fields', 'warning');
      return;
    }

    const dayNum = parseInt(day, 10) || 1;
    addCreditTransaction({
      cardId,
      month: activeMonth,
      date: formatDayWithMonth(dayNum, activeMonth),
      day: dayNum,
      category: cardCategory,
      description: cardDescription,
      amount: parseFloat(cardAmount) || 0,
      expenseType,
    });

    addToast(`Added card charge of ₹${parseFloat(cardAmount).toLocaleString()}`, 'success');
    setCardDescription('');
    setCardAmount('');
    closeQuickAdd();
  };

  const handleGoalDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetGoal = goals.find((g) => g.id === goalId);
    if (!targetGoal || !goalDepositAmount) {
      addToast('Please specify a valid goal and amount', 'warning');
      return;
    }

    const deposit = parseFloat(goalDepositAmount) || 0;
    const newTotal = (targetGoal.actualSaved || 0) + deposit;
    updateGoalSavedAmount(goalId, newTotal);

    addToast(`Saved ₹${deposit.toLocaleString()} toward ${targetGoal.goalName}`, 'success');
    setGoalDepositAmount('');
    closeQuickAdd();
  };

  return (
    <Modal
      isOpen={isQuickAddOpen}
      onClose={closeQuickAdd}
      title="Quick Logger"
      subtitle={`Logging for ${activeMonth}`}
      maxWidth="md"
    >
      {/* 5-Tab Switcher */}
      <div className="grid grid-cols-5 gap-1 rounded-xl bg-[#0b0d11] p-1 border border-[#222731]">
        <button
          type="button"
          onClick={() => setActiveTab('planned')}
          className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all truncate cursor-pointer ${
            currentTab === 'planned' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Planned
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('optional')}
          className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all truncate cursor-pointer ${
            currentTab === 'optional' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Optional
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('unplanned')}
          className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all truncate cursor-pointer ${
            currentTab === 'unplanned' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Unplanned
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('credit_tx')}
          className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all truncate cursor-pointer ${
            currentTab === 'credit_tx' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Card
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('goal_saving')}
          className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all truncate cursor-pointer ${
            currentTab === 'goal_saving' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Goal
        </button>
      </div>

      {/* Tab 1: Planned Expense Spend Logger */}
      {currentTab === 'planned' && (
        <form onSubmit={handlePlannedSubmit} className="space-y-3.5 pt-1 text-left">
          <Select
            label="Bank Account"
            value={plannedBankId}
            onChange={(e) => {
              setPlannedBankId(e.target.value);
              const b = banks.find((item) => item.id === e.target.value);
              if (b && b.plannedCategories[0]) {
                setPlannedMasterId(b.plannedCategories[0].id);
              }
            }}
            options={banks.map((b) => ({ value: b.id, label: `${b.bankName} (${b.nickname})` }))}
          />

          <Select
            label="Planned Budget Category"
            value={plannedMasterId}
            onChange={(e) => setPlannedMasterId(e.target.value)}
            options={
              currentPlannedBank?.plannedCategories.map((c) => ({
                value: c.id,
                label: `${c.category} (Budget: ₹${c.amountSet})`,
              })) || []
            }
          />

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#0b0d11] p-1 border border-[#222731]">
            <button
              type="button"
              onClick={() => setPlannedMode('add')}
              className={`py-1 text-xs font-semibold rounded-lg transition-all ${
                plannedMode === 'add' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              + Add to Spent
            </button>
            <button
              type="button"
              onClick={() => setPlannedMode('set')}
              className={`py-1 text-xs font-semibold rounded-lg transition-all ${
                plannedMode === 'set' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Set Total Spent
            </button>
          </div>

          <Input
            label={plannedMode === 'add' ? 'Amount to Add' : 'Total Spent Amount'}
            type="number"
            prefixSymbol="₹"
            placeholder="e.g. 1500"
            value={plannedAmount}
            onChange={(e) => setPlannedAmount(e.target.value)}
            required
            autoFocus
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeQuickAdd}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              Save Planned Spend
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Optional Expense Logger */}
      {currentTab === 'optional' && (
        <form onSubmit={handleOptionalSubmit} className="space-y-3.5 pt-1 text-left">
          <Select
            label="Bank Account"
            value={optionalBankId}
            onChange={(e) => setOptionalBankId(e.target.value)}
            options={banks.map((b) => ({ value: b.id, label: `${b.bankName} (${b.nickname})` }))}
          />

          <Input
            label="Commitment Title"
            placeholder="e.g. Annual Car Insurance, Society Paint Cess"
            value={optionalTitle}
            onChange={(e) => setOptionalTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Budget (Amount Set)"
              type="number"
              prefixSymbol="₹"
              placeholder="e.g. 12000"
              value={optionalSet}
              onChange={(e) => setOptionalSet(e.target.value)}
              required
            />
            <Input
              label="Already Spent"
              type="number"
              prefixSymbol="₹"
              placeholder="e.g. 0"
              value={optionalSpent}
              onChange={(e) => setOptionalSpent(e.target.value)}
            />
          </div>

          <Input
            label="Due Date (Optional)"
            type="date"
            value={optionalDueDate}
            onChange={(e) => setOptionalDueDate(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeQuickAdd}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              Save Optional Expense
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Unplanned Expense Form */}
      {currentTab === 'unplanned' && (
        <form onSubmit={handleUnplannedSubmit} className="space-y-3.5 pt-1 text-left">
          <Select
            label="Bank Account"
            value={bankId}
            onChange={(e) => setBankId(e.target.value)}
            options={banks.map((b) => ({ value: b.id, label: `${b.bankName} (${b.nickname})` }))}
          />

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Input
                label="Day"
                type="number"
                min={1}
                max={31}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                helperText="1-31"
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Amount"
                type="number"
                prefixSymbol="₹"
                placeholder="2500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <Input
            label="Description"
            placeholder="e.g. Car battery repair"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <Input
            label="Notes (Optional)"
            placeholder="e.g. Highway garage repair"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeQuickAdd}
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
      )}

      {/* Tab 4: Credit Card Transaction Form */}
      {currentTab === 'credit_tx' && (
        <form onSubmit={handleCreditSubmit} className="space-y-3.5 pt-1 text-left">
          <Select
            label="Credit Card"
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            options={creditCards.map((c) => ({ value: c.id, label: `${c.cardName} (${c.issuer})` }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Day"
              type="number"
              min={1}
              max={31}
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
            <Input
              label="Amount"
              type="number"
              prefixSymbol="₹"
              placeholder="3400"
              value={cardAmount}
              onChange={(e) => setCardAmount(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Category"
              placeholder="e.g. Dining, Travel"
              value={cardCategory}
              onChange={(e) => setCardCategory(e.target.value)}
              required
            />
            <Select
              label="Type"
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
            placeholder="e.g. Team lunch at Mainland China"
            value={cardDescription}
            onChange={(e) => setCardDescription(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeQuickAdd}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              Log Charge
            </button>
          </div>
        </form>
      )}

      {/* Tab 5: Goal Deposit Form */}
      {currentTab === 'goal_saving' && (
        <form onSubmit={handleGoalDepositSubmit} className="space-y-3.5 pt-1 text-left">
          <Select
            label="Select Future Goal"
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            options={goals.map((g) => ({
              value: g.id,
              label: `${g.goalName} (Saved: ₹${g.actualSaved.toLocaleString()} / Target: ₹${g.targetAmount.toLocaleString()})`,
            }))}
          />

          <Input
            label="Deposit Amount"
            type="number"
            prefixSymbol="₹"
            placeholder="10000"
            value={goalDepositAmount}
            onChange={(e) => setGoalDepositAmount(e.target.value)}
            helperText="Adds directly to total saved progress"
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeQuickAdd}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              Save Toward Goal
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
