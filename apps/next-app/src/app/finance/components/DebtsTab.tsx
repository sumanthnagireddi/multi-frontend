import React from 'react';
import { DebtEntry } from '../services';

interface DebtsTabProps {
  debts: DebtEntry[];
  totalReceivables: number;
  totalPayables: number;
  netDebtValue: number;
  showAddDebtForm: boolean;
  setShowAddDebtForm: (val: boolean) => void;
  handleAddDebt: (e: React.FormEvent) => void;
  handleToggleDebtStatus: (id: string, currentStatus: 'Pending' | 'Paid') => void;
  handleDeleteDebt: (id: string) => void;
  // Form fields
  dContactName: string;
  setDContactName: (val: string) => void;
  dAmount: string;
  setDAmount: (val: string) => void;
  dType: 'Receivable' | 'Payable';
  setDType: (val: 'Receivable' | 'Payable') => void;
  dDueDate: string;
  setDDueDate: (val: string) => void;
  dNotes: string;
  setDNotes: (val: string) => void;
}

export default function DebtsTab({
  debts,
  totalReceivables,
  totalPayables,
  netDebtValue,
  showAddDebtForm,
  setShowAddDebtForm,
  handleAddDebt,
  handleToggleDebtStatus,
  handleDeleteDebt,
  dContactName,
  setDContactName,
  dAmount,
  setDAmount,
  dType,
  setDType,
  dDueDate,
  setDDueDate,
  dNotes,
  setDNotes
}: DebtsTabProps) {
  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-medium">Debts & Receivables Ledger</h2>
          <p className="text-xs text-[color:var(--claude-ink-sub)]">Track money coming in (Receivables) and outgoing payments due (Payables)</p>
        </div>

        <button
          onClick={() => setShowAddDebtForm(!showAddDebtForm)}
          className="px-4 py-2 bg-[color:var(--claude-accent)] hover:bg-[color:var(--claude-accent)]/85 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Ledger Item
        </button>
      </div>

      {/* Add Debt Form */}
      {showAddDebtForm && (
        <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] p-6 rounded-2xl shadow-sm max-w-xl">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--claude-ink)] mb-4">Log Debt Ledger Record</h3>
          <form onSubmit={handleAddDebt} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amit Sharma"
                  value={dContactName}
                  onChange={(e) => setDContactName(e.target.value)}
                  className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5000"
                  value={dAmount}
                  onChange={(e) => setDAmount(e.target.value)}
                  className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Ledger Type</label>
                <select
                  value={dType}
                  onChange={(e) => setDType(e.target.value as any)}
                  className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                >
                  <option value="Receivable">Receivable (Coming to me)</option>
                  <option value="Payable">Payable (I need to give)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Target Due Date *</label>
                <input
                  type="date"
                  required
                  value={dDueDate}
                  onChange={(e) => setDDueDate(e.target.value)}
                  className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Notes</label>
              <textarea
                placeholder="Purpose, status notes..."
                value={dNotes}
                onChange={(e) => setDNotes(e.target.value)}
                rows={2}
                className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)] resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-[color:var(--claude-accent)] text-white text-xs font-semibold rounded-xl hover:bg-[color:var(--claude-accent)]/90 transition"
              >
                Add Record
              </button>
              <button
                type="button"
                onClick={() => setShowAddDebtForm(false)}
                className="flex-1 py-2 bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)] text-xs font-semibold rounded-xl border border-[color:var(--claude-border)] hover:bg-[color:var(--claude-bg-strong)]/80 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] p-6 rounded-2xl shadow-sm text-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--claude-ink-sub)]">Total Owed To Me</span>
          <h3 className="text-3xl font-sans font-semibold tracking-tight mt-2 text-emerald-600">₹{totalReceivables.toLocaleString('en-IN')}</h3>
          <p className="text-[10px] text-[color:var(--claude-ink-sub)] mt-1">Pending incoming assets</p>
        </div>

        <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] p-6 rounded-2xl shadow-sm text-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--claude-ink-sub)]">Total I Need To Pay</span>
          <h3 className="text-3xl font-sans font-semibold tracking-tight mt-2 text-rose-600">₹{totalPayables.toLocaleString('en-IN')}</h3>
          <p className="text-[10px] text-[color:var(--claude-ink-sub)] mt-1">Pending payables obligations</p>
        </div>

        <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] p-6 rounded-2xl shadow-sm text-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--claude-ink-sub)]">Ledger Net Worth</span>
          <h3 className={`text-3xl font-sans font-semibold tracking-tight mt-2 ${netDebtValue >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {netDebtValue >= 0 ? '+' : '-'}₹{Math.abs(netDebtValue).toLocaleString('en-IN')}
          </h3>
          <p className="text-[10px] text-[color:var(--claude-ink-sub)] mt-1">{netDebtValue >= 0 ? 'Surplus balance' : 'Deficit liability'}</p>
        </div>
      </div>

      {/* Ledger split cards */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Receivables Ledger (Coming to me) */}
        <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-emerald-50/20 border-b border-[color:var(--claude-border)]">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--claude-ink)]">
              Receivables (Coming to me)
            </h3>
          </div>
          
          <div className="divide-y divide-[color:var(--claude-border)]/50">
            {debts.filter(d => d.type === 'Receivable').length > 0 ? (
              debts
                .filter(d => d.type === 'Receivable')
                .sort((a, b) => a.status === 'Pending' ? -1 : 1)
                .map(debt => (
                  <div key={debt.id} className={`p-4 flex justify-between items-center gap-4 transition ${debt.status === 'Paid' ? 'opacity-50' : ''}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-xs text-[color:var(--claude-ink)]">{debt.contactName}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          debt.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {debt.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-[color:var(--claude-ink-sub)] mt-0.5">{debt.notes}</p>
                      <p className="text-[9px] text-[color:var(--claude-ink-sub)] font-sans">Due date: {debt.dueDate}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="font-semibold tracking-tight tabular-nums text-xs text-emerald-600">₹{debt.amount.toLocaleString('en-IN')}</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleToggleDebtStatus(debt.id, debt.status)}
                          className="p-1 rounded bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] text-[9px] font-semibold hover:bg-[color:var(--claude-bg-strong)]/80 transition"
                          title={debt.status === 'Pending' ? 'Mark Settle' : 'Mark Unsettle'}
                        >
                          {debt.status === 'Pending' ? 'Settle' : 'Reopen'}
                        </button>
                        <button
                          onClick={() => handleDeleteDebt(debt.id)}
                          className="p-1 text-rose-600 rounded bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] text-[9px] hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                          title="Delete entry"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-xs text-[color:var(--claude-ink-sub)] text-center py-8">No receivables registered.</p>
            )}
          </div>
        </div>

        {/* Payables Ledger (I need to give) */}
        <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-rose-50/20 border-b border-[color:var(--claude-border)]">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--claude-ink)]">
              Payables (I need to give)
            </h3>
          </div>

          <div className="divide-y divide-[color:var(--claude-border)]/50">
            {debts.filter(d => d.type === 'Payable').length > 0 ? (
              debts
                .filter(d => d.type === 'Payable')
                .sort((a, b) => a.status === 'Pending' ? -1 : 1)
                .map(debt => (
                  <div key={debt.id} className={`p-4 flex justify-between items-center gap-4 transition ${debt.status === 'Paid' ? 'opacity-50' : ''}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-xs text-[color:var(--claude-ink)]">{debt.contactName}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          debt.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}>
                          {debt.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-[color:var(--claude-ink-sub)] mt-0.5">{debt.notes}</p>
                      <p className="text-[9px] text-[color:var(--claude-ink-sub)] font-sans">Due date: {debt.dueDate}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold tracking-tight tabular-nums text-xs text-rose-600">₹{debt.amount.toLocaleString('en-IN')}</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleToggleDebtStatus(debt.id, debt.status)}
                          className="p-1 rounded bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] text-[9px] font-semibold hover:bg-[color:var(--claude-bg-strong)]/80 transition"
                          title={debt.status === 'Pending' ? 'Mark Paid' : 'Mark Unpaid'}
                        >
                          {debt.status === 'Pending' ? 'Paid' : 'Reopen'}
                        </button>
                        <button
                          onClick={() => handleDeleteDebt(debt.id)}
                          className="p-1 text-rose-600 rounded bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] text-[9px] hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                          title="Delete entry"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-xs text-[color:var(--claude-ink-sub)] text-center py-8">No payables registered.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
