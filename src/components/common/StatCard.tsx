import React from 'react';
import { clsx } from 'clsx';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  colorTheme?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'slate' | 'zinc';
  compact?: boolean;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  badgeVariant = 'neutral',
  compact = false,
  className,
  onClick,
}) => {
  const badgeStyles = {
    success: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40',
    warning: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
    danger: 'bg-rose-950/40 text-rose-300 border-rose-800/40',
    info: 'bg-sky-950/40 text-sky-300 border-sky-800/40',
    neutral: 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-xl border border-[#222731] bg-[#13161c] transition-all text-left',
        compact ? 'p-2.5 sm:p-3' : 'p-3 sm:p-3.5',
        onClick && 'hover:border-[#2f3645] hover:bg-[#161a22] cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between gap-1.5">
        <div className="space-y-0.5 min-w-0">
          <p className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-zinc-400 uppercase truncate">{title}</p>
          <p className={clsx('font-bold tracking-tight text-white font-mono truncate', compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg')}>{value}</p>
        </div>
        {Icon && (
          <div className={clsx('shrink-0 flex items-center justify-center rounded-lg bg-zinc-800/60 text-zinc-300 border border-zinc-700/40', compact ? 'h-6 w-6' : 'h-7 w-7')}>
            <Icon className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
          </div>
        )}
      </div>

      {(subtitle || badgeText) && (
        <div className="mt-1.5 flex items-center justify-between gap-1.5 border-t border-[#1e232c] pt-1 text-[10px] sm:text-[11px] text-zinc-400">
          <span className="truncate">{subtitle}</span>
          {badgeText && (
            <span
              className={clsx(
                'inline-flex items-center rounded-full border px-1.5 py-0.2 text-[9px] font-medium',
                badgeStyles[badgeVariant]
              )}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
