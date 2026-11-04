import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Check,
  Heart,
  Smile,
  Wand2,
  Camera,
  RotateCcw,
  Palette,
} from 'lucide-react';
import { generateInfantArt } from '../utils/aiArtGenerator.ts';

type ArtMode = 'logo' | 'ai' | 'upload';

export const StickerGeneratorView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const PRESET_MESSAGES = [
    { title: 'Data Reservada! 🎈', text: 'Data Reservada!', subtext: 'Sua data está garantida com muito carinho!' },
    { title: 'Festa Mágica ✨', text: 'Sua Festa vai ser Mágica!', subtext: 'Ateliê Festa com alegria' },
    { title: 'Pegue & Monte 💖', text: 'Pegue e Monte Confirmado!', subtext: 'Tudo pronto para retirada' },
    { title: 'Decoração Pronta! 🎂', text: 'Decoração Pronta!', subtext: 'Cenário montado com muito amor' },
    { title: 'Orçamento com Amor 💕', text: 'Orçamento Enviado!', subtext: 'Preparado com carinho para você' },
  ];

  const AI_PROMPT_PRESETS = [
    { label: '🧸 Ursinho com Balão', prompt: 'Ursinho fofo segurando balão e chapeuzinho de festa' },
    { label: '🦁 Safári Baby', prompt: 'Leãozinho fofo do safári com chapéu de aniversário' },
    { label: '🦋 Jardim Borboletas', prompt: 'Borboleta mágica aquarela infantil com flores' },
    { label: '👑 Princesa Cute', prompt: 'Princesa com coroa dourada e balões rosas' },
    { label: '🦖 Dino Fofinho', prompt: 'Bebê dinossauro fofo verde com balão azul' },
  ];

  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customText, setCustomText] = useState(PRESET_MESSAGES[0].text);
  const [customSubtext, setCustomSubtext] = useState(PRESET_MESSAGES[0].subtext);
  const [themeColor, setThemeColor] = useState<'pink' | 'turquoise' | 'yellow'>('pink');
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Central Artwork Mode: Logo, AI Infant Art, or Gallery Upload
  const [artMode, setArtMode] = useState<ArtMode>('logo');
  const [aiPrompt, setAiPrompt] = useState('Ursinho fofo segurando balão de festa');
  const [aiGeneratedArtUrl, setAiGeneratedArtUrl] = useState<string>(() =>
    generateInfantArt({ prompt: 'Ursinho fofo segurando balão de festa' })
  );
  const [uploadedArtUrl, setUploadedArtUrl] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Trigger AI generation
  const handleGenerateAiArt = (promptToUse?: string) => {
    const textPrompt = promptToUse || aiPrompt;
    setIsGeneratingAi(true);
    setTimeout(() => {
      const art = generateInfantArt({ prompt: textPrompt });
      setAiGeneratedArtUrl(art);
      setArtMode('ai');
      setIsGeneratingAi(false);
    }, 250);
  };

  // Upload image for sticker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedArtUrl(reader.result);
        setArtMode('upload');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Draw sticker on 512x512 canvas (WhatsApp sticker standard resolution)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 512;
    const height = 512;
    canvas.width = width;
    canvas.height = height;

    // Clear transparent
    ctx.clearRect(0, 0, width, height);

    // Draw scalloped / cloud sticker badge with thick white sticker border and soft shadow
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 220;

    // Shadow for sticker feel
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;

    // Outer Scalloped Badge (like the official logo)
    const petals = 12;
    ctx.beginPath();
    for (let i = 0; i <= petals; i++) {
      const angle = (i * 2 * Math.PI) / petals;
      const nextAngle = ((i + 1) * 2 * Math.PI) / petals;
      const midAngle = (angle + nextAngle) / 2;

      const x1 = centerX + Math.cos(angle) * (radius - 10);
      const y1 = centerY + Math.sin(angle) * (radius - 10);
      const cx = centerX + Math.cos(midAngle) * (radius + 20);
      const cy = centerY + Math.sin(midAngle) * (radius + 20);

      if (i === 0) {
        ctx.moveTo(x1, y1);
      } else {
        ctx.quadraticCurveTo(cx, cy, x1, y1);
      }
    }
    ctx.closePath();

    // Background color of badge
    ctx.fillStyle = themeColor === 'pink' ? '#FFFDF0' : themeColor === 'turquoise' ? '#F0FDFA' : '#FFFDF2';
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';

    // Border around badge
    ctx.lineWidth = 10;
    ctx.strokeStyle = themeColor === 'pink' ? '#FF4B93' : themeColor === 'turquoise' ? '#00C9DB' : '#FFBF1A';
    ctx.stroke();

    // Secondary decorative thin inner ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 24, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFE1EE';
    ctx.stroke();

    // Determine which image to draw in center upper section
    let currentImgSrc = '/assets/aistudio/image_971ed1a0.png';
    if (artMode === 'ai' && aiGeneratedArtUrl) {
      currentImgSrc = aiGeneratedArtUrl;
    } else if (artMode === 'upload' && uploadedArtUrl) {
      currentImgSrc = uploadedArtUrl;
    }

    const img = new Image();
    img.src = currentImgSrc;
    img.onload = () => {
      // Draw circular artwork image
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY - 55, 80, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, centerX - 80, centerY - 135, 160, 160);
      ctx.restore();

      // Border around logo/art
      ctx.beginPath();
      ctx.arc(centerX, centerY - 55, 80, 0, Math.PI * 2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Main Text
      ctx.fillStyle = '#1E293B';
      const mainFontSize = customText.length > 20 ? 24 : 28;
      ctx.font = `bold ${mainFontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(customText, centerX, centerY + 55);

      // Subtext
      ctx.fillStyle = '#FF4B93';
      const subFontSize = customSubtext.length > 28 ? 14 : 16;
      ctx.font = `600 ${subFontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText(customSubtext, centerX, centerY + 90);

      // Handle @festa_com_alegria
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('@festa_com_alegria · Ateliê Festa com alegria', centerX, centerY + 120);
    };

    if (img.complete) {
      img.onload(new Event('load'));
    }
  }, [customText, customSubtext, themeColor, artMode, aiGeneratedArtUrl, uploadedArtUrl]);

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    setCustomText(PRESET_MESSAGES[idx].text);
    setCustomSubtext(PRESET_MESSAGES[idx].subtext);
  };

  const handleDownloadSticker = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `figurinha-festa-com-alegria-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 3000);
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Hidden file input for custom artwork upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header Info */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-rose-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FF4B93]" />
            <h2 className="text-sm font-bold text-slate-800">
              Criador de Figurinhas WhatsApp
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Crie stickers com a logo da marca ou arte infantil gerada por IA!
          </p>
        </div>
      </div>

      {/* Live Preview Container (512x512 display scaled for iPhone) */}
      <div id="tour-sticker-preview" className="bg-gradient-to-b from-[#FFF5F8] to-[#FFFDF5] rounded-3xl p-6 shadow-sm border border-rose-200/60 flex flex-col items-center justify-center space-y-3">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain drop-shadow-md transition-all duration-200"
          />
        </div>

        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
          <Smile className="w-3.5 h-3.5 text-[#FF4B93]" />
          Formato padrão WhatsApp (PNG Transparente 512×512)
        </span>
      </div>

      {/* Mode Selector: Logo Oficial vs Arte Infantil por IA vs Foto Própria */}
      <div id="tour-sticker-ai-section" className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Wand2 className="w-4 h-4 text-[#FF4B93]" />
            Imagem Central da Figurinha:
          </span>
          <span className="text-[10px] text-[#FF4B93] font-bold">
            {artMode === 'logo' ? 'Logo Oficial' : artMode === 'ai' ? 'Arte IA Infantil' : 'Foto Própria'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => setArtMode('logo')}
            className={`min-h-[42px] px-2 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
              artMode === 'logo'
                ? 'bg-[#FF4B93] text-white border-[#FF4B93] shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>🎈 Logo Oficial</span>
          </button>

          <button
            type="button"
            onClick={() => setArtMode('ai')}
            className={`min-h-[42px] px-2 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
              artMode === 'ai'
                ? 'bg-[#FF4B93] text-white border-[#FF4B93] shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>✨ Arte IA Infantil</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (uploadedArtUrl) {
                setArtMode('upload');
              } else if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className={`min-h-[42px] px-2 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
              artMode === 'upload'
                ? 'bg-[#FF4B93] text-white border-[#FF4B93] shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Foto Galeria</span>
          </button>
        </div>

        {/* AI Art Generation Controls */}
        {artMode === 'ai' && (
          <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3.5 space-y-2.5 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Descreva como será a imagem infantil por IA:
              </label>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ex: Ursinho fofo segurando balão, Princesa com coroa..."
                className="w-full h-11 px-3 text-xs bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF4B93] text-slate-800"
              />
            </div>

            {/* Quick Inspiration Tags */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Temas Frequentes do Ateliê:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {AI_PROMPT_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiPrompt(p.prompt);
                      handleGenerateAiArt(p.prompt);
                    }}
                    className="min-h-[32px] px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-rose-100/60 text-slate-700 rounded-lg border border-rose-100 cursor-pointer transition-all active:scale-95"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleGenerateAiArt()}
              disabled={isGeneratingAi || !aiPrompt.trim()}
              className="w-full min-h-[42px] bg-gradient-to-r from-[#FF4B93] to-[#FF6B8B] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGeneratingAi ? 'Criando Arte...' : 'Gerar Nova Arte com IA ✨'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Preset Phrases */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 block">
          Modelos Prontos de Mensagem:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_MESSAGES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(idx)}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedPreset === idx
                  ? 'bg-[#FF4B93] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Text Inputs (Digitados Manualmente) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Texto Principal da Figurinha (Manual)
          </label>
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93] text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Subtítulo / Mensagem de Apoio (Manual)
          </label>
          <input
            type="text"
            value={customSubtext}
            onChange={(e) => setCustomSubtext(e.target.value)}
            className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93] text-slate-800"
          />
        </div>

        {/* Color accents */}
        <div className="pt-1">
          <span className="block text-xs font-semibold text-slate-600 mb-2">
            Cor da Borda da Figurinha:
          </span>
          <div className="flex gap-2">
            {[
              { id: 'pink', label: 'Rosa Festa', color: 'bg-[#FF4B93]' },
              { id: 'turquoise', label: 'Turquesa', color: 'bg-[#00C9DB]' },
              { id: 'yellow', label: 'Dourado', color: 'bg-[#FFBF1A]' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setThemeColor(t.id as any)}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border cursor-pointer ${
                  themeColor === t.id
                    ? 'border-[#FF4B93] bg-rose-50 text-slate-800 font-bold'
                    : 'border-slate-100 bg-white text-slate-600'
                }`}
              >
                <span className={`w-3 h-3 rounded-full ${t.color}`} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Download Action Button */}
      <button
        onClick={handleDownloadSticker}
        className="w-full min-h-[50px] bg-gradient-to-r from-[#FF4B93] via-[#FF6B8B] to-[#FFBF1A] hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-300/50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
      >
        {isDownloaded ? (
          <>
            <Check className="w-4 h-4" />
            <span>Figurinha Salva na Galeria!</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Salvar Figurinha no iPhone (PNG)</span>
          </>
        )}
      </button>

      {/* Tip Box */}
      <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-3.5 text-xs text-slate-600 space-y-1">
        <p className="font-semibold text-slate-800 flex items-center gap-1">
          <Heart className="w-3.5 h-3.5 text-[#FF4B93] fill-[#FF4B93]" />
          Como adicionar no WhatsApp do seu iPhone:
        </p>
        <ol className="list-decimal list-inside text-[11px] text-slate-500 space-y-0.5">
          <li>Clique no botão acima para salvar a imagem transparente no seu iPhone.</li>
          <li>Abra o WhatsApp ou o app "Sticker.ly" e adicione a imagem ao seu pacote de figurinhas do Ateliê.</li>
          <li>Envie nas conversas com suas clientes para encantar ainda mais!</li>
        </ol>
      </div>
    </div>
  );
};
