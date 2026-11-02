import React, { useState } from 'react';
import { DebtEntry, financeService } from '../services/finance.service';

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
  onRefresh?: () => void;
  triggerToast?: (msg: string) => void;
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
  setDNotes,
  onRefresh,
  triggerToast
}: DebtsTabProps) {
  // Toggle expanded state
  const [expandedDebtId, setExpandedDebtId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Partial' | 'Paid'>('All');
  const [busyDebtId, setBusyDebtId] = useState<string | null>(null);

  // New partial payment record fields
  const [showAddPaymentId, setShowAddPaymentId] = useState<string | null>(null);
  const [pAmount, setPAmount] = useState('');
  const [pDate, setPDate] = useState(new Date().toISOString().split('T')[0]);
  const [pNotes, setPNotes] = useState('');

  // Editing main debt entry fields
  const [editingDebtId, setEditingDebtId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editContactName, setEditContactName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<'Receivable' | 'Payable'>('Receivable');
  const [editDueDate, setEditDueDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Editing partial payment fields
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [editPAmount, setEditPAmount] = useState('');
  const [editPDate, setEditPDate] = useState('');
  const [editPNotes, setEditPNotes] = useState('');

  // Status sorting priority: Pending (1) -> Partial (2) -> Paid (3)
  const getStatusPriority = (status: string) => {
    if (status === 'Pending') return 1;
    if (status === 'Partial') return 2;
    if (status === 'Paid') return 3;
    return 4;
  };

  const matchesFilters = (debt: DebtEntry) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      debt.contactName.toLowerCase().includes(query) ||
      debt.notes.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'All' || debt.status === statusFilter;
    return matchesSearch && matchesStatus;
  };

  // --- Handlers ---
  const handleOpenEditMain = (debt: DebtEntry) => {
    setEditingDebtId(debt.id);
    setEditContactName(debt.contactName);
    setEditAmount(debt.amount.toString());
    setEditType(debt.type);
    setEditDueDate(debt.dueDate);
    setEditNotes(debt.notes);
    setShowEditModal(true);
  };

  const handleSaveEditMain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContactName || !editAmount || !editingDebtId) return;
    try {
      await financeService.editDebt(editingDebtId, {
        contactName: editContactName,
        amount: parseFloat(editAmount),
        type: editType,
        dueDate: editDueDate,
        notes: editNotes,
      });
      setShowEditModal(false);
      setEditingDebtId(null);
      if (triggerToast) triggerToast('Debt details updated successfully.');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPartialPayment = async (e: React.FormEvent, debtId: string) => {
    e.preventDefault();
    if (!pAmount || !pDate) return;
    try {
      await financeService.addPartialPayment(debtId, {
        amount: parseFloat(pAmount),
        date: pDate,
        notes: pNotes,
      });
      setPAmount('');
      setPNotes('');
      setShowAddPaymentId(null);
      if (triggerToast) triggerToast('Partial payment logged successfully.');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEditPayment = (payment: any) => {
    setEditingPaymentId(payment.id);
    setEditPAmount(payment.amount.toString());
    setEditPDate(payment.date);
    setEditPNotes(payment.notes || '');
  };

  const handleSaveEditPayment = async (e: React.FormEvent, debtId: string, paymentId: string) => {
    e.preventDefault();
    if (!editPAmount || !editPDate) return;
    try {
      await financeService.editPartialPayment(debtId, paymentId, {
        amount: parseFloat(editPAmount),
        date: editPDate,
        notes: editPNotes,
      });
      setEditingPaymentId(null);
      if (triggerToast) triggerToast('Partial payment updated.');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePartialPayment = async (debtId: string, paymentId: string) => {
    if (!confirm('Revert/delete this partial payment?')) return;
    try {
      await financeService.deletePartialPayment(debtId, paymentId);
      if (triggerToast) triggerToast('Partial payment removed.');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--claude-accent)]">Money ledger</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[color:var(--claude-ink)]">Debts & receivables</h2>
          <p className="mt-1 text-xs text-[color:var(--claude-ink-sub)]">Everything you owe and all money owed to you.</p>
        </div>

        <button
          onClick={() => setShowAddDebtForm(!showAddDebtForm)}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[color:var(--claude-accent)] px-4 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Ledger Item
        </button>
      </div>

      {/* Add Debt Modal */}
      {showAddDebtForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            
            <div className="px-6 py-4 border-b border-[color:var(--claude-border)] flex justify-between items-center bg-[color:var(--claude-bg-strong)]/40">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--claude-ink)]">Log Debt Ledger Record</h3>
              <button 
                onClick={() => setShowAddDebtForm(false)}
                className="text-[color:var(--claude-ink-sub)] hover:text-[color:var(--claude-ink)] p-1 rounded-lg transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleAddDebt} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Target Due Date</label>
                  <input
                    type="date"
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
                  className="flex-1 cursor-pointer rounded-xl bg-[color:var(--claude-accent)] py-2.5 text-xs font-medium text-white transition hover:brightness-95 active:scale-[0.99]"
                >
                  Add Record
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDebtForm(false)}
                  className="flex-1 cursor-pointer rounded-xl bg-[color:var(--claude-bg-strong)] py-2.5 text-xs font-medium text-[color:var(--claude-ink-sub)] transition hover:brightness-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Main Debt Specs Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            
            <div className="px-6 py-4 border-b border-[color:var(--claude-border)] flex justify-between items-center bg-[color:var(--claude-bg-strong)]/40">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--claude-ink)]">Edit Debt Specifications</h3>
              <button 
                onClick={() => { setShowEditModal(false); setEditingDebtId(null); }}
                className="text-[color:var(--claude-ink-sub)] hover:text-[color:var(--claude-ink)] p-1 rounded-lg transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleSaveEditMain} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={editContactName}
                    onChange={e => setEditContactName(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Ledger Type</label>
                  <select
                    value={editType}
                    onChange={e => setEditType(e.target.value as any)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="Receivable">Receivable</option>
                    <option value="Payable">Payable</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={e => setEditDueDate(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Notes</label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 cursor-pointer rounded-xl bg-[color:var(--claude-accent)] py-2.5 text-xs font-medium text-white transition hover:brightness-95 active:scale-[0.99]"
                >
                  Save Specs
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingDebtId(null); }}
                  className="flex-1 cursor-pointer rounded-xl bg-[color:var(--claude-bg-strong)] py-2.5 text-xs font-medium text-[color:var(--claude-ink-sub)] transition hover:brightness-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">To receive</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-400">₹{totalReceivables.toLocaleString('en-IN')}</h3>
          <p className="mt-1 text-[11px] text-emerald-700/70 dark:text-emerald-400/70">{debts.filter(d => d.type === 'Receivable' && d.status !== 'Paid').length} active receivables</p>
        </div>

        <div className="rounded-2xl border border-rose-200/60 bg-rose-50/70 p-5 dark:border-rose-900/40 dark:bg-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">To pay</span>
            <span className="h-2 w-2 rounded-full bg-rose-500" />
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-rose-700 dark:text-rose-400">₹{totalPayables.toLocaleString('en-IN')}</h3>
          <p className="mt-1 text-[11px] text-rose-700/70 dark:text-rose-400/70">{debts.filter(d => d.type === 'Payable' && d.status !== 'Paid').length} active payables</p>
        </div>

        <div className="rounded-2xl border border-[color:var(--claude-border)] bg-[color:var(--claude-card)] p-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--claude-ink-sub)]">Net position</span>
          <h3 className={`mt-3 text-2xl font-semibold tracking-tight ${netDebtValue >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
            {netDebtValue >= 0 ? '+' : '-'}₹{Math.abs(netDebtValue).toLocaleString('en-IN')}
          </h3>
          <p className="mt-1 text-[11px] text-[color:var(--claude-ink-sub)]">{netDebtValue >= 0 ? 'Overall surplus' : 'Overall liability'}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[color:var(--claude-border)] bg-[color:var(--claude-card)] p-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--claude-ink-sub)]" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search contact or notes"
            className="h-10 w-full rounded-xl border-0 bg-[color:var(--claude-bg-strong)]/60 pl-9 pr-3 text-xs text-[color:var(--claude-ink)] outline-none transition focus:bg-[color:var(--claude-bg-strong)] focus:ring-2 focus:ring-[color:var(--claude-accent)]/20"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-[color:var(--claude-bg-strong)]/60 p-1">
          {(['All', 'Pending', 'Partial', 'Paid'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-semibold transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-[color:var(--claude-card)] text-[color:var(--claude-ink)] shadow-sm'
                  : 'text-[color:var(--claude-ink-sub)] hover:text-[color:var(--claude-ink)]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger split cards */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Receivables Ledger (Coming to me) */}
        <div className="overflow-hidden rounded-2xl border border-[color:var(--claude-border)] bg-[color:var(--claude-card)]">
          <div className="flex items-center justify-between border-b border-[color:var(--claude-border)] px-5 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Receivables</p>
              <h3 className="mt-0.5 text-sm font-semibold text-[color:var(--claude-ink)]">Money coming to you</h3>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              {debts.filter(d => d.type === 'Receivable').length}
            </span>
          </div>
          
          <div className="divide-y divide-[color:var(--claude-border)]/50">
            {debts.filter(d => d.type === 'Receivable' && matchesFilters(d)).length > 0 ? (
              debts
                .filter(d => d.type === 'Receivable')
                .filter(matchesFilters)
                .sort((a, b) => getStatusPriority(a.status) - getStatusPriority(b.status))
                .map(debt => renderDebtItem(debt))
            ) : (
              <div className="px-5 py-10 text-center">
                <p className="text-xs font-medium text-[color:var(--claude-ink-sub)]">No matching receivables</p>
                <p className="mt-1 text-[10px] text-[color:var(--claude-ink-sub)]">Try changing the search or status.</p>
              </div>
            )}
          </div>
        </div>

        {/* Payables Ledger (I need to give) */}
        <div className="overflow-hidden rounded-2xl border border-[color:var(--claude-border)] bg-[color:var(--claude-card)]">
          <div className="flex items-center justify-between border-b border-[color:var(--claude-border)] px-5 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Payables</p>
              <h3 className="mt-0.5 text-sm font-semibold text-[color:var(--claude-ink)]">Money you need to pay</h3>
            </div>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
              {debts.filter(d => d.type === 'Payable').length}
            </span>
          </div>

          <div className="divide-y divide-[color:var(--claude-border)]/50">
            {debts.filter(d => d.type === 'Payable' && matchesFilters(d)).length > 0 ? (
              debts
                .filter(d => d.type === 'Payable')
                .filter(matchesFilters)
                .sort((a, b) => getStatusPriority(a.status) - getStatusPriority(b.status))
                .map(debt => renderDebtItem(debt))
            ) : (
              <div className="px-5 py-10 text-center">
                <p className="text-xs font-medium text-[color:var(--claude-ink-sub)]">No matching payables</p>
                <p className="mt-1 text-[10px] text-[color:var(--claude-ink-sub)]">Try changing the search or status.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );

  // Helper to render individual debt items (expanded / collapsed)
  function renderDebtItem(debt: DebtEntry) {
    const isExpanded = expandedDebtId === debt.id;
    const progressPercent = Math.min(Math.round(((debt.paidAmount || 0) / debt.amount) * 100), 100);

    return (
      <div key={debt.id} className="border-b border-[color:var(--claude-border)]/40 transition-colors last:border-0">
        
        {/* Header summary line: Stack on mobile, row on larger screens */}
        <div 
          onClick={() => {
            setExpandedDebtId(isExpanded ? null : debt.id);
          }}
          className="flex cursor-pointer flex-col gap-3 p-5 transition-all duration-200 hover:bg-[color:var(--claude-bg-strong)]/40 sm:flex-row sm:items-center sm:justify-between"
        >
          {/* Top/Left Section */}
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center flex-wrap gap-2">
              <p className="font-semibold text-sm text-[color:var(--claude-ink)]">{debt.contactName}</p>
              <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                debt.status === 'Paid'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : debt.status === 'Partial'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
              }`}>
                {debt.status}
              </span>
            </div>
            {debt.notes && (
              <p className="line-clamp-1 max-w-md text-xs text-[color:var(--claude-ink-sub)]">{debt.notes}</p>
            )}
            <p className="text-[10px] text-[color:var(--claude-ink-sub)] font-sans">
              {debt.dueDate ? <>Due <span className="font-semibold text-[color:var(--claude-ink)]">{debt.dueDate}</span></> : <span>No due date</span>}
              {debt.paidAmount > 0 && debt.status !== 'Paid' && (
                <span className="ml-2 font-medium text-[color:var(--claude-accent)]">
                  Paid ₹{(debt.paidAmount || 0).toLocaleString('en-IN')} ({progressPercent}%)
                </span>
              )}
            </p>
          </div>
          
          {/* Bottom/Right Section: flex-row layout for amount + actions */}
          <div 
            className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-[color:var(--claude-border)]/20"
            onClick={e => e.stopPropagation()}
          >
            <div className="sm:text-right">
              <span className={`font-semibold tracking-tight tabular-nums text-sm ${
                debt.type === 'Receivable' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                ₹{debt.amount.toLocaleString('en-IN')}
              </span>
              {debt.status !== 'Paid' && debt.paidAmount > 0 && (
                <span className="block text-[10px] text-[color:var(--claude-ink-sub)]">
                  Owed: ₹{(debt.amount - debt.paidAmount).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            
            <div className="flex gap-1.5">
              <button
                onClick={async () => {
                  setBusyDebtId(debt.id);
                  await handleToggleDebtStatus(debt.id, debt.status === 'Paid' ? 'Paid' : 'Pending');
                  setBusyDebtId(null);
                }}
                disabled={busyDebtId === debt.id}
                className="cursor-pointer rounded px-2.5 py-1 text-xs font-medium bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink)] transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60 dark:hover:brightness-125"
                title={debt.status === 'Paid' ? 'Reopen ledger' : 'Mark settled'}
              >
                {busyDebtId === debt.id ? 'Saving...' : debt.status === 'Paid' ? 'Reopen' : 'Settle'}
              </button>
              <button
                onClick={() => handleDeleteDebt(debt.id)}
                className="cursor-pointer rounded px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/60"
                title="Delete entry"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Panel Details */}
        {isExpanded && (
          <div className="px-4 sm:px-6 pb-6 pt-2 bg-[color:var(--claude-bg-strong)]/15 border-t border-[color:var(--claude-border)]/30 space-y-4">
            
            {/* Progress indicator */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[color:var(--claude-ink-sub)] font-medium">
                <span>Payment Progress</span>
                <span>₹{(debt.paidAmount || 0).toLocaleString('en-IN')} / ₹{debt.amount.toLocaleString('en-IN')} ({progressPercent}%)</span>
              </div>
              <div className="w-full bg-[color:var(--claude-bg-strong)] h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    debt.type === 'Receivable' ? 'bg-emerald-600' : 'bg-rose-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Split specifications grid - stack on small screens, side-by-side on md and up */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
              
              {/* Left Column: Sub-partial entries list */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex justify-between items-center border-b border-[color:var(--claude-border)]/40 pb-1.5">
                  <h4 className="text-xs font-bold text-[color:var(--claude-ink)]">Partial Payments History</h4>
                  <button
                    onClick={() => {
                      setShowAddPaymentId(showAddPaymentId === debt.id ? null : debt.id);
                      setPAmount('');
                      setPNotes('');
                    }}
                    className="cursor-pointer rounded px-2 py-1 text-xs font-medium text-[color:var(--claude-accent)] transition hover:bg-[color:var(--claude-bg-strong)]"
                  >
                    + Record Sub-Payment
                  </button>
                </div>

                {/* Inline form to record sub-payment */}
                {showAddPaymentId === debt.id && (
                  <form onSubmit={e => handleAddPartialPayment(e, debt.id)} className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] p-4 rounded-xl space-y-3 shadow-xs">
                    <p className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)]">Log Sub-Payment</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] text-[color:var(--claude-ink-sub)] block">Amount (₹) *</label>
                        <input
                          type="number"
                          required
                          value={pAmount}
                          onChange={e => setPAmount(e.target.value)}
                          className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-lg px-2 py-1 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-[color:var(--claude-ink-sub)] block">Date *</label>
                        <input
                          type="date"
                          required
                          value={pDate}
                          onChange={e => setPDate(e.target.value)}
                          className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-lg px-2 py-1 text-xs focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] text-[color:var(--claude-ink-sub)] block">Notes</label>
                      <input
                        type="text"
                        placeholder="Receipt reference, account target..."
                        value={pNotes}
                        onChange={e => setPNotes(e.target.value)}
                        className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-lg px-2 py-1 text-xs focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button type="submit" className="cursor-pointer rounded px-2.5 py-1.5 text-xs font-medium bg-[color:var(--claude-accent)] text-white transition hover:brightness-95">Save Payment</button>
                      <button type="button" onClick={() => setShowAddPaymentId(null)} className="cursor-pointer rounded px-2.5 py-1.5 text-xs font-medium bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)] transition hover:brightness-95">Cancel</button>
                    </div>
                  </form>
                )}

                {/* Sub-entries loop */}
                <div className="space-y-2">
                  {!debt.partialPayments || debt.partialPayments.length === 0 ? (
                    <p className="text-[11px] text-[color:var(--claude-ink-sub)] italic">No partial payments recorded.</p>
                  ) : (
                    debt.partialPayments.map(payment => {
                      const isEditingPayment = editingPaymentId === payment.id;

                      if (isEditingPayment) {
                        return (
                          <form 
                            key={payment.id} 
                            onSubmit={e => handleSaveEditPayment(e, debt.id, payment.id)}
                            className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] p-3 rounded-xl space-y-3"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[9px] block text-[color:var(--claude-ink-sub)]">Amount (₹)</label>
                                <input
                                  type="number"
                                  required
                                  value={editPAmount}
                                  onChange={e => setEditPAmount(e.target.value)}
                                  className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-lg px-2 py-1 text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] block text-[color:var(--claude-ink-sub)]">Date</label>
                                <input
                                  type="date"
                                  required
                                  value={editPDate}
                                  onChange={e => setEditPDate(e.target.value)}
                                  className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-lg px-2 py-1 text-xs"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[9px] block text-[color:var(--claude-ink-sub)]">Notes</label>
                              <input
                                type="text"
                                value={editPNotes}
                                onChange={e => setEditPNotes(e.target.value)}
                                className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-lg px-2 py-1 text-xs"
                              />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button type="submit" className="cursor-pointer rounded px-2.5 py-1.5 text-xs font-medium bg-[color:var(--claude-accent)] text-white transition hover:brightness-95">Save</button>
                              <button type="button" onClick={() => setEditingPaymentId(null)} className="cursor-pointer rounded px-2.5 py-1.5 text-xs font-medium bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)] transition hover:brightness-95">Cancel</button>
                            </div>
                          </form>
                        );
                      }

                      return (
                        <div key={payment.id} className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)]/50 p-3 rounded-xl flex justify-between items-center text-xs gap-3">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-[color:var(--claude-ink)]">₹{payment.amount.toLocaleString('en-IN')}</span>
                              <span className="text-[10px] text-[color:var(--claude-ink-sub)] font-sans">{payment.date}</span>
                            </div>
                            {payment.notes && <p className="text-[10px] text-[color:var(--claude-ink-sub)] mt-0.5">{payment.notes}</p>}
                          </div>
                          
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleOpenEditPayment(payment)}
                              className="cursor-pointer rounded px-2.5 py-1 text-xs font-medium bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink)] transition hover:brightness-95"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePartialPayment(debt.id, payment.id)}
                              className="cursor-pointer rounded px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 transition hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Edit main debt specs (trigger Modal instead of inline form) */}
              <div className="md:border-l border-[color:var(--claude-border)]/40 md:pl-6 border-t md:border-t-0 pt-6 md:pt-0 space-y-3">
                <h4 className="text-xs font-bold text-[color:var(--claude-ink)] border-b border-[color:var(--claude-border)]/40 pb-1.5">
                  Ledger Specifications
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-[color:var(--claude-ink-sub)] block">Main Ledger Notes:</span>
                    <p className="font-medium bg-[color:var(--claude-bg-strong)]/40 p-2.5 rounded-lg border border-[color:var(--claude-border)]/50 italic text-[11px]">{debt.notes || 'No description logged.'}</p>
                  </div>
                  <button
                    onClick={() => handleOpenEditMain(debt)}
                    className="w-full cursor-pointer rounded-xl bg-[color:var(--claude-bg-strong)] py-2 text-xs font-medium text-[color:var(--claude-ink)] transition hover:brightness-95"
                  >
                    Edit Main Specs
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    );
  }
}
