import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  onNewOrderClick: () => void;
  onOpenSettings: () => void;
  activeOrdersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNewOrderClick,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-rose-100/70 px-3.5 pt-safe pb-2.5 shadow-2xs">
      <div className="flex items-center justify-between gap-2.5">
        {/* Brand & Logo (Tap to open Settings) */}
        <button
          id="tour-logo"
          onClick={onOpenSettings}
          aria-label="Abrir Configurações do Aplicativo"
          className="flex items-center gap-2.5 text-left cursor-pointer group active:scale-98 transition-transform min-h-[44px] -ml-1 pl-1 pr-2 rounded-2xl hover:bg-rose-50/40 min-w-0"
        >
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#FF4B93]/30 shadow-2xs bg-[#FFFDF0] shrink-0">
            <img
              src="/assets/aistudio/image_971ed1a0.png"
              alt="Ateliê Festa com alegria"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col min-w-0 justify-center">
            <h1 className="text-xs sm:text-[13px] font-black text-slate-800 tracking-tight leading-tight whitespace-nowrap truncate group-hover:text-[#FF4B93] transition-colors">
              Ateliê Festa com alegria
            </h1>
            <span className="text-[10px] text-slate-400 font-medium leading-tight whitespace-nowrap">
              @festa_com_alegria
            </span>
          </div>
        </button>

        {/* Action Button: Compact Novo Pedido */}
        <button
          id="tour-new-order"
          onClick={onNewOrderClick}
          aria-label="Adicionar Novo Pedido"
          className="h-8 px-2.5 rounded-xl bg-gradient-to-r from-[#FF4B93] to-[#FF6B8B] hover:opacity-95 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs shadow-rose-200 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-3 h-3" />
          <span>Novo Pedido</span>
        </button>
      </div>
    </header>
  );
};
