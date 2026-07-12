import React from 'react';
import { ConstructionExpense } from '../services';

interface ConstructionTabProps {
  constructionExpenses: ConstructionExpense[];
  constructionBudget: number;
  totalConstructionSpent: number;
  totalConstructionPending: number;
  constructionCategoryDistribution: Record<string, number>;
  isEditingConstBudget: boolean;
  setIsEditingConstBudget: (editing: boolean) => void;
  tempConstBudget: string;
  setTempConstBudget: (val: string) => void;
  handleUpdateConstBudget: (e: React.FormEvent) => void;
  showAddConstForm: boolean;
  setShowAddConstForm: (val: boolean) => void;
  handleAddConstructionExpense: (e: React.FormEvent) => void;
  handleToggleConstStatus: (id: string, currentStatus: 'Paid' | 'Pending') => void;
  handleDeleteConstExpense: (id: string) => void;
  // Form fields
  ceAmount: string;
  setCeAmount: (val: string) => void;
  ceCategory: string;
  setCeCategory: (val: string) => void;
  ceDate: string;
  setCeDate: (val: string) => void;
  ceVendor: string;
  setCeVendor: (val: string) => void;
  ceNotes: string;
  setCeNotes: (val: string) => void;
  ceStatus: 'Paid' | 'Pending';
  setCeStatus: (val: 'Paid' | 'Pending') => void;
}

export default function ConstructionTab({
  constructionExpenses,
  constructionBudget,
  totalConstructionSpent,
  totalConstructionPending,
  constructionCategoryDistribution,
  isEditingConstBudget,
  setIsEditingConstBudget,
  tempConstBudget,
  setTempConstBudget,
  handleUpdateConstBudget,
  showAddConstForm,
  setShowAddConstForm,
  handleAddConstructionExpense,
  handleToggleConstStatus,
  handleDeleteConstExpense,
  ceAmount,
  setCeAmount,
  ceCategory,
  setCeCategory,
  ceDate,
  setCeDate,
  ceVendor,
  setCeVendor,
  ceNotes,
  setCeNotes,
  ceStatus,
  setCeStatus
}: ConstructionTabProps) {
  return (
    <div className="space-y-6">
      
      {/* Header summary & Budget details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-medium">House Construction Budget</h2>
          {isEditingConstBudget ? (
            <form onSubmit={handleUpdateConstBudget} className="mt-1 flex items-center gap-2">
              <input
                type="number"
                value={tempConstBudget}
                onChange={(e) => setTempConstBudget(e.target.value)}
                className="bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-lg px-2 py-1 text-xs w-32 focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)] font-semibold"
              />
              <button type="submit" className="text-[10px] bg-[color:var(--claude-accent)] text-white px-2 py-1 rounded hover:bg-[color:var(--claude-accent)]/85 font-semibold">Save</button>
              <button type="button" onClick={() => setIsEditingConstBudget(false)} className="text-[10px] text-[color:var(--claude-ink-sub)] hover:text-[color:var(--claude-ink)] font-semibold">Cancel</button>
            </form>
          ) : (
            <p className="text-xs text-[color:var(--claude-ink-sub)] mt-0.5 flex items-center gap-1.5">
              Total Project Budget: <span className="font-semibold text-[color:var(--claude-ink)]">₹{constructionBudget.toLocaleString('en-IN')}</span>
              <button
                onClick={() => { setIsEditingConstBudget(true); setTempConstBudget(constructionBudget.toString()); }}
                className="text-[10px] text-[color:var(--claude-accent)] hover:underline flex items-center gap-0.5 ml-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
              </button>
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddConstForm(!showAddConstForm)}
            className="px-4 py-2 bg-[color:var(--claude-accent)] hover:bg-[color:var(--claude-accent)]/85 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Log Project Expense
          </button>
        </div>
      </div>

      {/* Add Construction Expense Form */}
      {showAddConstForm && (
        <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] p-6 rounded-2xl shadow-sm max-w-xl">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--claude-ink)] mb-4">Log Construction Expense</h3>
          <form onSubmit={handleAddConstructionExpense} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Amount Paid/Contracted (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 75000"
                  value={ceAmount}
                  onChange={(e) => setCeAmount(e.target.value)}
                  className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Transaction Date *</label>
                <input
                  type="date"
                  required
                  value={ceDate}
                  onChange={(e) => setCeDate(e.target.value)}
                  className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Material / Category</label>
                <select
                  value={ceCategory}
                  onChange={(e) => setCeCategory(e.target.value)}
                  className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                >
                  {['Cement', 'Steel', 'Labor', 'Plumbing', 'Electrical', 'Interior', 'Architect', 'Permits', 'Others'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Vendor / Recipient *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ultratech Cement"
                  value={ceVendor}
                  onChange={(e) => setCeVendor(e.target.value)}
                  className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Status</label>
                <select
                  value={ceStatus}
                  onChange={(e) => setCeStatus(e.target.value as any)}
                  className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)]"
                >
                  <option value="Paid">Fully Paid</option>
                  <option value="Pending">Pending / Owed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase text-[color:var(--claude-ink-sub)] block mb-1">Notes / Item Specifications</label>
              <textarea
                placeholder="e.g. Grade 43 Cement, 200 bags..."
                value={ceNotes}
                onChange={(e) => setCeNotes(e.target.value)}
                rows={2}
                className="w-full bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--claude-accent)] resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-[color:var(--claude-accent)] text-white text-xs font-semibold rounded-xl hover:bg-[color:var(--claude-accent)]/90 transition"
              >
                Save Log Entry
              </button>
              <button
                type="button"
                onClick={() => setShowAddConstForm(false)}
                className="flex-1 py-2 bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)] text-xs font-semibold rounded-xl border border-[color:var(--claude-border)] hover:bg-[color:var(--claude-bg-strong)]/80 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* KPI stats & breakdown grids */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Status Card */}
        <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--claude-ink-sub)]">Overall Building Costs</span>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between border-b border-[color:var(--claude-border)]/50 pb-2">
                <span className="text-[color:var(--claude-ink-sub)]">Allocated Budget:</span>
                <span className="font-semibold text-[color:var(--claude-ink)]">₹{constructionBudget.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-b border-[color:var(--claude-border)]/50 pb-2">
                <span className="text-[color:var(--claude-ink-sub)]">Spent (Paid):</span>
                <span className="font-semibold text-emerald-600">₹{totalConstructionSpent.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-b border-[color:var(--claude-border)]/50 pb-2">
                <span className="text-[color:var(--claude-ink-sub)]">Pending Wages/Invoices:</span>
                <span className="font-semibold text-rose-600">₹{totalConstructionPending.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[color:var(--claude-ink-sub)]">Balance Available:</span>
                <span className="font-semibold text-[color:var(--claude-ink)]">
                  ₹{(constructionBudget - totalConstructionSpent).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[color:var(--claude-border)] pt-4">
            <div className="w-full bg-[color:var(--claude-bg-strong)] h-2 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{ width: `${Math.min((totalConstructionSpent / constructionBudget) * 100, 100)}%` }}
              ></div>
            </div>
            <span className="text-[9px] text-[color:var(--claude-ink-sub)] block">
              {((totalConstructionSpent / constructionBudget) * 100).toFixed(1)}% of maximum budget consumed.
            </span>
          </div>
        </div>

        {/* Category allocation progress bar chart */}
        <div className="md:col-span-2 bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--claude-ink)] border-b border-[color:var(--claude-border)] pb-3 mb-4">
            Material & Services Allocation
          </h3>
          
          {Object.keys(constructionCategoryDistribution).length === 0 ? (
            <p className="text-xs text-[color:var(--claude-ink-sub)] text-center py-8">No logged expenses.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(constructionCategoryDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amt]) => {
                  const pct = totalConstructionSpent > 0 ? (amt / (totalConstructionSpent + totalConstructionPending)) * 100 : 0;
                  return (
                    <div key={cat} className="text-xs">
                      <div className="flex justify-between font-semibold mb-1">
                        <span>{cat}</span>
                        <span className="text-[color:var(--claude-ink)] tracking-tight tabular-nums">₹{amt.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full bg-[color:var(--claude-bg-strong)] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-700 rounded-full"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="text-[9px] text-[color:var(--claude-ink-sub)] block mt-0.5">{pct.toFixed(0)}% of total logged</span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Construction Expenses Ledger */}
      <div className="bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[color:var(--claude-border)]">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--claude-ink)]">Contract Ledger Logs</h3>
          <p className="text-xs text-[color:var(--claude-ink-sub)] mt-0.5">Chronological construction materials & services billing records</p>
        </div>
        
        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[color:var(--claude-bg-strong)] text-[color:var(--claude-ink-sub)] font-semibold border-b border-[color:var(--claude-border)] uppercase tracking-wider">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Vendor / Recipient</th>
                <th className="px-6 py-3">Notes</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--claude-border)]/60">
              {constructionExpenses.length > 0 ? (
                constructionExpenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(exp => (
                    <tr key={exp.id} className="hover:bg-[color:var(--claude-bg-strong)]/30 transition">
                      <td className="px-6 py-4 text-[color:var(--claude-ink-sub)]">{exp.date}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-[color:var(--claude-ink)]">{exp.category}</span>
                      </td>
                      <td className="px-6 py-4 font-medium">{exp.vendor}</td>
                      <td className="px-6 py-4 text-[color:var(--claude-ink-sub)] max-w-[200px] truncate">{exp.notes}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleConstStatus(exp.id, exp.status)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                            exp.status === 'Paid'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900'
                              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900'
                          }`}
                        >
                          {exp.status === 'Paid' ? 'Paid' : 'Pending'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold tracking-tight tabular-nums text-[color:var(--claude-ink)]">
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteConstExpense(exp.id)}
                          className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                          title="Delete construction record"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[color:var(--claude-ink-sub)]">
                    No construction transactions logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards List View */}
        <div className="block sm:hidden divide-y divide-[color:var(--claude-border)]/40">
          {constructionExpenses.length > 0 ? (
            constructionExpenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(exp => (
                <div key={exp.id} className="p-4 flex flex-col gap-2 bg-[color:var(--claude-card)]">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-xs text-[color:var(--claude-ink)]">{exp.vendor}</p>
                      <p className="text-[10px] text-[color:var(--claude-ink-sub)] mt-0.5">{exp.date}</p>
                    </div>
                    <span className="font-semibold text-xs tracking-tight tabular-nums text-[color:var(--claude-ink)]">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {exp.notes && <p className="text-[10px] text-[color:var(--claude-ink-sub)] bg-[color:var(--claude-bg-strong)]/30 p-2.5 rounded-xl">{exp.notes}</p>}
                  <div className="flex justify-between items-center mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] text-[9px] font-medium">
                      {exp.category}
                    </span>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => handleToggleConstStatus(exp.id, exp.status)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition ${
                          exp.status === 'Paid'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900'
                            : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900'
                        }`}
                      >
                        {exp.status === 'Paid' ? 'Paid' : 'Pending'}
                      </button>
                      <button
                        onClick={() => handleDeleteConstExpense(exp.id)}
                        className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-xs text-[color:var(--claude-ink-sub)] text-center py-8">No construction transactions logged yet.</p>
          )}
        </div>
      </div>

    </div>
  );
}
