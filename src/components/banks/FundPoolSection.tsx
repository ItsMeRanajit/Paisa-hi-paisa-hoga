import React, { useState } from 'react';
import { Edit3, Wallet, Check } from 'lucide-react';
import { BankAccount, BankCalculations } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore } from '../../store/useUIStore';
import { formatCurrency } from '../../utils/formatters';
import { Input } from '../common/Input';

interface FundPoolSectionProps {
  bank: BankAccount;
  metrics: BankCalculations;
}

export const FundPoolSection: React.FC<FundPoolSectionProps> = ({ bank, metrics }) => {
  const { activeMonth, updateMonthlyFundPool } = useFinanceStore();
  const { addToast } = useUIStore();

  const [isEditing, setIsEditing] = useState(false);
  const [incomeInput, setIncomeInput] = useState(metrics.monthlyIncome.toString());
  const [bankAmountInput, setBankAmountInput] = useState(metrics.amountAtBank.toString());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const income = parseFloat(incomeInput) || 0;
    const amountAtBank = parseFloat(bankAmountInput) || 0;

    updateMonthlyFundPool(bank.id, activeMonth, income, amountAtBank);
    setIsEditing(false);
    addToast(`Updated ${bank.bankName} fund pool for ${activeMonth}`, 'success');
  };

  const handleStartEdit = () => {
    setIncomeInput(metrics.monthlyIncome.toString());
    setBankAmountInput(metrics.amountAtBank.toString());
    setIsEditing(true);
  };

  return (
    <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-5 text-left space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
            <Wallet className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Section 1: Monthly Fund Pool
            </h3>
            <p className="text-[11px] text-zinc-400">Available spending pool for {activeMonth}</p>
          </div>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={handleStartEdit}
            className="flex items-center gap-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Pool</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-xs font-medium text-zinc-400 hover:text-zinc-200"
          >
            Cancel
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl bg-[#0c0e12] p-3.5 border border-[#1c212b]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Monthly Income</span>
            <p className="text-lg font-bold font-mono text-zinc-100 mt-0.5">
              {formatCurrency(metrics.monthlyIncome)}
            </p>
          </div>

          <div className="rounded-xl bg-[#0c0e12] p-3.5 border border-[#1c212b]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Amount at Bank</span>
            <p className="text-lg font-bold font-mono text-zinc-100 mt-0.5">
              {formatCurrency(metrics.amountAtBank)}
            </p>
          </div>

          <div className="rounded-xl bg-[#0c0e12] p-3.5 border border-[#1c212b]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Total Spending Pool</span>
            <p className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              {formatCurrency(metrics.totalSpendingPool)}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-3.5 pt-1 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Monthly Income"
              type="number"
              prefixSymbol="₹"
              placeholder="e.g. 145000"
              value={incomeInput}
              onChange={(e) => setIncomeInput(e.target.value)}
              helperText="Salary or regular credit"
              required
            />

            <Input
              label="Amount at Bank (Starting Balance)"
              type="number"
              prefixSymbol="₹"
              placeholder="e.g. 35000"
              value={bankAmountInput}
              onChange={(e) => setBankAmountInput(e.target.value)}
              helperText="Existing savings or balance"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-zinc-400">
              Calculated Total Pool: <strong className="text-white font-mono">{formatCurrency((parseFloat(incomeInput) || 0) + (parseFloat(bankAmountInput) || 0))}</strong>
            </p>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold transition-all cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
