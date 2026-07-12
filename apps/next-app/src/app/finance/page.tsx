"use client";

import React, { useState, useMemo } from 'react';

// Type definition for a Saving item
interface SavingItem {
  id: string;
  amount: number;
  savingsType: string;
  platform: string;
  interestRate: number;
  createdDate: string;
  maturityDate: string;
  notes: string;
}

const SAVINGS_TYPES = [
  "Fixed Deposit",
  "Mutual Funds",
  "Stocks",
  "Real Estate",
  "Gold/Silver",
];

const PLATFORMS = ["Zerodha", "Groww", "Banks", "Others"];

const INITIAL_SAVINGS: SavingItem[] = [
  {
    id: '1',
    amount: 150000,
    savingsType: 'Fixed Deposit',
    platform: 'Banks',
    interestRate: 7.1,
    createdDate: '2026-01-15',
    maturityDate: '2027-01-15',
    notes: 'Emergency reserve fund at HDFC Bank.',
  },
  {
    id: '2',
    amount: 280000,
    savingsType: 'Mutual Funds',
    platform: 'Groww',
    interestRate: 12.5,
    createdDate: '2025-06-10',
    maturityDate: 'N/A',
    notes: 'Nifty 50 Index Mutual Fund SIP.',
  },
  {
    id: '3',
    amount: 175000,
    savingsType: 'Stocks',
    platform: 'Zerodha',
    interestRate: 15.4,
    createdDate: '2025-08-20',
    maturityDate: 'N/A',
    notes: 'Long term portfolio in blue-chip tech stocks.',
  },
  {
    id: '4',
    amount: 95000,
    savingsType: 'Gold/Silver',
    platform: 'Others',
    interestRate: 8.8,
    createdDate: '2024-11-05',
    maturityDate: '2032-11-05',
    notes: 'Sovereign Gold Bonds (SGB) Series IV.',
  },
];

export default function FinanceDashboard() {
  const [savings, setSavings] = useState<SavingItem[]>(INITIAL_SAVINGS);
  const [activeTab, setActiveTab] = useState<'overview' | 'list' | 'add'>('overview');
  
  // Form State
  const [amount, setAmount] = useState<string>('');
  const [savingsType, setSavingsType] = useState<string>(SAVINGS_TYPES[0]);
  const [platform, setPlatform] = useState<string>(PLATFORMS[0]);
  const [interestRate, setInterestRate] = useState<string>('');
  const [createdDate, setCreatedDate] = useState<string>('');
  const [maturityDate, setMaturityDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // Filter States
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [platformFilter, setPlatformFilter] = useState<string>('All');

  // Success Notification state
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Calculations
  const stats = useMemo(() => {
    const total = savings.reduce((acc, curr) => acc + curr.amount, 0);
    const avgInterest = savings.length > 0
      ? parseFloat((savings.reduce((acc, curr) => acc + curr.interestRate, 0) / savings.length).toFixed(2))
      : 0;
    
    // Group by category to find distribution
    const distribution: Record<string, number> = {};
    SAVINGS_TYPES.forEach(t => { distribution[t] = 0; });
    savings.forEach(item => {
      if (distribution[item.savingsType] !== undefined) {
        distribution[item.savingsType] += item.amount;
      } else {
        distribution[item.savingsType] = item.amount;
      }
    });

    // Find highest category
    let maxCat = 'None';
    let maxVal = 0;
    Object.entries(distribution).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val;
        maxCat = cat;
      }
    });

    return {
      total,
      avgInterest,
      maxCategory: maxCat,
      distribution
    };
  }, [savings]);

  const filteredSavings = useMemo(() => {
    return savings.filter(item => {
      const matchesType = typeFilter === 'All' || item.savingsType === typeFilter;
      const matchesPlatform = platformFilter === 'All' || item.platform === platformFilter;
      return matchesType && matchesPlatform;
    });
  }, [savings, typeFilter, platformFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !interestRate || !createdDate) {
      alert('Please fill in all required fields (Amount, Interest Rate, Created Date)');
      return;
    }

    const newItem: SavingItem = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      savingsType,
      platform,
      interestRate: parseFloat(interestRate),
      createdDate,
      maturityDate: maturityDate || 'N/A',
      notes: notes || 'No extra notes provided.',
    };

    setSavings(prev => [newItem, ...prev]);
    
    // Reset Form
    setAmount('');
    setSavingsType(SAVINGS_TYPES[0]);
    setPlatform(PLATFORMS[0]);
    setInterestRate('');
    setCreatedDate('');
    setMaturityDate('');
    setNotes('');

    // Trigger Toast
    setToastMessage('New investment record saved successfully!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    // Redirect to list
    setActiveTab('list');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this savings record?')) {
      setSavings(prev => prev.filter(item => item.id !== id));
      setToastMessage('Savings record deleted.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-12">
      {/* Upper banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white py-12 px-6 shadow-md">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-emerald-400 font-semibold">
              Personal Finance Manager
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Finance Buddy Dashboard
            </h1>
            <p className="mt-2 text-slate-300 text-sm md:text-base max-w-xl">
              Track and optimize your savings portfolio. Keep tabs on Fixed Deposits, Mutual Funds, Stocks, and Assets in one central view.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
              Overview
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'list'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              Savings List
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === 'add'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Saving
            </button>
          </div>
        </div>
      </div>

      {/* Main container */}
      <div className="mx-auto max-w-6xl px-6 mt-8">
        
        {/* KPI Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition duration-300">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Portfolio</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              ₹{stats.total.toLocaleString('en-IN')}
            </h3>
            <span className="inline-block mt-3 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              ↗ Live Allocation
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition duration-300">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Yield</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.avgInterest}%</h3>
            <span className="inline-block mt-3 text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">
              ~ Weighted Average
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition duration-300">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Primary Asset</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-2 truncate">{stats.maxCategory}</h3>
            <span className="inline-block mt-3 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              ⚡ Top Allocator
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition duration-300">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Assets</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">{savings.length}</h3>
            <span className="inline-block mt-3 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              ✔ 100% Client-Side
            </span>
          </div>
        </div>

        {/* Tab contents */}
        <div className="mt-8">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Asset Allocation */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm lg:col-span-2">
                <h3 className="text-lg font-bold text-slate-900">Portfolio Allocation</h3>
                <p className="text-sm text-slate-500 mt-1">Visual breakdown of your saving accounts by asset type.</p>
                
                <div className="mt-8 space-y-5">
                  {SAVINGS_TYPES.map(type => {
                    const amount = stats.distribution[type] || 0;
                    const percentage = stats.total > 0 ? (amount / stats.total) * 100 : 0;
                    
                    // Colors
                    let color = 'bg-blue-600';
                    if (type === 'Mutual Funds') color = 'bg-violet-600';
                    if (type === 'Stocks') color = 'bg-emerald-500';
                    if (type === 'Real Estate') color = 'bg-rose-500';
                    if (type === 'Gold/Silver') color = 'bg-amber-400';

                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm font-medium mb-1">
                          <span className="text-slate-700">{type}</span>
                          <span className="text-slate-900">
                            ₹{amount.toLocaleString('en-IN')} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${color} transition-all duration-1000`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Info & Actions */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Savings Breakdown</h3>
                  <p className="text-sm text-slate-500 mt-1">Portfolio statistics summary.</p>
                  
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between border-b border-slate-100 pb-3 text-sm">
                      <span className="text-slate-500">FD Rate High:</span>
                      <span className="font-semibold text-slate-800">7.1%</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-3 text-sm">
                      <span className="text-slate-500">Market Rate High:</span>
                      <span className="font-semibold text-emerald-600">15.4%</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-3 text-sm">
                      <span className="text-slate-500">Total Capital:</span>
                      <span className="font-semibold text-slate-800">
                        ₹{stats.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <button
                    onClick={() => setActiveTab('add')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-2xl transition duration-300 flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    Record New Saving
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SAVINGS LIST */}
          {activeTab === 'list' && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              {/* Header Filters */}
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Savings Records</h3>
                  <p className="text-sm text-slate-500 mt-1">Manage and track individual investment records.</p>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-400 uppercase">Type:</span>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="All">All Types</option>
                      {SAVINGS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-400 uppercase">Platform:</span>
                    <select
                      value={platformFilter}
                      onChange={(e) => setPlatformFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="All">All Platforms</option>
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Table wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Saving Type</th>
                      <th className="px-6 py-4">Platform</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Interest Rate</th>
                      <th className="px-6 py-4">Created Date</th>
                      <th className="px-6 py-4">Maturity Date</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredSavings.length > 0 ? (
                      filteredSavings.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900">{item.savingsType}</span>
                            <p className="text-xs text-slate-400 mt-1 max-w-[200px] truncate">{item.notes}</p>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">{item.platform}</td>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                              {item.interestRate}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">{item.createdDate}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                              item.maturityDate === 'N/A'
                                ? 'bg-slate-100 text-slate-500'
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {item.maturityDate}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-1.5 rounded-xl transition duration-200"
                              title="Delete Record"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                          No savings records found matching the filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ADD SAVING FORM */}
          {activeTab === 'add' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-slate-900">Add Savings Record</h3>
              <p className="text-sm text-slate-500 mt-1">Create a new local investment entry. Submissions update the table dynamically in state.</p>
              
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Amount */}
                  <div className="space-y-1.5">
                    <label htmlFor="amount" className="text-sm font-semibold text-slate-700">
                      Amount (₹) *
                    </label>
                    <input
                      id="amount"
                      type="number"
                      required
                      placeholder="e.g. 50000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Interest Rate */}
                  <div className="space-y-1.5">
                    <label htmlFor="interest" className="text-sm font-semibold text-slate-700">
                      Annual Yield (%) *
                    </label>
                    <input
                      id="interest"
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 7.5"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Savings Type */}
                  <div className="space-y-1.5">
                    <label htmlFor="type" className="text-sm font-semibold text-slate-700">
                      Savings Category *
                    </label>
                    <select
                      id="type"
                      value={savingsType}
                      onChange={(e) => setSavingsType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-950 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    >
                      {SAVINGS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Platform */}
                  <div className="space-y-1.5">
                    <label htmlFor="platform" className="text-sm font-semibold text-slate-700">
                      Platform *
                    </label>
                    <select
                      id="platform"
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-950 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    >
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  {/* Created Date */}
                  <div className="space-y-1.5">
                    <label htmlFor="created" className="text-sm font-semibold text-slate-700">
                      Investment Date *
                    </label>
                    <input
                      id="created"
                      type="date"
                      required
                      value={createdDate}
                      onChange={(e) => setCreatedDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Maturity Date */}
                  <div className="space-y-1.5">
                    <label htmlFor="maturity" className="text-sm font-semibold text-slate-700">
                      Maturity Date (Optional)
                    </label>
                    <input
                      id="maturity"
                      type="date"
                      value={maturityDate}
                      onChange={(e) => setMaturityDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label htmlFor="notes" className="text-sm font-semibold text-slate-700">
                    Memo / Notes
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    placeholder="Describe this investment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-2xl transition duration-300 shadow-md shadow-emerald-500/10"
                  >
                    Save Investment
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-2xl transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce z-50">
          <span className="flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          </span>
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}
