import React from 'react';
import { AlertTriangle, ShieldCheck, ShoppingBag } from 'lucide-react';
import { CreditCard, CreditCardCalculations } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { DonutChart, ChartSegment } from '../charts/DonutChart';
import { ProgressBar } from '../common/ProgressBar';

interface CreditAnalysisSectionProps {
  card: CreditCard;
  metrics: CreditCardCalculations;
  currency?: string;
}

export const CreditAnalysisSection: React.FC<CreditAnalysisSectionProps> = ({
  card,
  metrics,
  currency = '₹',
}) => {
  const chartSegments: ChartSegment[] = [
    {
      id: 'essential',
      label: 'Essential (Needs)',
      value: metrics.essentialAmount,
      color: '#38bdf8', // Soft Sky Blue
    },
    {
      id: 'non_essential',
      label: 'Non-Essential (Wants)',
      value: metrics.nonEssentialAmount,
      color: '#fb7185', // Soft Rose
    },
  ];

  const hasHighNonEssential = metrics.nonEssentialPercentage > 60;
  const isHighUtilization = metrics.utilizationPercentage > 30;

  return (
    <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-5 text-left space-y-4">
      <div className="flex items-center justify-between border-b border-[#1e232c] pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
          Credit Intelligence & Behavior
        </h3>
        <span className="text-[11px] font-mono text-zinc-400">
          Total Billed: {formatCurrency(metrics.currentOutstanding, currency)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Left: Essential vs Non-Essential Breakdown */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b] space-y-1">
              <span className="text-[10px] font-semibold uppercase text-sky-400">
                Essential Needs
              </span>
              <p className="text-base font-bold font-mono text-white">
                {formatCurrency(metrics.essentialAmount, currency)}
              </p>
              <p className="text-[11px] text-zinc-400">
                {formatPercentage(metrics.essentialPercentage)} of total
              </p>
              <ProgressBar value={metrics.essentialPercentage} height="sm" colorTheme="blue" />
            </div>

            <div className="rounded-xl bg-[#0c0e12] p-3 border border-[#1c212b] space-y-1">
              <span className="text-[10px] font-semibold uppercase text-rose-400">
                Non-Essential Wants
              </span>
              <p className="text-base font-bold font-mono text-white">
                {formatCurrency(metrics.nonEssentialAmount, currency)}
              </p>
              <p className="text-[11px] text-zinc-400">
                {formatPercentage(metrics.nonEssentialPercentage)} of total
              </p>
              <ProgressBar value={metrics.nonEssentialPercentage} height="sm" colorTheme="rose" />
            </div>
          </div>

          {/* Diagnostic Warnings */}
          <div className="space-y-2">
            {isHighUtilization && (
              <div className="flex items-start gap-2.5 rounded-xl bg-rose-950/30 p-3 border border-rose-900/40 text-xs text-rose-200">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <p>
                  <strong>High Utilization Risk:</strong> Card balance is {formatPercentage(metrics.utilizationPercentage)} of limit. Keep balance under 30% before the statement generates.
                </p>
              </div>
            )}

            {hasHighNonEssential && (
              <div className="flex items-start gap-2.5 rounded-xl bg-amber-950/30 p-3 border border-amber-900/40 text-xs text-amber-200">
                <ShoppingBag className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>High Discretionary Spending:</strong> {formatPercentage(metrics.nonEssentialPercentage)} of card spending is on non-essentials.
                </p>
              </div>
            )}

            {!isHighUtilization && !hasHighNonEssential && (
              <div className="flex items-start gap-2.5 rounded-xl bg-emerald-950/30 p-3 border border-emerald-900/40 text-xs text-emerald-200">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Healthy Credit Profile:</strong> Low utilization ({formatPercentage(metrics.utilizationPercentage)}) and balanced spending.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Chart */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 rounded-xl bg-[#0c0e12] border border-[#1c212b]">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Spending Classification
          </h4>
          <DonutChart
            segments={chartSegments}
            totalLabel="Total Spent"
            totalValue={metrics.currentOutstanding}
            size={160}
            strokeWidth={18}
            currency={currency}
          />
        </div>
      </div>
    </div>
  );
};
