import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatMonthDisplay, getOffsetMonth, getCurrentMonthString } from '../../utils/formatters';

export const MonthSelector: React.FC = () => {
  const { activeMonth, setActiveMonth } = useFinanceStore();
  const currentMonth = getCurrentMonthString();

  const handlePrev = () => {
    setActiveMonth(getOffsetMonth(activeMonth, -1));
  };

  const handleNext = () => {
    setActiveMonth(getOffsetMonth(activeMonth, 1));
  };

  const handleCurrent = () => {
    setActiveMonth(currentMonth);
  };

  const isCurrent = activeMonth === currentMonth;

  return (
    <div className="flex items-center gap-1 rounded-xl bg-[#13161c] border border-[#222731] p-1">
      <button
        type="button"
        onClick={handlePrev}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <div className="flex items-center gap-1.5 px-2">
        <span className="text-xs font-semibold text-zinc-200 whitespace-nowrap">
          {formatMonthDisplay(activeMonth)}
        </span>
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
        aria-label="Next month"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>

      {!isCurrent && (
        <button
          type="button"
          onClick={handleCurrent}
          className="ml-1 rounded-md bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 transition-all cursor-pointer"
        >
          Today
        </button>
      )}
    </div>
  );
};
