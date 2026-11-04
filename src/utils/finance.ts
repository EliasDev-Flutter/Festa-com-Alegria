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

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cartao_credito: 'Cartão de Crédito',
  debito: 'Débito',
  pix: 'PIX',
  boleto: 'Boleto',
  cinquenta_porcento: '50% Entrada',
  a_vista: 'À vista',
};

export const MONTH_OPTIONS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function getPaymentBadge(order: {
  paymentMethod?: string;
  installments?: number;
  splitMonths?: { firstMonth?: string; secondMonth?: string };
}): { label: string; details?: string; colorClass: string } {
  if (!order.paymentMethod) {
    return {
      label: 'A Definir',
      colorClass: 'bg-slate-50 text-slate-500 border-slate-200',
    };
  }

  switch (order.paymentMethod) {
    case 'cartao_credito': {
      const inst = order.installments || 1;
      return {
        label: `Cartão ${inst}x`,
        details: `${inst}x parcelado`,
        colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      };
    }
    case 'pix':
      return {
        label: 'PIX',
        details: 'Instantâneo',
        colorClass: 'bg-teal-50 text-teal-700 border-teal-200',
      };
    case 'cinquenta_porcento': {
      const m1 = order.splitMonths?.firstMonth || '';
      const m2 = order.splitMonths?.secondMonth || '';
      const monthText = m1 && m2 ? `${m1.slice(0, 3)}/${m2.slice(0, 3)}` : '2x meses';
      return {
        label: `50% (${monthText})`,
        details: m1 && m2 ? `${m1} & ${m2}` : '50% entrada + restante',
        colorClass: 'bg-purple-50 text-purple-700 border-purple-200',
      };
    }
    case 'debito':
      return {
        label: 'Débito',
        details: 'À vista',
        colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    case 'boleto':
      return {
        label: 'Boleto',
        details: 'Bancário',
        colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    case 'a_vista':
      return {
        label: 'À vista',
        details: 'Dinheiro / Transferência',
        colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    default:
      return {
        label: PAYMENT_METHOD_LABELS[order.paymentMethod] || 'Pagamento',
        colorClass: 'bg-slate-50 text-slate-600 border-slate-200',
      };
  }
}

