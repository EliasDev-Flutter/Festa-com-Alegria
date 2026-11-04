import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  PieChart,
  Tag,
  DollarSign,
  TrendingDown,
  TrendingUp,
  X,
  Check,
  Info,
  Calendar,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { Expense, ExpenseCategory, Order, PeriodFilter } from '../types/index.ts';
import {
  calculateFinancialSummary,
  formatBRL,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  isDateInPeriod,
  getPaymentBadge,
} from '../utils/finance.ts';

interface FinanceViewProps {
  orders: Order[];
  expenses: Expense[];
  period: PeriodFilter;
  onPeriodChange: (p: PeriodFilter) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  initialKpiDetail?: KpiDetailType;
  onClearInitialKpiDetail?: () => void;
}

type KpiDetailType = 'receita' | 'gastos' | 'lucro' | null;

export const FinanceView: React.FC<FinanceViewProps> = ({
  orders,
  expenses,
  period,
  onPeriodChange,
  onAddExpense,
  onDeleteExpense,
  initialKpiDetail = null,
  onClearInitialKpiDetail,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('baloes');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  // Active detail balloon modal when holding/clicking a KPI card or navigated from Home
  const [activeKpiDetail, setActiveKpiDetail] = useState<KpiDetailType>(initialKpiDetail);

  // Sync if initialKpiDetail changes from outside
  React.useEffect(() => {
    if (initialKpiDetail) {
      setActiveKpiDetail(initialKpiDetail);
    }
  }, [initialKpiDetail]);

  const summary = calculateFinancialSummary(orders, expenses, period);

  const periods: { id: PeriodFilter; label: string }[] = [
    { id: 'semanal', label: 'Semanal' },
    { id: 'mensal', label: 'Mensal' },
    { id: 'trimestral', label: 'Trimestral' },
    { id: 'semestral', label: 'Semestral' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddExpense({
      description: description.trim(),
      amount: parsedAmount,
      category,
      date,
      orderId: selectedOrderId || undefined,
    });

    // Reset & close
    setDescription('');
    setAmount('');
    setIsModalOpen(false);
  };

  const categories = Object.keys(CATEGORY_LABELS) as ExpenseCategory[];

  // Filtered lists for detail balloon
  const periodOrders = orders
    .filter((o) => isDateInPeriod(o.partyDate, period) && o.status !== 'orcamento')
    .sort((a, b) => b.partyDate.localeCompare(a.partyDate));

  const periodExpenses = expenses
    .filter((e) => isDateInPeriod(e.date, period))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4 pb-6">
      {/* Period Selector (iOS Pill style) */}
      <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-4 gap-1">
          {periods.map((p) => {
            const isSelected = period === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onPeriodChange(p.id)}
                className={`min-h-[44px] px-2 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center justify-center ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#FF4B93] to-[#FF6B8B] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary KPI Strip with Long-Press / Click Balloon Helper */}
      <div className="space-y-1.5">
        <div id="tour-kpi-balloons" className="grid grid-cols-3 gap-2 text-center">
          {/* Card Receita */}
          <button
            type="button"
            onClick={() => setActiveKpiDetail('receita')}
            className="bg-white hover:bg-emerald-50/40 rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col justify-between cursor-pointer transition-all active:scale-95 text-left group"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 mb-1 w-full">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Receita
              </span>
              <Info className="w-3 h-3 text-slate-300 group-hover:text-emerald-500" />
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-900 tabular-nums break-words leading-tight mt-1">
              {formatBRL(summary.revenue)}
            </div>
            <span className="text-[9px] text-slate-400 mt-1 block">Toque p/ detalhes</span>
          </button>

          {/* Card Gastos */}
          <button
            type="button"
            onClick={() => setActiveKpiDetail('gastos')}
            className="bg-white hover:bg-rose-50/40 rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col justify-between cursor-pointer transition-all active:scale-95 text-left group"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-rose-500 mb-1 w-full">
              <span className="flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                Gastos
              </span>
              <Info className="w-3 h-3 text-slate-300 group-hover:text-rose-500" />
            </div>
            <div className="text-xs sm:text-sm font-black text-rose-600 tabular-nums break-words leading-tight mt-1">
              {formatBRL(summary.expenses)}
            </div>
            <span className="text-[9px] text-slate-400 mt-1 block">Toque p/ detalhes</span>
          </button>

          {/* Card Lucro */}
          <button
            type="button"
            onClick={() => setActiveKpiDetail('lucro')}
            className="bg-gradient-to-b from-rose-50/70 to-white hover:to-rose-50/40 rounded-2xl p-3 shadow-sm border border-rose-100 flex flex-col justify-between cursor-pointer transition-all active:scale-95 text-left group"
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 mb-1 w-full">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-[#FF4B93]" />
                Lucro
              </span>
              <Info className="w-3 h-3 text-slate-300 group-hover:text-[#FF4B93]" />
            </div>
            <div className="text-xs sm:text-sm font-black text-[#FF4B93] tabular-nums break-words leading-tight mt-1">
              {formatBRL(summary.netProfit)}
            </div>
            <span className="text-[9px] text-[#FF4B93] font-semibold mt-1 block">
              {summary.profitMargin.toFixed(0)}% margem
            </span>
          </button>
        </div>

        <p className="text-[10px] text-center text-slate-400 font-medium">
          💡 Toque em qualquer card acima para ver o valor sem cortes e a composição completa.
        </p>
      </div>

      {/* KPI Detail Balloon Modal */}
      {activeKpiDetail && (
        <div
          onClick={() => setActiveKpiDetail(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto"
          >
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

            {/* Header of Balloon */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {activeKpiDetail === 'receita' && <TrendingUp className="w-5 h-5 text-emerald-500" />}
                {activeKpiDetail === 'gastos' && <TrendingDown className="w-5 h-5 text-rose-500" />}
                {activeKpiDetail === 'lucro' && <DollarSign className="w-5 h-5 text-[#FF4B93]" />}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 capitalize">
                    Detalhamento Completo: {activeKpiDetail}
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Período selecionado: {period}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveKpiDetail(null);
                  onClearInitialKpiDetail?.();
                }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content for RECEITA */}
            {activeKpiDetail === 'receita' && (
              <div className="py-4 space-y-4">
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                    Valor Total da Receita
                  </span>
                  <div className="text-2xl font-black text-emerald-800 tabular-nums mt-1">
                    {formatBRL(summary.revenue)}
                  </div>
                  <span className="text-[11px] text-emerald-600 mt-1 block">
                    Proveniente de {periodOrders.length} {periodOrders.length === 1 ? 'festa confirmada' : 'festas confirmadas'}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    Festas que compõem esta receita:
                  </span>
                  {periodOrders.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl">
                      Nenhuma festa confirmada no período selecionado.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {periodOrders.map((order) => {
                        const payBadge = getPaymentBadge(order);
                        return (
                          <div
                            key={order.id}
                            className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-slate-800 leading-snug truncate">
                                {order.theme}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate">
                                {order.clientName}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-emerald-500" />
                                  {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(
                                    new Date(order.partyDate + 'T00:00:00')
                                  )}
                                  {order.partyTime && ` · ${order.partyTime}h`}
                                </span>
                                {order.paymentMethod && (
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${payBadge.colorClass}`}>
                                    {payBadge.label}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs font-black text-emerald-700 tabular-nums shrink-0">
                              {formatBRL(order.value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content for GASTOS */}
            {activeKpiDetail === 'gastos' && (
              <div className="py-4 space-y-4">
                <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
                    Valor Total de Gastos com Materiais
                  </span>
                  <div className="text-2xl font-black text-rose-800 tabular-nums mt-1">
                    {formatBRL(summary.expenses)}
                  </div>
                  <span className="text-[11px] text-rose-600 mt-1 block">
                    {periodExpenses.length} lançamentos de materiais e frete
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    Lançamentos registrados:
                  </span>
                  {periodExpenses.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl">
                      Nenhum gasto lançado no período selecionado.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {periodExpenses.map((exp) => (
                        <div
                          key={exp.id}
                          className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between gap-2"
                        >
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">
                              {exp.description}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              {CATEGORY_LABELS[exp.category]} · {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(exp.date + 'T00:00:00'))}
                            </span>
                          </div>
                          <span className="text-xs font-black text-rose-600 tabular-nums shrink-0">
                            {formatBRL(exp.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content for LUCRO */}
            {activeKpiDetail === 'lucro' && (
              <div className="py-4 space-y-4">
                <div className="bg-gradient-to-r from-rose-50 to-[#FFFDF0] border border-rose-200 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-[#FF4B93] uppercase tracking-wider block">
                    Lucro Líquido Real Calculado
                  </span>
                  <div className="text-2xl font-black text-[#FF4B93] tabular-nums mt-1">
                    {formatBRL(summary.netProfit)}
                  </div>
                  <span className="text-[11px] text-slate-600 font-medium mt-1 block">
                    Margem de rentabilidade: <strong>{summary.profitMargin.toFixed(1)}%</strong>
                  </span>
                </div>

                {/* Calculation breakdown */}
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 space-y-2 text-xs">
                  <span className="font-bold text-slate-700 block">Composição do Lucro:</span>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-600">(+) Receitas de Festas</span>
                    <span className="font-bold text-emerald-700 tabular-nums">{formatBRL(summary.revenue)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-600">(-) Gastos com Materiais</span>
                    <span className="font-bold text-rose-600 tabular-nums">{formatBRL(summary.expenses)}</span>
                  </div>
                  <div className="flex justify-between py-1 pt-1.5 font-bold">
                    <span className="text-slate-800">(=) Lucro Livre</span>
                    <span className="text-[#FF4B93] text-sm tabular-nums">{formatBRL(summary.netProfit)}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveKpiDetail(null)}
              className="w-full min-h-[44px] bg-slate-900 text-white font-bold text-xs rounded-xl mt-2 cursor-pointer active:scale-98"
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      )}

      {/* Material Categories Breakdown */}
      <div id="tour-finance-materials" className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#FF4B93]" />
            <h3 className="text-xs font-bold text-slate-800">Gastos com Materiais</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Total {formatBRL(summary.expenses)}
          </span>
        </div>

        {summary.expenses === 0 ? (
          <div className="py-6 text-center text-slate-400 space-y-1">
            <p className="text-xs font-medium">Nenhuma despesa de material registrada no período.</p>
            <p className="text-[11px] text-slate-400">Clique em "Lançar Gasto" para cadastrar.</p>
          </div>
        ) : (
          <div className="space-y-2.5 pt-1">
            {categories.map((cat) => {
              const spent = summary.categoryExpenses[cat] || 0;
              const percent = summary.expenses > 0 ? (spent / summary.expenses) * 100 : 0;
              if (spent === 0) return null;

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-700 flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                      />
                      {CATEGORY_LABELS[cat]}
                    </span>
                    <span className="font-bold text-slate-800 tabular-nums">
                      {formatBRL(spent)}{' '}
                      <span className="text-[10px] font-normal text-slate-400">
                        ({percent.toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: CATEGORY_COLORS[cat],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expense History Header with Add Button */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-xs font-bold text-slate-800">Histórico de Despesas</h3>
        <button
          id="tour-finance-add-expense"
          onClick={() => setIsModalOpen(true)}
          className="min-h-[44px] px-3.5 rounded-xl bg-gradient-to-r from-[#FF4B93] to-[#FF6B8B] hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-rose-200 cursor-pointer active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Gasto</span>
        </button>
      </div>

      {/* Expense List */}
      <div className="space-y-2.5">
        {expenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#FF4B93] flex items-center justify-center mx-auto">
              <Tag className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700">Nenhum gasto cadastrado ainda.</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Quando você comprar balões, alugar estruturas ou pagar frete, lance aqui para calcular seu lucro real.
            </p>
          </div>
        ) : (
          expenses.map((expense) => {
            const catLabel = CATEGORY_LABELS[expense.category] || 'Outros';
            const catColor = CATEGORY_COLORS[expense.category] || '#CBD5E1';

            return (
              <div
                key={expense.id}
                className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${catColor}20`, color: catColor }}
                  >
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs leading-snug line-clamp-1">
                      {expense.description}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{catLabel}</span>
                      <span>·</span>
                      <span>
                        {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(
                          new Date(expense.date + 'T00:00:00')
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-slate-800 text-xs tabular-nums">
                    {formatBRL(expense.amount)}
                  </span>
                  <button
                    onClick={() => onDeleteExpense(expense.id)}
                    aria-label={`Excluir despesa ${expense.description}`}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-rose-500 rounded-lg active:scale-90 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal / Bottom Sheet: Lançar Nova Despesa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Lançar Novo Gasto</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Descrição do Material / Serviço *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 200 balões cromados ouro e pêssego"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Categoria de Material
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Vincular a uma Festa (Opcional)
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93]"
                >
                  <option value="">Geral / Sem vínculo específico</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.theme} ({o.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[48px] bg-gradient-to-r from-[#FF4B93] to-[#FF6B8B] hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Gasto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
