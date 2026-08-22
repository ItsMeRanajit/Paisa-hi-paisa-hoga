import React, { useState } from 'react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

export interface ChartSegment {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: ChartSegment[];
  totalLabel?: string;
  totalValue?: number;
  size?: number;
  strokeWidth?: number;
  currency?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  totalLabel = 'Total',
  totalValue,
  size = 180,
  strokeWidth = 20,
  currency = '₹',
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<ChartSegment | null>(null);

  const validSegments = segments.filter((s) => s.value > 0);
  const calculatedTotal = totalValue !== undefined ? totalValue : validSegments.reduce((sum, s) => sum + s.value, 0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let currentOffset = 0;

  if (validSegments.length === 0 || calculatedTotal === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <svg width={size} height={size} className="overflow-visible">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#1c212b"
            strokeWidth={strokeWidth}
          />
        </svg>
        <p className="mt-2 text-xs text-zinc-500">No spending logged</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="rotate-[-90deg] overflow-visible">
          {validSegments.map((segment) => {
            const percentage = (segment.value / calculatedTotal) * 100;
            const strokeDashoffset = circumference - (percentage / 100) * circumference;
            const strokeDasharray = `${circumference} ${circumference}`;
            const rotationOffset = (currentOffset / calculatedTotal) * 360;
            currentOffset += segment.value;

            const isHovered = hoveredSegment?.id === segment.id;

            return (
              <circle
                key={segment.id}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(${rotationOffset} ${center} ${center})`}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredSegment(segment)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            {hoveredSegment ? hoveredSegment.label : totalLabel}
          </span>
          <span className="text-sm sm:text-base font-bold text-white font-mono tracking-tight">
            {formatCurrency(hoveredSegment ? hoveredSegment.value : calculatedTotal, currency)}
          </span>
          {hoveredSegment && (
            <span className="text-[10px] text-zinc-400 font-mono">
              {formatPercentage((hoveredSegment.value / calculatedTotal) * 100)}
            </span>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-2 gap-1.5 w-full max-h-32 overflow-y-auto pr-1">
        {validSegments.map((segment) => (
          <div
            key={segment.id}
            onMouseEnter={() => setHoveredSegment(segment)}
            onMouseLeave={() => setHoveredSegment(null)}
            className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
              hoveredSegment?.id === segment.id ? 'bg-zinc-800' : 'hover:bg-zinc-850'
            }`}
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} />
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[11px] font-medium text-zinc-300 truncate">{segment.label}</p>
              <p className="text-[10px] font-mono text-zinc-400">{formatCurrency(segment.value, currency)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
