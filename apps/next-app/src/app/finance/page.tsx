"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  financeService,
  CardInfo,
  PersonalExpense,
  ConstructionExpense,
  DebtEntry,
  CardBillStatement
} from './services';

// Import refactored subcomponents
import OverviewTab from './components/OverviewTab';
import PersonalTab from './components/PersonalTab';
import CardsTab from './components/CardsTab';
import ConstructionTab from './components/ConstructionTab';
import DebtsTab from './components/DebtsTab';

export default function FinanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<CardInfo[]>([]);
  const [personalExpenses, setPersonalExpenses] = useState<PersonalExpense[]>([]);
  const [personalTarget, setPersonalTarget] = useState<number>(10000);
  const [constructionExpenses, setConstructionExpenses] = useState<ConstructionExpense[]>([]);
  const [constructionBudget, setConstructionBudget] = useState<number>(5000000);
  const [debts, setDebts] = useState<DebtEntry[]>([]);
  const [cardBills, setCardBills] = useState<CardBillStatement[]>([]);
  
  // Navigation & Filter states
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'cards' | 'construction' | 'debts'>('overview');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07'); // YYYY-MM
  const [personalCategoryFilter, setPersonalCategoryFilter] = useState<string>('All');
  const [personalCardFilter, setPersonalCardFilter] = useState<string>('All');

  // Success Notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form toggles
  const [showAddPersonalForm, setShowAddPersonalForm] = useState(false);
  const [showAddConstForm, setShowAddConstForm] = useState(false);
  const [showAddDebtForm, setShowAddDebtForm] = useState(false);
  const [showAddCardForm, setShowAddCardForm] = useState(false);

  // Edit settings toggles
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [isEditingConstBudget, setIsEditingConstBudget] = useState(false);

  // Form states - Personal Expense
  const [peAmount, setPeAmount] = useState('');
  const [peCategory, setPeCategory] = useState('Food');
  const [peDate, setPeDate] = useState('2026-07-12');
  const [peCardId, setPeCardId] = useState('cash');
  const [peUsedBy, setPeUsedBy] = useState('Self');
  const [peNotes, setPeNotes] = useState('');

  // Form states - Construction Expense
  const [ceAmount, setCeAmount] = useState('');
  const [ceCategory, setCeCategory] = useState('Cement');
  const [ceDate, setCeDate] = useState('2026-07-12');
  const [ceVendor, setCeVendor] = useState('');
  const [ceNotes, setCeNotes] = useState('');
  const [ceStatus, setCeStatus] = useState<'Paid' | 'Pending'>('Paid');

  // Form states - Debt
  const [dContactName, setDContactName] = useState('');
  const [dAmount, setDAmount] = useState('');
  const [dType, setDType] = useState<'Receivable' | 'Payable'>('Receivable');
  const [dDueDate, setDDueDate] = useState('2026-07-12');
  const [dNotes, setDNotes] = useState('');

  // Form states - Card
  const [cName, setCName] = useState('');
  const [cLastFour, setCLastFour] = useState('');
  const [cBillingDay, setCBillingDay] = useState('15');
  const [cDueDay, setCDueDay] = useState('5');
  const [cLimit, setCLimit] = useState('');

  // Editing budget states
  const [tempTarget, setTempTarget] = useState('10000');
  const [tempConstBudget, setTempConstBudget] = useState('5000000');

  // Load data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const fetchedCards = await financeService.getCards();
      const fetchedExpenses = await financeService.getPersonalExpenses();
      const fetchedTarget = await financeService.getPersonalTarget();
      const fetchedConst = await financeService.getConstructionExpenses();
      const fetchedBudget = await financeService.getConstructionBudget();
      const fetchedDebts = await financeService.getDebts();
      const fetchedBills = await financeService.getCardBillStatements(selectedMonth);

      setCards(fetchedCards);
      setPersonalExpenses(fetchedExpenses);
      setPersonalTarget(fetchedTarget);
      setConstructionExpenses(fetchedConst);
      setConstructionBudget(fetchedBudget);
      setDebts(fetchedDebts);
      setCardBills(fetchedBills);

      setTempTarget(fetchedTarget.toString());
      setTempConstBudget(fetchedBudget.toString());
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedMonth]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // --- Handlers ---
  const handleAddPersonalExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!peAmount || !peDate) return;
    try {
      await financeService.addPersonalExpense({
        amount: parseFloat(peAmount),
        category: peCategory,
        date: peDate,
        cardId: peCardId,
        usedBy: peUsedBy || 'Self',
        notes: peNotes
      });
      setPeAmount('');
      setPeNotes('');
      setShowAddPersonalForm(false);
      triggerToast('Personal expense added successfully!');
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePersonalExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await financeService.deletePersonalExpense(id);
      triggerToast('Expense deleted.');
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempTarget);
    if (isNaN(val) || val <= 0) return;
    try {
      await financeService.updatePersonalTarget(val);
      setPersonalTarget(val);
      setIsEditingTarget(false);
      triggerToast('Monthly spending target updated.');
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddConstructionExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ceAmount || !ceVendor || !ceDate) return;
    try {
      await financeService.addConstructionExpense({
        amount: parseFloat(ceAmount),
        category: ceCategory,
        date: ceDate,
        vendor: ceVendor,
        notes: ceNotes,
        status: ceStatus
      });
      setCeAmount('');
      setCeVendor('');
      setCeNotes('');
      setShowAddConstForm(false);
      triggerToast('Construction log entry created.');
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleConstStatus = async (id: string, currentStatus: 'Paid' | 'Pending') => {
    try {
      const nextStatus = currentStatus === 'Paid' ? 'Pending' : 'Paid';
      await financeService.updateConstructionExpenseStatus(id, nextStatus);
      triggerToast(`Marked construction log as ${nextStatus.toLowerCase()}.`);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConstExpense = async (id: string) => {
    if (!confirm('Delete this construction log entry?')) return;
    try {
      await financeService.deleteConstructionExpense(id);
      triggerToast('Construction log removed.');
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateConstBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempConstBudget);
    if (isNaN(val) || val <= 0) return;
    try {
      await financeService.updateConstructionBudget(val);
      setConstructionBudget(val);
      setIsEditingConstBudget(false);
      triggerToast('House construction budget updated.');
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dContactName || !dAmount || !dDueDate) return;
    try {
      await financeService.addDebt({
        contactName: dContactName,
        amount: parseFloat(dAmount),
        type: dType,
        dueDate: dDueDate,
        notes: dNotes,
        status: 'Pending'
      });
      setDContactName('');
      setDAmount('');
      setDNotes('');
      setShowAddDebtForm(false);
      triggerToast('Debt ledger entry added.');
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleDebtStatus = async (id: string, currentStatus: 'Pending' | 'Paid') => {
    try {
      const nextStatus = currentStatus === 'Pending' ? 'Paid' : 'Pending';
      await financeService.updateDebtStatus(id, nextStatus);
      triggerToast(`Debt marked as ${nextStatus.toLowerCase()}.`);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDebt = async (id: string) => {
    if (!confirm('Remove this debt ledger entry?')) return;
    try {
      await financeService.deleteDebt(id);
      triggerToast('Debt record deleted.');
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName || !cLastFour || !cLimit) return;
    try {
      await financeService.addCard({
        name: cName,
        lastFour: cLastFour,
        billingDay: parseInt(cBillingDay),
        dueDay: parseInt(cDueDay),
        creditLimit: parseFloat(cLimit)
      });
      setCName('');
      setCLastFour('');
      setCBillingDay('15');
      setCDueDay('5');
      setCLimit('');
      setShowAddCardForm(false);
      triggerToast('Credit card registered.');
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayBill = async (cardId: string, month: string, isPaid: boolean) => {
    try {
      await financeService.markCardBillAsPaid(cardId, month, isPaid);
      triggerToast(isPaid ? 'Card bill marked as Paid.' : 'Card bill marked as Unpaid.');
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Calculations & Filtered values ---

  // Personal Month expenses calculations
  const monthlyPersonalExpenses = useMemo(() => {
    return personalExpenses.filter(e => e.date.startsWith(selectedMonth));
  }, [personalExpenses, selectedMonth]);

  const filteredPersonalExpenses = useMemo(() => {
    return personalExpenses.filter(e => {
      const matchesMonth = e.date.startsWith(selectedMonth);
      const matchesCategory = personalCategoryFilter === 'All' || e.category === personalCategoryFilter;
      const matchesCard = personalCardFilter === 'All' || e.cardId === personalCardFilter;
      return matchesMonth && matchesCategory && matchesCard;
    });
  }, [personalExpenses, selectedMonth, personalCategoryFilter, personalCardFilter]);

  const totalMonthlySpend = useMemo(() => {
    return monthlyPersonalExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [monthlyPersonalExpenses]);

  const personalCategoryDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    monthlyPersonalExpenses.forEach(e => {
      dist[e.category] = (dist[e.category] || 0) + e.amount;
    });
    return dist;
  }, [monthlyPersonalExpenses]);

  // Who used my card distribution (in current month)
  const userCardUsage = useMemo(() => {
    const usage: Record<string, number> = {};
    monthlyPersonalExpenses
      .filter(e => e.cardId !== 'cash')
      .forEach(e => {
        usage[e.usedBy] = (usage[e.usedBy] || 0) + e.amount;
      });
    return usage;
  }, [monthlyPersonalExpenses]);

  // Construction math
  const totalConstructionSpent = useMemo(() => {
    return constructionExpenses
      .filter(e => e.status === 'Paid')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [constructionExpenses]);

  const totalConstructionPending = useMemo(() => {
    return constructionExpenses
      .filter(e => e.status === 'Pending')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [constructionExpenses]);

  const constructionCategoryDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    constructionExpenses.forEach(e => {
      dist[e.category] = (dist[e.category] || 0) + e.amount;
    });
    return dist;
  }, [constructionExpenses]);

  // Debt math
  const totalReceivables = useMemo(() => {
    return debts
      .filter(d => d.type === 'Receivable' && d.status === 'Pending')
      .reduce((sum, d) => sum + d.amount, 0);
  }, [debts]);

  const totalPayables = useMemo(() => {
    return debts
      .filter(d => d.type === 'Payable' && d.status === 'Pending')
      .reduce((sum, d) => sum + d.amount, 0);
  }, [debts]);

  const netDebtValue = totalReceivables - totalPayables;

  // Month options for dropdown selection
  const monthOptions = useMemo(() => {
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

  const cardMap = useMemo(() => {
    const map = new Map<string, CardInfo>();
    cards.forEach(c => map.set(c.id, c));
    return map;
  }, [cards]);

  return (
    <div className="min-h-screen bg-[color:var(--claude-bg)] text-[color:var(--claude-ink)] font-sans antialiased pb-16 transition-colors duration-300">
      
      {/* Editorial Claude Header */}
      <header className="border-b border-[color:var(--claude-border)] bg-[color:var(--claude-card)] py-8">
        <div className="mx-auto max-w-6xl px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <span className="text-[10px] tracking-[0.3em] font-semibold text-[color:var(--claude-accent)] uppercase block mb-1">
              Private Ledger
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-[color:var(--claude-ink)]">
              Anthropic Finance
            </h1>
            <p className="text-xs md:text-sm text-[color:var(--claude-ink-sub)] mt-1 max-w-xl">
              Redesigned companion dashboard for personal monthly targets, construction projects, credit cards, and debt ledgers.
            </p>
          </div>
          
          {/* Month Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[color:var(--claude-bg-strong)] border border-[color:var(--claude-border)] px-3 py-2 rounded-xl">
              <label htmlFor="globalMonth" className="text-xs font-medium text-[color:var(--claude-ink-sub)]">Period:</label>
              <select
                id="globalMonth"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-semibold focus:outline-none border-none cursor-pointer"
              >
                {monthOptions.map(opt => (
                  <option key={opt.val} value={opt.val}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="w-full mx-auto max-w-6xl mt-8 flex gap-1 border-b border-[color:var(--claude-border)]/50 overflow-x-auto scrollbar-none flex-nowrap px-6 md:px-12">
          {[
            { id: 'overview', label: 'Overview', icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg> },
            { id: 'personal', label: 'Personal Expenses', icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> },
            { id: 'cards', label: 'Card Statements', icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
            { id: 'construction', label: 'House Construction', icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
            { id: 'debts', label: 'Debts Ledger', icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 -mb-px transition duration-200 ${
                activeTab === tab.id
                  ? 'border-[color:var(--claude-accent)] text-[color:var(--claude-accent)] font-bold'
                  : 'border-transparent text-[color:var(--claude-ink-sub)] hover:text-[color:var(--claude-ink)]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main dashboard content */}
      <main className="mx-auto max-w-6xl px-6 md:px-12 mt-8">
        
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-[color:var(--claude-border)] border-t-[color:var(--claude-accent)] animate-spin"></div>
            <p className="text-xs font-semibold text-[color:var(--claude-ink-sub)] uppercase tracking-wider">Syncing Ledger...</p>
          </div>
        ) : (
          <div>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <OverviewTab
                personalTarget={personalTarget}
                totalMonthlySpend={totalMonthlySpend}
                constructionBudget={constructionBudget}
                totalConstructionSpent={totalConstructionSpent}
                netDebtValue={netDebtValue}
                totalReceivables={totalReceivables}
                totalPayables={totalPayables}
                cardBills={cardBills}
                isEditingTarget={isEditingTarget}
                setIsEditingTarget={setIsEditingTarget}
                tempTarget={tempTarget}
                setTempTarget={setTempTarget}
                handleUpdateTarget={handleUpdateTarget}
                isEditingConstBudget={isEditingConstBudget}
                setIsEditingConstBudget={setIsEditingConstBudget}
                tempConstBudget={tempConstBudget}
                setTempConstBudget={setTempConstBudget}
                handleUpdateConstBudget={handleUpdateConstBudget}
                handlePayBill={handlePayBill}
                selectedMonth={selectedMonth}
              />
            )}

            {/* Personal Expenses Tab */}
            {activeTab === 'personal' && (
              <PersonalTab
                cards={cards}
                personalTarget={personalTarget}
                isEditingTarget={isEditingTarget}
                setIsEditingTarget={setIsEditingTarget}
                tempTarget={tempTarget}
                setTempTarget={setTempTarget}
                handleUpdateTarget={handleUpdateTarget}
                monthlyPersonalExpenses={monthlyPersonalExpenses}
                filteredPersonalExpenses={filteredPersonalExpenses}
                totalMonthlySpend={totalMonthlySpend}
                personalCategoryDistribution={personalCategoryDistribution}
                userCardUsage={userCardUsage}
                personalCategoryFilter={personalCategoryFilter}
                setPersonalCategoryFilter={setPersonalCategoryFilter}
                personalCardFilter={personalCardFilter}
                setPersonalCardFilter={setPersonalCardFilter}
                selectedMonth={selectedMonth}
                cardMap={cardMap}
                showAddPersonalForm={showAddPersonalForm}
                setShowAddPersonalForm={setShowAddPersonalForm}
                handleAddPersonalExpense={handleAddPersonalExpense}
                handleDeletePersonalExpense={handleDeletePersonalExpense}
                peAmount={peAmount}
                setPeAmount={setPeAmount}
                peCategory={peCategory}
                setPeCategory={setPeCategory}
                peDate={peDate}
                setPeDate={setPeDate}
                peCardId={peCardId}
                setPeCardId={setPeCardId}
                peUsedBy={peUsedBy}
                setPeUsedBy={setPeUsedBy}
                peNotes={peNotes}
                setPeNotes={setPeNotes}
              />
            )}

            {/* Credit Cards Tab */}
            {activeTab === 'cards' && (
              <CardsTab
                cards={cards}
                cardBills={cardBills}
                cardMap={cardMap}
                selectedMonth={selectedMonth}
                showAddCardForm={showAddCardForm}
                setShowAddCardForm={setShowAddCardForm}
                handleAddCard={handleAddCard}
                handlePayBill={handlePayBill}
                cName={cName}
                setCName={setCName}
                cLastFour={cLastFour}
                setCLastFour={setCLastFour}
                cBillingDay={cBillingDay}
                setCBillingDay={setCBillingDay}
                cDueDay={cDueDay}
                setCDueDay={setCDueDay}
                cLimit={cLimit}
                setCLimit={setCLimit}
              />
            )}

            {/* House Construction Tab */}
            {activeTab === 'construction' && (
              <ConstructionTab
                constructionExpenses={constructionExpenses}
                constructionBudget={constructionBudget}
                totalConstructionSpent={totalConstructionSpent}
                totalConstructionPending={totalConstructionPending}
                constructionCategoryDistribution={constructionCategoryDistribution}
                isEditingConstBudget={isEditingConstBudget}
                setIsEditingConstBudget={setIsEditingConstBudget}
                tempConstBudget={tempConstBudget}
                setTempConstBudget={setTempConstBudget}
                handleUpdateConstBudget={handleUpdateConstBudget}
                showAddConstForm={showAddConstForm}
                setShowAddConstForm={setShowAddConstForm}
                handleAddConstructionExpense={handleAddConstructionExpense}
                handleToggleConstStatus={handleToggleConstStatus}
                handleDeleteConstExpense={handleDeleteConstExpense}
                ceAmount={ceAmount}
                setCeAmount={setCeAmount}
                ceCategory={ceCategory}
                setCeCategory={setCeCategory}
                ceDate={ceDate}
                setCeDate={setCeDate}
                ceVendor={ceVendor}
                setCeVendor={setCeVendor}
                ceNotes={ceNotes}
                setCeNotes={setCeNotes}
                ceStatus={ceStatus}
                setCeStatus={setCeStatus}
              />
            )}

            {/* Debts Tab */}
            {activeTab === 'debts' && (
              <DebtsTab
                debts={debts}
                totalReceivables={totalReceivables}
                totalPayables={totalPayables}
                netDebtValue={netDebtValue}
                showAddDebtForm={showAddDebtForm}
                setShowAddDebtForm={setShowAddDebtForm}
                handleAddDebt={handleAddDebt}
                handleToggleDebtStatus={handleToggleDebtStatus}
                handleDeleteDebt={handleDeleteDebt}
                dContactName={dContactName}
                setDContactName={setDContactName}
                dAmount={dAmount}
                setDAmount={setDAmount}
                dType={dType}
                setDType={setDType}
                dDueDate={dDueDate}
                setDDueDate={setDDueDate}
                dNotes={dNotes}
                setDNotes={setDNotes}
              />
            )}
          </div>
        )}
      </main>

      {/* Elegant Toast Success Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-[color:var(--claude-card)] border border-[color:var(--claude-border)] text-[color:var(--claude-ink)] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in z-50 transition duration-300">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[color:var(--claude-accent)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--claude-accent)]"></span>
          </span>
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

    </div>
  );
}
