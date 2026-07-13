import React, { useState } from 'react';
import { CardInfo, CardBillStatement, financeService } from '../services';

interface CardsTabProps {
  cards: CardInfo[];
  cardBills: CardBillStatement[];
  cardMap: Map<string, CardInfo>;
  selectedMonth: string;
  showAddCardForm: boolean;
  setShowAddCardForm: (val: boolean) => void;
  handleAddCard: (e: React.FormEvent) => void;
  handlePayBill: (cardId: string, month: string, isPaid: boolean) => void;
  // Form fields
  cName: string;
  setCName: (val: string) => void;
  cLastFour: string;
  setCLastFour: (val: string) => void;
  cBillingDay: string;
  setCBillingDay: (val: string) => void;
  cDueDay: string;
  setCDueDay: (val: string) => void;
  cLimit: string;
  setCLimit: (val: string) => void;
  onRefresh?: () => void;
  triggerToast?: (msg: string) => void;
}

// Card styling config mapper based on card name keywords
function getCardDesign(name: string) {
  const n = name.toLowerCase();
  
  // Defaults
  let bg = 'linear-gradient(135deg, #141e30 0%, #243b55 100%)'; // premium slate dark
  let bankName = 'CREDIT CARD';
  let cardNickname = name;
  let network: 'Visa' | 'Mastercard' | 'Amex' | 'RuPay' = 'Visa';
  let themeColor = '#3b82f6';
  let textColor = 'text-white';
  let isPlatinum = false;

  // Bank name detection
  if (n.includes('axis')) bankName = 'AXIS BANK';
  else if (n.includes('icici')) bankName = 'ICICI BANK';
  else if (n.includes('hdfc')) bankName = 'HDFC BANK';
  else if (n.includes('sbi')) bankName = 'SBI';

  // Card specific gradients & details
  if (n.includes('airtel') && n.includes('axis')) {
    bg = 'linear-gradient(135deg, #d31027 0%, #ea384d 100%)'; // Airtel red accent
    themeColor = '#d31027';
    cardNickname = 'Airtel Axis';
  } else if (n.includes('myzone') || n.includes('my zone')) {
    bg = 'linear-gradient(135deg, #800020 0%, #4A0E17 100%)'; // Axis Burgundy
    themeColor = '#800020';
    cardNickname = 'My Zone';
  } else if (n.includes('amazon') || n.includes('amazon pay')) {
    bg = 'linear-gradient(135deg, #232F3E 0%, #151923 100%)'; // Amazon Pay charcoal dark
    themeColor = '#FF9900';
    cardNickname = 'Amazon Pay';
  } else if (n.includes('platinum')) {
    bg = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'; // Silver platinum
    textColor = 'text-slate-900';
    themeColor = '#475569';
    isPlatinum = true;
    cardNickname = 'Platinum Chip';
  } else if (n.includes('rubyx')) {
    bg = 'linear-gradient(135deg, #4b121a 0%, #b80d22 100%)'; // Ruby red
    themeColor = '#b80d22';
    cardNickname = 'Rubyx Jewel';
  } else if (n.includes('millennia') || n.includes('millenia')) {
    bg = 'linear-gradient(135deg, #093028 0%, #237a57 100%)'; // HDFC Millennia cyber teal
    themeColor = '#10b981';
    cardNickname = 'Millennia';
  } else if (n.includes('bpcl')) {
    bg = 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'; // Petrol green/blue
    themeColor = '#f59e0b';
    cardNickname = 'BPCL Octane';
  }

  // Network detection
  if (n.includes('mastercard') || n.includes('master')) network = 'Mastercard';
  else if (n.includes('amex') || n.includes('american')) network = 'Amex';
  else if (n.includes('rupay')) network = 'RuPay';

  return { bg, bankName, cardNickname, network, themeColor, textColor, isPlatinum };
}

export default function CardsTab({
  cards,
  cardBills,
  cardMap,
  selectedMonth,
  showAddCardForm,
  setShowAddCardForm,
  handleAddCard,
  handlePayBill,
  cName,
  setCName,
  cLastFour,
  setCLastFour,
  cBillingDay,
  setCBillingDay,
  cDueDay,
  setCDueDay,
  cLimit,
  setCLimit,
  onRefresh,
  triggerToast
}: CardsTabProps) {

  // Local state to store statement data, selected period, and loading states for each card
  const [localCardBills, setLocalCardBills] = useState<Record<string, CardBillStatement>>({});
  const [cardMonths, setCardMonths] = useState<Record<string, string>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  // Construct Month options for selection dropdown
  const monthOptions = React.useMemo(() => {
    const options = [];
    const base = new Date();
    base.setFullYear(2026, 6, 1); // July 2026
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ val, label });
    }
    return options;
  }, []);

  // Sync initial card statements loaded by the dashboard (for the globally selected month)
  React.useEffect(() => {
    const initialBills: Record<string, CardBillStatement> = {};
    const initialMonths: Record<string, string> = {};
    cardBills.forEach(bill => {
      initialBills[bill.cardId] = bill;
      initialMonths[bill.cardId] = selectedMonth;
    });
    setLocalCardBills(initialBills);
    setCardMonths(initialMonths);
  }, [cardBills, selectedMonth]);

  // Handle local statement month changes for a specific card
  const handleCardMonthChange = async (cardId: string, newMonth: string) => {
    setCardMonths(prev => ({ ...prev, [cardId]: newMonth }));
    setLoadingMap(prev => ({ ...prev, [cardId]: true }));
    try {
      const bills = await financeService.getCardBillStatements(newMonth);
      const myBill = bills.find(b => b.cardId === cardId);
      if (myBill) {
        setLocalCardBills(prev => ({ ...prev, [cardId]: myBill }));
      }
    } catch (err) {
      console.error('Error fetching statement for card:', err);
    } finally {
      setLoadingMap(prev => ({ ...prev, [cardId]: false }));
    }
  };

  // Fetch statements for cards that don't have them in local state (e.g. newly registered cards)
  React.useEffect(() => {
    cards.forEach(card => {
      if (!localCardBills[card.id] && !loadingMap[card.id]) {
        handleCardMonthChange(card.id, cardMonths[card.id] || selectedMonth);
      }
    });
  }, [cards, localCardBills, loadingMap, selectedMonth]);

  // Handle local card statement bill settlement
  const handlePayBillLocal = async (cardId: string, statementMonth: string, currentPaidState: boolean) => {
    try {
      const nextPaidState = !currentPaidState;
      await handlePayBill(cardId, statementMonth, nextPaidState);
      
      setLocalCardBills(prev => {
        const bill = prev[cardId];
        if (bill && bill.statementMonth === statementMonth) {
          return {
            ...prev,
            [cardId]: { ...bill, isPaid: nextPaidState }
          };
        }
        return prev;
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Card handler
  const handleDeleteCard = async (id: string) => {
    if (!confirm('Are you sure you want to deregister this card? This will hide statement calculations but keep existing logged transactions.')) return;
    try {
      await financeService.deleteCard(id);
      if (triggerToast) triggerToast('Credit card deregistered successfully.');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Editing card state
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [editCardName, setEditCardName] = useState('');
  const [editCardLastFour, setEditCardLastFour] = useState('');
  const [editCardBillingDay, setEditCardBillingDay] = useState('15');
  const [editCardDueDay, setEditCardDueDay] = useState('5');
  const [editCardLimit, setEditCardLimit] = useState('');

  const handleOpenEditCard = (card: CardInfo) => {
    setEditingCardId(card.id);
    setEditCardName(card.name);
    setEditCardLastFour(card.lastFour);
    setEditCardBillingDay(card.billingDay.toString());
    setEditCardDueDay(card.dueDay.toString());
    setEditCardLimit(card.creditLimit.toString());
    setShowEditCardModal(true);
  };

  const handleSaveEditCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCardName || !editCardLastFour || !editCardLimit || !editingCardId) return;
    try {
      await financeService.updateCard(editingCardId, {
        name: editCardName,
        lastFour: editCardLastFour,
        billingDay: parseInt(editCardBillingDay),
        dueDay: parseInt(editCardDueDay),
        creditLimit: parseFloat(editCardLimit)
      });
      setShowEditCardModal(false);
      setEditingCardId(null);
      if (triggerToast) triggerToast('Credit card details updated successfully.');
      
      // Update the local statement as well
      handleCardMonthChange(editingCardId, cardMonths[editingCardId] || selectedMonth);
      
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-medium">My Credit Cards Wallet</h2>
          <p className="text-xs text-[color:var(--claude-ink-sub)]">Manage active billing statements and custom credit card targets for {selectedMonth}</p>
        </div>
        
        <button
          onClick={() => setShowAddCardForm(true)}
          className="px-4 py-2 bg-[color:var(--claude-accent)] hover:bg-[color:var(--claude-accent)]/85 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Register New Card
        </button>
      </div>

      {/* Add Card Modal Overlay */}
      {showAddCardForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            
            <div className="px-6 py-4 border-b border-[color:var(--claude-border)] flex justify-between items-center bg-[color:var(--claude-bg-strong)]/40">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--claude-ink)]">Register Credit Card</h3>
              <button 
                onClick={() => setShowAddCardForm(false)}
                className="text-[color:var(--claude-ink-sub)] hover:text-[color:var(--claude-ink)] p-1 rounded-lg transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleAddCard} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Card Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Airtel Axis, HDFC Millennia"
                    value={cName}
                    onChange={(e) => setCName(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Last 4 Digits *</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="e.g. 5432"
                    value={cLastFour}
                    onChange={(e) => setCLastFour(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Billing Day *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={31}
                    value={cBillingDay}
                    onChange={(e) => setCBillingDay(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Due Day *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={31}
                    value={cDueDay}
                    onChange={(e) => setCDueDay(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Credit Limit *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 200000"
                    value={cLimit}
                    onChange={(e) => setCLimit(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[color:var(--claude-accent)] text-white text-xs font-semibold rounded-xl hover:bg-[color:var(--claude-accent)]/90 transition"
                >
                  Register Card
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCardForm(false)}
                  className="flex-1 py-2.5 bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)] text-xs font-semibold rounded-xl border border-[color:var(--claude-border)] hover:bg-[color:var(--claude-bg-strong)]/80 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Card Modal Overlay */}
      {showEditCardModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            
            <div className="px-6 py-4 border-b border-[color:var(--claude-border)] flex justify-between items-center bg-[color:var(--claude-bg-strong)]/40">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--claude-ink)]">Edit Credit Card Details</h3>
              <button 
                onClick={() => { setShowEditCardModal(false); setEditingCardId(null); }}
                className="text-[color:var(--claude-ink-sub)] hover:text-[color:var(--claude-ink)] p-1 rounded-lg transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleSaveEditCard} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Card Name *</label>
                  <input
                    type="text"
                    required
                    value={editCardName}
                    onChange={(e) => setEditCardName(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Last 4 Digits *</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={editCardLastFour}
                    onChange={(e) => setEditCardLastFour(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Billing Day *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={31}
                    value={editCardBillingDay}
                    onChange={(e) => setEditCardBillingDay(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Due Day *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={31}
                    value={editCardDueDay}
                    onChange={(e) => setEditCardDueDay(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Credit Limit *</label>
                  <input
                    type="number"
                    required
                    value={editCardLimit}
                    onChange={(e) => setEditCardLimit(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[color:var(--claude-accent)] text-white text-xs font-semibold rounded-xl hover:bg-[color:var(--claude-accent)]/90 transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditCardModal(false); setEditingCardId(null); }}
                  className="flex-1 py-2.5 bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)] text-xs font-semibold rounded-xl border border-[color:var(--claude-border)] hover:bg-[color:var(--claude-bg-strong)]/80 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credit Cards Horizontal Slides Deck */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[color:var(--claude-ink)]">Registered Cards Wallet</h3>
        
        {cards.length === 0 ? (
          <p className="text-xs text-[color:var(--claude-ink-sub)] italic bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] p-8 text-center rounded-2xl">No registered cards in your wallet yet.</p>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
            {cards.map(card => {
              const design = getCardDesign(card.name);
              return (
                <div 
                  key={card.id}
                  style={{ background: design.bg }}
                  className={`relative w-72 h-44 rounded-2xl p-5 flex flex-col justify-between shadow-md border border-white/10 snap-center shrink-0 hover:scale-103 transition-all duration-300 ${design.textColor}`}
                >
                  {/* Decorative card overlay lines */}
                  <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/15 pointer-events-none"></div>
                  
                  {/* Card top bar */}
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest font-sans font-bold opacity-80">{design.bankName}</span>
                      <h4 className="text-sm font-semibold tracking-tight">{design.cardNickname}</h4>
                    </div>
                    {/* Glowing gold card chip */}
                    <div className="w-8 h-6 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 rounded-md shadow-xs flex items-center justify-center border border-yellow-200/40">
                      <div className="w-5 h-3.5 border-r border-b border-amber-600/30"></div>
                    </div>
                  </div>

                  {/* Mono card number */}
                  <div className="font-mono text-sm tracking-widest my-2 z-10 select-all">
                    ••••  ••••  ••••  {card.lastFour}
                  </div>

                  {/* Card bottom details */}
                  <div className="flex justify-between items-end z-10">
                    <div className="text-left">
                      <span className="text-[8px] uppercase tracking-wider opacity-70 block">Credit Limit</span>
                      <span className="text-xs font-semibold">₹{card.creditLimit.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="text-center">
                      <span className="text-[8px] uppercase tracking-wider opacity-70 block">Cycle Details</span>
                      <span className="text-[10px] font-medium">Bill: {card.billingDay} | Due: {card.dueDay}</span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {/* Brand card network renderer */}
                      {renderNetworkLogo(design.network, design.isPlatinum)}
                      <div className="flex gap-1.5 mt-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenEditCard(card); }}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-black/35 hover:bg-[color:var(--claude-accent)] text-white transition font-medium"
                          title="Edit Card"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-black/35 hover:bg-red-700/80 text-white transition font-medium"
                          title="Delete Card"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Credit Card Statements Overview */}
      <div className="space-y-6 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[color:var(--claude-ink)] border-b border-[color:var(--claude-border)]/50 pb-2">Active Cycle Billing Statements</h3>
        
        {cards.length === 0 ? (
          <p className="text-xs text-[color:var(--claude-ink-sub)] text-center py-8">No registered cards in your wallet yet.</p>
        ) : (
          <div className="space-y-8">
            {cards.map(card => {
              const bill = localCardBills[card.id];
              const design = getCardDesign(card.name);
              const currentMonth = cardMonths[card.id] || selectedMonth;
              const loading = loadingMap[card.id];
              
              if (!bill) {
                return (
                  <div key={card.id} className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] rounded-2xl shadow-sm p-6 flex justify-between items-center animate-pulse">
                    <span className="text-xs text-[color:var(--claude-ink-sub)]">Loading {card.name} statement...</span>
                  </div>
                );
              }

              const usersDist: Record<string, number> = {};
              bill.transactions.forEach(tx => {
                usersDist[tx.usedBy] = (usersDist[tx.usedBy] || 0) + tx.amount;
              });

              // Cycle status details
              const billingDay = card.billingDay;
              const dueDay = card.dueDay;
              const isPaid = bill.isPaid;
              
              // Calculate limit usage percentage
              const limitUsedPct = Math.min(Math.round((bill.totalAmount / card.creditLimit) * 100), 100);

              return (
                <div key={card.id} className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] rounded-2xl shadow-sm overflow-hidden relative">
                  
                  {loading && (
                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-xs flex items-center justify-center z-10">
                      <div className="w-6 h-6 rounded-full border-2 border-[color:var(--claude-border)] border-t-[color:var(--claude-accent)] animate-spin"></div>
                    </div>
                  )}

                  {/* Statement Top Info Bar */}
                  <div className="p-6 bg-[color:var(--claude-bg-strong)]/40 border-b border-[color:var(--claude-border)] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex items-center gap-4">
                      {/* Mini Card design circle avatar */}
                      <div 
                        style={{ background: design.bg }} 
                        className={`w-12 h-8 rounded-lg border border-white/10 shrink-0 flex items-center justify-center text-[8px] font-bold ${design.textColor}`}
                      >
                        {card.lastFour || 'CARD'}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h4 className="text-sm font-semibold text-[color:var(--claude-ink)]">{card.name}</h4>
                          <span className="text-[9px] bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] px-2 py-0.5 rounded font-medium text-[color:var(--claude-ink-sub)]">
                            Bill Cycle Day: {billingDay}th
                          </span>
                          
                          {/* Local Month Selector Dropdown */}
                          <div className="flex items-center gap-1.5 bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] px-2 py-0.5 rounded-lg">
                            <label className="text-[8px] font-medium text-[color:var(--claude-ink-sub)] uppercase">Period:</label>
                            <select
                              value={currentMonth}
                              onChange={(e) => handleCardMonthChange(card.id, e.target.value)}
                              className="bg-transparent text-[10px] font-semibold focus:outline-none border-none cursor-pointer text-[color:var(--claude-ink)]"
                            >
                              {monthOptions.map(opt => (
                                <option key={opt.val} value={opt.val}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <p className="text-[10px] text-[color:var(--claude-ink-sub)] mt-0.5">
                          Statement: <span className="font-medium">{bill.startDate}</span> to <span className="font-medium">{bill.endDate}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-6">
                      <div className="text-right">
                        <span className="text-[9px] text-[color:var(--claude-ink-sub)] uppercase tracking-wider block font-medium">Limit Consumption</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-semibold tabular-nums">{limitUsedPct}% Used</span>
                          <div className="w-16 bg-[color:var(--claude-bg-strong)] h-1.5 rounded-full overflow-hidden border border-[color:var(--claude-border)]/50">
                            <div className="h-full rounded-full" style={{ width: `${limitUsedPct}%`, backgroundColor: design.themeColor }}></div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-[color:var(--claude-ink-sub)] uppercase tracking-wider block font-medium">Due Date</span>
                        <p className="text-xs font-semibold">{bill.dueDate}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-[color:var(--claude-ink-sub)] uppercase tracking-wider block font-medium">Billed Amount</span>
                        <p className="text-sm font-semibold tracking-tight tabular-nums" style={{ color: design.themeColor }}>
                          ₹{bill.totalAmount.toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div>
                        {bill.totalAmount > 0 ? (
                          <button
                            onClick={() => handlePayBillLocal(card.id, bill.statementMonth, isPaid)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900'
                                : 'bg-[color:var(--claude-accent)] text-white border-transparent hover:bg-[color:var(--claude-accent)]/85 shadow-xs'
                            }`}
                          >
                            {isPaid ? '✓ Statement Paid' : 'Pay Bill'}
                          </button>
                        ) : (
                          <span className="text-xs text-[color:var(--claude-ink-sub)] px-2.5 py-1 rounded bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] font-medium">No Dues</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Statement breakdown grids */}
                  <div className="grid gap-6 md:grid-cols-3 p-6">
                    
                    {/* Shareholder split */}
                    <div className="md:border-r border-[color:var(--claude-border)]/50 md:pr-6">
                      <h5 className="text-xs font-bold text-[color:var(--claude-ink)] mb-3">Usage Share</h5>
                      
                      {bill.transactions.length === 0 ? (
                        <p className="text-xs text-[color:var(--claude-ink-sub)] italic">No transactions recorded in this billing window.</p>
                      ) : (
                        <div className="space-y-3">
                          {Object.entries(usersDist)
                            .sort((a, b) => b[1] - a[1])
                            .map(([user, amt]) => {
                              const pct = bill.totalAmount > 0 ? (amt / bill.totalAmount) * 100 : 0;
                              return (
                                <div key={user} className="flex justify-between items-center text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: design.themeColor }}></span>
                                    <span className="font-medium">{user}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-semibold tracking-tight tabular-nums">₹{amt.toLocaleString('en-IN')}</span>
                                    <span className="text-[9px] text-[color:var(--claude-ink-sub)] ml-1">({pct.toFixed(0)}%)</span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>

                    {/* Transactions list */}
                    <div className="md:col-span-2 space-y-3">
                      <h5 className="text-xs font-bold text-[color:var(--claude-ink)]">Transactions Window Ledger</h5>
                      
                      {bill.transactions.length === 0 ? (
                        <p className="text-xs text-[color:var(--claude-ink-sub)] py-4 text-center italic bg-[color:var(--claude-bg-strong)]/20 rounded-xl">No transactions found.</p>
                      ) : (
                        <div className="overflow-hidden border border-[color:var(--claude-border)]/50 rounded-xl">
                          {/* Desktop Table View */}
                          <table className="w-full text-left text-xs border-collapse hidden sm:table bg-[color:var(--claude-card)]">
                            <thead>
                              <tr className="bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)] font-semibold border-b border-[color:var(--claude-border)]">
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Category</th>
                                <th className="px-4 py-2">User</th>
                                <th className="px-4 py-2">Notes</th>
                                <th className="px-4 py-2 text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[color:var(--claude-border)]/40">
                              {bill.transactions.map(tx => (
                                <tr key={tx.id} className="hover:bg-[color:var(--claude-bg-strong)]/20">
                                  <td className="px-4 py-2.5 text-[color:var(--claude-ink-sub)] text-[10px]">{tx.date}</td>
                                  <td className="px-4 py-2.5">{tx.category}</td>
                                  <td className="px-4 py-2.5 font-semibold text-[color:var(--claude-accent)]">{tx.usedBy}</td>
                                  <td className="px-4 py-2.5 text-[color:var(--claude-ink-sub)] truncate max-w-[120px]">{tx.notes}</td>
                                  <td className="px-4 py-2.5 text-right font-semibold tracking-tight tabular-nums">₹{tx.amount.toLocaleString('en-IN')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Mobile Cards View */}
                          <div className="block sm:hidden divide-y divide-[color:var(--claude-border)]/40">
                            {bill.transactions.map(tx => (
                              <div key={tx.id} className="p-3 flex justify-between items-center text-xs bg-[color:var(--claude-card)]">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-[color:var(--claude-ink)]">{tx.category}</span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/20 text-[color:var(--claude-accent)] border border-[color:var(--claude-accent)]/20 font-semibold">{tx.usedBy}</span>
                                  </div>
                                  {tx.notes && <p className="text-[10px] text-[color:var(--claude-ink-sub)] mt-0.5 truncate max-w-[160px]">{tx.notes}</p>}
                                  <p className="text-[9px] text-[color:var(--claude-ink-sub)] mt-0.5">{tx.date}</p>
                                </div>
                                <span className="font-semibold tracking-tight tabular-nums text-[color:var(--claude-ink)]">
                                  ₹{tx.amount.toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

// Sub-component to render card network logo
function renderNetworkLogo(network: 'Visa' | 'Mastercard' | 'Amex' | 'RuPay', isPlatinum: boolean) {
  if (network === 'Visa') {
    return (
      <span className="font-sans font-black italic tracking-wide text-sm opacity-90 text-blue-200">
        VISA {isPlatinum && <span className="text-[8px] uppercase font-bold tracking-widest ml-0.5 text-slate-100">PLATINUM</span>}
      </span>
    );
  }
  if (network === 'Mastercard') {
    return (
      <div className="flex items-center -space-x-1.5 opacity-90">
        <div className="w-4 h-4 rounded-full bg-red-500"></div>
        <div className="w-4 h-4 rounded-full bg-amber-400"></div>
      </div>
    );
  }
  if (network === 'Amex') {
    return (
      <div className="px-1.5 py-0.5 bg-sky-600 rounded text-[8px] font-sans font-extrabold uppercase tracking-wide border border-sky-400/40 text-white shadow-xs">
        Amex
      </div>
    );
  }
  if (network === 'RuPay') {
    return (
      <span className="font-sans font-bold italic text-[11px] tracking-tight text-emerald-100">
        RuPay<span className="text-yellow-400">⚡</span>
      </span>
    );
  }
  return <span className="text-[9px] font-semibold opacity-70">CARD</span>;
}
