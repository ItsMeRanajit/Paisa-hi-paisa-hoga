import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export interface BarChartItem {
  id: string;
  label: string;
  primaryValue: number;
  secondaryValue?: number;
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface BarChartProps {
  items: BarChartItem[];
  currency?: string;
  title?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  items,
  currency = '₹',
  title,
}) => {
  const maxValue = Math.max(
    1,
    ...items.map((i) => Math.max(i.primaryValue, i.secondaryValue || 0))
  );

  return (
    <div className="w-full space-y-3.5">
      {title && <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{title}</h4>}

      <div className="space-y-3">
        {items.map((item) => {
          const primaryPercent = (item.primaryValue / maxValue) * 100;
          const secondaryPercent = item.secondaryValue ? (item.secondaryValue / maxValue) * 100 : 0;

          return (
            <div key={item.id} className="space-y-1.5 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-300 truncate">{item.label}</span>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-zinc-200">
                    {formatCurrency(item.primaryValue, currency)}
                  </span>
                  {item.secondaryValue !== undefined && (
                    <span className="text-zinc-400">
                      / {formatCurrency(item.secondaryValue, currency)}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bars container */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#1c212b] flex gap-1">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${primaryPercent}%`,
                    backgroundColor: item.primaryColor || '#a1a1aa',
                  }}
                  title={`${item.primaryLabel || 'Value'}: ${formatCurrency(item.primaryValue, currency)}`}
                />
                {item.secondaryValue !== undefined && secondaryPercent > 0 && (
                  <div
                    className="h-full rounded-full opacity-40 transition-all duration-300 ease-out"
                    style={{
                      width: `${Math.max(0, secondaryPercent - primaryPercent)}%`,
                      backgroundColor: item.secondaryColor || '#52525b',
                    }}
                    title={`${item.secondaryLabel || 'Total'}: ${formatCurrency(item.secondaryValue, currency)}`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
