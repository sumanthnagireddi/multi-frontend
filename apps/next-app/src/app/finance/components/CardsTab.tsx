import React from 'react';
import { CardInfo, CardBillStatement } from '../services';

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
  setCLimit
}: CardsTabProps) {
  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-medium">Card Bills Detailed Statements</h2>
          <p className="text-xs text-[color:var(--claude-ink-sub)]">Statements computed based on credit cards' billing dates for {selectedMonth}</p>
        </div>
        
        <button
          onClick={() => setShowAddCardForm(!showAddCardForm)}
          className="px-4 py-2 bg-[color:var(--claude-accent)] hover:bg-[color:var(--claude-accent)]/85 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Register New Card
        </button>
      </div>

      {/* Add Card Form */}
      {showAddCardForm && (
        <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] p-6 rounded-2xl shadow-sm max-w-xl">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--claude-ink)] mb-4">Register Credit Card</h3>
          <form onSubmit={handleAddCard} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Card Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AMEX Gold"
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
                <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Billing Day of Month *</label>
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
                <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Payment Due Day *</label>
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
                <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Credit Limit (₹) *</label>
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
                className="flex-1 py-2 bg-[color:var(--claude-accent)] text-white text-xs font-semibold rounded-xl hover:bg-[color:var(--claude-accent)]/90 transition"
              >
                Register Card
              </button>
              <button
                type="button"
                onClick={() => setShowAddCardForm(false)}
                className="flex-1 py-2 bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)] text-xs font-semibold rounded-xl border border-[color:var(--claude-border)] hover:bg-[color:var(--claude-bg-strong)]/80 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Render statement cards */}
      <div className="grid gap-8">
        {cardBills.length === 0 ? (
          <p className="text-xs text-[color:var(--claude-ink-sub)] text-center py-12">No registered cards found.</p>
        ) : (
          cardBills.map(bill => {
            const cardData = cardMap.get(bill.cardId);
            
            // Card statement usage distribution
            const usersDist: Record<string, number> = {};
            bill.transactions.forEach(tx => {
              usersDist[tx.usedBy] = (usersDist[tx.usedBy] || 0) + tx.amount;
            });

            return (
              <div key={bill.cardId} className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] rounded-2xl shadow-sm overflow-hidden">
                
                {/* Statement Header */}
                <div className="p-6 bg-[color:var(--claude-bg-strong)]/40 border-b border-[color:var(--claude-border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-md font-serif font-semibold text-[color:var(--claude-ink)]">{bill.cardName}</h3>
                      <span className="text-[10px] bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] px-2 py-0.5 rounded">
                        ends on {cardData?.billingDay || 15}th
                      </span>
                    </div>
                    <p className="text-xs text-[color:var(--claude-ink-sub)] mt-0.5">
                      Statement period: <span className="font-medium">{bill.startDate}</span> to <span className="font-medium">{bill.endDate}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-[color:var(--claude-ink-sub)] uppercase tracking-wider block">Due Date</span>
                      <p className="text-xs font-semibold">{bill.dueDate}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[color:var(--claude-ink-sub)] uppercase tracking-wider block">Billed Amount</span>
                      <p className="text-sm font-semibold tracking-tight tabular-nums text-[color:var(--claude-accent)]">₹{bill.totalAmount.toLocaleString('en-IN')}</p>
                    </div>

                    <div>
                      {bill.totalAmount > 0 ? (
                        <button
                          onClick={() => handlePayBill(bill.cardId, selectedMonth, !bill.isPaid)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                            bill.isPaid
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900'
                              : 'bg-[color:var(--claude-accent)] text-white border-transparent hover:bg-[color:var(--claude-accent)]/85'
                          }`}
                        >
                          {bill.isPaid ? '✓ Billed Paid' : 'Mark as Paid'}
                        </button>
                      ) : (
                        <span className="text-xs text-[color:var(--claude-ink-sub)] px-2.5 py-1 rounded bg-[color:var(--claude-bg-strong)]">No Due</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statement Details */}
                <div className="grid gap-6 md:grid-cols-3 p-6">
                  
                  {/* Left: User Breakdown */}
                  <div className="border-r border-[color:var(--claude-border)]/50 pr-6">
                    <h4 className="text-xs font-bold text-[color:var(--claude-ink)] mb-3">Usage Share</h4>
                    
                    {bill.transactions.length === 0 ? (
                      <p className="text-xs text-[color:var(--claude-ink-sub)] italic">No card statements found in this cycle.</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(usersDist)
                          .sort((a, b) => b[1] - a[1])
                          .map(([user, amt]) => {
                            const pct = bill.totalAmount > 0 ? (amt / bill.totalAmount) * 100 : 0;
                            return (
                              <div key={user} className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--claude-accent)]"></span>
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

                  {/* Middle/Right: Transactions list for card */}
                  <div className="md:col-span-2 space-y-3">
                    <h4 className="text-xs font-bold text-[color:var(--claude-ink)]">Transactions Log</h4>
                    
                    {bill.transactions.length === 0 ? (
                      <p className="text-xs text-[color:var(--claude-ink-sub)] py-4 text-center">No transactions recorded for this cycle.</p>
                    ) : (
                      <div className="overflow-hidden border border-[color:var(--claude-border)]/50 rounded-xl">
                        {/* Desktop Table View */}
                        <table className="w-full text-left text-xs border-collapse hidden sm:table">
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
                                  <span className="text-[9px] px-1 rounded bg-amber-50 dark:bg-amber-950/20 text-[color:var(--claude-accent)] border border-[color:var(--claude-accent)]/20 font-semibold">{tx.usedBy}</span>
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
          })
        )}
      </div>

    </div>
  );
}
