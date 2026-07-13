import React, { useState } from 'react';
import { DebtEntry, financeService } from '../services';

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
    if (!editContactName || !editAmount || !editDueDate || !editingDebtId) return;
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

      {/* Add Debt Modal */}
      {showAddDebtForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
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
                  className="flex-1 py-2.5 bg-[color:var(--claude-accent)] text-white text-xs font-semibold rounded-xl hover:bg-[color:var(--claude-accent)]/90 transition"
                >
                  Add Record
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDebtForm(false)}
                  className="flex-1 py-2.5 bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)] text-xs font-semibold rounded-xl border border-[color:var(--claude-border)] hover:bg-[color:var(--claude-bg-strong)]/80 transition"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
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
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
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
                  className="flex-1 py-2.5 bg-[color:var(--claude-accent)] text-white text-xs font-semibold rounded-xl hover:bg-[color:var(--claude-accent)]/90 transition"
                >
                  Save Specs
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingDebtId(null); }}
                  className="flex-1 py-2.5 bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)] text-xs font-semibold rounded-xl border border-[color:var(--claude-border)] hover:bg-[color:var(--claude-bg-strong)]/80 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
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
                .sort((a, b) => getStatusPriority(a.status) - getStatusPriority(b.status))
                .map(debt => renderDebtItem(debt))
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
                .sort((a, b) => getStatusPriority(a.status) - getStatusPriority(b.status))
                .map(debt => renderDebtItem(debt))
            ) : (
              <p className="text-xs text-[color:var(--claude-ink-sub)] text-center py-8">No payables registered.</p>
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
      <div key={debt.id} className="transition border-b border-[color:var(--claude-border)]/20 last:border-0">
        
        {/* Header summary line: Stack on mobile, row on larger screens */}
        <div 
          onClick={() => {
            setExpandedDebtId(isExpanded ? null : debt.id);
          }}
          className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-[color:var(--claude-bg-strong)]/30 transition ${
            debt.status === 'Paid' ? 'opacity-65' : ''
          }`}
        >
          {/* Top/Left Section */}
          <div className="space-y-1">
            <div className="flex items-center flex-wrap gap-2">
              <p className="font-semibold text-sm text-[color:var(--claude-ink)]">{debt.contactName}</p>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                debt.status === 'Paid'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : debt.status === 'Partial'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
              }`}>
                {debt.status}
              </span>
            </div>
            {debt.notes && (
              <p className="text-xs text-[color:var(--claude-ink-sub)] line-clamp-2 max-w-md">{debt.notes}</p>
            )}
            <p className="text-[10px] text-[color:var(--claude-ink-sub)] font-sans">
              Due Date: <span className="font-semibold">{debt.dueDate}</span>
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
                onClick={() => handleToggleDebtStatus(debt.id, debt.status === 'Paid' ? 'Paid' : 'Pending')}
                className="px-2.5 py-1 rounded bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] text-xs font-semibold hover:bg-[color:var(--claude-bg-strong)]/80 transition"
                title={debt.status === 'Paid' ? 'Reopen ledger' : 'Mark settled'}
              >
                {debt.status === 'Paid' ? 'Reopen' : 'Settle'}
              </button>
              <button
                onClick={() => handleDeleteDebt(debt.id)}
                className="px-2.5 py-1 text-rose-600 rounded bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] text-xs hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
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
                    className="text-[10px] text-[color:var(--claude-accent)] font-semibold hover:underline flex items-center gap-0.5"
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
                      <button type="submit" className="px-2.5 py-1 text-[10px] bg-[color:var(--claude-accent)] text-white font-semibold rounded hover:bg-[color:var(--claude-accent)]/90 transition">Save Payment</button>
                      <button type="button" onClick={() => setShowAddPaymentId(null)} className="px-2.5 py-1 text-[10px] bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)] font-semibold rounded hover:bg-slate-200 transition">Cancel</button>
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
                              <button type="submit" className="px-2.5 py-1 text-[10px] bg-[color:var(--claude-accent)] text-white font-semibold rounded hover:bg-[color:var(--claude-accent)]/90 transition">Save</button>
                              <button type="button" onClick={() => setEditingPaymentId(null)} className="px-2.5 py-1 text-[10px] bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)] font-semibold rounded hover:bg-slate-200 transition">Cancel</button>
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
                              className="text-[10px] px-2.5 py-1 rounded bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] text-[color:var(--claude-ink)] hover:bg-slate-200 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePartialPayment(debt.id, payment.id)}
                              className="text-[10px] px-2.5 py-1 rounded bg-[color:var(--claude-bg-strong)] border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
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
                    className="w-full py-2 bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl font-semibold hover:bg-slate-200/60 transition text-[11px] text-[color:var(--claude-ink)]"
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
