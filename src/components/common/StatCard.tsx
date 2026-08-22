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
        'rounded-2xl border border-[#222731] bg-[#13161c] p-4 sm:p-5 transition-all text-left',
        onClick && 'hover:border-[#2f3645] hover:bg-[#161a22] cursor-pointer',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">{title}</p>
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono truncate">{value}</p>
        </div>
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-800/60 text-zinc-300 border border-zinc-700/40">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {(subtitle || badgeText) && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#1e232c] pt-2.5 text-xs text-zinc-400">
          <span className="truncate">{subtitle}</span>
          {badgeText && (
            <span
              className={clsx(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium',
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
