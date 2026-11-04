import React from 'react';
import { Home, TrendingUp, CalendarDays, Images, Sparkles } from 'lucide-react';
import { TabType } from '../types/index.ts';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingOrdersCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  pendingOrdersCount = 0,
}) => {
  const tabs = [
    {
      id: 'home' as TabType,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'financas' as TabType,
      label: 'Finanças',
      icon: TrendingUp,
    },
    {
      id: 'pedidos' as TabType,
      label: 'Pedidos',
      icon: CalendarDays,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      id: 'catalogo' as TabType,
      label: 'Catálogo',
      icon: Images,
    },
    {
      id: 'figurinhas' as TabType,
      label: 'Stickers',
      icon: Sparkles,
    },
  ];

  return (
    <nav
      aria-label="Navegação Principal"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-rose-100 shadow-[0_-4px_16px_rgba(255,75,147,0.06)] pb-safe"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tour-nav-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              aria-label={`Ir para ${tab.label}`}
              className={`min-h-[48px] min-w-[44px] flex flex-col items-center justify-center transition-all cursor-pointer rounded-xl ${
                isActive ? 'text-[#FF4B93] font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-rose-50 text-[#FF4B93] scale-105' : ''
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'
                    }`}
                  />
                </div>

                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 bg-gradient-to-r from-[#FF4B93] to-[#FFBF1A] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
