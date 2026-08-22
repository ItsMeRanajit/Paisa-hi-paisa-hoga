import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CreditCard } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore } from '../../store/useUIStore';
import { formatCurrency } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';

interface BillPaymentSectionProps {
  card: CreditCard;
  isPaymentModalOpen: boolean;
  onClosePaymentModal: () => void;
  currency?: string;
}

export const BillPaymentSection: React.FC<BillPaymentSectionProps> = ({
  card,
  isPaymentModalOpen,
  onClosePaymentModal,
  currency = '₹',
}) => {
  const { recordCardPayment } = useFinanceStore();
  const { addToast } = useUIStore();

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount) || 0;
    if (!amt) return;

    recordCardPayment(card.id, amt, paymentDate);
    addToast(`Recorded payment of ₹${amt.toLocaleString()} on ${card.cardName}`, 'success');
    setPaymentAmount('');
    onClosePaymentModal();
  };

  return (
    <>
      <div className="rounded-2xl border border-[#222731] bg-[#13161c] p-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Last Bill Settlement
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                {card.lastPaymentDate ? (
                  <span>
                    Paid <strong className="text-white font-mono">{formatCurrency(card.lastPaymentAmount, currency)}</strong> on {card.lastPaymentDate}
                  </span>
                ) : (
                  'No previous settlement recorded.'
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClosePaymentModal}
            className="self-start sm:self-auto rounded-xl bg-zinc-800 hover:bg-zinc-700 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer"
          >
            Update Settlement
          </button>
        </div>
      </div>

      {/* Bill Settlement Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={onClosePaymentModal}
        title="Record Bill Settlement"
        subtitle={`Log payment for ${card.cardName}`}
        maxWidth="sm"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-3.5 text-left">
          <Input
            label="Payment Amount"
            type="number"
            prefixSymbol="₹"
            placeholder="e.g. 48500"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Payment Date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClosePaymentModal}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              Save Settlement
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
