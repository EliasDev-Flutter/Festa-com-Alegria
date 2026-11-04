import React, { useEffect, useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Show splash for 2.2 seconds, then smoothly fade out
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        onFinish();
      }, 500);
    }, 2200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      onFinish();
    }, 300);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#FFF5F8] via-[#FFFDF5] to-[#FFEBF3] cursor-pointer transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top decorative badge */}
      <div className="pt-12 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-[#FF4B93] text-xs font-bold shadow-xs border border-rose-100">
          <Sparkles className="w-3.5 h-3.5 text-[#FFBF1A]" />
          Gestão de Festas & Decoração
        </span>
      </div>

      {/* Center Hero Logo */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-xs animate-in zoom-in-95 duration-700">
        <div className="relative">
          {/* Glowing pulse ring */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#FF4B93]/20 via-[#00C9DB]/20 to-[#FFBF1A]/20 rounded-full blur-xl animate-pulse" />

          {/* Actual company logo from attachment */}
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden shadow-xl shadow-rose-200/60 border-4 border-white bg-[#FFFDF0] flex items-center justify-center p-1">
            <img
              src="/assets/aistudio/image_971ed1a0.png"
              alt="Ateliê Festa com alegria"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Ateliê Festa com alegria
          </h1>
          <p className="text-xs text-[#FF4B93] font-bold uppercase tracking-wider">
            Painel Exclusivo para iPhone
          </p>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          Transformando sonhos em decorações inesquecíveis, cheias de afeto e magia! 🎈
        </p>
      </div>

      {/* Bottom Loading Indicator & Tap to continue */}
      <div className="pb-8 flex flex-col items-center space-y-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4B93] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-[#00C9DB] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBF1A] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          Toque para entrar
        </span>
      </div>
    </div>
  );
};
