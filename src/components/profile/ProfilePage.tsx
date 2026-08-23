import React, { useState } from 'react';
import {
  User,
  Landmark,
  CreditCard as CardIcon,
  Shield,
  Download,
  RotateCcw,
  Plus,
  Trash2,
} from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore } from '../../store/useUIStore';
import { exportFinancialWorkbook } from '../../utils/excelExport';
import { formatCurrency } from '../../utils/formatters';
import { Input, Select } from '../common/Input';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const ProfilePage: React.FC = () => {
  const {
    userProfile,
    banks,
    creditCards,
    goals,
    monthlyData,
    optionalExpenses,
    unplannedExpenses,
    creditTransactions,
    activeMonth,
    updateUserProfile,
    addBank,
    deleteBank,
    addCreditCard,
    deleteCreditCard,
    emptyAllExpenses,
    resetToMockData,
  } = useFinanceStore();

  const { addToast } = useUIStore();

  // Profile fields state
  const [name, setName] = useState(userProfile.name);
  const [mobileNumber, setMobileNumber] = useState(userProfile.mobileNumber || '');
  const [currency, setCurrency] = useState(userProfile.currency);
  const [unplannedLimit, setUnplannedLimit] = useState(userProfile.unplannedSpendingLimit.toString());

  // Bank creation
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankName, setBankName] = useState('');
  const [bankNickname, setBankNickname] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Card creation
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [cardName, setCardName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [cardNickname, setCardNickname] = useState('');
  const [creditLimit, setCreditLimit] = useState('');

  // Confirm delete bank/card / empty expenses
  const [deletingBankId, setDeletingBankId] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [isEmptyExpensesConfirmOpen, setIsEmptyExpensesConfirmOpen] = useState(false);
  const [emptyScope, setEmptyScope] = useState<'current_month' | 'all_months'>('current_month');

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      mobileNumber,
      currency,
      unplannedSpendingLimit: parseFloat(unplannedLimit) || 18000,
    });
    addToast('Profile & limits updated', 'success');
  };

  const handleCreateBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName) return;

    addBank({
      bankName,
      nickname: bankNickname || 'Savings',
      accountNumberMasked: accountNumber ? `••• ${accountNumber.slice(-4)}` : undefined,
      color: '#71717a',
      plannedCategories: [
        { id: `cat-rent-${Date.now()}`, category: 'Rent', amountSet: 20000 },
        { id: `cat-groceries-${Date.now()}`, category: 'Groceries', amountSet: 8000 },
        { id: `cat-bills-${Date.now()}`, category: 'Electricity & Bills', amountSet: 3500 },
      ],
    });

    addToast(`Added bank workspace: ${bankName}`, 'success');
    setBankName('');
    setBankNickname('');
    setAccountNumber('');
    setIsBankModalOpen(false);
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || !issuer || !creditLimit) return;

    addCreditCard({
      cardName,
      issuer,
      nickname: cardNickname || 'Card',
      creditLimit: parseFloat(creditLimit) || 150000,
      billingCycleStart: 15,
      billingCycleEnd: 14,
      cardColor: 'from-zinc-800 to-zinc-950',
    });

    addToast(`Added credit card: ${cardName}`, 'success');
    setCardName('');
    setIssuer('');
    setCardNickname('');
    setCreditLimit('');
    setIsCardModalOpen(false);
  };

  const handleExport = () => {
    try {
      const activeMonthMap = monthlyData[activeMonth] || {};
      const activeMonthOptional = optionalExpenses.filter((o) => o.month === activeMonth);
      exportFinancialWorkbook({
        userProfile,
        activeMonth,
        banks,
        monthlyData: activeMonthMap,
        optionalExpenses: activeMonthOptional,
        unplannedExpenses,
        creditCards,
        creditTransactions,
        goals,
      });
      addToast('Generated Excel workbook', 'success');
    } catch (err) {
      console.error(err);
      addToast('Export failed', 'danger');
    }
  };

  const handleEmptyExpenses = () => {
    if (emptyScope === 'current_month') {
      emptyAllExpenses(activeMonth);
      addToast(`Cleared all spent amounts & logs for ${activeMonth}. Budgets & goals kept.`, 'success');
    } else {
      emptyAllExpenses();
      addToast('Cleared all spent amounts & logs across all months. Budgets & goals kept.', 'success');
    }
    setIsEmptyExpensesConfirmOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left max-w-4xl mx-auto">
      {/* Page Title */}
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-zinc-400" />
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Settings & Profile
          </h2>
          <p className="text-xs text-zinc-400">Personalize limits, manage accounts, and export data</p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 border-b border-[#1e232c] pb-2.5">
          User Details & Global Spending Thresholds
        </h3>

        <form onSubmit={handleProfileSave} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Mobile Number"
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Select
              label="Currency Symbol"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={[
                { value: '₹', label: 'INR (₹) - Indian Rupee' },
                { value: '$', label: 'USD ($) - US Dollar' },
                { value: '€', label: 'EUR (€) - Euro' },
                { value: '£', label: 'GBP (£) - British Pound' },
                { value: 'AED ', label: 'AED - UAE Dirham' },
                { value: 'S$', label: 'SGD (S$) - Singapore Dollar' },
              ]}
            />

            <Input
              label="Default Monthly Unplanned Limit"
              type="number"
              prefixSymbol={currency}
              value={unplannedLimit}
              onChange={(e) => setUnplannedLimit(e.target.value)}
              helperText="Warning alerts trigger when reached or exceeded"
              required
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold transition-all cursor-pointer"
            >
              Save Profile Preferences
            </button>
          </div>
        </form>
      </div>

      {/* Bank Management */}
      <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e232c] pb-2.5">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4 text-zinc-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Bank Workspaces ({banks.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsBankModalOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Bank</span>
          </button>
        </div>

        <div className="space-y-2">
          {banks.map((bank) => (
            <div
              key={bank.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#0c0e12] border border-[#1c212b]"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{bank.bankName}</span>
                  <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded">
                    {bank.nickname}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  {bank.plannedCategories?.length || 0} planned budget categories
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeletingBankId(bank.id)}
                disabled={banks.length <= 1}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Delete bank"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Card Management */}
      <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e232c] pb-2.5">
          <div className="flex items-center gap-2">
            <CardIcon className="h-4 w-4 text-zinc-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Credit Cards ({creditCards.length})
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsCardModalOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Card</span>
          </button>
        </div>

        <div className="space-y-2">
          {creditCards.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#0c0e12] border border-[#1c212b]"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{card.cardName}</span>
                  <span className="text-[10px] text-zinc-400">({card.issuer})</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Limit: {formatCurrency(card.creditLimit, userProfile.currency)} • Cycle: {card.billingCycleStart}th–{card.billingCycleEnd}th
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeletingCardId(card.id)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Delete card"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Export & Data Management */}
      <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 border-b border-[#1e232c] pb-2.5">
          Data Export & Storage
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-white">Export Complete Financial Report</h4>
            <p className="text-[11px] text-zinc-400">
              Generates a multi-sheet Excel (.xlsx) file with banks, cards, budgets, and analysis.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer border border-zinc-700"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .xlsx</span>
          </button>
        </div>

        <div className="pt-3 border-t border-[#1e232c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-amber-300">Empty All Expenses (Reset Spends to Zero)</h4>
            <p className="text-[11px] text-zinc-400">
              Resets spent amounts to ₹0 across all planned categories and clears unplanned & card logs. Preserves all your bank accounts, budgets, categories, and future goals.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsEmptyExpensesConfirmOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 border border-amber-800/50 px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Empty All Expenses</span>
          </button>
        </div>
      </div>

      {/* Add Bank Modal */}
      <Modal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        title="Add Bank Account"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateBank} className="space-y-3.5 text-left">
          <Input
            label="Bank Name"
            placeholder="e.g. Kotak Mahindra, ICICI"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Nickname / Type"
            placeholder="e.g. Salary, Expenses"
            value={bankNickname}
            onChange={(e) => setBankNickname(e.target.value)}
            required
          />
          <Input
            label="Account Number (Last 4 digits)"
            placeholder="e.g. 4589"
            maxLength={4}
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsBankModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              Save Bank
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Card Modal */}
      <Modal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        title="Add Credit Card"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateCard} className="space-y-3.5 text-left">
          <Input
            label="Card Name"
            placeholder="e.g. Amazon Pay ICICI"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Issuer"
            placeholder="e.g. ICICI Bank"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            required
          />
          <Input
            label="Nickname / Benefit"
            placeholder="e.g. Shopping & Cashback"
            value={cardNickname}
            onChange={(e) => setCardNickname(e.target.value)}
          />
          <Input
            label="Credit Limit"
            type="number"
            prefixSymbol="₹"
            placeholder="e.g. 200000"
            value={creditLimit}
            onChange={(e) => setCreditLimit(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCardModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              Save Card
            </button>
          </div>
        </form>
      </Modal>

      {/* Deletion Dialogs */}
      <ConfirmDialog
        isOpen={Boolean(deletingBankId)}
        onClose={() => setDeletingBankId(null)}
        onConfirm={() => deletingBankId && deleteBank(deletingBankId)}
        title="Delete Bank Workspace"
        message="Are you sure you want to remove this bank workspace and its monthly records?"
      />

      <ConfirmDialog
        isOpen={Boolean(deletingCardId)}
        onClose={() => setDeletingCardId(null)}
        onConfirm={() => deletingCardId && deleteCreditCard(deletingCardId)}
        title="Delete Credit Card"
        message="Are you sure you want to remove this credit card and all its transactions?"
      />

      {/* Empty All Expenses Modal & Confirm */}
      <Modal
        isOpen={isEmptyExpensesConfirmOpen}
        onClose={() => setIsEmptyExpensesConfirmOpen(false)}
        title="Empty All Monthly Expenses"
        subtitle="Reset spent records to zero for a clean slate"
        maxWidth="sm"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-zinc-300 leading-relaxed">
            This will set <strong className="text-white">Spent Amount to ₹0</strong> for all planned categories, clear all logged unplanned expenses, reset optional commitment spends to 0, and clear credit card charges.
          </p>

          <div className="rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b] space-y-1.5 text-xs">
            <p className="font-semibold text-emerald-400">✓ What stays preserved:</p>
            <ul className="text-zinc-400 text-[11px] list-disc list-inside space-y-0.5">
              <li>All Bank Accounts and starting balances</li>
              <li>All Planned Categories and default monthly budget amounts</li>
              <li>All Future Goals, target dates, and bank allocation strategies</li>
              <li>Your profile settings and limits</li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Choose Scope</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEmptyScope('current_month')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  emptyScope === 'current_month'
                    ? 'bg-zinc-800 border-zinc-600 text-white'
                    : 'bg-[#0c0e12] border-[#1c212b] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                For {activeMonth} Only
              </button>
              <button
                type="button"
                onClick={() => setEmptyScope('all_months')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  emptyScope === 'all_months'
                    ? 'bg-zinc-800 border-zinc-600 text-white'
                    : 'bg-[#0c0e12] border-[#1c212b] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Across All Months
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#1e232c]">
            <button
              type="button"
              onClick={() => setIsEmptyExpensesConfirmOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEmptyExpenses}
              className="rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2 text-xs transition-all shadow-sm"
            >
              Reset Spends to Zero
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
