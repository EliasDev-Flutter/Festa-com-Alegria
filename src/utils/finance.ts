import { Order, Expense, PeriodFilter, ExpenseCategory } from '../types/index.ts';

export function formatBRL(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatBRLShort(amount: number): string {
  if (amount >= 1000) {
    const formatted = (amount / 1000).toFixed(1).replace('.', ',');
    return `R$ ${formatted}k`;
  }
  return formatBRL(amount);
}

export function isDateInPeriod(dateStr: string, period: PeriodFilter, referenceDate: Date = new Date()): boolean {
  if (!dateStr) return false;
  const targetDate = new Date(dateStr + 'T00:00:00');
  if (isNaN(targetDate.getTime())) return false;

  const now = new Date(referenceDate);
  const diffDays = Math.floor((now.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

  switch (period) {
    case 'semanal':
      // Within +/- 7 days
      return Math.abs(diffDays) <= 7;
    case 'mensal':
      // Within current month or +/- 30 days
      return Math.abs(diffDays) <= 31;
    case 'trimestral':
      // Within 90 days
      return Math.abs(diffDays) <= 92;
    case 'semestral':
      // Within 180 days
      return Math.abs(diffDays) <= 185;
    default:
      return true;
  }
}

export interface FinancialSummary {
  revenue: number;
  expenses: number;
  netProfit: number;
  profitMargin: number;
  orderCount: number;
  confirmedCount: number;
  categoryExpenses: Record<ExpenseCategory, number>;
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  baloes: 'Balões & Arcos',
  estruturas_paineis: 'Painéis & Estruturas',
  flores_folhagens: 'Flores & Folhagens',
  mobiliario: 'Locação Mobiliário',
  deslocamento_frete: 'Frete & Logística',
  outros: 'Outros Materiais',
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  baloes: '#FF9A9E', // Rose Pastel
  estruturas_paineis: '#A18CD1', // Lilac
  flores_folhagens: '#84D9BA', // Mint
  mobiliario: '#FBC2EB', // Soft Pink
  deslocamento_frete: '#FEE140', // Joyful Yellow
  outros: '#CBD5E1', // Slate
};

export function calculateFinancialSummary(
  orders: Order[],
  expenses: Expense[],
  period: PeriodFilter,
  refDate: Date = new Date()
): FinancialSummary {
  const filteredOrders = orders.filter((o) => isDateInPeriod(o.partyDate, period, refDate));
  const filteredExpenses = expenses.filter((e) => isDateInPeriod(e.date, period, refDate));

  // Revenue is from orders that are confirmed, in preparation, or completed
  const activeOrders = filteredOrders.filter((o) => o.status !== 'orcamento');
  const revenue = activeOrders.reduce((acc, o) => acc + (o.value || 0), 0);

  // Total expenses include direct expenses and estimated material costs from active orders
  const directExpenses = filteredExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const totalExpenses = directExpenses;

  const netProfit = revenue - totalExpenses;
  const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  const categoryExpenses: Record<ExpenseCategory, number> = {
    baloes: 0,
    estruturas_paineis: 0,
    flores_folhagens: 0,
    mobiliario: 0,
    deslocamento_frete: 0,
    outros: 0,
  };

  for (const exp of filteredExpenses) {
    if (categoryExpenses[exp.category] !== undefined) {
      categoryExpenses[exp.category] += exp.amount || 0;
    } else {
      categoryExpenses.outros += exp.amount || 0;
    }
  }

  return {
    revenue,
    expenses: totalExpenses,
    netProfit,
    profitMargin,
    orderCount: filteredOrders.length,
    confirmedCount: activeOrders.length,
    categoryExpenses,
  };
}
