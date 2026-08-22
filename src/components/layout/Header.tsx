import React from 'react';
import { Plus, Download, Wallet } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore } from '../../store/useUIStore';
import { MonthSelector } from './MonthSelector';
import { DesktopNav } from './BottomNav';
import { exportFinancialWorkbook } from '../../utils/excelExport';

export const Header: React.FC = () => {
  const {
    userProfile,
    activeMonth,
    banks,
    monthlyData,
    optionalExpenses,
    unplannedExpenses,
    creditCards,
    creditTransactions,
    goals,
  } = useFinanceStore();

  const { openQuickAdd, addToast } = useUIStore();

  const handleExport = () => {
    try {
      const activeMonthMap = monthlyData[activeMonth] || {};
      exportFinancialWorkbook({
        userProfile,
        activeMonth,
        banks,
        monthlyData: activeMonthMap,
        optionalExpenses,
        unplannedExpenses,
        creditCards,
        creditTransactions,
        goals,
      });
      addToast(`Downloaded Excel report for ${activeMonth}`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to export Excel report', 'danger');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#1c212b] bg-[#0c0e12]/90 backdrop-blur-md transition-all">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-15 items-center justify-between gap-4">
          {/* Minimalist Logo & App Title */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700/60">
              <Wallet className="h-4 w-4" />
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-sm font-bold tracking-tight text-white">
                Finance<span className="text-zinc-400 font-normal">Command</span>
              </span>
            </div>
          </div>

          {/* Center Navigation & Month Stepper */}
          <div className="flex items-center gap-2.5">
            <DesktopNav />
            <MonthSelector />
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              title="Download Monthly Excel Report"
              className="hidden md:flex items-center gap-1.5 rounded-xl bg-[#13161c] border border-[#222731] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-[#1a1f27] hover:text-white transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-zinc-400" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={() => openQuickAdd('unplanned')}
              className="flex items-center gap-1.5 rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Expense</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
