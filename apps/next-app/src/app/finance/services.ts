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
  vendor: string;
  notes: string;
  status: 'Paid' | 'Pending';
}

export interface DebtEntry {
  id: string;
  contactName: string;
  amount: number;
  type: 'Receivable' | 'Payable'; // Receivable = "coming to me", Payable = "I need to give"
  dueDate: string;  // YYYY-MM-DD
  status: 'Pending' | 'Paid';
  notes: string;
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
// Seed Data
// ---------------------------------------------------------

const DEFAULT_CARDS: CardInfo[] = [
  { id: 'card-1', name: 'HDFC Regalia', lastFour: '4321', billingDay: 15, dueDay: 5, creditLimit: 500000 },
  { id: 'card-2', name: 'ICICI Coral', lastFour: '8765', billingDay: 20, dueDay: 10, creditLimit: 300000 },
  { id: 'card-3', name: 'SBI SimplyClick', lastFour: '9876', billingDay: 1, dueDay: 21, creditLimit: 150000 },
];

const DEFAULT_PERSONAL_EXPENSES: PersonalExpense[] = [
  { id: 'pe-1', amount: 1200, category: 'Food', date: '2026-07-02', cardId: 'card-1', usedBy: 'Self', notes: 'Dinner at Bistro' },
  { id: 'pe-2', amount: 3500, category: 'Utilities', date: '2026-07-04', cardId: 'card-2', usedBy: 'Brother', notes: 'Brother used my card for electricity bill' },
  { id: 'pe-3', amount: 850, category: 'Transport', date: '2026-07-05', cardId: 'cash', usedBy: 'Self', notes: 'Fuel fill up' },
  { id: 'pe-4', amount: 1500, category: 'Shopping', date: '2026-07-08', cardId: 'card-1', usedBy: 'Spouse', notes: 'Spouse bought books' },
  { id: 'pe-5', amount: 650, category: 'Groceries', date: '2026-07-10', cardId: 'card-3', usedBy: 'Self', notes: 'Weekly grocery run' },
  // Previous month expenses for billing date demonstration
  { id: 'pe-6', amount: 4500, category: 'Entertainment', date: '2026-06-18', cardId: 'card-1', usedBy: 'Self', notes: 'Concert tickets' },
  { id: 'pe-7', amount: 2000, category: 'Shopping', date: '2026-06-25', cardId: 'card-2', usedBy: 'Brother', notes: 'Clothes' },
];

const DEFAULT_CONSTRUCTION_EXPENSES: ConstructionExpense[] = [
  { id: 'ce-1', amount: 250000, category: 'Cement', date: '2026-05-10', vendor: 'Ultratech Cement Ltd', notes: 'First batch cement (500 bags) for foundation', status: 'Paid' },
  { id: 'ce-2', amount: 480000, category: 'Steel', date: '2026-05-25', vendor: 'Tata Tiscon', notes: 'Foundation steel rods', status: 'Paid' },
  { id: 'ce-3', amount: 120000, category: 'Architect', date: '2026-06-05', vendor: 'Creative Spaces Studio', notes: 'Layout plan & blueprint blueprints design fee', status: 'Paid' },
  { id: 'ce-4', amount: 85000, category: 'Labor', date: '2026-07-01', vendor: 'Ramesh contractor group', notes: 'Excavation & pillars labor wages', status: 'Paid' },
  { id: 'ce-5', amount: 60000, category: 'Plumbing', date: '2026-07-11', vendor: 'Supreme Pipes & Sanitary', notes: 'Main drainage line piping supply', status: 'Pending' },
];

const DEFAULT_DEBTS: DebtEntry[] = [
  { id: 'd-1', contactName: 'Amit Verma', amount: 15000, type: 'Receivable', dueDate: '2026-07-25', status: 'Pending', notes: 'Shared travel tickets money' },
  { id: 'd-2', contactName: 'Rahul Kumar', amount: 5000, type: 'Receivable', dueDate: '2026-08-10', status: 'Pending', notes: 'Short term loan' },
  { id: 'd-3', contactName: 'Sharma Contractor', amount: 45000, type: 'Payable', dueDate: '2026-07-20', status: 'Pending', notes: 'Plumbing wages pending check clearance' },
  { id: 'd-4', contactName: 'Sunita (Sister)', amount: 10000, type: 'Payable', dueDate: '2026-07-18', status: 'Pending', notes: 'Borrowed to pay internet & cell bills' },
];

const DEFAULT_CONSTRUCTION_BUDGET = 5000000; // 50 Lakhs INR
const DEFAULT_PERSONAL_TARGET = 10000; // 10k INR per month

// ---------------------------------------------------------
// Helper for Async Simulation
// ---------------------------------------------------------
const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

// ---------------------------------------------------------
// API Services Layer
// ---------------------------------------------------------

export const financeService = {
  // Cards API
  async getCards(): Promise<CardInfo[]> {
    await delay();
    return getStorageItem<CardInfo[]>('finance_cards', DEFAULT_CARDS);
  },

  async addCard(card: Omit<CardInfo, 'id'>): Promise<CardInfo> {
    await delay();
    const cards = getStorageItem<CardInfo[]>('finance_cards', DEFAULT_CARDS);
    const newCard: CardInfo = { ...card, id: `card-${Date.now()}` };
    cards.push(newCard);
    setStorageItem('finance_cards', cards);
    return newCard;
  },

  async deleteCard(id: string): Promise<boolean> {
    await delay();
    const cards = getStorageItem<CardInfo[]>('finance_cards', DEFAULT_CARDS);
    const filtered = cards.filter(c => c.id !== id);
    setStorageItem('finance_cards', filtered);
    return true;
  },

  // Personal Expenses API
  async getPersonalExpenses(): Promise<PersonalExpense[]> {
    await delay();
    return getStorageItem<PersonalExpense[]>('finance_personal_expenses', DEFAULT_PERSONAL_EXPENSES);
  },

  async addPersonalExpense(expense: Omit<PersonalExpense, 'id'>): Promise<PersonalExpense> {
    await delay();
    const expenses = getStorageItem<PersonalExpense[]>('finance_personal_expenses', DEFAULT_PERSONAL_EXPENSES);
    const newExpense: PersonalExpense = { ...expense, id: `pe-${Date.now()}` };
    expenses.push(newExpense);
    setStorageItem('finance_personal_expenses', expenses);
    return newExpense;
  },

  async deletePersonalExpense(id: string): Promise<boolean> {
    await delay();
    const expenses = getStorageItem<PersonalExpense[]>('finance_personal_expenses', DEFAULT_PERSONAL_EXPENSES);
    const filtered = expenses.filter(e => e.id !== id);
    setStorageItem('finance_personal_expenses', filtered);
    return true;
  },

  // Personal Target API
  async getPersonalTarget(): Promise<number> {
    await delay();
    return getStorageItem<number>('finance_personal_target', DEFAULT_PERSONAL_TARGET);
  },

  async updatePersonalTarget(target: number): Promise<number> {
    await delay();
    setStorageItem('finance_personal_target', target);
    return target;
  },

  // Construction Expenses API
  async getConstructionExpenses(): Promise<ConstructionExpense[]> {
    await delay();
    return getStorageItem<ConstructionExpense[]>('finance_construction_expenses', DEFAULT_CONSTRUCTION_EXPENSES);
  },

  async addConstructionExpense(expense: Omit<ConstructionExpense, 'id'>): Promise<ConstructionExpense> {
    await delay();
    const expenses = getStorageItem<ConstructionExpense[]>('finance_construction_expenses', DEFAULT_CONSTRUCTION_EXPENSES);
    const newExpense: ConstructionExpense = { ...expense, id: `ce-${Date.now()}` };
    expenses.push(newExpense);
    setStorageItem('finance_construction_expenses', expenses);
    return newExpense;
  },

  async updateConstructionExpenseStatus(id: string, status: 'Paid' | 'Pending'): Promise<boolean> {
    await delay();
    const expenses = getStorageItem<ConstructionExpense[]>('finance_construction_expenses', DEFAULT_CONSTRUCTION_EXPENSES);
    const updated = expenses.map(e => e.id === id ? { ...e, status } : e);
    setStorageItem('finance_construction_expenses', updated);
    return true;
  },

  async deleteConstructionExpense(id: string): Promise<boolean> {
    await delay();
    const expenses = getStorageItem<ConstructionExpense[]>('finance_construction_expenses', DEFAULT_CONSTRUCTION_EXPENSES);
    const filtered = expenses.filter(e => e.id !== id);
    setStorageItem('finance_construction_expenses', filtered);
    return true;
  },

  async getConstructionBudget(): Promise<number> {
    await delay();
    return getStorageItem<number>('finance_construction_budget', DEFAULT_CONSTRUCTION_BUDGET);
  },

  async updateConstructionBudget(budget: number): Promise<number> {
    await delay();
    setStorageItem('finance_construction_budget', budget);
    return budget;
  },

  // Debts API
  async getDebts(): Promise<DebtEntry[]> {
    await delay();
    return getStorageItem<DebtEntry[]>('finance_debts', DEFAULT_DEBTS);
  },

  async addDebt(debt: Omit<DebtEntry, 'id'>): Promise<DebtEntry> {
    await delay();
    const debts = getStorageItem<DebtEntry[]>('finance_debts', DEFAULT_DEBTS);
    const newDebt: DebtEntry = { ...debt, id: `d-${Date.now()}` };
    debts.push(newDebt);
    setStorageItem('finance_debts', debts);
    return newDebt;
  },

  async updateDebtStatus(id: string, status: 'Pending' | 'Paid'): Promise<boolean> {
    await delay();
    const debts = getStorageItem<DebtEntry[]>('finance_debts', DEFAULT_DEBTS);
    const updated = debts.map(d => d.id === id ? { ...d, status } : d);
    setStorageItem('finance_debts', updated);
    return true;
  },

  async deleteDebt(id: string): Promise<boolean> {
    await delay();
    const debts = getStorageItem<DebtEntry[]>('finance_debts', DEFAULT_DEBTS);
    const filtered = debts.filter(d => d.id !== id);
    setStorageItem('finance_debts', filtered);
    return true;
  },

  // Billing calculations for Credit Cards
  async getCardBillStatements(targetMonth: string): Promise<CardBillStatement[]> {
    await delay();
    // targetMonth is YYYY-MM, e.g. "2026-07"
    const cards = getStorageItem<CardInfo[]>('finance_cards', DEFAULT_CARDS);
    const expenses = getStorageItem<PersonalExpense[]>('finance_personal_expenses', DEFAULT_PERSONAL_EXPENSES);
    const paidBills = getStorageItem<Record<string, boolean>>('finance_paid_bills', {});

    const year = parseInt(targetMonth.split('-')[0]);
    const month = parseInt(targetMonth.split('-')[1]); // 1-indexed

    return cards.map(card => {
      const billingDay = card.billingDay;
      const dueDay = card.dueDay;

      // Start date of the cycle is previous month's billingDay + 1
      let startYear = year;
      let startMonth = month - 1;
      if (startMonth === 0) {
        startMonth = 12;
        startYear = year - 1;
      }
      
      const startDateStr = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(billingDay + 1).padStart(2, '0')}`;
      const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(billingDay).padStart(2, '0')}`;

      // Due date calculation: payment is due in month+1 around dueDay (or month+2 if dueDay is very low, but generally it's month+1)
      let dueYear = year;
      let dueMonth = month;
      
      // If billing date is late in the month (e.g. 20th) and due date is early next month (e.g. 10th), due month is month + 1
      if (dueDay < billingDay) {
        dueMonth = month + 1;
      }
      if (dueMonth > 12) {
        dueMonth = 1;
        dueYear = year + 1;
      }
      
      const dueDateStr = `${dueYear}-${String(dueMonth).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`;

      // Filter transactions that fall within this date range for this card
      const startMs = new Date(startDateStr).getTime();
      const endMs = new Date(endDateStr).getTime();

      const cardTransactions = expenses.filter(exp => {
        if (exp.cardId !== card.id) return false;
        const expMs = new Date(exp.date).getTime();
        return expMs >= startMs && expMs <= endMs;
      });

      const totalAmount = cardTransactions.reduce((sum, item) => sum + item.amount, 0);
      const billKey = `${card.id}_${targetMonth}`;
      const isPaid = !!paidBills[billKey];

      return {
        cardId: card.id,
        cardName: card.name,
        statementMonth: targetMonth,
        startDate: startDateStr,
        endDate: endDateStr,
        dueDate: dueDateStr,
        totalAmount,
        transactions: cardTransactions,
        isPaid
      };
    });
  },

  async markCardBillAsPaid(cardId: string, targetMonth: string, isPaid: boolean): Promise<boolean> {
    await delay();
    const paidBills = getStorageItem<Record<string, boolean>>('finance_paid_bills', {});
    const billKey = `${cardId}_${targetMonth}`;
    if (isPaid) {
      paidBills[billKey] = true;
    } else {
      delete paidBills[billKey];
    }
    setStorageItem('finance_paid_bills', paidBills);
    return true;
  }
};
