import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Flame,
  Calendar,
  Layers,
  Camera,
  Smile,
  Wand2,
  PieChart,
  Settings,
} from 'lucide-react';
import { TabType } from '../types/index.ts';

interface Step {
  targetId: string;
  tab?: TabType;
  title: string;
  description: string;
  badge: string;
  icon: React.ElementType;
}

interface OnboardingHelperProps {
  onComplete: () => void;
  onNavigateTab?: (tab: TabType) => void;
}

export const OnboardingHelper: React.FC<OnboardingHelperProps> = ({
  onComplete,
  onNavigateTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const balloonRef = useRef<HTMLDivElement | null>(null);

  const steps: Step[] = [
    // --- TELA 1: HOME (DASHBOARD) ---
    {
      targetId: 'tour-logo',
      tab: 'home',
      title: 'Ajustes & Configurações',
      description:
        'Toque na logo oficial a qualquer momento para abrir as Configurações: gerencie notificações de festas com horário, teste o som e zere ou restaure seus dados.',
      badge: 'Passo 1 de 14',
      icon: Settings,
    },
    {
      targetId: 'tour-new-order',
      tab: 'home',
      title: 'Novo Pedido Instantâneo',
      description:
        'Toque aqui para cadastrar novas festas com máscaras automáticas de moeda, datas e horários, ou copie conversas do WhatsApp.',
      badge: 'Passo 2 de 14',
      icon: Sparkles,
    },
    {
      targetId: 'tour-kpi-summary',
      tab: 'home',
      title: 'Lucro Líquido Real',
      description:
        'Acompanhe seu faturamento, gastos com materiais e a margem de lucro estimada em tempo real para cada festa contratada.',
      badge: 'Passo 3 de 14',
      icon: TrendingUp,
    },
    {
      targetId: 'tour-period-selector',
      tab: 'home',
      title: 'Filtro de Período em Pílulas',
      description:
        'Alterne com apenas um toque entre as visões Semanal, Mensal, Trimestral e Semestral para acompanhar as finanças do ateliê.',
      badge: 'Passo 4 de 14',
      icon: Flame,
    },
    {
      targetId: 'tour-upcoming-orders',
      tab: 'home',
      title: 'Agenda das Próximas Decorações',
      description:
        'Visualize as festas mais próximas organizadas por data, com horário de início da montagem e contagem regressiva de dias.',
      badge: 'Passo 5 de 14',
      icon: Calendar,
    },

    // --- TELA 2: FINANÇAS ---
    {
      targetId: 'tour-kpi-balloons',
      tab: 'financas',
      title: 'Cards com Detalhes ao Toque',
      description:
        'Segure ou toque nos cards de Receita, Gastos ou Lucro para abrir o balão explicativo com o valor sem cortes e o extrato detalhado de cada festa!',
      badge: 'Passo 6 de 14',
      icon: TrendingUp,
    },
    {
      targetId: 'tour-finance-materials',
      tab: 'financas',
      title: 'Gastos com Materiais',
      description:
        'Gráfico categorizado dos custos da empresa: balões, locação de peças e cilindros, flores permanentes e transporte.',
      badge: 'Passo 7 de 14',
      icon: PieChart,
    },
    {
      targetId: 'tour-finance-add-expense',
      tab: 'financas',
      title: 'Lançar Gastos de Materiais',
      description:
        'Cadastre compras de balões, fretes ou materiais para que o sistema deduza do faturamento e calcule seu lucro real.',
      badge: 'Passo 8 de 14',
      icon: Sparkles,
    },

    // --- TELA 3: PEDIDOS ---
    {
      targetId: 'tour-orders-smart-input',
      tab: 'pedidos',
      title: 'Smart Entry via WhatsApp',
      description:
        'Cole a mensagem enviada pela cliente no WhatsApp e o app preenche nome, data, tema, local e valor automaticamente!',
      badge: 'Passo 9 de 14',
      icon: Sparkles,
    },
    {
      targetId: 'tour-orders-list',
      tab: 'pedidos',
      title: 'Gestão de Status das Festas',
      description:
        'Acompanhe seus pedidos separados por status: orçamentos em aberto, festas confirmadas, em produção e concluídas.',
      badge: 'Passo 10 de 14',
      icon: Calendar,
    },

    // --- TELA 4: CATÁLOGO ---
    {
      targetId: 'tour-catalog-add-actions',
      tab: 'catalogo',
      title: 'Fotos do iPhone & Zoom',
      description:
        'Carregue fotos reais das suas decorações direto da galeria do celular. Ajuste o zoom, enquadramento e escolha fundos com molduras coloridas.',
      badge: 'Passo 11 de 14',
      icon: Camera,
    },
    {
      targetId: 'tour-catalog-grid',
      tab: 'catalogo',
      title: 'Seleção & Propostas para WhatsApp',
      description:
        'Selecione as decorações que a cliente solicitou para gerar uma proposta visual com valores e descrição pronta para enviar no WhatsApp!',
      badge: 'Passo 12 de 14',
      icon: Layers,
    },

    // --- TELA 5: FIGURINHAS ---
    {
      targetId: 'tour-sticker-preview',
      tab: 'figurinhas',
      title: 'Figurinha WhatsApp 512×512',
      description:
        'Prévia em tempo real no formato oficial de stickers do WhatsApp com recorte transparente e borda adesiva para divulgar o ateliê.',
      badge: 'Passo 13 de 14',
      icon: Smile,
    },
    {
      targetId: 'tour-sticker-ai-section',
      tab: 'figurinhas',
      title: 'Arte Infantil por Inteligência Artificial',
      description:
        'Gere artes infantis fofas por IA digitando o tema desejado (ursinho com balão, safari, jardim de borboletas) para personalizar seus stickers!',
      badge: 'Passo 14 de 14',
      icon: Wand2,
    },
  ];

  const step = steps[currentStep];
  const StepIcon = step.icon;

  // Measure element rect and update when step changes
  useEffect(() => {
    if (step.tab && onNavigateTab) {
      onNavigateTab(step.tab);
    }

    const updateRect = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        // Scroll element into view smoothly if not visible
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Recalculate rect after smooth scroll settles
        setTimeout(() => {
          const updated = el.getBoundingClientRect();
          setTargetRect(updated);
        }, 300);
      } else {
        setTargetRect(null);
      }
    };

    // Update after DOM paint and tab switch
    const timer = setTimeout(updateRect, 140);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [currentStep, step.targetId, step.tab, onNavigateTab]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Compute balloon positioning (above or below the target element)
  const isTargetInBottomHalf = targetRect
    ? targetRect.top > window.innerHeight / 2
    : false;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto overflow-hidden animate-in fade-in duration-200">
      {/* 
        CRITICAL SPOTLIGHT CUTOUT:
        SVG Mask ensures the target element inside the cutout is 100% visible, bright and unblurred,
        while the rest of the screen is darkened with rgba(0, 0, 0, 0.72).
      */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-51"
        style={{ width: '100vw', height: '100vh' }}
      >
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White fills entire viewport (makes overlay opaque) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout over target element (makes overlay 100% transparent here) */}
            {targetRect && (
              <rect
                x={Math.max(4, targetRect.left - 6)}
                y={targetRect.top - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="20"
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Darkened overlay strictly respecting mask */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.72)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Top Floating Bar with ONLY Skip Button in 1 line (no X, no mini card) */}
      <div className="fixed top-0 left-0 right-0 z-55 px-4 pt-safe pb-2 flex justify-end">
        <button
          onClick={onComplete}
          aria-label="Pular Tutorial"
          className="min-h-[42px] px-5 py-2 rounded-full bg-white text-slate-800 font-bold text-xs shadow-lg shadow-black/25 cursor-pointer active:scale-95 transition-all whitespace-nowrap"
        >
          Pular Tutorial
        </button>
      </div>

      {/* Glowing Border around the Target Element */}
      {targetRect && (
        <div
          style={{
            top: targetRect.top - 6,
            left: Math.max(4, targetRect.left - 6),
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
          className="fixed z-52 pointer-events-none rounded-2xl border-2 border-[#FF4B93] ring-4 ring-[#FF4B93]/50 shadow-[0_0_24px_rgba(255,75,147,0.75)] transition-all duration-300"
        />
      )}

      {/* Explanatory Speech Balloon (Card) */}
      <div
        ref={balloonRef}
        style={{
          top: targetRect
            ? isTargetInBottomHalf
              ? Math.max(56, targetRect.top - 235)
              : Math.min(window.innerHeight - 250, targetRect.bottom + 16)
            : '50%',
          transform: !targetRect ? 'translateY(-50%)' : undefined,
        }}
        className="fixed left-4 right-4 z-54 max-w-sm mx-auto bg-white rounded-3xl p-5 shadow-2xl border-2 border-rose-200 transition-all duration-300 flex flex-col space-y-3"
      >
        {/* Balloon Header */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF4B93] bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100 flex items-center gap-1">
            <StepIcon className="w-3 h-3 text-[#FF4B93]" />
            {step.badge}
          </span>

          <span className="text-[10px] font-semibold text-slate-400">
            Dica do Ateliê
          </span>
        </div>

        {/* Title and Description */}
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold text-slate-800 leading-snug">
            {step.title}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center items-center gap-1 py-0.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === currentStep ? 'w-5 bg-[#FF4B93]' : 'w-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="min-h-[44px] px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex-1 min-h-[44px] bg-gradient-to-r from-[#FF4B93] to-[#FF6B8B] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xs shadow-rose-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Começar a Usar! ✨</span>
              </>
            ) : (
              <>
                <span>Próximo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
