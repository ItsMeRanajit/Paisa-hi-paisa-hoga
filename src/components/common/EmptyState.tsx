import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#222731] bg-[#101318]/50 p-8 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800/60 text-zinc-300 border border-zinc-700/50 mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-bold text-zinc-200 tracking-tight">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-zinc-400 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-100 transition-all cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
