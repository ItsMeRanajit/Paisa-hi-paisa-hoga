import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore, QuickAddType } from '../../store/useUIStore';
import { Modal } from '../common/Modal';
import { Input, Select } from '../common/Input';
import { CreditExpenseType, ExpensePaymentType } from '../../types/finance';
import { formatDayWithMonth } from '../../utils/formatters';

export const QuickActionModal: React.FC = () => {
  const { isQuickAddOpen, quickAddType, closeQuickAdd, addToast } = useUIStore();
  const {
    activeMonth,
    banks,
    monthlyData,
    optionalExpenses,
    creditCards,
    goals,
    addPlannedSpend,
    addRecurringPlannedSpend,
    addPortionPlannedSpend,
    updatePlannedSpent,
    updateOptionalExpense,
    addUnplannedExpense,
    addCreditTransaction,
    updateGoalSavedAmount,
    setSelectedBankId,
    setActiveTab: navigateTab,
  } = useFinanceStore();

  const [currentTab, setCurrentTab] = useState<QuickAddType>('unplanned');

  // Planned Spend Form State
  const [plannedBankId, setPlannedBankId] = useState('');
  const [plannedMasterId, setPlannedMasterId] = useState('');
  const [plannedDate, setPlannedDate] = useState(new Date().toISOString().split('T')[0]);
  const [plannedDesc, setPlannedDesc] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [plannedMode, setPlannedMode] = useState<'add' | 'set'>('add');

  // Month Specific Commitment Form State
  const [optionalBankId, setOptionalBankId] = useState('');
  const [optionalItemId, setOptionalItemId] = useState('');
  const [optionalSpendAmount, setOptionalSpendAmount] = useState('');
  const [optionalMode, setOptionalMode] = useState<'add' | 'set'>('add');

  // Unplanned Form State
  const [bankId, setBankId] = useState('');
  const [day, setDay] = useState(new Date().getDate().toString());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  // Credit Card Form State
  const [cardId, setCardId] = useState('');
  const [cardCategory, setCardCategory] = useState('Shopping');
  const [cardDescription, setCardDescription] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  const [expenseType, setExpenseType] = useState<CreditExpenseType>('non_essential');

  // Goal Deposit Form State
  const [goalId, setGoalId] = useState('');
  const [goalDepositAmount, setGoalDepositAmount] = useState('');

  // Synchronize initial state when modal opens
  useEffect(() => {
    if (isQuickAddOpen) {
      if (quickAddType) {
        setCurrentTab(quickAddType);
      }
      if (banks.length > 0) {
        const firstBank = banks[0];
        setPlannedBankId(firstBank.id);
        setBankId(firstBank.id);
        setOptionalBankId(firstBank.id);

        if (firstBank.plannedCategories && firstBank.plannedCategories.length > 0) {
          setPlannedMasterId(firstBank.plannedCategories[0].id);
        } else {
          setPlannedMasterId('');
        }

        const firstBankOpts = optionalExpenses.filter(
          (o) => o.bankId === firstBank.id && o.month === activeMonth
        );
        setOptionalItemId(firstBankOpts[0]?.id || '');
      }
      if (creditCards.length > 0) {
        setCardId(creditCards[0].id);
      }
      if (goals.length > 0) {
        setGoalId(goals[0].id);
      }
    }
  }, [isQuickAddOpen, quickAddType, banks, optionalExpenses, activeMonth, creditCards, goals]);

  // When planned bank changes, update selected master category
  const handlePlannedBankChange = (newBankId: string) => {
    setPlannedBankId(newBankId);
    const b = banks.find((item) => item.id === newBankId);
    if (b && b.plannedCategories && b.plannedCategories.length > 0) {
      setPlannedMasterId(b.plannedCategories[0].id);
    } else {
      setPlannedMasterId('');
    }
  };

  // When optional bank changes, update selected commitment item
  const handleOptionalBankChange = (newBankId: string) => {
    setOptionalBankId(newBankId);
    const bankOpts = optionalExpenses.filter(
      (o) => o.bankId === newBankId && o.month === activeMonth
    );
    setOptionalItemId(bankOpts[0]?.id || '');
  };

  const currentPlannedBank = banks.find((b) => b.id === plannedBankId) || banks[0];

  const handlePlannedSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPlannedBank) {
      addToast('Please add a bank account first in Profile', 'warning');
      return;
    }

    if (!plannedMasterId) {
      addToast('Please select a planned category', 'warning');
      return;
    }

    if (!plannedAmount || parseFloat(plannedAmount) <= 0) {
      addToast('Please enter a valid spend amount', 'warning');
      return;
    }

    const amt = parseFloat(plannedAmount) || 0;
    const cat = currentPlannedBank?.plannedCategories?.find((c) => c.id === plannedMasterId);
    const pType = cat?.paymentType || 'recurring';

    if (pType === 'recurring') {
      addRecurringPlannedSpend(currentPlannedBank.id, activeMonth, plannedMasterId, {
        date: plannedDate,
        description: plannedDesc.trim() || 'Payment',
        amount: amt,
      });
      addToast(`Added ₹${amt.toLocaleString()} to ${cat?.category || 'Planned Expense'}`, 'success');
    } else if (pType === 'in_portions') {
      addPortionPlannedSpend(currentPlannedBank.id, activeMonth, plannedMasterId, {
        date: plannedDate,
        label: plannedDesc.trim() || undefined,
        amount: amt,
      });
      addToast(`Recorded portion of ₹${amt.toLocaleString()} for ${cat?.category || 'Planned Expense'}`, 'success');
    } else {
      if (plannedMode === 'add') {
        addPlannedSpend(currentPlannedBank.id, activeMonth, plannedMasterId, amt);
        addToast(`Added ₹${amt.toLocaleString()} to ${cat?.category || 'Planned Expense'}`, 'success');
      } else {
        updatePlannedSpent(currentPlannedBank.id, activeMonth, plannedMasterId, amt);
        addToast(`Set ${cat?.category || 'Planned Expense'} spent to ₹${amt.toLocaleString()}`, 'success');
      }
    }

    setPlannedAmount('');
    setPlannedDesc('');
    closeQuickAdd();
  };

  const handleOptionalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBankId = optionalBankId || banks[0]?.id;

    if (!targetBankId) {
      addToast('Please add a bank account first in Profile', 'warning');
      return;
    }

    const bankOpts = optionalExpenses.filter(
      (o) => o.bankId === targetBankId && o.month === activeMonth
    );
    const selectedItem = bankOpts.find((o) => o.id === (optionalItemId || bankOpts[0]?.id));

    if (!selectedItem) {
      addToast('Please select a month commitment', 'warning');
      return;
    }

    if (!optionalSpendAmount || parseFloat(optionalSpendAmount) <= 0) {
      addToast('Please enter a valid spend amount', 'warning');
      return;
    }

    const amt = parseFloat(optionalSpendAmount) || 0;
    const newSpent = optionalMode === 'add' ? selectedItem.amountSpent + amt : amt;

    updateOptionalExpense(selectedItem.id, {
      amountSpent: newSpent,
      isPaid: newSpent >= selectedItem.amountSet && selectedItem.amountSet > 0,
    });

    addToast(`Logged spend of ₹${amt.toLocaleString()} for "${selectedItem.title}"`, 'success');
    setOptionalSpendAmount('');
    closeQuickAdd();
  };

  const handleUnplannedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBankId = bankId || banks[0]?.id;

    if (!targetBankId) {
      addToast('Please add a bank account first in Profile', 'warning');
      return;
    }

    if (!description.trim()) {
      addToast('Please enter an expense description', 'warning');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      addToast('Please enter a valid expense amount', 'warning');
      return;
    }

    const amtNum = parseFloat(amount) || 0;
    const dayNum = parseInt(day, 10) || new Date().getDate();

    addUnplannedExpense({
      bankId: targetBankId,
      month: activeMonth,
      day: dayNum,
      description: description.trim(),
      amount: amtNum,
    });

    addToast(`Logged ₹${amtNum.toLocaleString()} unplanned expense`, 'success');
    setDescription('');
    setAmount('');
    closeQuickAdd();
  };

  const handleCreditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCardId = cardId || creditCards[0]?.id;

    if (!targetCardId) {
      addToast('Please add a credit card first in Cards or Profile', 'warning');
      return;
    }

    if (!cardDescription.trim()) {
      addToast('Please enter a charge description', 'warning');
      return;
    }

    if (!cardAmount || parseFloat(cardAmount) <= 0) {
      addToast('Please enter a valid amount', 'warning');
      return;
    }

    const dayNum = parseInt(day, 10) || new Date().getDate();
    const amtNum = parseFloat(cardAmount) || 0;

    addCreditTransaction({
      cardId: targetCardId,
      month: activeMonth,
      date: formatDayWithMonth(dayNum, activeMonth),
      day: dayNum,
      category: cardCategory,
      description: cardDescription.trim(),
      amount: amtNum,
      expenseType,
    });

    addToast(`Added card charge of ₹${amtNum.toLocaleString()}`, 'success');
    setCardDescription('');
    setCardAmount('');
    closeQuickAdd();
  };

  const handleGoalDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetGoalId = goalId || goals[0]?.id;
    const targetGoal = goals.find((g) => g.id === targetGoalId);

    if (!targetGoal) {
      addToast('Please create a goal first on the Goals page', 'warning');
      return;
    }

    if (!goalDepositAmount || parseFloat(goalDepositAmount) <= 0) {
      addToast('Please enter a valid deposit amount', 'warning');
      return;
    }

    const deposit = parseFloat(goalDepositAmount) || 0;
    const newTotal = (targetGoal.actualSaved || 0) + deposit;
    updateGoalSavedAmount(targetGoal.id, newTotal);

    addToast(`Saved ₹${deposit.toLocaleString()} toward ${targetGoal.goalName}`, 'success');
    setGoalDepositAmount('');
    closeQuickAdd();
  };

  return (
    <Modal
      isOpen={isQuickAddOpen}
      onClose={closeQuickAdd}
      title="Add Financial Entry"
      subtitle={`Logging for ${activeMonth}`}
      maxWidth="md"
    >
      {/* 5-Tab Switcher with unrestricted switching */}
      <div className="grid grid-cols-5 gap-1 rounded-xl bg-[#0b0d11] p-1 border border-[#222731]">
        <button
          type="button"
          onClick={() => setCurrentTab('planned')}
          className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all truncate cursor-pointer ${
            currentTab === 'planned' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Planned
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('optional')}
          className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all truncate cursor-pointer ${
            currentTab === 'optional' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Commitment
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('unplanned')}
          className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all truncate cursor-pointer ${
            currentTab === 'unplanned' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Unplanned
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('credit_tx')}
          className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all truncate cursor-pointer ${
            currentTab === 'credit_tx' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Card
        </button>
        <button
          type="button"
          onClick={() => setCurrentTab('goal_saving')}
          className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all truncate cursor-pointer ${
            currentTab === 'goal_saving' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Goal
        </button>
      </div>

      {/* If No Banks exist yet */}
      {banks.length === 0 && (currentTab === 'planned' || currentTab === 'optional' || currentTab === 'unplanned') && (
        <div className="rounded-xl border border-dashed border-[#222731] p-5 text-center space-y-3 bg-[#0c0e12]">
          <p className="text-xs text-zinc-400">
            No bank workspaces found. Please create a bank account on the Profile page to start tracking expenses.
          </p>
          <button
            type="button"
            onClick={() => {
              closeQuickAdd();
              navigateTab('profile');
            }}
            className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold cursor-pointer"
          >
            Go to Profile to Add Bank
          </button>
        </div>
      )}

      {/* Tab 1: Planned Expense Spend Logger */}
      {currentTab === 'planned' && banks.length > 0 && (
        <form onSubmit={handlePlannedSubmit} className="space-y-3.5 pt-1 text-left">
          <Select
            label="Bank Account"
            value={plannedBankId || currentPlannedBank?.id}
            onChange={(e) => handlePlannedBankChange(e.target.value)}
            options={banks.map((b) => ({ value: b.id, label: `${b.bankName} (${b.nickname})` }))}
          />

          {currentPlannedBank?.plannedCategories && currentPlannedBank.plannedCategories.length > 0 ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Planned Budget Category</label>
                <Select
                  value={plannedMasterId || currentPlannedBank.plannedCategories[0]?.id}
                  onChange={(e) => setPlannedMasterId(e.target.value)}
                  options={currentPlannedBank.plannedCategories.map((c) => ({
                    value: c.id,
                    label: c.category,
                  }))}
                />
              </div>

              {/* Contextual Category Overview Card */}
              {(() => {
                const selCat = currentPlannedBank.plannedCategories.find((c) => c.id === (plannedMasterId || currentPlannedBank.plannedCategories[0]?.id));
                if (!selCat) return null;
                const monthVal = monthlyData[activeMonth]?.[currentPlannedBank.id]?.plannedExpenseValues?.[selCat.id];
                const budget = monthVal?.amountSet !== undefined ? Number(monthVal.amountSet) : Number(selCat.amountSet) || 0;
                const pType = monthVal?.paymentType || selCat.paymentType || 'recurring';
                let spent = Number(monthVal?.amountSpent) || 0;
                if (pType === 'recurring' && monthVal?.recurringEntries?.length) {
                  spent = monthVal.recurringEntries.reduce((s, e) => s + (Number(e.amount) || 0), 0);
                } else if (pType === 'in_portions' && monthVal?.portionEntries?.length) {
                  spent = monthVal.portionEntries.reduce((s, p) => s + (Number(p.amount) || 0), 0);
                }
                const remaining = budget - spent;

                const typeLabels = {
                  recurring: { label: 'Recurring', style: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40' },
                  in_portions: { label: 'In Portions', style: 'bg-purple-950/60 text-purple-300 border-purple-800/40' },
                  one_time: { label: 'One-time', style: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' },
                };
                const badge = typeLabels[pType] || typeLabels.recurring;

                return (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#0c0e12] px-3 py-2 border border-[#1c212b] text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.style}`}>
                        {badge.label}
                      </span>
                      <span className="text-zinc-400">Budget: <strong className="text-zinc-200 font-mono">₹{budget.toLocaleString()}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-zinc-400">Spent: <strong className="text-zinc-200">₹{spent.toLocaleString()}</strong></span>
                      <span className="text-zinc-600">•</span>
                      <span className={remaining < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {remaining < 0 ? 'Deficit: ' : 'Left: '}₹{Math.abs(remaining).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Dynamic form inputs based on selected category type */}
              {(() => {
                const selCat = currentPlannedBank.plannedCategories.find((c) => c.id === (plannedMasterId || currentPlannedBank.plannedCategories[0]?.id));
                const pType = selCat?.paymentType || 'recurring';

                if (pType === 'recurring') {
                  return (
                    <div className="space-y-3 rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b]">
                      <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
                        Recurring Payment Entry
                      </span>
                      <Input
                        label="Date"
                        type="date"
                        value={plannedDate}
                        onChange={(e) => setPlannedDate(e.target.value)}
                        required
                      />
                      <Input
                        label="Description"
                        placeholder="e.g. Swiggy order, Fuel refill, Auto fare"
                        value={plannedDesc}
                        onChange={(e) => setPlannedDesc(e.target.value)}
                        required
                        autoFocus
                      />
                      <Input
                        label="Payment Amount (₹)"
                        type="number"
                        prefixSymbol="₹"
                        placeholder="e.g. 450"
                        value={plannedAmount}
                        onChange={(e) => setPlannedAmount(e.target.value)}
                        required
                      />
                    </div>
                  );
                }

                if (pType === 'in_portions') {
                  return (
                    <div className="space-y-3 rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b]">
                      <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
                        Portion / Installment Entry
                      </span>
                      <Input
                        label="Date"
                        type="date"
                        value={plannedDate}
                        onChange={(e) => setPlannedDate(e.target.value)}
                        required
                      />
                      <Input
                        label="Portion Label / Note"
                        placeholder="e.g. 1st installment, Down payment"
                        value={plannedDesc}
                        onChange={(e) => setPlannedDesc(e.target.value)}
                        autoFocus
                      />
                      <Input
                        label="Portion Amount (₹)"
                        type="number"
                        prefixSymbol="₹"
                        placeholder="e.g. 10000"
                        value={plannedAmount}
                        onChange={(e) => setPlannedAmount(e.target.value)}
                        required
                      />
                    </div>
                  );
                }

                // One-time payment
                return (
                  <div className="space-y-3 rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b]">
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
                      label={plannedMode === 'add' ? 'Amount to Add to Spent' : 'Set Total Spent Amount'}
                      type="number"
                      prefixSymbol="₹"
                      placeholder="e.g. 2500"
                      value={plannedAmount}
                      onChange={(e) => setPlannedAmount(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                );
              })()}

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
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#222731] bg-[#0c0e12] p-5 text-center space-y-2">
              <p className="text-xs font-semibold text-zinc-300">No Planned Categories Configured</p>
              <p className="text-[11px] text-zinc-400">
                You must add planned budget categories from the Bank Workspace → Planned Expenses section first before logging spend.
              </p>
              <button
                type="button"
                onClick={() => {
                  closeQuickAdd();
                  setSelectedBankId(currentPlannedBank?.id || banks[0]?.id);
                  navigateTab('banks');
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline cursor-pointer pt-1"
              >
                Go to Bank Workspace
              </button>
            </div>
          )}
        </form>
      )}

      {/* Tab 2: Month Specific Commitment Logger */}
      {currentTab === 'optional' && banks.length > 0 && (
        <form onSubmit={handleOptionalSubmit} className="space-y-3.5 pt-1 text-left">
          <Select
            label="Bank Account"
            value={optionalBankId || banks[0]?.id}
            onChange={(e) => handleOptionalBankChange(e.target.value)}
            options={banks.map((b) => ({ value: b.id, label: `${b.bankName} (${b.nickname})` }))}
          />

          {(() => {
            const currentBankOptionalList = optionalExpenses.filter(
              (o) => o.bankId === (optionalBankId || banks[0]?.id) && o.month === activeMonth
            );

            if (currentBankOptionalList.length === 0) {
              return (
                <div className="rounded-xl border border-dashed border-[#222731] bg-[#0c0e12] p-5 text-center space-y-2">
                  <p className="text-xs font-semibold text-zinc-300">No Month Commitments Found</p>
                  <p className="text-[11px] text-zinc-400">
                    You must add month-specific commitment plans from the Bank Workspace → Month Specific Commitments section first before logging spend.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      closeQuickAdd();
                      setSelectedBankId(optionalBankId || banks[0]?.id);
                      navigateTab('banks');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 underline cursor-pointer pt-1"
                  >
                    Go to Month Specific Commitments
                  </button>
                </div>
              );
            }

            const selOpt = currentBankOptionalList.find(
              (o) => o.id === (optionalItemId || currentBankOptionalList[0]?.id)
            ) || currentBankOptionalList[0];

            const optRemaining = selOpt ? selOpt.amountSet - selOpt.amountSpent : 0;

            return (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Commitment Plan</label>
                  <Select
                    value={optionalItemId || currentBankOptionalList[0]?.id}
                    onChange={(e) => setOptionalItemId(e.target.value)}
                    options={currentBankOptionalList.map((o) => ({
                      value: o.id,
                      label: o.title,
                    }))}
                  />
                </div>

                {selOpt && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#0c0e12] px-3 py-2 border border-[#1c212b] text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-purple-950/60 text-purple-300 border-purple-800/40">
                        1-Mo Commitment
                      </span>
                      <span className="text-zinc-400">
                        Budget: <strong className="text-zinc-200 font-mono">₹{selOpt.amountSet.toLocaleString()}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-zinc-400">
                        Spent: <strong className="text-zinc-200">₹{selOpt.amountSpent.toLocaleString()}</strong>
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className={optRemaining < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {optRemaining < 0 ? 'Deficit: ' : 'Left: '}₹{Math.abs(optRemaining).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-3 rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b]">
                  <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#0b0d11] p-1 border border-[#222731]">
                    <button
                      type="button"
                      onClick={() => setOptionalMode('add')}
                      className={`py-1 text-xs font-semibold rounded-lg transition-all ${
                        optionalMode === 'add' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      + Add to Spent
                    </button>
                    <button
                      type="button"
                      onClick={() => setOptionalMode('set')}
                      className={`py-1 text-xs font-semibold rounded-lg transition-all ${
                        optionalMode === 'set' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Set Total Spent
                    </button>
                  </div>

                  <Input
                    label={optionalMode === 'add' ? 'Amount to Add to Spent' : 'Set Total Spent Amount'}
                    type="number"
                    prefixSymbol="₹"
                    placeholder="e.g. 4500"
                    value={optionalSpendAmount}
                    onChange={(e) => setOptionalSpendAmount(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

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
                    Save Commitment Spend
                  </button>
                </div>
              </div>
            );
          })()}
        </form>
      )}

      {/* Tab 3: Unplanned Expense Form */}
      {currentTab === 'unplanned' && banks.length > 0 && (
        <form onSubmit={handleUnplannedSubmit} className="space-y-3.5 pt-1 text-left">
          <Select
            label="Bank Account"
            value={bankId || banks[0]?.id}
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
                autoFocus
              />
            </div>
          </div>

          <Input
            label="Description"
            placeholder="e.g. Car battery repair, Doctor visit"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
              Save Expense
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Credit Card Transaction Form */}
      {currentTab === 'credit_tx' && (
        creditCards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#222731] p-5 text-center space-y-3 bg-[#0c0e12]">
            <p className="text-xs text-zinc-400">
              No credit cards configured. Please add a card in the Cards tab or Profile.
            </p>
            <button
              type="button"
              onClick={() => {
                closeQuickAdd();
                navigateTab('credit_cards');
              }}
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              Go to Cards Page
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreditSubmit} className="space-y-3.5 pt-1 text-left">
            <Select
              label="Credit Card"
              value={cardId || creditCards[0]?.id}
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
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Category"
                placeholder="e.g. Dining, Travel, Shopping"
                value={cardCategory}
                onChange={(e) => setCardCategory(e.target.value)}
                required
              />
              <Select
                label="Expense Type"
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
              placeholder="e.g. Weekend grocery at DMart"
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
                Log Card Charge
              </button>
            </div>
          </form>
        )
      )}

      {/* Tab 5: Goal Deposit Form */}
      {currentTab === 'goal_saving' && (
        goals.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#222731] p-5 text-center space-y-3 bg-[#0c0e12]">
            <p className="text-xs text-zinc-400">
              No financial goals configured yet. Please create a target goal first.
            </p>
            <button
              type="button"
              onClick={() => {
                closeQuickAdd();
                navigateTab('goals');
              }}
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              Go to Goals Page
            </button>
          </div>
        ) : (
          <form onSubmit={handleGoalDepositSubmit} className="space-y-3.5 pt-1 text-left">
            <Select
              label="Select Future Goal"
              value={goalId || goals[0]?.id}
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
              helperText="Adds directly to goal saved progress"
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
                Save Toward Goal
              </button>
            </div>
          </form>
        )
      )}
    </Modal>
  );
};
