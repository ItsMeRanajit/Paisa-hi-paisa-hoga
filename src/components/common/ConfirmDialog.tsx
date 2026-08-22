import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const btnVariants = {
    danger: 'bg-rose-600 hover:bg-rose-500 text-white',
    warning: 'bg-amber-600 hover:bg-amber-500 text-white',
    info: 'bg-zinc-700 hover:bg-zinc-600 text-white',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4 text-left">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-950/40 text-rose-400 border border-rose-800/40">
            <AlertCircle className="h-4 w-4" />
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">{message}</p>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${btnVariants[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};
