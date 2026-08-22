import React from 'react';
import { Landmark, CreditCard, Target, Activity } from 'lucide-react';

export type AnalysisScope =
  | 'overall_financial_health'
  | 'all_banks'
  | 'individual_bank'
  | 'all_credit_cards'
  | 'individual_credit_card'
  | 'future_goals';

interface ScopeSelectorProps {
  currentScope: AnalysisScope;
  onSelectScope: (scope: AnalysisScope) => void;
}

export const ScopeSelector: React.FC<ScopeSelectorProps> = ({
  currentScope,
  onSelectScope,
}) => {
  const scopes: Array<{ id: AnalysisScope; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'overall_financial_health', label: 'Financial Health', icon: Activity },
    { id: 'all_banks', label: 'All Banks', icon: Landmark },
    { id: 'individual_bank', label: 'Single Bank', icon: Landmark },
    { id: 'all_credit_cards', label: 'Credit Cards', icon: CreditCard },
    { id: 'future_goals', label: 'Goal Projections', icon: Target },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
      {scopes.map((s) => {
        const Icon = s.icon;
        const isActive = currentScope === s.id;

        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelectScope(s.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
              isActive
                ? 'bg-zinc-800 border-zinc-700 text-white'
                : 'bg-[#13161c] border-[#222731] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
};
