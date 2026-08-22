import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  const iconMap = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
    danger: <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />,
    info: <Info className="h-4 w-4 text-sky-400 shrink-0" />,
  };

  const borderMap = {
    success: 'border-emerald-800/40 bg-[#121815] text-emerald-100',
    warning: 'border-amber-800/40 bg-[#1a1711] text-amber-100',
    danger: 'border-rose-800/40 bg-[#1a1114] text-rose-100',
    info: 'border-sky-800/40 bg-[#10171d] text-sky-100',
  };

  return (
    <div
      aria-live="assertive"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg animate-slide-up text-xs font-medium ${
            borderMap[toast.type]
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {iconMap[toast.type]}
            <span className="truncate">{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-md text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
