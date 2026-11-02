import { environment } from '@/shared/config/env';

export interface CardInfo {
  id: string;
  name: string;
  lastFour: string;
  billingDay: number;
  dueDay: number;
  creditLimit: number;
}

export interface PersonalExpense {
  id: string;
  amount: number;
  category: string;
  date: string;
  cardId: string;
  usedBy: string;
  notes: string;
}

export interface ConstructionExpense {
  id: string;
  amount: number;
  category: string;
  date: string;
  vendor?: string;
  notes?: string;
  status: 'Paid' | 'Pending';
  source?: string;
  title?: string;
}

export interface PartialPaymentRecord {
  id: string;
  amount: number;
  date: string;
  notes: string;
}

export interface DebtEntry {
  id: string;
  contactName: string;
  amount: number;
  type: 'Receivable' | 'Payable';
  dueDate: string;
  status: 'Pending' | 'Paid' | 'Partial';
  notes: string;
  paidAmount: number;
  partialPayments: PartialPaymentRecord[];
}

export interface CardBillStatement {
  cardId: string;
  cardName: string;
  statementMonth: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  totalAmount: number;
  transactions: PersonalExpense[];
  isPaid: boolean;
}

export interface ChitAuction {
  month: number;
  winningBid: number;
  isActual?: boolean;
  verified?: boolean;
}

export interface ChitPayment {
  month: number;
  amountPaid: number;
}

export interface Chit {
  id: string;
  name: string;
  chitValue: number;
  duration: number;
  members: number;
  monthlyInstallment: number;
  commissionType: 'PERCENT' | 'FIXED';
  commissionValue: number;
  currentMonth: number;
  startMonth: string;
  firstAndLastFixed: boolean;
  terminalDividendMonths: number[];
  auctions: ChitAuction[];
  payments?: ChitPayment[];
}

export interface ChitDashboard {
  chitCount: number;
  totalChitValue: number;
  totalPaidToDate: number;
  totalDividendsEarnedToDate: number;
  chits: Chit[];
}

export interface ChitAnalysis {
  withdrawalMonth: number;
  winningBid: number;
  totalInstallments: number;
  terminalDividends: number;
  netCashCost: number;
  payout: number;
  nominalNetGain: number;
  nominalReturnPercent: number;
  npvAtTargetReturn: number;
  targetAnnualReturn: number;
  maximumDiscountBidForTargetReturn: number;
  minimumWinningPayoutForTargetReturn: number;
  monthlySchedule: Array<{
    month: number;
    winningBid: number;
    discount: number;
    dividendPerMember: number;
    installmentPaid: number;
    amountPaid?: number;
    totalAmountPaid?: number;
    terminalDividend: number;
    isActual: boolean;
    source?: 'ACTUAL' | 'PROJECTED';
  }>;
  assumptions: string[];
}

let cards: CardInfo[] = [
  { id: 'card-1', name: 'HDFC Regalia', lastFour: '4821', billingDay: 10, dueDay: 30, creditLimit: 300000 },
  { id: 'card-2', name: 'ICICI Amazon Pay', lastFour: '7319', billingDay: 18, dueDay: 5, creditLimit: 180000 },
];

let personalExpenses: PersonalExpense[] = [
  { id: 'exp-1', amount: 2450, category: 'Groceries', date: '2026-10-28', cardId: 'card-1', usedBy: 'Self', notes: 'Weekly groceries' },
  { id: 'exp-2', amount: 1800, category: 'Food', date: '2026-10-30', cardId: 'cash', usedBy: 'Family', notes: 'Dinner' },
  { id: 'exp-3', amount: 599, category: 'Entertainment', date: '2026-10-31', cardId: 'card-2', usedBy: 'Self', notes: 'Streaming subscription' },
];

let constructionExpenses: ConstructionExpense[] = [
  { id: 'con-1', amount: 85000, category: 'Cement', date: '2026-10-10', vendor: 'Sri Builders', status: 'Paid', source: 'house', title: 'Home Construction' },
  { id: 'con-2', amount: 42000, category: 'Electrical', date: '2026-10-22', vendor: 'Bright Electric', status: 'Pending', source: 'house', title: 'Home Construction' },
];

const CONSTRUCTION_STORAGE_KEY = 'finance-mock-construction-expenses';
if (typeof window !== 'undefined') {
  try {
    const savedConstruction = window.localStorage.getItem(CONSTRUCTION_STORAGE_KEY);
    if (savedConstruction) {
      const parsed = JSON.parse(savedConstruction) as ConstructionExpense[];
      if (Array.isArray(parsed)) constructionExpenses = parsed;
    }
  } catch {
    // Keep the in-memory mock data if browser storage is unavailable or invalid.
  }
}

const persistConstructionExpenses = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSTRUCTION_STORAGE_KEY, JSON.stringify(constructionExpenses));
  } catch {
    // Mock mutations still work in memory when browser storage is unavailable.
  }
};

const loadConstructionExpenses = () => {
  if (typeof window === 'undefined') return;
  try {
    const savedConstruction = window.localStorage.getItem(CONSTRUCTION_STORAGE_KEY);
    if (savedConstruction) {
      const parsed = JSON.parse(savedConstruction) as ConstructionExpense[];
      if (Array.isArray(parsed)) constructionExpenses = parsed;
    }
  } catch {
    // Keep the in-memory mock data if browser storage is unavailable or invalid.
  }
};

let debts: DebtEntry[] = [
  { id: 'debt-1', contactName: 'Rahul', amount: 25000, type: 'Receivable', dueDate: '2026-11-15', status: 'Partial', notes: 'Project contribution', paidAmount: 10000, partialPayments: [{ id: 'pay-1', amount: 10000, date: '2026-10-20', notes: 'First payment' }] },
  { id: 'debt-2', contactName: 'Anita', amount: 12000, type: 'Payable', dueDate: '2026-11-30', status: 'Pending', notes: 'Shared household expense', paidAmount: 0, partialPayments: [] },
];

let chits: Chit[] = [
  {
    id: 'chit-1', name: 'Prime Chit Fund', chitValue: 500000, duration: 20, members: 20,
    monthlyInstallment: 25000, commissionType: 'PERCENT', commissionValue: 5, currentMonth: 6,
    startMonth: '2026-05', firstAndLastFixed: true, terminalDividendMonths: [19, 20],
    auctions: [
      { month: 1, winningBid: 400000, isActual: true, verified: true },
      { month: 2, winningBid: 390000, isActual: true, verified: true },
      { month: 3, winningBid: 385000, isActual: true, verified: true },
      { month: 4, winningBid: 380000, isActual: true, verified: true },
      { month: 5, winningBid: 375000, isActual: true, verified: true },
    ],
    payments: [{ month: 1, amountPaid: 25000 }, { month: 2, amountPaid: 25000 }, { month: 3, amountPaid: 25000 }, { month: 4, amountPaid: 25000 }, { month: 5, amountPaid: 25000 }],
  },
];

let personalTarget = 80000;
let constructionBudget = 1500000;
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const delay = () => new Promise(resolve => setTimeout(resolve, 180));

export const financeService = {
  async getCards() { await delay(); return [...cards]; },
  async addCard(card: Omit<CardInfo, 'id'>) { await delay(); const item = { ...card, id: uid('card') }; cards.push(item); return item; },
  async deleteCard(id: string) { await delay(); cards = cards.filter(item => item.id !== id); return true; },
  async updateCard(id: string, card: Partial<Omit<CardInfo, 'id'>>) { await delay(); cards = cards.map(item => item.id === id ? { ...item, ...card } : item); return cards.find(item => item.id === id)!; },

  async getPersonalExpenses() { await delay(); return [...personalExpenses]; },
  async addPersonalExpense(expense: Omit<PersonalExpense, 'id'>) { await delay(); const item = { ...expense, id: uid('expense') }; personalExpenses.push(item); return item; },
  async deletePersonalExpense(id: string) { await delay(); personalExpenses = personalExpenses.filter(item => item.id !== id); return true; },
  async editPersonalExpense(id: string, expense: Partial<Omit<PersonalExpense, 'id'>>) { await delay(); personalExpenses = personalExpenses.map(item => item.id === id ? { ...item, ...expense } : item); return personalExpenses.find(item => item.id === id)!; },
  async getPersonalTarget() { await delay(); return personalTarget; },
  async updatePersonalTarget(target: number) { await delay(); personalTarget = target; return target; },

  async getConstructionExpenses(): Promise<ConstructionExpense[]> {
    await delay();
    try {
      const response = await fetch(`${environment.financeApiUrl}/finance/construction-expenses`);
      if (!response.ok) throw new Error('Could not load construction expenses');
      const records = await response.json() as Array<Record<string, any>>;
      return records
        .filter((record) => record.isDeleted !== true)
        .map((record) => ({
          id: record._id || record.id,
          amount: Number(record.amount || 0),
          category: record.category || '',
          date: record.date || '',
          vendor: record.vendor,
          notes: record.notes,
          status: record.status === 'Pending' ? 'Pending' : 'Paid',
          source: record.source,
          title: record.title
        }));
    } catch {
      loadConstructionExpenses();
      return [...constructionExpenses];
    }
  },
  async addConstructionExpense(expense: Omit<ConstructionExpense, 'id'>) {
    await delay();
    try {
      const response = await fetch(`${environment.financeApiUrl}/finance/construction-expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      });
      if (!response.ok) throw new Error('Could not create construction expense');
      const record = await response.json() as Record<string, any>;
      return { ...expense, id: record._id || record.id };
    } catch {
      loadConstructionExpenses();
      const item = { ...expense, id: uid('construction') };
      constructionExpenses.push(item);
      persistConstructionExpenses();
      return item;
    }
  },
  async updateConstructionExpenseStatus(id: string, status: 'Paid' | 'Pending') {
    await delay();
    try {
      await fetch(`${environment.financeApiUrl}/finance/construction-expenses/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return true;
    } catch {
      loadConstructionExpenses();
      constructionExpenses = constructionExpenses.map(item => item.id === id ? { ...item, status } : item);
      persistConstructionExpenses();
      return true;
    }
  },
  async deleteConstructionExpense(id: string) {
    await delay();
    try {
      await fetch(`${environment.financeApiUrl}/finance/construction-expenses/${id}`, { method: 'DELETE' });
      return true;
    } catch {
      loadConstructionExpenses();
      constructionExpenses = constructionExpenses.filter(item => item.id !== id);
      persistConstructionExpenses();
      return true;
    }
  },
  async editConstructionExpense(id: string, expense: Partial<Omit<ConstructionExpense, 'id'>>) {
    await delay();
    try {
      const response = await fetch(`${environment.financeApiUrl}/finance/construction-expenses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense)
      });
      if (!response.ok) throw new Error('Could not edit construction expense');
      const record = await response.json() as Record<string, any>;
      return { ...expense, id: record._id || id } as ConstructionExpense;
    } catch {
      loadConstructionExpenses();
      constructionExpenses = constructionExpenses.map(item => item.id === id ? { ...item, ...expense } : item);
      persistConstructionExpenses();
      return constructionExpenses.find(item => item.id === id)!;
    }
  },
  async getConstructionBudget() {
    await delay();
    try {
      const response = await fetch(`${environment.financeApiUrl}/finance/construction-budget`);
      if (!response.ok) throw new Error('Could not load construction budget');
      const value = await response.json() as number | { budget?: number; monthlyBudget?: number };
      if (typeof value === 'number') return value;
      return Number(value.budget ?? value.monthlyBudget ?? constructionBudget);
    } catch {
      return constructionBudget;
    }
  },
  async updateConstructionBudget(budget: number) {
    await delay();
    try {
      await fetch(`${environment.financeApiUrl}/finance/construction-budget`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget })
      });
    } catch {
      constructionBudget = budget;
    }
    constructionBudget = budget;
    return budget;
  },

  async getDebts() { await delay(); return [...debts]; },
  async addDebt(debt: Omit<DebtEntry, 'id' | 'paidAmount' | 'partialPayments'>) { await delay(); const item: DebtEntry = { ...debt, id: uid('debt'), paidAmount: 0, partialPayments: [] }; debts.push(item); return item; },
  async editDebt(id: string, debt: Partial<Omit<DebtEntry, 'id' | 'paidAmount' | 'partialPayments'>>) { await delay(); debts = debts.map(item => item.id === id ? { ...item, ...debt } : item); return debts.find(item => item.id === id)!; },
  async updateDebtStatus(id: string, status: 'Pending' | 'Paid') { await delay(); debts = debts.map(item => item.id === id ? { ...item, status, paidAmount: status === 'Paid' ? item.amount : item.paidAmount } : item); return true; },
  async deleteDebt(id: string) { await delay(); debts = debts.filter(item => item.id !== id); return true; },
  async addPartialPayment(debtId: string, payment: { amount: number; date: string; notes?: string }) { await delay(); debts = debts.map(item => { if (item.id !== debtId) return item; const paidAmount = item.paidAmount + payment.amount; return { ...item, paidAmount, status: paidAmount >= item.amount ? 'Paid' as const : 'Partial' as const, partialPayments: [...item.partialPayments, { id: uid('payment'), amount: payment.amount, date: payment.date, notes: payment.notes || '' }] }; }); return debts.find(item => item.id === debtId)!; },
  async editPartialPayment(debtId: string, partialId: string, payment: { amount?: number; date?: string; notes?: string }) { await delay(); debts = debts.map(item => item.id === debtId ? { ...item, partialPayments: item.partialPayments.map(partial => partial.id === partialId ? { ...partial, ...payment } : partial) } : item); return debts.find(item => item.id === debtId)!; },
  async deletePartialPayment(debtId: string, partialId: string) { await delay(); debts = debts.map(item => item.id === debtId ? { ...item, partialPayments: item.partialPayments.filter(partial => partial.id !== partialId) } : item); return debts.find(item => item.id === debtId)!; },

  async getCardBillStatements(targetMonth: string): Promise<CardBillStatement[]> {
    await delay();
    return cards.map(card => ({
      cardId: card.id,
      cardName: card.name,
      statementMonth: targetMonth,
      startDate: `${targetMonth}-01`,
      endDate: `${targetMonth}-31`,
      dueDate: `${targetMonth}-${String(card.dueDay).padStart(2, '0')}`,
      totalAmount: personalExpenses.filter(expense => expense.cardId === card.id).reduce((sum, expense) => sum + expense.amount, 0),
      transactions: personalExpenses.filter(expense => expense.cardId === card.id),
      isPaid: false,
    }));
  },
  async markCardBillAsPaid(cardId: string, targetMonth: string, isPaid: boolean) { await delay(); return Boolean(cardId && targetMonth && typeof isPaid === 'boolean'); },

  async getChitDashboard(): Promise<ChitDashboard> {
    await delay();
    return {
      chitCount: chits.length,
      totalChitValue: chits.reduce((sum, chit) => sum + chit.chitValue, 0),
      totalPaidToDate: chits.reduce((sum, chit) => sum + (chit.payments || []).reduce((paid, payment) => paid + payment.amountPaid, 0), 0),
      totalDividendsEarnedToDate: 18500,
      chits: [...chits],
    };
  },
  async createChit(body: { name: string; chitValue: number; duration: number; members: number; monthlyInstallment: number; commissionType: 'PERCENT' | 'FIXED'; commissionValue: number; currentMonth: number; startMonth?: string; firstAndLastFixed?: boolean; terminalDividendMonths?: number[] }) {
    await delay();
    const item: Chit = { ...body, id: uid('chit'), startMonth: body.startMonth || '2026-11', firstAndLastFixed: body.firstAndLastFixed ?? true, terminalDividendMonths: body.terminalDividendMonths || [body.duration - 1, body.duration], auctions: [], payments: [] };
    chits.push(item);
    return item;
  },
  async addChitAuction(id: string, month: number, winningBid: number) { await delay(); chits = chits.map(chit => chit.id === id ? { ...chit, auctions: [...chit.auctions.filter(auction => auction.month !== month), { month, winningBid, isActual: true, verified: false }] } : chit); return chits.find(chit => chit.id === id)!; },
  async verifyChitAuction(id: string, month: number) { await delay(); chits = chits.map(chit => chit.id === id ? { ...chit, auctions: chit.auctions.map(auction => auction.month === month ? { ...auction, verified: true } : auction) } : chit); return chits.find(chit => chit.id === id)!; },
  async updateChit(id: string, body: Partial<{ name: string; chitValue: number; duration: number; members: number; monthlyInstallment: number; commissionType: 'PERCENT' | 'FIXED'; commissionValue: number; currentMonth: number; startMonth: string; firstAndLastFixed: boolean; terminalDividendMonths: number[] }>) { await delay(); chits = chits.map(chit => chit.id === id ? { ...chit, ...body } : chit); return chits.find(chit => chit.id === id)!; },
  async setChitMonthlyPayment(id: string, month: number, amountPaid: number) { await delay(); chits = chits.map(chit => chit.id === id ? { ...chit, payments: [...(chit.payments || []).filter(payment => payment.month !== month), { month, amountPaid }] } : chit); return chits.find(chit => chit.id === id)!; },
  async deleteChit(id: string) { await delay(); chits = chits.filter(chit => chit.id !== id); return true; },

  async simulateChit(id: string, withdrawalMonth: number, winningBid: number, targetAnnualReturn: number): Promise<ChitAnalysis> {
    await delay();
    const chit = chits.find(item => item.id === id) || chits[0];
    const bid = winningBid || chit.auctions[chit.auctions.length - 1]?.winningBid || chit.chitValue * 0.76;
    const terminalDividends = chit.chitValue * 0.02 * 2;
    const totalInstallments = chit.monthlyInstallment * withdrawalMonth;
    const payout = chit.chitValue - bid;
    return {
      withdrawalMonth,
      winningBid: bid,
      totalInstallments,
      terminalDividends,
      netCashCost: totalInstallments - terminalDividends,
      payout,
      nominalNetGain: payout - totalInstallments,
      nominalReturnPercent: ((payout - totalInstallments) / totalInstallments) * 100,
      npvAtTargetReturn: 1250,
      targetAnnualReturn,
      maximumDiscountBidForTargetReturn: chit.chitValue * 0.74,
      minimumWinningPayoutForTargetReturn: chit.chitValue * 0.74,
      monthlySchedule: Array.from({ length: chit.duration }, (_, index) => {
        const month = index + 1;
        const discount = month <= withdrawalMonth ? bid * 0.08 : 0;
        return { month, winningBid: month === withdrawalMonth ? bid : 0, discount, dividendPerMember: discount / chit.members, installmentPaid: chit.monthlyInstallment, terminalDividend: month >= 19 ? chit.chitValue * 0.02 : 0, isActual: month <= chit.currentMonth, source: month <= chit.currentMonth ? 'ACTUAL' : 'PROJECTED' };
      }),
      assumptions: ['Mock projection for UI testing', 'Terminal dividends are estimates', 'Actual returns depend on auction terms'],
    };
  },
};
