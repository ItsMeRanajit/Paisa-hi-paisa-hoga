import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  value: number; // percentage (0-100+)
  max?: number;
  showLabel?: boolean;
  label?: string;
  sublabel?: string;
  height?: 'sm' | 'md' | 'lg';
  colorTheme?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'zinc' | 'gradient' | 'auto';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  label,
  sublabel,
  height = 'md',
  colorTheme = 'auto',
  className,
}) => {
  const percentage = Math.max(0, (value / max) * 100);
  const clampedPercentage = Math.min(100, percentage);

  let effectiveTheme = colorTheme;
  if (colorTheme === 'auto') {
    if (percentage > 100) effectiveTheme = 'rose';
    else if (percentage >= 85) effectiveTheme = 'amber';
    else effectiveTheme = 'emerald';
  }

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const themeFillStyles = {
    emerald: 'bg-emerald-500/80',
    amber: 'bg-amber-500/80',
    rose: 'bg-rose-500/80',
    indigo: 'bg-indigo-400/80',
    blue: 'bg-sky-400/80',
    purple: 'bg-purple-400/80',
    zinc: 'bg-zinc-400/80',
    gradient: 'bg-gradient-to-r from-zinc-400 via-emerald-400 to-teal-400',
    auto: 'bg-emerald-500/80',
  };

  return (
    <div className={clsx('w-full space-y-1.5', className)}>
      {(showLabel || label || sublabel) && (
        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
          <span>{label || `${percentage.toFixed(0)}%`}</span>
          {sublabel && <span className="font-mono text-zinc-300">{sublabel}</span>}
        </div>
      )}

      <div className={clsx('w-full overflow-hidden rounded-full bg-[#1c212b]', heightStyles[height])}>
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-300 ease-out',
            themeFillStyles[effectiveTheme as keyof typeof themeFillStyles] || 'bg-zinc-400'
          )}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
};
