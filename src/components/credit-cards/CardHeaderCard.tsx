import React from 'react';
import { Percent } from 'lucide-react';
import { CreditCard, CreditCardCalculations } from '../../types/finance';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { GaugeMeter } from '../charts/GaugeMeter';
import { ProgressBar } from '../common/ProgressBar';

interface CardHeaderCardProps {
  card: CreditCard;
  metrics: CreditCardCalculations;
  activeMonth: string;
  currency?: string;
  onOpenPaymentModal: () => void;
}

export const CardHeaderCard: React.FC<CardHeaderCardProps> = ({
  card,
  metrics,
  currency = '₹',
  onOpenPaymentModal,
}) => {
  const isOver30 = metrics.utilizationPercentage > 30;

  return (
    <div className="space-y-4">
      {/* Matte Graphite Card */}
      <div className="rounded-3xl border border-[#262c38] bg-[#161a22] p-6 text-white text-left space-y-5">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              {card.issuer}
            </span>
            <h3 className="text-xl font-bold tracking-tight">{card.cardName}</h3>
            <p className="text-xs text-zinc-400">{card.nickname}</p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] font-mono text-zinc-300">
              Cycle: {card.billingCycleStart}th–{card.billingCycleEnd}th
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                isOver30 ? 'bg-rose-950/40 text-rose-300 border-rose-800/40' : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
              }`}
            >
              {formatPercentage(metrics.utilizationPercentage)} Utilized
            </span>
          </div>
        </div>

        {/* Outstanding & Available limit */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-[#232936] pt-4 items-center">
          <div>
            <span className="text-[10px] uppercase font-semibold text-zinc-400">Current Outstanding</span>
            <p className="text-lg font-bold font-mono text-white mt-0.5">
              {formatCurrency(metrics.currentOutstanding, currency)}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-zinc-400">Available Limit</span>
            <p className="text-lg font-bold font-mono text-zinc-300 mt-0.5">
              {formatCurrency(metrics.remainingLimit, currency)}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
            <button
              type="button"
              onClick={onOpenPaymentModal}
              className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3.5 py-2 text-xs font-semibold text-zinc-100 transition-all cursor-pointer"
            >
              Record Bill Payment
            </button>
          </div>
        </div>
      </div>

      {/* Utilization & Threshold Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <div className="md:col-span-8 rounded-2xl border border-[#222731] bg-[#13161c] p-4.5 text-left space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-zinc-400" />
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
                Credit Utilization (Target &lt; 30%)
              </h4>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {formatCurrency(metrics.currentOutstanding, currency)} / {formatCurrency(metrics.creditLimit, currency)}
            </span>
          </div>

          <ProgressBar
            value={metrics.currentOutstanding}
            max={metrics.creditLimit}
            height="sm"
            colorTheme={isOver30 ? 'rose' : metrics.utilizationPercentage >= 25 ? 'amber' : 'emerald'}
          />

          <p className="text-xs text-zinc-400 leading-relaxed pt-0.5">
            {isOver30 ? (
              <span className="text-rose-300 font-medium">
                Utilization is {formatPercentage(metrics.utilizationPercentage)}, above the 30% safe threshold. Paying down balance before the cycle closes is recommended.
              </span>
            ) : (
              <span className="text-emerald-300 font-medium">
                Safe credit parameters. You have {formatCurrency(metrics.remainingLimit, currency)} available without crossing safe parameters.
              </span>
            )}
          </p>
        </div>

        <div className="md:col-span-4 rounded-2xl border border-[#222731] bg-[#13161c] p-3 flex items-center justify-center">
          <GaugeMeter
            value={metrics.utilizationPercentage}
            max={100}
            threshold={30}
            title="Card Utilization"
            subtitle={`${formatPercentage(metrics.utilizationPercentage)} used`}
            variant="credit"
            size={130}
          />
        </div>
      </div>
    </div>
  );
};
