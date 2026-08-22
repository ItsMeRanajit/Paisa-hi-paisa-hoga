import React from 'react';
import { CreditCard, CreditTransaction, UserProfile } from '../../types/finance';
import { calculateCreditCardMetrics } from '../../utils/calculations';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { BarChart, BarChartItem } from '../charts/BarChart';

interface CreditCardAnalysisViewProps {
  creditCards: CreditCard[];
  creditTransactions: CreditTransaction[];
  userProfile: UserProfile;
  activeMonth: string;
}

export const CreditCardAnalysisView: React.FC<CreditCardAnalysisViewProps> = ({
  creditCards,
  creditTransactions,
  userProfile,
  activeMonth,
}) => {
  const cardCalculations = creditCards.map((card) => {
    const cardTxs = creditTransactions.filter((t) => t.cardId === card.id && t.month === activeMonth);
    const metrics = calculateCreditCardMetrics(card, cardTxs);
    return { card, metrics, transactionsCount: cardTxs.length };
  });

  const totalOutstanding = cardCalculations.reduce((sum, c) => sum + c.metrics.currentOutstanding, 0);
  const totalCreditLimit = cardCalculations.reduce((sum, c) => sum + c.metrics.creditLimit, 0);
  const totalNonEssential = cardCalculations.reduce((sum, c) => sum + c.metrics.nonEssentialAmount, 0);

  const aggregateUtilization = totalCreditLimit > 0 ? (totalOutstanding / totalCreditLimit) * 100 : 0;

  const barItems: BarChartItem[] = cardCalculations.map(({ card, metrics }) => ({
    id: card.id,
    label: card.cardName,
    primaryValue: metrics.currentOutstanding,
    secondaryValue: metrics.creditLimit,
    primaryLabel: 'Outstanding',
    secondaryLabel: 'Limit',
    primaryColor: metrics.utilizationPercentage > 30 ? '#fb7185' : '#a1a1aa',
    secondaryColor: '#27272a',
  }));

  return (
    <div className="space-y-5 text-left">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Total Outstanding
          </span>
          <p className="text-xl font-bold font-mono text-white mt-1">
            {formatCurrency(totalOutstanding, userProfile.currency)}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">{creditCards.length} active cards</p>
        </div>

        <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Aggregate Utilization
          </span>
          <p className={`text-xl font-bold font-mono mt-1 ${aggregateUtilization > 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {formatPercentage(aggregateUtilization)}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">Limit: {formatCurrency(totalCreditLimit, userProfile.currency)}</p>
        </div>

        <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Discretionary Ratio
          </span>
          <p className="text-xl font-bold font-mono text-zinc-200 mt-1">
            {formatPercentage((totalNonEssential / (totalOutstanding || 1)) * 100)}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5">Non-essential spending</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-5 space-y-3.5">
        <div className="border-b border-[#1e232c] pb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Card Limit vs Outstanding Exposure
          </h4>
          <p className="text-[11px] text-zinc-400">Target &lt;30% utilization per card</p>
        </div>

        <BarChart items={barItems} currency={userProfile.currency} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {cardCalculations.map(({ card, metrics }) => {
          const isOver30 = metrics.utilizationPercentage > 30;

          return (
            <div
              key={card.id}
              className="rounded-2xl border border-[#222731] bg-[#13161c] p-4 space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{card.cardName}</h4>
                  <p className="text-[11px] text-zinc-400">{card.issuer} • Limit: {formatCurrency(card.creditLimit, userProfile.currency)}</p>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.2 rounded-full border ${
                    isOver30 ? 'bg-rose-950/40 text-rose-300 border-rose-800/40' : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                  }`}
                >
                  {formatPercentage(metrics.utilizationPercentage)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#0c0e12] p-2.5 rounded-xl border border-[#1c212b]">
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-semibold">Essential</span>
                  <p className="text-zinc-200 font-bold">{formatCurrency(metrics.essentialAmount, userProfile.currency)}</p>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-semibold">Non-Essential</span>
                  <p className="text-zinc-200 font-bold">{formatCurrency(metrics.nonEssentialAmount, userProfile.currency)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
