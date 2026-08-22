import React from 'react';
import { clsx } from 'clsx';

interface GaugeMeterProps {
  value: number; // percentage
  max?: number;
  threshold?: number;
  title: string;
  subtitle?: string;
  size?: number;
  unit?: string;
  variant?: 'credit' | 'unplanned' | 'standard';
}

export const GaugeMeter: React.FC<GaugeMeterProps> = ({
  value,
  max = 100,
  threshold = 30,
  title,
  subtitle,
  size = 150,
  unit = '%',
  variant = 'credit',
}) => {
  const percentage = Math.max(0, (value / max) * 100);
  const clampedPercentage = Math.min(100, percentage);

  let strokeColor = '#34d399'; // Muted Emerald
  let statusText = 'Optimal';

  if (variant === 'credit') {
    if (percentage > 30) {
      strokeColor = '#fb7185'; // Soft Rose
      statusText = 'High (>30%)';
    } else if (percentage >= 25) {
      strokeColor = '#fbbf24'; // Warm Amber
      statusText = 'Warning';
    } else {
      strokeColor = '#34d399';
      statusText = 'Healthy (<30%)';
    }
  } else if (variant === 'unplanned') {
    if (percentage > 100) {
      strokeColor = '#fb7185';
      statusText = 'Exceeded';
    } else if (percentage >= 80) {
      strokeColor = '#fbbf24';
      statusText = 'Approaching';
    } else {
      strokeColor = '#34d399';
      statusText = 'In Budget';
    }
  }

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const arcLength = Math.PI * radius;
  const strokeDashoffset = arcLength - (clampedPercentage / 100) * arcLength;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative" style={{ width: size, height: size / 2 + 15 }}>
        <svg
          width={size}
          height={size / 2 + 10}
          viewBox={`0 0 ${size} ${size / 2 + 10}`}
          className="overflow-visible"
        >
          {/* Background track */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="#1c212b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Value arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${arcLength}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />

          {/* Threshold dot */}
          {variant === 'credit' && (
            <circle
              cx={size / 2 - radius * Math.cos((threshold / 100) * Math.PI)}
              cy={size / 2 - radius * Math.sin((threshold / 100) * Math.PI)}
              r={2.5}
              fill="#e2e8f0"
            />
          )}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold font-mono text-white tracking-tight">
            {value.toFixed(1)}
            <span className="text-xs font-normal text-zinc-400">{unit}</span>
          </span>
          <span
            className={clsx(
              'mt-0.5 text-[10px] font-medium px-2 py-0.2 rounded-full border',
              percentage > (variant === 'credit' ? 30 : 100)
                ? 'bg-rose-950/40 text-rose-300 border-rose-800/40'
                : percentage >= (variant === 'credit' ? 25 : 80)
                ? 'bg-amber-950/40 text-amber-300 border-amber-800/40'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
            )}
          >
            {statusText}
          </span>
        </div>
      </div>

      <div className="mt-1 space-y-0.5">
        <h4 className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">{title}</h4>
        {subtitle && <p className="text-[10px] text-zinc-400">{subtitle}</p>}
      </div>
    </div>
  );
};
