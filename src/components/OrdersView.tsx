import React, { useState } from 'react';
import {
  Sparkles,
  Edit3,
  Calendar,
  CheckCircle2,
  Trash2,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  ClipboardCopy,
  Plus,
} from 'lucide-react';
import { Order, OrderStatus } from '../types/index.ts';
import { parseWhatsAppMessage } from '../utils/orderParser.ts';
import { formatBRL } from '../utils/finance.ts';
import {
  formatCurrencyInput,
  formatDateInput,
  formatTimeInput,
  formatPhoneInput,
  toIsoDate,
  toBrazilianDate,
} from '../utils/formatters.ts';

interface OrdersViewProps {
  orders: Order[];
  onAddOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
  onDeleteOrder: (id: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onAddOrder,
  onUpdateOrderStatus,
  onDeleteOrder,
}) => {
  const [subTab, setSubTab] = useState<'smart' | 'manual'>('smart');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // WhatsApp Smart text
  const [rawText, setRawText] = useState('');
  const [extractedPreview, setExtractedPreview] = useState<{
    clientName: string;
    partyDate: string;
    partyTime: string;
    theme: string;
    location: string;
    value: number;
    clientPhone: string;
    notes: string;
  } | null>(null);

  // Manual Form State with Formatters
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [partyDateDisplay, setPartyDateDisplay] = useState(''); // DD/MM/AAAA
  const [partyTimeDisplay, setPartyTimeDisplay] = useState('14:00'); // HH:MM
  const [theme, setTheme] = useState('');
  const [location, setLocation] = useState('');
  const [valueDisplay, setValueDisplay] = useState(''); // R$ 0,00
  const [valueNumeric, setValueNumeric] = useState(0);
  const [materialCostDisplay, setMaterialCostDisplay] = useState(''); // R$ 0,00
  const [materialCostNumeric, setMaterialCostNumeric] = useState(0);
  const [status, setStatus] = useState<OrderStatus>('confirmado');
  const [notes, setNotes] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sample presets for quick testing
  const presets = [
    {
      title: 'WhatsApp 1 (Jardim)',
      text: 'Oi boa tarde! Gostaria de fechar a decoração pro aniversário da Sophia no dia 18/11/2026 às 15:00 horas. O tema vai ser Jardim Encantado no buffet Splash Kids. Ficou R$ 1.850 com o arco de balões desconstruído né?',
    },
    {
      title: 'WhatsApp 2 (Safari)',
      text: 'Olá! Sou a Fernanda, quero reservar pro meu filho Oliver pro dia 21/11/2026 às 14:00 horas. Decoração tema Safari com letreiro 3 iluminado no Espaço Granja Viana. Fechamos em R$ 2.800! Meu tel é (11) 97120-4499.',
    },
    {
      title: 'WhatsApp 3 (Pegue e Monte)',
      text: 'Oi! Aqui é a Renata. Quero fechar o Kit Pegue e Monte de cilindros dourados pro dia 28/11/2026 às 11h. Retirada no ateliê. Valor R$ 950,00 né?',
    },
  ];

  const handleProcessWhatsApp = () => {
    if (!rawText.trim()) return;
    const parsed = parseWhatsAppMessage(rawText);

    const detectedTime = parsed.partyTime || '14:00';

    setExtractedPreview({
      clientName: parsed.clientName || 'Cliente WhatsApp',
      partyDate: parsed.partyDate || new Date().toISOString().split('T')[0],
      partyTime: detectedTime,
      theme: parsed.theme || 'Decoração Personalizada',
      location: parsed.location || 'Local a definir',
      value: parsed.value || 1500,
      clientPhone: parsed.clientPhone || '',
      notes: parsed.notes || '',
    });

    // Auto-fill formatted manual form fields
    setClientName(parsed.clientName || 'Cliente WhatsApp');
    const isoDate = parsed.partyDate || new Date().toISOString().split('T')[0];
    setPartyDateDisplay(toBrazilianDate(isoDate));
    setPartyTimeDisplay(formatTimeInput(detectedTime));
    setTheme(parsed.theme || 'Decoração Personalizada');
    setLocation(parsed.location || 'Local a definir');
    if (parsed.value > 0) {
      const valFmt = formatCurrencyInput(parsed.value);
      setValueDisplay(valFmt.display);
      setValueNumeric(valFmt.numericValue);

      const estimatedCost = Math.round(parsed.value * 0.28);
      const costFmt = formatCurrencyInput(estimatedCost);
      setMaterialCostDisplay(costFmt.display);
      setMaterialCostNumeric(costFmt.numericValue);
    }
    if (parsed.clientPhone) setClientPhone(formatPhoneInput(parsed.clientPhone));
    if (parsed.notes) setNotes(parsed.notes);
  };

  const handleTransferToManual = () => {
    setSubTab('manual');
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const isoDate = toIsoDate(partyDateDisplay);
    if (!clientName.trim() || !isoDate || !theme.trim()) return;

    const finalVal = valueNumeric || 0;
    const finalCost = materialCostNumeric || Math.round(finalVal * 0.25);

    onAddOrder({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || undefined,
      partyDate: isoDate,
      partyTime: partyTimeDisplay || '14:00',
      theme: theme.trim(),
      location: location.trim() || 'A definir',
      value: finalVal,
      materialCost: finalCost,
      status,
      notes: notes.trim() || undefined,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);

    // Reset fields
    setClientName('');
    setClientPhone('');
    setPartyDateDisplay('');
    setPartyTimeDisplay('14:00');
    setTheme('');
    setLocation('');
    setValueDisplay('');
    setValueNumeric(0);
    setMaterialCostDisplay('');
    setMaterialCostNumeric(0);
    setNotes('');
    setRawText('');
    setExtractedPreview(null);
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'todos') return true;
    return o.status === statusFilter;
  });

  const getStatusBadge = (st: OrderStatus) => {
    switch (st) {
      case 'confirmado':
        return { label: 'Confirmado', bg: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
      case 'em_preparacao':
        return { label: 'Em Produção', bg: 'bg-amber-50 text-amber-700 border-amber-100' };
      case 'orcamento':
        return { label: 'Orçamento', bg: 'bg-sky-50 text-sky-700 border-sky-100' };
      case 'concluido':
        return { label: 'Concluído', bg: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Segmented Control: Análise Inteligente vs Entrada Manual */}
      <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setSubTab('smart')}
            className={`min-h-[44px] px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              subTab === 'smart'
                ? 'bg-gradient-to-r from-[#FF4B93] to-[#FF6B8B] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Análise Inteligente</span>
          </button>

          <button
            onClick={() => setSubTab('manual')}
            className={`min-h-[44px] px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              subTab === 'manual'
                ? 'bg-gradient-to-r from-[#FF4B93] to-[#FF6B8B] text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Entrada Manual</span>
          </button>
        </div>
      </div>

      {/* Subtab 1: Análise Inteligente */}
      {subTab === 'smart' && (
        <div className="space-y-4">
          <div id="tour-orders-smart-input" className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#FF4B93]" />
                  Smart Entry via WhatsApp
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Copie a conversa do WhatsApp e cole aqui para extrair os dados.
                </p>
              </div>
            </div>

            {/* Quick Test Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Exemplos Rápidos (Toque para Testar):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setRawText(preset.text);
                    }}
                    className="min-h-[36px] px-2.5 py-1 text-xs font-medium bg-rose-50 hover:bg-rose-100/70 text-[#FF4B93] rounded-lg border border-rose-100 flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                  >
                    <ClipboardCopy className="w-3 h-3 text-[#FF4B93]" />
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="pt-1">
              <textarea
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Cole aqui a mensagem da cliente: 'Oi boa tarde! Gostaria de fechar a decoração pro aniversário da Sophia no dia 18/11/2026 às 15:00 horas...'"
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93] text-slate-800 placeholder:text-slate-400 resize-none transition-all"
              />
            </div>

            {/* Process Button */}
            <button
              onClick={handleProcessWhatsApp}
              disabled={!rawText.trim()}
              className="w-full min-h-[48px] bg-gradient-to-r from-[#FF4B93] to-[#FF6B8B] hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Processar Pedido</span>
            </button>
          </div>

          {/* Extracted Preview Card */}
          {extractedPreview && (
            <div className="bg-gradient-to-br from-rose-50/80 via-white to-amber-50/50 rounded-2xl p-4 shadow-sm border border-rose-200 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FF4B93] flex items-center gap-1.5 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Dados Extraídos com Sucesso
                </span>
                <span className="text-xs font-bold text-slate-800 tabular-nums">
                  {formatBRL(extractedPreview.value)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/80 p-2.5 rounded-xl border border-rose-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Cliente</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {extractedPreview.clientName}
                  </span>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-rose-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Data & Horário</span>
                  <span className="font-semibold text-slate-800 block">
                    {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(
                      new Date(extractedPreview.partyDate + 'T00:00:00')
                    )}
                    {extractedPreview.partyTime && ` às ${extractedPreview.partyTime}h`}
                  </span>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-rose-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Tema Escolhido</span>
                  <span className="font-semibold text-[#FF4B93] truncate block">
                    {extractedPreview.theme}
                  </span>
                </div>

                <div className="bg-white/80 p-2.5 rounded-xl border border-rose-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Local / Buffet</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {extractedPreview.location}
                  </span>
                </div>
              </div>

              <button
                onClick={handleTransferToManual}
                className="w-full min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition-all"
              >
                <span>Revisar e Salvar no Formulário</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Entrada Manual */}
      {subTab === 'manual' && (
        <form onSubmit={handleSaveOrder} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-50">
            <h3 className="text-xs font-bold text-slate-800">Formulário de Cadastro</h3>
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Salvo com sucesso!
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Nome da Cliente / Responsável *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Larissa Moura (Mãe da Maria Aylla)"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93] text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Data da Festa (DD/MM/AAAA) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: 14/11/2026"
                  maxLength={10}
                  value={partyDateDisplay}
                  onChange={(e) => setPartyDateDisplay(formatDateInput(e.target.value))}
                  className="w-full h-11 px-3 pr-8 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93] text-slate-800"
                />
                <input
                  type="date"
                  tabIndex={-1}
                  aria-label="Selecionar data no calendário"
                  value={toIsoDate(partyDateDisplay)}
                  onChange={(e) => {
                    if (e.target.value) setPartyDateDisplay(toBrazilianDate(e.target.value));
                  }}
                  className="absolute right-2 top-2.5 w-6 h-6 opacity-0 cursor-pointer"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Horário da Festa (HH:MM) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: 15:00"
                  maxLength={5}
                  value={partyTimeDisplay}
                  onChange={(e) => setPartyTimeDisplay(formatTimeInput(e.target.value))}
                  className="w-full h-11 px-3 pr-8 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93] text-slate-800"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute right-2.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                WhatsApp / Tel
              </label>
              <input
                type="text"
                placeholder="(11) 98765-4321"
                maxLength={15}
                value={clientPhone}
                onChange={(e) => setClientPhone(formatPhoneInput(e.target.value))}
                className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93] text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tema da Decoração *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Jardim das Borboletas"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93] text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Local / Buffet
            </label>
            <input
              type="text"
              placeholder="Ex: Buffet Splash Kids - Salão Principal"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93] text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Valor Total (R$) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="R$ 0,00"
                value={valueDisplay}
                onChange={(e) => {
                  const res = formatCurrencyInput(e.target.value);
                  setValueDisplay(res.display);
                  setValueNumeric(res.numericValue);
                }}
                className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93] text-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Custo Materiais (R$)
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={materialCostDisplay}
                onChange={(e) => {
                  const res = formatCurrencyInput(e.target.value);
                  setMaterialCostDisplay(res.display);
                  setMaterialCostNumeric(res.numericValue);
                }}
                className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93] text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Status do Pedido
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93] text-slate-800"
            >
              <option value="orcamento">Orçamento em Aberto</option>
              <option value="confirmado">Confirmado (Sinal Pago)</option>
              <option value="em_preparacao">Em Produção / Balões Prontos</option>
              <option value="concluido">Festa Realizada / Concluído</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Observações & Itens Especiais
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Arco orgânico desconstruído, cilindros canelados, balões cromados..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93] text-slate-800 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[48px] bg-gradient-to-r from-[#FF4B93] to-[#FF6B8B] hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Salvar Pedido</span>
            </button>
          </div>
        </form>
      )}

      {/* Orders Filter & List */}
      <div id="tour-orders-list" className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FF4B93]" />
            <h3 className="text-xs font-bold text-slate-800">
              Todos os Pedidos ({filteredOrders.length})
            </h3>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'confirmado', label: 'Confirmados' },
            { id: 'em_preparacao', label: 'Em Produção' },
            { id: 'orcamento', label: 'Orçamentos' },
            { id: 'concluido', label: 'Concluídos' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-[#FF4B93] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Order Cards / Empty State */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#FF4B93] flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Nenhum pedido encontrado</h4>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Use a "Análise Inteligente" para colar conversas do WhatsApp ou cadastre uma festa na aba "Entrada Manual".
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const badge = getStatusBadge(order.status);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3 hover:border-rose-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#FF4B93]" />
                          {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(
                            new Date(order.partyDate + 'T00:00:00')
                          )}
                          {order.partyTime && ` · ${order.partyTime}h`}
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
                      <span className="font-extrabold text-slate-800 text-base tabular-nums">
                        {formatBRL(order.value)}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        Custo mat: {formatBRL(order.materialCost)}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100/70">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{order.location || 'Local a definir'}</span>
                    </div>
                    {order.partyTime && (
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#FF4B93] shrink-0" />
                        <span>Horário da festa: {order.partyTime} horas</span>
                      </div>
                    )}
                    {order.clientPhone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{order.clientPhone}</span>
                      </div>
                    )}
                    {order.notes && (
                      <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                        "{order.notes}"
                      </p>
                    )}
                  </div>

                  {/* Quick status cycle and delete actions */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-400">Status:</span>
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="text-xs font-semibold bg-slate-100 border-none rounded-lg px-2 py-1 text-slate-700 focus:ring-1 focus:ring-[#FF4B93] cursor-pointer"
                      >
                        <option value="orcamento">Orçamento</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="em_preparacao">Em Produção</option>
                        <option value="concluido">Concluído</option>
                      </select>
                    </div>

                    <button
                      onClick={() => onDeleteOrder(order.id)}
                      aria-label={`Excluir pedido ${order.theme}`}
                      className="min-h-[40px] px-2.5 text-slate-300 hover:text-rose-500 rounded-lg flex items-center gap-1 text-xs active:scale-95 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
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
