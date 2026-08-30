import React, { useState } from 'react';
import { CreditCard as CardIcon, Plus, Settings } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useUIStore } from '../../store/useUIStore';
import { calculateCreditCardMetrics } from '../../utils/calculations';
import { CardHeaderCard } from './CardHeaderCard';
import { TransactionsSection } from './TransactionsSection';
import { BillPaymentSection } from './BillPaymentSection';
import { CreditAnalysisSection } from './CreditAnalysisSection';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';

export const CreditCardsPage: React.FC = () => {
  const {
    creditCards,
    selectedCardId,
    setSelectedCardId,
    creditTransactions,
    activeMonth,
    userProfile,
    addCreditCard,
    setActiveTab,
  } = useFinanceStore();

  const { addToast } = useUIStore();

  // Add Card Modal State
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newIssuer, setNewIssuer] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [newCycleStart, setNewCycleStart] = useState('15');
  const [newCycleEnd, setNewCycleEnd] = useState('14');

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const currentCardId = selectedCardId && creditCards.some((c) => c.id === selectedCardId)
    ? selectedCardId
    : creditCards[0]?.id || null;

  const currentCard = creditCards.find((c) => c.id === currentCardId);

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName || !newIssuer || !newLimit) return;

    const newId = addCreditCard({
      cardName: newCardName,
      issuer: newIssuer,
      nickname: newNickname || 'Primary Card',
      creditLimit: parseFloat(newLimit) || 100000,
      billingCycleStart: parseInt(newCycleStart, 10) || 1,
      billingCycleEnd: parseInt(newCycleEnd, 10) || 30,
      cardColor: 'from-zinc-800 to-zinc-950',
    });

    setSelectedCardId(newId);
    setIsAddCardModalOpen(false);
    setNewCardName('');
    setNewIssuer('');
    setNewNickname('');
    setNewLimit('');
    addToast(`Added credit card: ${newCardName}`, 'success');
  };

  if (creditCards.length === 0 || !currentCard) {
    return (
      <>
        <EmptyState
          icon={CardIcon}
          title="No Credit Cards Added"
          description="Add your credit cards to monitor spending, track utilization against the 30% safe threshold, and classify essential vs non-essential purchases."
          actionLabel="Add Credit Card"
          onAction={() => setIsAddCardModalOpen(true)}
        />

        {/* Add Card Modal */}
        <Modal
          isOpen={isAddCardModalOpen}
          onClose={() => setIsAddCardModalOpen(false)}
          title="Add Credit Card"
          subtitle="Track outstanding, limits, and utilization"
          maxWidth="sm"
        >
          <form onSubmit={handleCreateCard} className="space-y-3.5 text-left">
            <Input
              label="Card Name"
              placeholder="e.g. HDFC Regalia, Axis Magnus"
              value={newCardName}
              onChange={(e) => setNewCardName(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="Issuer"
              placeholder="e.g. HDFC Bank, SBI Card"
              value={newIssuer}
              onChange={(e) => setNewIssuer(e.target.value)}
              required
            />

            <Input
              label="Nickname / Purpose"
              placeholder="e.g. Travel & Lounges"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
            />

            <Input
              label="Credit Limit"
              type="number"
              prefixSymbol="₹"
              placeholder="e.g. 300000"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Billing Cycle Start"
                type="number"
                min={1}
                max={31}
                value={newCycleStart}
                onChange={(e) => setNewCycleStart(e.target.value)}
                helperText="e.g. 15th"
                required
              />
              <Input
                label="Billing Cycle End"
                type="number"
                min={1}
                max={31}
                value={newCycleEnd}
                onChange={(e) => setNewCycleEnd(e.target.value)}
                helperText="e.g. 14th"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddCardModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
              >
                Save Card
              </button>
            </div>
          </form>
        </Modal>
      </>
    );
  }

  const cardTransactions = creditTransactions.filter(
    (t) => t.cardId === currentCard.id && t.month === activeMonth
  );

  const metrics = calculateCreditCardMetrics(currentCard, cardTransactions);

  return (
    <div className="space-y-5 animate-fade-in text-left">
      {/* Horizontal Switcher */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-2">
          {creditCards.map((card) => {
            const isSelected = card.id === currentCard.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelectedCardId(card.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-zinc-800 border-zinc-700 text-white'
                    : 'bg-[#13161c] border-[#222731] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="text-left">
                  <p className="leading-tight">{card.cardName}</p>
                  <p className="text-[10px] font-normal text-zinc-400 leading-tight">{card.issuer}</p>
                </div>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsAddCardModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 bg-[#101318]/50 border border-dashed border-[#222731] hover:border-zinc-600 hover:text-zinc-200 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Card</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>

      {/* Top Card Header */}
      <CardHeaderCard
        card={currentCard}
        metrics={metrics}
        activeMonth={activeMonth}
        currency={userProfile.currency}
        onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
      />

      {/* Bill Settlement Section */}
      <BillPaymentSection
        card={currentCard}
        isPaymentModalOpen={isPaymentModalOpen}
        onClosePaymentModal={() => setIsPaymentModalOpen(false)}
        currency={userProfile.currency}
      />

      {/* Transactions Section */}
      <TransactionsSection
        card={currentCard}
        transactions={cardTransactions}
        activeMonth={activeMonth}
        currency={userProfile.currency}
      />

      {/* Credit Analysis Section */}
      <CreditAnalysisSection
        card={currentCard}
        metrics={metrics}
        currency={userProfile.currency}
      />

      {/* Add Card Modal */}
      <Modal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        title="Add Credit Card"
        subtitle="Track outstanding, limits, and utilization"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateCard} className="space-y-3.5 text-left">
          <Input
            label="Card Name"
            placeholder="e.g. HDFC Regalia, Axis Magnus"
            value={newCardName}
            onChange={(e) => setNewCardName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Issuer"
            placeholder="e.g. HDFC Bank, SBI Card"
            value={newIssuer}
            onChange={(e) => setNewIssuer(e.target.value)}
            required
          />

          <Input
            label="Nickname / Purpose"
            placeholder="e.g. Travel & Lounges"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
          />

          <Input
            label="Credit Limit"
            type="number"
            prefixSymbol="₹"
            placeholder="e.g. 300000"
            value={newLimit}
            onChange={(e) => setNewLimit(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Billing Cycle Start"
              type="number"
              min={1}
              max={31}
              value={newCycleStart}
              onChange={(e) => setNewCycleStart(e.target.value)}
              helperText="e.g. 15th"
              required
            />
            <Input
              label="Billing Cycle End"
              type="number"
              min={1}
              max={31}
              value={newCycleEnd}
              onChange={(e) => setNewCycleEnd(e.target.value)}
              helperText="e.g. 14th"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddCardModalOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-zinc-200 hover:bg-white text-zinc-950 px-4 py-2 text-xs font-semibold"
            >
              Save Card
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
