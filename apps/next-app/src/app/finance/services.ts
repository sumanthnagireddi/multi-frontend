// Data models for the Finance Dashboard

export interface CardInfo {
  id: string;
  name: string;
  lastFour: string;
  billingDay: number; // Day of the month billing statement is generated (e.g. 15)
  dueDay: number;     // Day of the next month payment is due (e.g. 5)
  creditLimit: number;
}

export interface PersonalExpense {
  id: string;
  amount: number;
  category: string; // e.g. "Food", "Groceries", "Transport", "Utilities", "Shopping", "Entertainment", "Others"
  date: string;     // YYYY-MM-DD
  cardId: string;   // references CardInfo.id, or "cash" for cash payments
  usedBy: string;   // e.g. "Self", "Spouse", "Brother", "Friend"
  notes: string;
}

export interface ConstructionExpense {
  id: string;
  amount: number;
  category: string; // e.g. "Cement", "Steel", "Labor", "Plumbing", "Electrical", "Interior", "Architect", "Permits", "Others"
  date: string;     // YYYY-MM-DD
  vendor?: string;
  notes?: string;
  status: 'Paid' | 'Pending';
  source?: string;  // Project Key (e.g. 'house', 'office')
  title?: string;   // Project Title (stored in metadata)
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
  type: 'Receivable' | 'Payable'; // Receivable = "coming to me", Payable = "I need to give"
  dueDate: string;  // YYYY-MM-DD
  status: 'Pending' | 'Paid' | 'Partial';
  notes: string;
  paidAmount: number;
  partialPayments: PartialPaymentRecord[];
}

export interface CardBillStatement {
  cardId: string;
  cardName: string;
  statementMonth: string; // YYYY-MM
  startDate: string;     // YYYY-MM-DD (start of billing cycle)
  endDate: string;       // YYYY-MM-DD (end of billing cycle)
  dueDate: string;       // YYYY-MM-DD
  totalAmount: number;
  transactions: PersonalExpense[];
  isPaid: boolean;
}

// ---------------------------------------------------------
// API Services Layer targeting the NestJS webservices backend
// ---------------------------------------------------------

import { getApiUrl } from '@unified-frontend-monorepo/workspace-data';

const BASE_URL = getApiUrl();


export const financeService = {
  // Cards API
  async getCards(): Promise<CardInfo[]> {
    const response = await fetch(`${BASE_URL}/finance/cards`);
    if (!response.ok) throw new Error('Failed to fetch cards');
    const cards = await response.json();
    return cards.map((c: any) => ({
      id: c._id || c.id,
      name: c.name,
      lastFour: c.lastFour,
      billingDay: c.billingDay,
      dueDay: c.dueDay,
      creditLimit: c.creditLimit,
    }));
  },

  async addCard(card: Omit<CardInfo, 'id'>): Promise<CardInfo> {
    const response = await fetch(`${BASE_URL}/finance/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    });
    if (!response.ok) throw new Error('Failed to add card');
    const c = await response.json();
    return {
      id: c._id || c.id,
      name: c.name,
      lastFour: c.lastFour,
      billingDay: c.billingDay,
      dueDay: c.dueDay,
      creditLimit: c.creditLimit,
    };
  },

  async deleteCard(id: string): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/finance/cards/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete card');
    return response.json();
  },

  async updateCard(id: string, card: Partial<Omit<CardInfo, 'id'>>): Promise<CardInfo> {
    const response = await fetch(`${BASE_URL}/finance/cards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(card),
    });
    if (!response.ok) throw new Error('Failed to update card');
    const c = await response.json();
    return {
      id: c._id || c.id,
      name: c.name,
      lastFour: c.lastFour,
      billingDay: c.billingDay,
      dueDay: c.dueDay,
      creditLimit: c.creditLimit,
    };
  },

  // Personal Expenses API
  async getPersonalExpenses(): Promise<PersonalExpense[]> {
    const response = await fetch(`${BASE_URL}/finance/personal-expenses`);
    if (!response.ok) throw new Error('Failed to fetch personal expenses');
    const expenses = await response.json();
    return expenses.map((e: any) => ({
      id: e._id || e.id,
      amount: e.amount,
      category: e.category,
      date: e.date,
      cardId: e.cardId,
      usedBy: e.usedBy,
      notes: e.notes,
    }));
  },

  async addPersonalExpense(expense: Omit<PersonalExpense, 'id'>): Promise<PersonalExpense> {
    const response = await fetch(`${BASE_URL}/finance/personal-expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    if (!response.ok) throw new Error('Failed to add personal expense');
    const e = await response.json();
    return {
      id: e._id || e.id,
      amount: e.amount,
      category: e.category,
      date: e.date,
      cardId: e.cardId,
      usedBy: e.usedBy,
      notes: e.notes,
    };
  },

  async deletePersonalExpense(id: string): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/finance/personal-expenses/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete personal expense');
    return response.json();
  },

  async editPersonalExpense(id: string, expense: Partial<Omit<PersonalExpense, 'id'>>): Promise<PersonalExpense> {
    const response = await fetch(`${BASE_URL}/finance/personal-expenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    if (!response.ok) throw new Error('Failed to edit personal expense');
    const e = await response.json();
    return {
      id: e._id || e.id,
      amount: e.amount,
      category: e.category,
      date: e.date,
      cardId: e.cardId,
      usedBy: e.usedBy,
      notes: e.notes,
    };
  },

  // Personal Target API
  async getPersonalTarget(): Promise<number> {
    const response = await fetch(`${BASE_URL}/finance/personal-target`);
    if (!response.ok) throw new Error('Failed to fetch personal target');
    return response.json();
  },

  async updatePersonalTarget(target: number): Promise<number> {
    const response = await fetch(`${BASE_URL}/finance/personal-target`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target }),
    });
    if (!response.ok) throw new Error('Failed to update personal target');
    return response.json();
  },

  // Construction Expenses API
  async getConstructionExpenses(): Promise<ConstructionExpense[]> {
    const response = await fetch(`${BASE_URL}/finance/construction-expenses`);
    if (!response.ok) throw new Error('Failed to fetch construction expenses');
    const expenses = await response.json();
    return expenses.map((e: any) => ({
      id: e._id || e.id,
      amount: e.amount,
      category: e.category,
      date: e.date,
      vendor: e.vendor,
      notes: e.notes,
      status: e.status,
      source: e.source,
      title: e.title,
    }));
  },

  async addConstructionExpense(expense: Omit<ConstructionExpense, 'id'>): Promise<ConstructionExpense> {
    const response = await fetch(`${BASE_URL}/finance/construction-expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    if (!response.ok) throw new Error('Failed to add construction expense');
    const e = await response.json();
    return {
      id: e._id || e.id,
      amount: e.amount,
      category: e.category,
      date: e.date,
      vendor: e.vendor,
      notes: e.notes,
      status: e.status,
      source: e.source,
      title: e.title,
    };
  },

  async updateConstructionExpenseStatus(id: string, status: 'Paid' | 'Pending'): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/finance/construction-expenses/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update construction expense status');
    return response.json();
  },

  async deleteConstructionExpense(id: string): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/finance/construction-expenses/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete construction expense');
    return response.json();
  },

  async editConstructionExpense(id: string, expense: Partial<Omit<ConstructionExpense, 'id'>>): Promise<ConstructionExpense> {
    const response = await fetch(`${BASE_URL}/finance/construction-expenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    if (!response.ok) throw new Error('Failed to edit construction expense');
    const e = await response.json();
    return {
      id: e._id || e.id,
      amount: e.amount,
      category: e.category,
      date: e.date,
      vendor: e.vendor,
      notes: e.notes,
      status: e.status,
      source: e.source,
      title: e.title,
    };
  },

  async getConstructionBudget(): Promise<number> {
    const response = await fetch(`${BASE_URL}/finance/construction-budget`);
    if (!response.ok) throw new Error('Failed to fetch construction budget');
    return response.json();
  },

  async updateConstructionBudget(budget: number): Promise<number> {
    const response = await fetch(`${BASE_URL}/finance/construction-budget`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget }),
    });
    if (!response.ok) throw new Error('Failed to update construction budget');
    return response.json();
  },

  // Debts API
  async getDebts(): Promise<DebtEntry[]> {
    const response = await fetch(`${BASE_URL}/finance/debts-ledger`);
    if (!response.ok) throw new Error('Failed to fetch debts');
    return response.json();
  },

  async addDebt(debt: Omit<DebtEntry, 'id' | 'paidAmount' | 'partialPayments'>): Promise<DebtEntry> {
    const response = await fetch(`${BASE_URL}/finance/debts-ledger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(debt),
    });
    if (!response.ok) throw new Error('Failed to add debt');
    return response.json();
  },

  async editDebt(id: string, debt: Partial<Omit<DebtEntry, 'id' | 'paidAmount' | 'partialPayments'>>): Promise<DebtEntry> {
    const response = await fetch(`${BASE_URL}/finance/debts-ledger/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(debt),
    });
    if (!response.ok) throw new Error('Failed to edit debt');
    return response.json();
  },

  async updateDebtStatus(id: string, status: 'Pending' | 'Paid'): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/finance/debts-ledger/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update debt status');
    return response.json();
  },

  async deleteDebt(id: string): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/finance/debts-ledger/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete debt');
    return response.json();
  },

  async addPartialPayment(debtId: string, payment: { amount: number; date: string; notes?: string }): Promise<DebtEntry> {
    const response = await fetch(`${BASE_URL}/finance/debts-ledger/${debtId}/partial-payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    if (!response.ok) throw new Error('Failed to add partial payment');
    return response.json();
  },

  async editPartialPayment(debtId: string, partialId: string, payment: { amount?: number; date?: string; notes?: string }): Promise<DebtEntry> {
    const response = await fetch(`${BASE_URL}/finance/debts-ledger/${debtId}/partial-payments/${partialId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    if (!response.ok) throw new Error('Failed to edit partial payment');
    return response.json();
  },

  async deletePartialPayment(debtId: string, partialId: string): Promise<DebtEntry> {
    const response = await fetch(`${BASE_URL}/finance/debts-ledger/${debtId}/partial-payments/${partialId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete partial payment');
    return response.json();
  },

  // Billing calculations for Credit Cards
  async getCardBillStatements(targetMonth: string): Promise<CardBillStatement[]> {
    const response = await fetch(`${BASE_URL}/finance/card-bills/${targetMonth}`);
    if (!response.ok) throw new Error('Failed to fetch card bills');
    return response.json();
  },

  async markCardBillAsPaid(cardId: string, targetMonth: string, isPaid: boolean): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/finance/card-bills/${cardId}/${targetMonth}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPaid }),
    });
    if (!response.ok) throw new Error('Failed to update card bill status');
    return response.json();
  }
};
