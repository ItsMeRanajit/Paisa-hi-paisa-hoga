import React from 'react';
import { CreditCard as CardIcon, ArrowUpRight } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { calculateCreditCardMetrics } from '../../utils/calculations';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { ProgressBar } from '../common/ProgressBar';

export const CreditCardSnapshot: React.FC = () => {
  const {
    creditCards,
    creditTransactions,
    activeMonth,
    setSelectedCardId,
    setActiveTab,
  } = useFinanceStore();

  const handleCardClick = (cardId: string) => {
    setSelectedCardId(cardId);
    setActiveTab('credit_cards');
  };

  if (creditCards.length === 0) return null;

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CardIcon className="h-4 w-4 text-zinc-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Credit Cards ({creditCards.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('credit_cards')}
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          Manage Cards <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {creditCards.map((card) => {
          const cardTxs = creditTransactions.filter(
            (t) => t.cardId === card.id && t.month === activeMonth
          );
          const metrics = calculateCreditCardMetrics(card, cardTxs);

          const isOver30 = metrics.utilizationPercentage > 30;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="rounded-2xl border border-[#222731] bg-[#13161c] p-4.5 transition-all hover:border-[#2d3340] hover:bg-[#161a22] cursor-pointer text-left"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {card.cardName}
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    {card.issuer} • Cycle: {card.billingCycleStart}th–{card.billingCycleEnd}th
                  </p>
                </div>

                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                    isOver30
                      ? 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                      : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                  }`}
                >
                  {formatPercentage(metrics.utilizationPercentage)}
                </span>
              </div>

              {/* Outstanding vs Limit */}
              <div className="grid grid-cols-2 gap-2 my-2.5 rounded-xl bg-[#0c0e12] p-2.5 border border-[#1c212b]">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-400">Current Outstanding</span>
                  <p className="text-sm font-bold font-mono text-white">
                    {formatCurrency(metrics.currentOutstanding)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-400">Available Limit</span>
                  <p className="text-sm font-bold font-mono text-zinc-300">
                    {formatCurrency(metrics.remainingLimit)}
                  </p>
                </div>
              </div>

              {/* Utilization Progress Bar */}
              <ProgressBar
                value={metrics.currentOutstanding}
                max={metrics.creditLimit}
                height="sm"
                showLabel
                label="Limit Utilization (Target <30%)"
                sublabel={`${formatCurrency(metrics.currentOutstanding)} / ${formatCurrency(metrics.creditLimit)}`}
                colorTheme={isOver30 ? 'rose' : metrics.utilizationPercentage >= 25 ? 'amber' : 'emerald'}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
