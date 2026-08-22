import React from 'react';
import { formatPercentage } from '../../utils/formatters';
import { ProgressBar } from '../common/ProgressBar';

interface FinancialHealthScoreProps {
  savingsRate: number;
  unplannedRatio: number;
  maxCardUtilization: number;
  overBudgetCategoriesCount: number;
  totalPool: number;
  totalRemaining: number;
  currency?: string;
}

export const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({
  savingsRate,
  unplannedRatio,
  maxCardUtilization,
  overBudgetCategoriesCount,
}) => {
  const savingsPts = Math.min(35, (Math.max(0, savingsRate) / 30) * 35);
  const unplannedPts = Math.max(0, 25 - Math.max(0, unplannedRatio - 10) * 1.5);
  const creditPts = maxCardUtilization <= 25 ? 25 : Math.max(0, 25 - (maxCardUtilization - 25) * 1.2);
  const budgetPts = Math.max(0, 15 - overBudgetCategoriesCount * 5);

  const totalScore = Math.min(100, Math.max(0, Math.round(savingsPts + unplannedPts + creditPts + budgetPts)));

  let grade = 'A';
  let gradeColor = 'text-emerald-400 border-emerald-900/40 bg-[#121815]';
  let statusSummary = 'Strong financial discipline and healthy savings rate.';

  if (totalScore < 60) {
    grade = 'C';
    gradeColor = 'text-rose-400 border-rose-900/40 bg-[#181114]';
    statusSummary = 'Budget leaks or high credit utilization detected. Action recommended.';
  } else if (totalScore < 80) {
    grade = 'B';
    gradeColor = 'text-amber-400 border-amber-900/40 bg-[#181510]';
    statusSummary = 'Moderate health. Lower unplanned spending and keep card utilization below 30%.';
  }

  return (
    <div className="space-y-4 text-left">
      <div className="rounded-3xl border border-[#222731] bg-[#13161c] p-5 sm:p-6 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Financial Health Index
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              Score: {totalScore} / 100
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
              {statusSummary}
            </p>
          </div>

          <div className={`flex flex-col items-center justify-center h-16 w-16 rounded-2xl border shadow-xs ${gradeColor}`}>
            <span className="text-[9px] font-semibold uppercase text-zinc-400">Grade</span>
            <span className="text-2xl font-black">{grade}</span>
          </div>
        </div>

        {/* 4 Score Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-[#1e232c]">
          <div className="rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b] space-y-1">
            <div className="flex justify-between text-[11px] font-medium text-zinc-400">
              <span>Savings Rate ({formatPercentage(savingsRate)})</span>
              <span className="text-emerald-400 font-mono">{Math.round(savingsPts)}/35</span>
            </div>
            <ProgressBar value={savingsPts} max={35} height="sm" colorTheme="emerald" />
          </div>

          <div className="rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b] space-y-1">
            <div className="flex justify-between text-[11px] font-medium text-zinc-400">
              <span>Unplanned Spending</span>
              <span className="text-amber-400 font-mono">{Math.round(unplannedPts)}/25</span>
            </div>
            <ProgressBar value={unplannedPts} max={25} height="sm" colorTheme="amber" />
          </div>

          <div className="rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b] space-y-1">
            <div className="flex justify-between text-[11px] font-medium text-zinc-400">
              <span>Credit Utilization</span>
              <span className="text-zinc-300 font-mono">{Math.round(creditPts)}/25</span>
            </div>
            <ProgressBar value={creditPts} max={25} height="sm" colorTheme="zinc" />
          </div>

          <div className="rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b] space-y-1">
            <div className="flex justify-between text-[11px] font-medium text-zinc-400">
              <span>Budget Adherence</span>
              <span className="text-sky-400 font-mono">{Math.round(budgetPts)}/15</span>
            </div>
            <ProgressBar value={budgetPts} max={15} height="sm" colorTheme="blue" />
          </div>
        </div>
      </div>
    </div>
  );
};
