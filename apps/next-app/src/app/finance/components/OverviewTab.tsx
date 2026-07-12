import React from 'react';
import { CardBillStatement } from '../services';

interface OverviewTabProps {
  personalTarget: number;
  totalMonthlySpend: number;
  constructionBudget: number;
  totalConstructionSpent: number;
  netDebtValue: number;
  totalReceivables: number;
  totalPayables: number;
  cardBills: CardBillStatement[];
  isEditingTarget: boolean;
  setIsEditingTarget: (editing: boolean) => void;
  tempTarget: string;
  setTempTarget: (val: string) => void;
  handleUpdateTarget: (e: React.FormEvent) => void;
  isEditingConstBudget: boolean;
  setIsEditingConstBudget: (editing: boolean) => void;
  tempConstBudget: string;
  setTempConstBudget: (val: string) => void;
  handleUpdateConstBudget: (e: React.FormEvent) => void;
  handlePayBill: (cardId: string, month: string, isPaid: boolean) => void;
  selectedMonth: string;
}

export default function OverviewTab({
  personalTarget,
  totalMonthlySpend,
  constructionBudget,
  totalConstructionSpent,
  netDebtValue,
  totalReceivables,
  totalPayables,
  cardBills,
  isEditingTarget,
  setIsEditingTarget,
  tempTarget,
  setTempTarget,
  handleUpdateTarget,
  isEditingConstBudget,
  setIsEditingConstBudget,
  tempConstBudget,
  setTempConstBudget,
  handleUpdateConstBudget,
  handlePayBill,
  selectedMonth
}: OverviewTabProps) {
  return (
    <div className="space-y-8">
      
      {/* Visual Widgets Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Monthly Personal Expenses target indicator */}
        <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold text-[color:var(--claude-ink-sub)] uppercase tracking-wider">Personal Expenses</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${totalMonthlySpend > personalTarget ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                {totalMonthlySpend > personalTarget ? 'Limit Breached' : 'On Track'}
              </span>
            </div>
            
            <div className="mt-4">
              <p className="text-xs text-[color:var(--claude-ink-sub)]">Spent this month</p>
              <h3 className="text-3xl font-sans font-semibold tracking-tight mt-1">₹{totalMonthlySpend.toLocaleString('en-IN')}</h3>
              
              {isEditingTarget ? (
                <form onSubmit={handleUpdateTarget} className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={tempTarget}
                    onChange={(e) => setTempTarget(e.target.value)}
                    className="bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-lg px-2 py-1 text-xs w-28 focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)] font-semibold"
                  />
                  <button type="submit" className="text-[10px] bg-[color:var(--claude-accent)] text-white px-2 py-1 rounded hover:bg-[color:var(--claude-accent)]/85 font-semibold">Save</button>
                  <button type="button" onClick={() => { setIsEditingTarget(false); setTempTarget(personalTarget.toString()); }} className="text-[10px] text-[color:var(--claude-ink-sub)] hover:text-[color:var(--claude-ink)] font-semibold">Cancel</button>
                </form>
              ) : (
                <p className="text-xs text-[color:var(--claude-ink-sub)] mt-1 flex items-center gap-1.5">
                  Target: <span className="font-semibold text-[color:var(--claude-ink)]">₹{personalTarget.toLocaleString('en-IN')}</span>
                  <button
                    onClick={() => { setIsEditingTarget(true); setTempTarget(personalTarget.toString()); }}
                    className="text-[10px] text-[color:var(--claude-accent)] hover:underline flex items-center gap-0.5 ml-1"
                    title="Edit monthly target"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full bg-[color:var(--claude-bg-strong)] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${totalMonthlySpend > personalTarget ? 'bg-rose-500' : 'bg-[color:var(--claude-accent)]'}`}
                style={{ width: `${Math.min((totalMonthlySpend / personalTarget) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2 text-[10px] text-[color:var(--claude-ink-sub)]">
              <span>{((totalMonthlySpend / personalTarget) * 100).toFixed(0)}% Utilized</span>
              <span>₹{Math.max(personalTarget - totalMonthlySpend, 0).toLocaleString('en-IN')} Left</span>
            </div>
          </div>
        </div>

        {/* House Construction target indicator */}
        <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold text-[color:var(--claude-ink-sub)] uppercase tracking-wider">House Construction</span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                Ongoing Project
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs text-[color:var(--claude-ink-sub)]">Paid Out So Far</p>
              <h3 className="text-3xl font-sans font-semibold tracking-tight mt-1">₹{totalConstructionSpent.toLocaleString('en-IN')}</h3>
              
              {isEditingConstBudget ? (
                <form onSubmit={handleUpdateConstBudget} className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={tempConstBudget}
                    onChange={(e) => setTempConstBudget(e.target.value)}
                    className="bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-lg px-2 py-1 text-xs w-32 focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)] font-semibold"
                  />
                  <button type="submit" className="text-[10px] bg-[color:var(--claude-accent)] text-white px-2 py-1 rounded hover:bg-[color:var(--claude-accent)]/85 font-semibold">Save</button>
                  <button type="button" onClick={() => { setIsEditingConstBudget(false); setTempConstBudget(constructionBudget.toString()); }} className="text-[10px] text-[color:var(--claude-ink-sub)] hover:text-[color:var(--claude-ink)] font-semibold">Cancel</button>
                </form>
              ) : (
                <p className="text-xs text-[color:var(--claude-ink-sub)] mt-1 flex items-center gap-1.5">
                  Budget: <span className="font-semibold text-[color:var(--claude-ink)]">₹{constructionBudget.toLocaleString('en-IN')}</span>
                  <button
                    onClick={() => { setIsEditingConstBudget(true); setTempConstBudget(constructionBudget.toString()); }}
                    className="text-[10px] text-[color:var(--claude-accent)] hover:underline flex items-center gap-0.5 ml-1"
                    title="Edit construction budget"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                </p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full bg-[color:var(--claude-bg-strong)] h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-700"
                style={{ width: `${Math.min((totalConstructionSpent / constructionBudget) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-2 text-[10px] text-[color:var(--claude-ink-sub)]">
              <span>{((totalConstructionSpent / constructionBudget) * 100).toFixed(1)}% Capital Utilized</span>
              <span>₹{(constructionBudget - totalConstructionSpent).toLocaleString('en-IN')} Remaining</span>
            </div>
          </div>
        </div>

        {/* Debts indicator */}
        <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold text-[color:var(--claude-ink-sub)] uppercase tracking-wider">Net Debt Position</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${netDebtValue >= 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'}`}>
                {netDebtValue >= 0 ? 'Net Surplus' : 'Net Deficit'}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs text-[color:var(--claude-ink-sub)]">Balance Ledger</p>
              <h3 className="text-3xl font-sans font-semibold tracking-tight mt-1 text-[color:var(--claude-ink)]">
                {netDebtValue >= 0 ? '+' : '-'}₹{Math.abs(netDebtValue).toLocaleString('en-IN')}
              </h3>
              <div className="grid grid-cols-2 mt-2 gap-2 text-xs border-t border-[color:var(--claude-border)] pt-2">
                <div>
                  <span className="text-[10px] text-[color:var(--claude-ink-sub)] block">Coming in:</span>
                  <span className="font-semibold text-emerald-600">₹{totalReceivables.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[color:var(--claude-ink-sub)] block">To give:</span>
                  <span className="font-semibold text-rose-600">₹{totalPayables.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Layout: Card Statement Bills at a Glance */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] rounded-2xl shadow-sm p-6">
          <h3 className="text-md font-serif font-semibold text-[color:var(--claude-ink)] border-b border-[color:var(--claude-border)] pb-3">
            Credit Card Bills due in next cycle
          </h3>
          <div className="divide-y divide-[color:var(--claude-border)]">
            {cardBills.length === 0 ? (
              <p className="text-xs text-[color:var(--claude-ink-sub)] py-8 text-center">No statements registered.</p>
            ) : (
              cardBills.map(bill => (
                <div key={bill.cardId} className="py-4 flex justify-between items-center gap-4">
                  <div>
                    <p className="text-sm font-semibold">{bill.cardName}</p>
                    <p className="text-xs text-[color:var(--claude-ink-sub)] mt-0.5">
                      Due date: <span className="font-medium text-[color:var(--claude-ink)]">{bill.dueDate}</span> | Statement: {bill.startDate} to {bill.endDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold tracking-tight tabular-nums">₹{bill.totalAmount.toLocaleString('en-IN')}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${bill.isPaid ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                        {bill.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                    
                    {!bill.isPaid && bill.totalAmount > 0 && (
                      <button
                        onClick={() => handlePayBill(bill.cardId, selectedMonth, true)}
                        className="px-3 py-1.5 text-[10px] font-semibold bg-[color:var(--claude-accent)] hover:bg-[color:var(--claude-accent)]/85 text-white rounded-lg transition"
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-serif font-semibold text-[color:var(--claude-ink)] border-b border-[color:var(--claude-border)] pb-3">
              Personal Target Adjuster
            </h3>
            <p className="text-xs text-[color:var(--claude-ink-sub)] mt-2">
              Configure your monthly expense threshold. When exceeded, indicators show warning states.
            </p>

            <form onSubmit={handleUpdateTarget} className="mt-4 space-y-4">
              <div>
                <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">
                  Monthly Target (₹)
                </label>
                <input
                  type="number"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(e.target.value)}
                  className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[color:var(--claude-accent)] text-white text-xs font-semibold rounded-xl hover:bg-[color:var(--claude-accent)]/90 transition"
              >
                Update Budget Target
              </button>
            </form>
          </div>

          <div className="border-t border-[color:var(--claude-border)] pt-4 mt-6">
            <h4 className="text-xs font-bold text-[color:var(--claude-ink)]">Quick Tip</h4>
            <p className="text-[11px] text-[color:var(--claude-ink-sub)] mt-1">
              Use the tabs above to log transactions, record construction contracts, manage debts, and view card breakdowns.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
