import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface TrendDataPoint {
  label: string;
  income: number;
  spending: number;
  savings: number;
}

interface LineTrendChartProps {
  data: TrendDataPoint[];
  currency?: string;
}

export const LineTrendChart: React.FC<LineTrendChartProps> = ({
  data,
  currency = '₹',
}) => {
  if (!data || data.length === 0) return null;

  const width = 340;
  const height = 150;
  const padding = 24;

  const maxVal = Math.max(1, ...data.flatMap((d) => [d.income, d.spending, d.savings]));

  const getX = (index: number) => {
    if (data.length <= 1) return width / 2;
    return padding + (index / (data.length - 1)) * (width - 2 * padding);
  };

  const getY = (value: number) => {
    return height - padding - (Math.max(0, value) / maxVal) * (height - 2 * padding);
  };

  const incomePoints = data.map((d, i) => `${getX(i)},${getY(d.income)}`).join(' ');
  const spendingPoints = data.map((d, i) => `${getX(i)},${getY(d.spending)}`).join(' ');
  const savingsPoints = data.map((d, i) => `${getX(i)},${getY(d.savings)}`).join(' ');

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Cash Flow Trend</h4>
        <div className="flex items-center gap-2.5 text-[11px]">
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-zinc-400">Income</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <span className="text-zinc-400">Spent</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
            <span className="text-zinc-400">Savings</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-[#0b0d11] p-2 border border-[#1c212b]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
          {/* Subtle grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#222731" strokeDasharray="2 2" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#222731" strokeDasharray="2 2" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#222731" strokeDasharray="2 2" />

          {/* Lines */}
          <polyline fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={incomePoints} />
          <polyline fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={spendingPoints} />
          <polyline fill="none" stroke="#d4d4d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={savingsPoints} />

          {/* Dots */}
          {data.map((d, i) => (
            <g key={i}>
              <circle cx={getX(i)} cy={getY(d.income)} r="3" fill="#34d399" />
              <circle cx={getX(i)} cy={getY(d.spending)} r="3" fill="#fb7185" />
              <circle cx={getX(i)} cy={getY(d.savings)} r="3" fill="#d4d4d8" />
              <text
                x={getX(i)}
                y={height - 6}
                fontSize="9"
                fill="#71717a"
                textAnchor="middle"
                className="font-medium"
              >
                {d.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
