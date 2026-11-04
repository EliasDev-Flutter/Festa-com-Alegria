import React from 'react';
import {
  TrendingUp,
  Wallet,
  ShoppingBag,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  ArrowUpRight,
  PlusCircle,
  Percent,
  Bell,
  Sparkle,
} from 'lucide-react';
import { Order, Expense, PeriodFilter, TabType, AppSettings } from '../types/index.ts';
import { calculateFinancialSummary, formatBRL } from '../utils/finance.ts';

interface DashboardViewProps {
  orders: Order[];
  expenses: Expense[];
  period: PeriodFilter;
  settings: AppSettings;
  onPeriodChange: (p: PeriodFilter) => void;
  onNavigateTab: (tab: TabType) => void;
  onNewOrder: () => void;
  onNewExpense: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  expenses,
  period,
  settings,
  onPeriodChange,
  onNavigateTab,
  onNewOrder,
  onNewExpense,
}) => {
  const summary = calculateFinancialSummary(orders, expenses, period);

  const periods: { id: PeriodFilter; label: string }[] = [
    { id: 'semanal', label: 'Semanal' },
    { id: 'mensal', label: 'Mensal' },
    { id: 'trimestral', label: 'Trimestral' },
    { id: 'semestral', label: 'Semestral' },
  ];

  // Helper for days remaining
  const getDiffDays = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getDaysRemainingText = (diff: number) => {
    if (diff === 0) return 'É hoje!';
    if (diff === 1) return 'Amanhã';
    if (diff > 1) return `Em ${diff} dias`;
    return 'Data passada';
  };

  // Find if any party triggers the notification configured in settings
  const upcomingNotificationOrder = orders
    .filter((o) => o.status !== 'concluido')
    .map((o) => ({ ...o, diff: getDiffDays(o.partyDate) }))
    .filter((o) => o.diff >= 0 && o.diff <= settings.notificationDaysBefore)
    .sort((a, b) => a.diff - b.diff)[0];

  // Upcoming parties list
  const upcomingOrders = [...orders]
    .filter((o) => o.status !== 'concluido')
    .sort((a, b) => a.partyDate.localeCompare(b.partyDate))
    .slice(0, 4);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'confirmado':
        return { label: 'Confirmado', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
      case 'em_preparacao':
        return { label: 'Em Produção', bg: 'bg-amber-50 text-amber-700 border-amber-100' };
      case 'orcamento':
        return { label: 'Orçamento', bg: 'bg-sky-50 text-sky-700 border-sky-100' };
      case 'concluido':
        return { label: 'Realizada', bg: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round((summary.revenue / (settings.monthlyTarget || 15000)) * 100)
  );

  return (
    <div className="space-y-4 pb-6">
      {/* Active Notification Banner (Configured via Settings) */}
      {settings.notificationsEnabled && upcomingNotificationOrder && (
        <div
          onClick={() => onNavigateTab('pedidos')}
          className="bg-gradient-to-r from-rose-50 via-[#FFFDF5] to-amber-50 border border-rose-200/90 rounded-2xl p-3.5 shadow-sm space-y-1.5 cursor-pointer active:scale-98 transition-all"
        >
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-black text-[#FF4B93] flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 fill-[#FF4B93]" />
              {settings.notificationTitle || 'Lembrete de Decoração'}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">
              Aviso Importante
            </span>
          </div>

          <p className="text-xs font-bold text-slate-800">
            {upcomingNotificationOrder.theme} · {upcomingNotificationOrder.clientName}
          </p>

          <p className="text-[11px] text-slate-600 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#FF4B93] shrink-0" />
            Festa {getDaysRemainingText(upcomingNotificationOrder.diff)}! Horário da festa:{' '}
            <strong className="text-slate-800 font-bold">
              {upcomingNotificationOrder.partyTime || '14:00'} horas
            </strong>.
          </p>
        </div>
      )}

      {/* Period Selector (iOS Pill style) */}
      <div id="tour-period-selector" className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
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

      {/* Main Net Profit Card (Hero Card) */}
      <div id="tour-kpi-summary" className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF9A9E] via-[#FECFEF] to-[#FFF1EB] p-5 shadow-sm text-slate-900 border border-rose-200/50">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-white/80 backdrop-blur-xs flex items-center justify-center text-[#FF4B93] shadow-2xs">
                <TrendingUp className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Lucro Líquido Estimado
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-[#FF4B93] shadow-2xs">
              <Percent className="w-3 h-3 text-[#FF4B93]" />
              {summary.profitMargin.toFixed(0)}% margem
            </span>
          </div>

          <div className="mt-3">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 tabular-nums">
              {formatBRL(summary.netProfit)}
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Considerando faturamento de festas ativas menos gastos com materiais.
            </p>
          </div>

          {/* Quick Metrics Bar inside Hero */}
          <div className="mt-4 pt-3 border-t border-rose-200/60 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/70 backdrop-blur-xs rounded-xl p-2.5">
              <span className="text-slate-500 text-[11px] block">Faturamento</span>
              <span className="font-bold text-slate-800 text-sm tabular-nums">
                {formatBRL(summary.revenue)}
              </span>
            </div>
            <div className="bg-white/70 backdrop-blur-xs rounded-xl p-2.5">
              <span className="text-slate-500 text-[11px] block">Gastos Materiais</span>
              <span className="font-bold text-rose-700 text-sm tabular-nums">
                {formatBRL(summary.expenses)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card Gastos Materiais */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-500">Materiais</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#FF4B93] flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-lg font-black text-slate-800 tabular-nums">
              {formatBRL(summary.expenses)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Balões, estruturas e frete</p>
          </div>

          <button
            onClick={() => onNavigateTab('financas')}
            className="mt-3 text-xs font-bold text-[#FF4B93] flex items-center gap-1 hover:text-rose-700 pt-2 border-t border-slate-50 cursor-pointer"
          >
            Ver despesas
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card Festas & Pedidos */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium text-slate-500">Festas Ativas</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-lg font-black text-slate-800 tabular-nums">
              {summary.confirmedCount} <span className="text-xs font-normal text-slate-400">/ {summary.orderCount} total</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">No período selecionado</p>
          </div>

          <button
            onClick={() => onNavigateTab('pedidos')}
            className="mt-3 text-xs font-bold text-[#FF4B93] flex items-center gap-1 hover:text-rose-700 pt-2 border-t border-slate-50 cursor-pointer"
          >
            Gerenciar pedidos
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Action Buttons Bar */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onNewOrder}
          className="min-h-[48px] px-4 py-3 bg-white hover:bg-rose-50/50 rounded-2xl border border-rose-100 shadow-sm flex items-center justify-center gap-2 text-[#FF4B93] font-bold text-xs active:scale-[0.98] transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Cadastrar Pedido</span>
        </button>

        <button
          onClick={onNewExpense}
          className="min-h-[48px] px-4 py-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center gap-2 text-slate-700 font-bold text-xs active:scale-[0.98] transition-all cursor-pointer"
        >
          <Wallet className="w-4 h-4 text-slate-500" />
          <span>Lançar Gasto</span>
        </button>
      </div>

      {/* Target Progress Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">Meta Mensal da Empresa</span>
          <span className="font-black text-[#FF4B93] tabular-nums">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full mt-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FF4B93] via-[#FF6B8B] to-[#FFBF1A] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 text-[11px] text-slate-400">
          <span>{formatBRL(summary.revenue)} faturados</span>
          <span>Meta: {formatBRL(settings.monthlyTarget || 15000)}</span>
        </div>
      </div>

      {/* Próximas Festas & Entregas Section */}
      <div id="tour-upcoming-orders" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FF4B93]" />
            <h3 className="text-xs font-bold text-slate-800">Próximas Decorações</h3>
          </div>
          <button
            onClick={() => onNavigateTab('pedidos')}
            className="text-xs font-bold text-[#FF4B93] hover:underline cursor-pointer"
          >
            Ver todas
          </button>
        </div>

        {upcomingOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100 space-y-2">
            <p className="text-xs text-slate-500 font-medium">Nenhuma festa cadastrada no momento.</p>
            <button
              onClick={onNewOrder}
              className="text-xs font-bold text-[#FF4B93] underline cursor-pointer"
            >
              Cadastrar primeira festa
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {upcomingOrders.map((order) => {
              const badge = getStatusBadge(order.status);
              const diff = getDiffDays(order.partyDate);
              const daysLeft = getDaysRemainingText(diff);

              return (
                <div
                  key={order.id}
                  onClick={() => onNavigateTab('pedidos')}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 active:scale-[0.99] transition-all cursor-pointer hover:border-rose-100"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-[11px] font-bold text-[#FF4B93] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {daysLeft}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mt-1.5 leading-snug">
                        {order.theme}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {order.clientName}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-800 text-sm tabular-nums">
                        {formatBRL(order.value)}
                      </span>
                      <span className="block text-[11px] text-slate-400 capitalize">
                        {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(
                          new Date(order.partyDate + 'T00:00:00')
                        )}
                        {order.partyTime && ` · ${order.partyTime}h`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{order.location || 'Local a definir'}</span>
                    </span>
                    <span className="text-[#FF4B93] font-semibold shrink-0">
                      Detalhes →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
