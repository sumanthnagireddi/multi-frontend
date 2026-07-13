import React, { useState } from 'react';
import { CardInfo, PersonalExpense, financeService } from '../services';

interface PersonalTabProps {
  cards: CardInfo[];
  personalTarget: number;
  isEditingTarget: boolean;
  setIsEditingTarget: (editing: boolean) => void;
  tempTarget: string;
  setTempTarget: (val: string) => void;
  handleUpdateTarget: (e: React.FormEvent) => void;
  monthlyPersonalExpenses: PersonalExpense[];
  filteredPersonalExpenses: PersonalExpense[];
  totalMonthlySpend: number;
  personalCategoryDistribution: Record<string, number>;
  userCardUsage: Record<string, number>;
  personalCategoryFilter: string;
  setPersonalCategoryFilter: (val: string) => void;
  personalCardFilter: string;
  setPersonalCardFilter: (val: string) => void;
  selectedMonth: string;
  cardMap: Map<string, CardInfo>;
  showAddPersonalForm: boolean;
  setShowAddPersonalForm: (val: boolean) => void;
  handleAddPersonalExpense: (e: React.FormEvent) => void;
  handleDeletePersonalExpense: (id: string) => void;
  // Form fields states
  peAmount: string;
  setPeAmount: (val: string) => void;
  peCategory: string;
  setPeCategory: (val: string) => void;
  peDate: string;
  setPeDate: (val: string) => void;
  peCardId: string;
  setPeCardId: (val: string) => void;
  peUsedBy: string;
  setPeUsedBy: (val: string) => void;
  peNotes: string;
  setPeNotes: (val: string) => void;
  onRefresh?: () => void;
  triggerToast?: (msg: string) => void;
}

export default function PersonalTab({
  cards,
  personalTarget,
  isEditingTarget,
  setIsEditingTarget,
  tempTarget,
  setTempTarget,
  handleUpdateTarget,
  monthlyPersonalExpenses,
  filteredPersonalExpenses,
  totalMonthlySpend,
  personalCategoryDistribution,
  userCardUsage,
  personalCategoryFilter,
  setPersonalCategoryFilter,
  personalCardFilter,
  setPersonalCardFilter,
  selectedMonth,
  cardMap,
  showAddPersonalForm,
  setShowAddPersonalForm,
  handleAddPersonalExpense,
  handleDeletePersonalExpense,
  peAmount,
  setPeAmount,
  peCategory,
  setPeCategory,
  peDate,
  setPeDate,
  peCardId,
  setPeCardId,
  peUsedBy,
  setPeUsedBy,
  peNotes,
  setPeNotes,
  onRefresh,
  triggerToast
}: PersonalTabProps) {
  // Editing states
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCategory, setEditCategory] = useState('Food');
  const [editCardId, setEditCardId] = useState('cash');
  const [editUsedBy, setEditUsedBy] = useState('Self');
  const [editNotes, setEditNotes] = useState('');

  // --- Handlers ---
  const handleOpenEdit = (exp: PersonalExpense) => {
    setEditingExpenseId(exp.id);
    setEditAmount(exp.amount.toString());
    setEditDate(exp.date);
    setEditCategory(exp.category);
    setEditCardId(exp.cardId);
    setEditUsedBy(exp.usedBy);
    setEditNotes(exp.notes || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAmount || !editDate || !editingExpenseId) return;
    try {
      await financeService.editPersonalExpense(editingExpenseId, {
        amount: parseFloat(editAmount),
        date: editDate,
        category: editCategory,
        cardId: editCardId,
        usedBy: editUsedBy,
        notes: editNotes,
      });
      setShowEditModal(false);
      setEditingExpenseId(null);
      if (triggerToast) triggerToast('Transaction updated successfully.');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-medium">Personal Monthly Expenses</h2>
          {isEditingTarget ? (
            <form onSubmit={handleUpdateTarget} className="mt-1 flex items-center gap-2">
              <input
                type="number"
                value={tempTarget}
                onChange={(e) => setTempTarget(e.target.value)}
                className="bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-lg px-2 py-1 text-xs w-32 focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)] font-semibold"
              />
              <button type="submit" className="text-[10px] bg-[color:var(--claude-accent)] text-white px-2 py-1 rounded hover:bg-[color:var(--claude-accent)]/85 font-semibold">Save</button>
              <button type="button" onClick={() => setIsEditingTarget(false)} className="text-[10px] text-[color:var(--claude-ink-sub)] hover:text-[color:var(--claude-ink)] font-semibold">Cancel</button>
            </form>
          ) : (
            <p className="text-xs text-[color:var(--claude-ink-sub)] mt-0.5 flex items-center gap-1.5">
              Spending Limit: <span className="font-semibold text-[color:var(--claude-ink)]">₹{personalTarget.toLocaleString('en-IN')}</span>
              <button
                onClick={() => { setIsEditingTarget(true); setTempTarget(personalTarget.toString()); }}
                className="text-[10px] text-[color:var(--claude-accent)] hover:underline flex items-center gap-0.5 ml-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
              </button>
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddPersonalForm(!showAddPersonalForm)}
            className="px-4 py-2 bg-[color:var(--claude-accent)] hover:bg-[color:var(--claude-accent)]/85 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Log Expense
          </button>
        </div>
      </div>

      {/* New Personal Expense Modal */}
      {showAddPersonalForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            
            <div className="px-6 py-4 border-b border-[color:var(--claude-border)] flex justify-between items-center bg-[color:var(--claude-bg-strong)]/40">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--claude-ink)]">New Expense Transaction</h3>
              <button 
                onClick={() => setShowAddPersonalForm(false)}
                className="text-[color:var(--claude-ink-sub)] hover:text-[color:var(--claude-ink)] p-1 rounded-lg transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleAddPersonalExpense} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500"
                    value={peAmount}
                    onChange={(e) => setPeAmount(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={peDate}
                    onChange={(e) => setPeDate(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Category</label>
                  <select
                    value={peCategory}
                    onChange={(e) => setPeCategory(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  >
                    {['Food', 'Groceries', 'Transport', 'Utilities', 'Shopping', 'Entertainment', 'Rent', 'Others'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Paid With</label>
                  <select
                    value={peCardId}
                    onChange={(e) => setPeCardId(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  >
                    <option value="cash">Cash (No Card)</option>
                    {cards.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (...{c.lastFour})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Used By</label>
                  <input
                    type="text"
                    placeholder="e.g. Self"
                    value={peUsedBy}
                    onChange={(e) => setPeUsedBy(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Notes / Description</label>
                <textarea
                  placeholder="Short description..."
                  value={peNotes}
                  onChange={(e) => setPeNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[color:var(--claude-accent)] text-white text-xs font-semibold rounded-xl hover:bg-[color:var(--claude-accent)]/90 transition"
                >
                  Save Transaction
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPersonalForm(false)}
                  className="flex-1 py-2.5 bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)] text-xs font-semibold rounded-xl border border-[color:var(--claude-border)] hover:bg-[color:var(--claude-bg-strong)]/80 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Personal Expense Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            
            <div className="px-6 py-4 border-b border-[color:var(--claude-border)] flex justify-between items-center bg-[color:var(--claude-bg-strong)]/40">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--claude-ink)]">Edit Expense Transaction</h3>
              <button 
                onClick={() => { setShowEditModal(false); setEditingExpenseId(null); }}
                className="text-[color:var(--claude-ink-sub)] hover:text-[color:var(--claude-ink)] p-1 rounded-lg transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  >
                    {['Food', 'Groceries', 'Transport', 'Utilities', 'Shopping', 'Entertainment', 'Rent', 'Others'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Paid With</label>
                  <select
                    value={editCardId}
                    onChange={(e) => setEditCardId(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  >
                    <option value="cash">Cash (No Card)</option>
                    {cards.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (...{c.lastFour})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Used By</label>
                  <input
                    type="text"
                    value={editUsedBy}
                    onChange={(e) => setEditUsedBy(e.target.value)}
                    className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Notes / Description</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)] resize-none"
                />
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
                  onClick={() => { setShowEditModal(false); setEditingExpenseId(null); }}
                  className="flex-1 py-2.5 bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)] text-xs font-semibold rounded-xl border border-[color:var(--claude-border)] hover:bg-[color:var(--claude-bg-strong)]/80 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Analytics Block */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* KPI Scorecard */}
        <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--claude-ink-sub)]">Spending Status</span>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between border-b border-[color:var(--claude-border)]/50 pb-2">
                <span className="text-[color:var(--claude-ink-sub)]">Monthly Budget Limit:</span>
                <span className="font-semibold text-[color:var(--claude-ink)]">₹{personalTarget.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-b border-[color:var(--claude-border)]/50 pb-2">
                <span className="text-[color:var(--claude-ink-sub)]">Total Month Spend:</span>
                <span className="font-semibold text-[color:var(--claude-ink)]">₹{totalMonthlySpend.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--claude-ink-sub)]">Difference / Remaining:</span>
                <span className={`font-semibold ${personalTarget - totalMonthlySpend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  ₹{(personalTarget - totalMonthlySpend).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[color:var(--claude-border)] pt-4">
            <div className="w-full bg-[color:var(--claude-bg-strong)] h-2 rounded-full overflow-hidden mb-1">
              <div
                className={`h-full rounded-full transition-all duration-300 ${totalMonthlySpend > personalTarget ? 'bg-rose-500' : 'bg-emerald-600'}`}
                style={{ width: `${Math.min((totalMonthlySpend / personalTarget) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-[9px] text-[color:var(--claude-ink-sub)] block">
              {((totalMonthlySpend / personalTarget) * 100).toFixed(1)}% of spending limit utilized.
            </span>
          </div>
        </div>

        {/* Categories Bar Chart */}
        <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--claude-ink)] border-b border-[color:var(--claude-border)] pb-3 mb-4">
              Category Distributions
            </h3>
            
            {Object.keys(personalCategoryDistribution).length === 0 ? (
              <p className="text-xs text-[color:var(--claude-ink-sub)] text-center py-8">No monthly logs found.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(personalCategoryDistribution)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([cat, amt]) => {
                    const pct = totalMonthlySpend > 0 ? (amt / totalMonthlySpend) * 100 : 0;
                    return (
                      <div key={cat} className="text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold">{cat}</span>
                          <span className="text-[color:var(--claude-ink-sub)]">₹{amt.toLocaleString('en-IN')} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-[color:var(--claude-bg-strong)] h-1 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-700 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Card Usage Distribution */}
        <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--claude-ink)] border-b border-[color:var(--claude-border)] pb-3 mb-4">
            Card Borrowing & Usage
          </h3>
          
          {Object.keys(userCardUsage).length === 0 ? (
            <p className="text-xs text-[color:var(--claude-ink-sub)] text-center py-8 font-sans">No monthly credit card logs.</p>
          ) : (
            <div className="space-y-3 font-sans text-xs">
              {Object.entries(userCardUsage)
                .sort((a, b) => b[1] - a[1])
                .map(([usr, amt]) => (
                  <div key={usr} className="flex justify-between border-b border-[color:var(--claude-border)]/40 pb-2 last:border-0">
                    <span className="font-semibold text-[color:var(--claude-ink)]">{usr}</span>
                    <span className="tabular-nums font-medium text-[color:var(--claude-ink-sub)]">₹{amt.toLocaleString('en-IN')}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

      </div>

      {/* Ledger filter panel & table */}
      <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[color:var(--claude-border)] flex flex-wrap gap-4 justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--claude-ink)]">Transactions Registry</h3>
            <p className="text-xs text-[color:var(--claude-ink-sub)] mt-0.5">Details of spending files mapped for {selectedMonth}</p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={personalCategoryFilter}
              onChange={(e) => setPersonalCategoryFilter(e.target.value)}
              className="bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-2.5 py-1.5 text-xs text-[color:var(--claude-ink)] focus:outline-none"
            >
              <option value="All">All Categories</option>
              {['Food', 'Groceries', 'Transport', 'Utilities', 'Shopping', 'Entertainment', 'Rent', 'Others'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={personalCardFilter}
              onChange={(e) => setPersonalCardFilter(e.target.value)}
              className="bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-2.5 py-1.5 text-xs text-[color:var(--claude-ink)] focus:outline-none"
            >
              <option value="All">All Cards</option>
              <option value="cash">Cash (No Card)</option>
              {cards.map(c => (
                <option key={c.id} value={c.id}>{c.name} (...{c.lastFour})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)] font-semibold border-b border-[color:var(--claude-border)] uppercase tracking-wider">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Paid With</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--claude-border)]/60">
              {filteredPersonalExpenses.length > 0 ? (
                filteredPersonalExpenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(exp => {
                    const card = exp.cardId === 'cash' ? null : cardMap.get(exp.cardId);
                    return (
                      <tr key={exp.id} className="hover:bg-[color:var(--claude-bg-strong)]/30 transition">
                        <td className="px-6 py-4 text-[color:var(--claude-ink-sub)]">{exp.date}</td>
                        <td className="px-6 py-4 font-medium text-[color:var(--claude-ink)]">
                          {exp.notes || <span className="text-[color:var(--claude-ink-sub)] italic text-[10px]">Unnamed Transaction</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-md font-medium bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)]">
                            {exp.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[color:var(--claude-ink-sub)]">
                          {card ? `${card.name} (...${card.lastFour})` : '💸 Cash'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/20 text-[color:var(--claude-accent)] font-semibold border border-[color:var(--claude-accent)]/20">
                            {exp.usedBy}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold tracking-tight tabular-nums text-[color:var(--claude-ink)]">
                          ₹{exp.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-1.5 justify-center">
                            <button
                              onClick={() => handleOpenEdit(exp)}
                              className="text-[color:var(--claude-accent)] hover:bg-[color:var(--claude-bg-strong)] p-1.5 rounded-lg transition"
                              title="Edit specifications"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button
                              onClick={() => handleDeletePersonalExpense(exp.id)}
                              className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                              title="Delete transaction record"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[color:var(--claude-ink-sub)]">
                    No matching transaction entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards List View */}
        <div className="block sm:hidden divide-y divide-[color:var(--claude-border)]/40">
          {filteredPersonalExpenses.length > 0 ? (
            filteredPersonalExpenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(exp => {
                const card = exp.cardId === 'cash' ? null : cardMap.get(exp.cardId);
                return (
                  <div key={exp.id} className="p-4 flex flex-col gap-2 bg-[color:var(--claude-card)]">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-xs text-[color:var(--claude-ink)]">{exp.notes || 'Unnamed Transaction'}</p>
                        <p className="text-[10px] text-[color:var(--claude-ink-sub)] mt-0.5">{exp.date}</p>
                      </div>
                      <span className="font-semibold text-xs tracking-tight tabular-nums text-[color:var(--claude-ink)]">
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] font-medium">
                        {exp.category}
                      </span>
                      <span className="text-[color:var(--claude-ink-sub)] font-sans">
                        {card ? `💳 ${card.name}` : '💸 Cash'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/20 text-[color:var(--claude-accent)] font-semibold">
                        {exp.usedBy}
                      </span>
                      <div className="flex gap-1.5 items-center">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="text-[color:var(--claude-accent)] p-1.5 rounded-lg hover:bg-[color:var(--claude-bg-strong)] transition"
                          title="Edit specs"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button
                          onClick={() => handleDeletePersonalExpense(exp.id)}
                          className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          ) : (
            <p className="text-xs text-[color:var(--claude-ink-sub)] text-center py-8">No matching transaction entries found.</p>
          )}
        </div>
      </div>

    </div>
  );
}
