import React, { useState } from 'react';
import { Landmark, Settings, PlusCircle, CalendarPlus, Sparkles } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { calculateBankMetrics } from '../../utils/calculations';
import { FundPoolSection } from './FundPoolSection';
import { PlannedExpensesSection } from './PlannedExpensesSection';
import { OptionalExpensesSection } from './OptionalExpensesSection';
import { RemainingBankAmountCard } from './RemainingBankAmountCard';
import { UnplannedExpensesSection } from './UnplannedExpensesSection';
import { MonthEndSummarySection } from './MonthEndSummarySection';
import { BankGoalRemindersSection } from './BankGoalRemindersSection';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';
import { Input, Select } from '../common/Input';
import { useUIStore } from '../../store/useUIStore';

export const BankWorkspace: React.FC = () => {
  const {
    banks,
    selectedBankId,
    setSelectedBankId,
    monthlyData,
    optionalExpenses,
    unplannedExpenses,
    goals,
    activeMonth,
    userProfile,
    addPlannedSpend,
    updatePlannedSpent,
    addOptionalExpense,
    addUnplannedExpense,
    setActiveTab,
  } = useFinanceStore();

  const { addToast } = useUIStore();

  // Quick Action Modal States
  const [isQuickLogSpendOpen, setIsQuickLogSpendOpen] = useState(false);
  const [quickLogCatId, setQuickLogCatId] = useState('');
  const [quickLogAmount, setQuickLogAmount] = useState('');
  const [quickLogMode, setQuickLogMode] = useState<'add' | 'set'>('add');

  const [isQuickAddOptionalOpen, setIsQuickAddOptionalOpen] = useState(false);
  const [quickOptTitle, setQuickOptTitle] = useState('');
  const [quickOptSet, setQuickOptSet] = useState('');
  const [quickOptSpent, setQuickOptSpent] = useState('');
  const [quickOptDate, setQuickOptDate] = useState('');

  const [isQuickAddUnplannedOpen, setIsQuickAddUnplannedOpen] = useState(false);
  const [quickUnpDay, setQuickUnpDay] = useState(new Date().getDate().toString());
  const [quickUnpDesc, setQuickUnpDesc] = useState('');
  const [quickUnpAmount, setQuickUnpAmount] = useState('');

  const currentBankId = selectedBankId && banks.some((b) => b.id === selectedBankId)
    ? selectedBankId
    : banks[0]?.id || null;

  const currentBank = banks.find((b) => b.id === currentBankId);

  const handleQuickLogPlanned = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBank || !quickLogCatId || !quickLogAmount) return;

    const amt = parseFloat(quickLogAmount) || 0;
    if (quickLogMode === 'add') {
      addPlannedSpend(currentBank.id, activeMonth, quickLogCatId, amt);
      addToast(`Logged ₹${amt.toLocaleString()} planned spend`, 'success');
    } else {
      updatePlannedSpent(currentBank.id, activeMonth, quickLogCatId, amt);
      addToast(`Updated spent total to ₹${amt.toLocaleString()}`, 'success');
    }

    setQuickLogAmount('');
    setIsQuickLogSpendOpen(false);
  };

  const handleQuickAddOptional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBank || !quickOptTitle || !quickOptSet) return;

    const setAmt = parseFloat(quickOptSet) || 0;
    const spentAmt = parseFloat(quickOptSpent) || 0;

    addOptionalExpense({
      bankId: currentBank.id,
      month: activeMonth,
      title: quickOptTitle,
      amountSet: setAmt,
      amountSpent: spentAmt,
      dueDate: quickOptDate || undefined,
      isPaid: spentAmt >= setAmt && setAmt > 0,
    });

    addToast(`Added optional commitment "${quickOptTitle}"`, 'success');
    setQuickOptTitle('');
    setQuickOptSet('');
    setQuickOptSpent('');
    setQuickOptDate('');
    setIsQuickAddOptionalOpen(false);
  };

  const handleQuickAddUnplanned = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBank || !quickUnpDesc || !quickUnpAmount) return;

    addUnplannedExpense({
      bankId: currentBank.id,
      month: activeMonth,
      day: parseInt(quickUnpDay, 10) || 1,
      description: quickUnpDesc,
      amount: parseFloat(quickUnpAmount) || 0,
    });

    addToast(`Added ₹${parseFloat(quickUnpAmount).toLocaleString()} unplanned expense`, 'success');
    setQuickUnpDesc('');
    setQuickUnpAmount('');
    setIsQuickAddUnplannedOpen(false);
  };

  if (banks.length === 0 || !currentBank) {
    return (
      <EmptyState
        icon={Landmark}
        title="No Bank Accounts Configured"
        description="Add your first bank account in Profile & Settings to begin tracking fund pools, planned budgets, optional commitments, and unplanned spending."
        actionLabel="Go to Profile to Add Bank"
        onAction={() => setActiveTab('profile')}
      />
    );
  }

  const bankMonthData = monthlyData[activeMonth]?.[currentBank.id];
  const bankUnplanned = unplannedExpenses.filter(
    (u) => u.bankId === currentBank.id && u.month === activeMonth
  );
  const bankOptional = optionalExpenses.filter(
    (o) => o.bankId === currentBank.id && o.month === activeMonth
  );

  const metrics = calculateBankMetrics(
    currentBank,
    bankMonthData,
    bankUnplanned,
    bankOptional,
    userProfile.unplannedSpendingLimit
  );

  return (
    <div className="space-y-5 animate-fade-in text-left">
      {/* Horizontal Switcher */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-2">
          {banks.map((bank) => {
            const isSelected = bank.id === currentBank.id;
            return (
              <button
                key={bank.id}
                type="button"
                onClick={() => setSelectedBankId(bank.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-zinc-800 border-zinc-700 text-white'
                    : 'bg-[#13161c] border-[#222731] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-left">
                  <p className="leading-tight">{bank.bankName}</p>
                  <p className="text-[10px] font-normal text-zinc-400 leading-tight">{bank.nickname}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>

      {/* Quick Action Bar for Bank Workspace */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          type="button"
          onClick={() => {
            setQuickLogCatId(currentBank.plannedCategories[0]?.id || '');
            setIsQuickLogSpendOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-medium border border-zinc-700/60 shrink-0 cursor-pointer"
        >
          <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
          <span>+ Log Planned Spend</span>
        </button>

        <button
          type="button"
          onClick={() => setIsQuickAddOptionalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-medium border border-zinc-700/60 shrink-0 cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span>+ Add Optional Expense</span>
        </button>

        <button
          type="button"
          onClick={() => setIsQuickAddUnplannedOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-medium border border-zinc-700/60 shrink-0 cursor-pointer"
        >
          <CalendarPlus className="h-3.5 w-3.5 text-amber-400" />
          <span>+ Add Unplanned</span>
        </button>
      </div>

      {/* Goal Reminders */}
      <BankGoalRemindersSection
        bank={currentBank}
        goals={goals}
        currency={userProfile.currency}
      />

      {/* Section 1: Monthly Fund Pool */}
      <FundPoolSection
        bank={currentBank}
        metrics={metrics}
      />

      {/* Section 2: Planned Expenses */}
      <PlannedExpensesSection
        bank={currentBank}
        metrics={metrics}
      />

      {/* Dedicated Section: Optional Expenses (One-Off Mandatory Commitments) */}
      <OptionalExpensesSection
        bank={currentBank}
        metrics={metrics}
        optionalExpenses={bankOptional}
        currency={userProfile.currency}
      />

      {/* Section 3: Remaining Bank Amount */}
      <RemainingBankAmountCard
        metrics={metrics}
        currency={userProfile.currency}
      />

      {/* Section 4: Unplanned Expenses */}
      <UnplannedExpensesSection
        bank={currentBank}
        metrics={metrics}
        unplannedExpenses={bankUnplanned}
      />

      {/* Section 5: Month-End Summary */}
      <MonthEndSummarySection
        bank={currentBank}
        metrics={metrics}
        currency={userProfile.currency}
      />

      {/* Quick Log Planned Spend Modal */}
      <Modal
        isOpen={isQuickLogSpendOpen}
        onClose={() => setIsQuickLogSpendOpen(false)}
        title="Log Planned Category Spend"
        subtitle={`Recording spend for ${currentBank.bankName}`}
        maxWidth="sm"
      >
        <form onSubmit={handleQuickLogPlanned} className="space-y-3.5 text-left">
          <Select
            label="Category"
            value={quickLogCatId}
            onChange={(e) => setQuickLogCatId(e.target.value)}
            options={currentBank.plannedCategories.map((c) => ({
              value: c.id,
              label: c.category,
            }))}
          />

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#0b0d11] p-1 border border-[#222731]">
            <button
              type="button"
              onClick={() => setQuickLogMode('add')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                quickLogMode === 'add' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              + Add to Spent
            </button>
            <button
              type="button"
              onClick={() => setQuickLogMode('set')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                quickLogMode === 'set' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Set Total Spent
            </button>
          </div>

          <Input
            label={quickLogMode === 'add' ? 'Amount to Add' : 'Total Spent'}
            type="number"
            prefixSymbol="₹"
            placeholder="e.g. 2500"
            value={quickLogAmount}
            onChange={(e) => setQuickLogAmount(e.target.value)}
            required
            autoFocus
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsQuickLogSpendOpen(false)}
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

      {/* Quick Add Optional Expense Modal */}
      <Modal
        isOpen={isQuickAddOptionalOpen}
        onClose={() => setIsQuickAddOptionalOpen(false)}
        title="Add Optional Expense"
        subtitle={`Month-specific mandatory commitment for ${currentBank.bankName}`}
        maxWidth="sm"
      >
        <form onSubmit={handleQuickAddOptional} className="space-y-3.5 text-left">
          <Input
            label="Title"
            placeholder="e.g. Annual Bike Insurance Renewal"
            value={quickOptTitle}
            onChange={(e) => setQuickOptTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Budget (Amount Set)"
              type="number"
              prefixSymbol="₹"
              placeholder="e.g. 4500"
              value={quickOptSet}
              onChange={(e) => setQuickOptSet(e.target.value)}
              required
            />
            <Input
              label="Already Spent"
              type="number"
              prefixSymbol="₹"
              placeholder="e.g. 0"
              value={quickOptSpent}
              onChange={(e) => setQuickOptSpent(e.target.value)}
            />
          </div>

          <Input
            label="Due Date (Optional)"
            type="date"
            value={quickOptDate}
            onChange={(e) => setQuickOptDate(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsQuickAddOptionalOpen(false)}
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
      </Modal>

      {/* Quick Add Unplanned Modal */}
      <Modal
        isOpen={isQuickAddUnplannedOpen}
        onClose={() => setIsQuickAddUnplannedOpen(false)}
        title="Add Unplanned Expense"
        subtitle={`Logged on ${currentBank.bankName} for ${activeMonth}`}
        maxWidth="sm"
      >
        <form onSubmit={handleQuickAddUnplanned} className="space-y-3.5 text-left">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Input
                label="Day"
                type="number"
                min={1}
                max={31}
                value={quickUnpDay}
                onChange={(e) => setQuickUnpDay(e.target.value)}
                required
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Amount"
                type="number"
                prefixSymbol="₹"
                placeholder="e.g. 1800"
                value={quickUnpAmount}
                onChange={(e) => setQuickUnpAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <Input
            label="Description"
            placeholder="e.g. Emergency water pipe replacement"
            value={quickUnpDesc}
            onChange={(e) => setQuickUnpDesc(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsQuickAddUnplannedOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              Save Unplanned Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
