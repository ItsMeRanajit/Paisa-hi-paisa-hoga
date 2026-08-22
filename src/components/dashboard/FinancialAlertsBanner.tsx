import React from 'react';
import { AlertCircle, AlertTriangle, ChevronRight, Info } from 'lucide-react';
import { FinancialAlert } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';

interface FinancialAlertsBannerProps {
  alerts: FinancialAlert[];
}

export const FinancialAlertsBanner: React.FC<FinancialAlertsBannerProps> = ({ alerts }) => {
  const { setActiveTab, setSelectedBankId, setSelectedCardId } = useFinanceStore();

  if (!alerts || alerts.length === 0) return null;

  const handleAlertClick = (alert: FinancialAlert) => {
    if (alert.actionTab) {
      setActiveTab(alert.actionTab);
    }
    if (alert.source === 'bank' && alert.sourceId) {
      setSelectedBankId(alert.sourceId);
    } else if (alert.source === 'card' && alert.sourceId) {
      setSelectedCardId(alert.sourceId);
    }
  };

  const alertStyles = {
    danger: 'bg-[#181114] border-rose-900/40 text-rose-200 hover:border-rose-700/50',
    warning: 'bg-[#181510] border-amber-900/40 text-amber-200 hover:border-amber-700/50',
    info: 'bg-[#10151a] border-sky-900/40 text-sky-200 hover:border-sky-700/50',
    success: 'bg-[#101814] border-emerald-900/40 text-emerald-200 hover:border-emerald-700/50',
  };

  const iconMap = {
    danger: <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />,
    info: <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />,
    success: <AlertCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />,
  };

  return (
    <div className="space-y-2 text-left">
      <div className="flex items-center gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Financial Alerts ({alerts.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => handleAlertClick(alert)}
            className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
              alertStyles[alert.type]
            }`}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              {iconMap[alert.type]}
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-white truncate">{alert.title}</p>
                <p className="text-[11px] text-zinc-300 line-clamp-2 mt-0.5">{alert.message}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500 self-center" />
          </div>
        ))}
      </div>
    </div>
  );
};
