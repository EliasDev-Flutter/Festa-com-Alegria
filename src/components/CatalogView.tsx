import React, { useState, useRef } from 'react';
import {
  CheckCircle2,
  Share2,
  Copy,
  Plus,
  Eye,
  ArrowLeft,
  Printer,
  Upload,
  Trash2,
  X,
  Check,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Sliders,
  ZoomIn,
  Palette,
  RotateCcw,
} from 'lucide-react';
import { CatalogCategory, CatalogItem } from '../types/index.ts';
import { formatBRL } from '../utils/finance.ts';
import { formatCurrencyInput } from '../utils/formatters.ts';

interface CatalogViewProps {
  catalog: CatalogItem[];
  onAddCatalogItem: (item: Omit<CatalogItem, 'id'>) => void;
  onDeleteCatalogItem?: (id: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  catalog,
  onAddCatalogItem,
  onDeleteCatalogItem,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<CatalogCategory>('todos');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Manual & Gallery Upload Modal state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rawImageUrl, setRawImageUrl] = useState<string>('');
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [frameBgColor, setFrameBgColor] = useState<string>('#FFFDF0');
  const [showFramingControls, setShowFramingControls] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CatalogCategory>('infantil');
  const [priceDisplay, setPriceDisplay] = useState('');
  const [priceNumeric, setPriceNumeric] = useState(0);
  const [description, setDescription] = useState('');
  const [highlightsText, setHighlightsText] = useState('');

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === catalog.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(catalog.map((c) => c.id));
    }
  };

  // Trigger file selection on iPhone
  const handleOpenPhotoLibrary = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawImageUrl(reader.result);
        setZoomScale(1);
        setPanX(0);
        setPanY(0);
        setShowFramingControls(true);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
        setIsModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleOpenManualAdd = () => {
    setRawImageUrl('');
    setTitle('');
    setPriceDisplay('');
    setPriceNumeric(0);
    setDescription('');
    setHighlightsText('');
    setCategory('infantil');
    setZoomScale(1);
    setPanX(0);
    setPanY(0);
    setShowFramingControls(false);
    setIsModalOpen(true);
  };

  // Helper to bake zoomed/framed image onto a canvas
  const bakeFramedImage = async (
    imgSrc: string,
    scale: number,
    offsetX: number,
    offsetY: number,
    bgColor: string
  ): Promise<string> => {
    if (!imgSrc) return '';
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imgSrc);
          return;
        }

        // Fill background frame color
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate aspect ratios
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;

        let drawW: number;
        let drawH: number;

        if (imgAspect > canvasAspect) {
          drawW = canvas.width * scale;
          drawH = (canvas.width / imgAspect) * scale;
        } else {
          drawH = canvas.height * scale;
          drawW = (canvas.height * imgAspect) * scale;
        }

        const drawX = (canvas.width - drawW) / 2 + (offsetX * canvas.width) / 100;
        const drawY = (canvas.height - drawH) / 2 + (offsetY * canvas.height) / 100;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);

        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = () => resolve(imgSrc);
      img.src = imgSrc;
    });
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || priceNumeric <= 0) return;

    let finalImageUrl = rawImageUrl || 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80';

    if (rawImageUrl) {
      try {
        finalImageUrl = await bakeFramedImage(rawImageUrl, zoomScale, panX, panY, frameBgColor);
      } catch {
        finalImageUrl = rawImageUrl;
      }
    }

    const highlights = highlightsText
      ? highlightsText.split(',').map((s) => s.trim()).filter(Boolean)
      : ['Montagem Inclusa', 'Balões de Qualidade'];

    onAddCatalogItem({
      title: title.trim(),
      category,
      imageUrl: finalImageUrl,
      estimatedPrice: priceNumeric,
      description: description.trim() || 'Projeto personalizado com balões e montagem profissional.',
      highlights,
      isCustomUpload: true,
    });

    setIsModalOpen(false);
    setRawImageUrl('');
    setTitle('');
    setPriceDisplay('');
    setPriceNumeric(0);
    setDescription('');
    setHighlightsText('');
  };

  const filteredCatalog = catalog.filter((item) => {
    if (categoryFilter === 'todos') return true;
    return item.category === categoryFilter;
  });

  const selectedItems = catalog.filter((item) => selectedIds.includes(item.id));

  // WhatsApp formatted share text
  const handleCopyWhatsAppProposal = () => {
    if (selectedItems.length === 0) return;

    let message = `🎈 *Ateliê Festa com alegria - Seleção de Decorações*\n\n`;
    message += `Olá! Selecionamos com muito carinho estas opções encantadoras para você:\n\n`;

    selectedItems.forEach((item, index) => {
      message += `✨ *${index + 1}. ${item.title}*\n`;
      if (item.description) message += `   ${item.description}\n`;
      message += `   Investimento: ${formatBRL(item.estimatedPrice)}\n\n`;
    });

    message += `Todos os nossos projetos incluem balões de alta qualidade, montagem e desmontagem pontual.\n`;
    message += `Qual dessas opções mais combina com o sonho da sua festa? 🥰\n\n`;
    message += `_Ateliê Festa com alegria · @festa_com_alegria_`;

    navigator.clipboard.writeText(message);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  const categories: { id: CatalogCategory; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'infantil', label: 'Infantil' },
    { id: 'pegue_e_monte', label: 'Pegue e Monte' },
    { id: 'arcos_baloes', label: 'Arcos de Balões' },
    { id: 'mesas_tematicas', label: 'Mesas de Bolo' },
    { id: 'batizado_cha', label: 'Chá & Batizado' },
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* Hidden file input for iPhone Photo Library */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Action Strip: Add via iPhone Photo Gallery or Manual Entry */}
      <div id="tour-catalog-add-actions" className="grid grid-cols-2 gap-2.5">
        <button
          onClick={handleOpenPhotoLibrary}
          className="min-h-[46px] p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-[#FFFDF0] border border-rose-200/80 hover:border-rose-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 transition-all"
        >
          <Camera className="w-4 h-4 text-[#FF4B93]" />
          <span className="text-xs font-bold text-slate-800">
            Foto do iPhone
          </span>
        </button>

        <button
          onClick={handleOpenManualAdd}
          className="min-h-[46px] p-3 rounded-2xl bg-white border border-slate-200 hover:border-rose-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 transition-all"
        >
          <Plus className="w-4 h-4 text-[#FF4B93]" />
          <span className="text-xs font-bold text-slate-800">
            Criar Manualmente
          </span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              categoryFilter === cat.id
                ? 'bg-[#FF4B93] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Selection Control Bar */}
      {catalog.length > 0 && (
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-rose-50 text-[#FF4B93] flex items-center justify-center font-bold text-xs">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold text-slate-700">
              {selectedIds.length === 1 ? '1 selecionada' : `${selectedIds.length} selecionadas`}
            </span>
          </div>

          <button
            onClick={handleSelectAll}
            className="text-xs font-bold text-[#FF4B93] hover:text-[#E03A7D] cursor-pointer"
          >
            {selectedIds.length === catalog.length ? 'Desmarcar todas' : 'Selecionar todas'}
          </button>
        </div>
      )}

      {/* Empty State when 0 items */}
      {catalog.length === 0 ? (
        <div id="tour-catalog-grid" className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-[#FF4B93] flex items-center justify-center mx-auto">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-800">
              Seu catálogo está vazio
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Você pode carregar fotos reais de festas direto da galeria do seu iPhone ou criar decorações com os valores que desejar.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
            <button
              onClick={handleOpenPhotoLibrary}
              className="min-h-[44px] bg-[#FF4B93] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
            >
              <Camera className="w-4 h-4" />
              <span>Adicionar Foto da Galeria</span>
            </button>
            <button
              onClick={handleOpenManualAdd}
              className="min-h-[44px] bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-200"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Manualmente</span>
            </button>
          </div>
        </div>
      ) : (
        /* Grid of Catalog Cards */
        <div id="tour-catalog-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredCatalog.map((item) => {
            const isSelected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm transition-all cursor-pointer border-2 ${
                  isSelected
                    ? 'border-[#FF4B93] ring-2 ring-[#FF4B93]/30 shadow-rose-100'
                    : 'border-transparent hover:border-slate-200'
                }`}
              >
                {/* Photo Area */}
                <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Selection Checkmark Badge */}
                  <div
                    className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all ${
                      isSelected
                        ? 'bg-[#FF4B93] text-white scale-100'
                        : 'bg-black/35 backdrop-blur-xs text-white/80 scale-90 hover:scale-100'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${isSelected ? 'fill-white text-[#FF4B93]' : ''}`}
                    />
                  </div>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold tabular-nums">
                    {formatBRL(item.estimatedPrice)}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-1">
                      {item.title}
                    </h4>
                    {onDeleteCatalogItem && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCatalogItem(item.id);
                        }}
                        aria-label={`Excluir ${item.title}`}
                        className="text-slate-300 hover:text-rose-500 p-1 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Highlight Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.highlights.map((h, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Action CTA for Client Proposal Generation */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-30 px-4 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="w-full min-h-[50px] bg-gradient-to-r from-[#FF4B93] via-[#FF6B8B] to-[#FFBF1A] hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-rose-300/50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>
                Gerar Catálogo para Cliente ({selectedIds.length})
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Decoração Manualmente com campos 100% controlados */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF4B93]" />
                Cadastrar Decoração no Catálogo
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5">
              {/* Image Preview or Upload trigger */}
              {rawImageUrl ? (
                <div className="space-y-2.5">
                  <div
                    style={{ backgroundColor: frameBgColor }}
                    className="relative aspect-4/3 w-full rounded-2xl overflow-hidden border-2 border-rose-200/80 shadow-inner flex items-center justify-center transition-colors"
                  >
                    <img
                      src={rawImageUrl}
                      alt="Pré-visualização do enquadramento"
                      style={{
                        transform: `scale(${zoomScale}) translate(${panX}%, ${panY}%)`,
                        transition: 'transform 0.05s ease-out',
                      }}
                      className="w-full h-full object-contain pointer-events-none"
                    />

                    {/* Change Photo and Framing toggle */}
                    <div className="absolute bottom-2 right-2 flex gap-1.5 z-10">
                      <button
                        type="button"
                        onClick={() => setShowFramingControls(!showFramingControls)}
                        className="px-2.5 py-1.5 bg-black/75 hover:bg-black text-white text-[10px] font-bold rounded-lg flex items-center gap-1 backdrop-blur-xs cursor-pointer shadow-xs active:scale-95"
                      >
                        <Sliders className="w-3 h-3 text-[#FF4B93]" />
                        <span>{showFramingControls ? 'Ocultar Ajustes' : 'Ajustar Zoom & Fundo'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenPhotoLibrary}
                        className="px-2.5 py-1.5 bg-white/90 hover:bg-white text-slate-800 text-[10px] font-bold rounded-lg backdrop-blur-xs cursor-pointer shadow-xs active:scale-95"
                      >
                        Trocar
                      </button>
                    </div>
                  </div>

                  {/* Framing & Zoom Controls Accordion */}
                  {showFramingControls && (
                    <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-3.5 space-y-3 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <ZoomIn className="w-3.5 h-3.5 text-[#FF4B93]" />
                          Ajuste de Zoom & Enquadramento
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setZoomScale(1);
                            setPanX(0);
                            setPanY(0);
                            setFrameBgColor('#FFFDF0');
                          }}
                          className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          Resetar
                        </button>
                      </div>

                      {/* Zoom Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-600 font-semibold">
                          <span>Tamanho / Zoom:</span>
                          <span className="text-[#FF4B93] font-bold">{Math.round(zoomScale * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.2"
                          step="0.05"
                          value={zoomScale}
                          onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                          className="w-full accent-[#FF4B93] cursor-pointer"
                        />
                      </div>

                      {/* Pan Position Sliders */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 font-semibold">
                        <div>
                          <span>Posição Horizontal:</span>
                          <input
                            type="range"
                            min="-40"
                            max="40"
                            step="1"
                            value={panX}
                            onChange={(e) => setPanX(parseInt(e.target.value, 10))}
                            className="w-full accent-[#FF4B93] cursor-pointer"
                          />
                        </div>
                        <div>
                          <span>Posição Vertical:</span>
                          <input
                            type="range"
                            min="-40"
                            max="40"
                            step="1"
                            value={panY}
                            onChange={(e) => setPanY(parseInt(e.target.value, 10))}
                            className="w-full accent-[#FF4B93] cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Frame Background Color Picker */}
                      <div className="space-y-1.5 pt-1 border-t border-rose-100">
                        <span className="text-[11px] text-slate-600 font-semibold flex items-center gap-1">
                          <Palette className="w-3 h-3 text-[#FF4B93]" />
                          Cor da Moldura ao Redor da Foto:
                        </span>
                        <div className="flex gap-2">
                          {[
                            { color: '#FFE4EC', label: 'Rosa Ateliê' },
                            { color: '#FFF9E6', label: 'Amarelo' },
                            { color: '#FFFDF0', label: 'Creme' },
                            { color: '#FFFFFF', label: 'Branco' },
                            { color: '#F0FDFA', label: 'Turquesa' },
                          ].map((f) => (
                            <button
                              key={f.color}
                              type="button"
                              onClick={() => setFrameBgColor(f.color)}
                              style={{ backgroundColor: f.color }}
                              title={f.label}
                              className={`w-7 h-7 rounded-xl border-2 shadow-2xs cursor-pointer transition-transform ${
                                frameBgColor === f.color
                                  ? 'border-[#FF4B93] scale-110 ring-2 ring-[#FF4B93]/30'
                                  : 'border-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={handleOpenPhotoLibrary}
                  className="w-full border-2 border-dashed border-rose-200 bg-rose-50/40 rounded-xl p-4 text-center cursor-pointer hover:bg-rose-50"
                >
                  <Camera className="w-6 h-6 text-[#FF4B93] mx-auto mb-1" />
                  <span className="text-xs font-bold text-[#FF4B93] block">
                    Toque para escolher foto da Galeria do iPhone
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Ao anexar, você poderá ajustar zoom e a cor da moldura
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Título / Nome da Decoração *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Jardim das Borboletas 1 Aninho"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CatalogCategory)}
                    className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93]"
                  >
                    <option value="infantil">Infantil</option>
                    <option value="pegue_e_monte">Pegue e Monte</option>
                    <option value="arcos_baloes">Arcos de Balões</option>
                    <option value="mesas_tematicas">Mesas de Bolo</option>
                    <option value="batizado_cha">Chá & Batizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Valor de Venda (R$) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="R$ 0,00"
                    value={priceDisplay}
                    onChange={(e) => {
                      const res = formatCurrencyInput(e.target.value);
                      setPriceDisplay(res.display);
                      setPriceNumeric(res.numericValue);
                    }}
                    className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93] font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Descrição Personalizada
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Painel romano duplo, cilindros canelados, arco orgânico..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Itens Inclusos (Separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Balões Biodegradáveis, Letreiro LED, Trio Cilindros"
                  value={highlightsText}
                  onChange={(e) => setHighlightsText(e.target.value)}
                  className="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[48px] bg-gradient-to-r from-[#FF4B93] to-[#FF6B8B] hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar no Catálogo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Customer Presentation Modal ("Visualização para Cliente") */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-[#FFFDF5] overflow-y-auto">
          {/* Top Bar for Customer View */}
          <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 px-4 py-3 flex items-center justify-between shadow-xs">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="min-h-[44px] px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>

            <div className="text-center">
              <span className="text-xs font-bold text-slate-800 block">
                Visualização para Cliente
              </span>
              <span className="text-[10px] text-slate-400">
                Pronta para print ou envio
              </span>
            </div>

            <button
              onClick={handleCopyWhatsAppProposal}
              className="min-h-[44px] px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-200 cursor-pointer active:scale-95 transition-all"
            >
              {copyFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copiar WhatsApp</span>
                </>
              )}
            </button>
          </div>

          {/* Customer Facing Clean Document Content */}
          <div className="max-w-md mx-auto p-4 space-y-5 pb-24">
            {/* Header Document Branding with Official Logo */}
            <div className="text-center space-y-2 py-5 px-4 bg-white rounded-3xl shadow-sm border border-rose-100">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#FF4B93]/30 shadow-md mx-auto bg-[#FFFDF0] p-0.5">
                <img
                  src="/assets/aistudio/image_971ed1a0.png"
                  alt="Ateliê Festa com alegria"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Ateliê Festa com alegria
                </h2>
                <p className="text-xs text-[#FF4B93] font-bold uppercase tracking-wider">
                  Proposta Exclusiva de Decoração
                </p>
                <p className="text-[11px] text-slate-400">@festa_com_alegria</p>
              </div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed pt-1">
                Criamos cenários encantadores, cheios de afeto, balões orgânicos e magia para celebrar momentos inesquecíveis! 🥰
              </p>
            </div>

            {/* List of Selected Designs */}
            <div className="space-y-4">
              {selectedItems.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-rose-100/70 space-y-3"
                >
                  <div className="relative aspect-4/3 w-full bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[#FF4B93] text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                      Opção {index + 1}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h3>
                      <span className="text-sm font-extrabold text-[#FF4B93] tabular-nums shrink-0">
                        {formatBRL(item.estimatedPrice)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {item.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold text-slate-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg"
                        >
                          ✓ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Included Guarantee Box */}
            <div className="bg-gradient-to-br from-[#FFF5F8] to-[#FFFDF5] rounded-2xl p-4 text-xs text-slate-700 space-y-2 border border-rose-200/50">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-[#FFBF1A]" />
                O que está incluso em nossos projetos:
              </h4>
              <ul className="space-y-1 text-slate-600 list-disc list-inside text-[11px]">
                <li>Montagem e desmontagem pontuais pela nossa equipe especializada</li>
                <li>Balões 100% biodegradáveis com brilho especial de longa duração</li>
                <li>Higienização completa de suportes, boleiras e cilindros</li>
              </ul>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-rose-100">
                Para reservar sua data, nos envie uma mensagem no WhatsApp. As datas são reservadas mediante sinal.
              </p>
            </div>

            {/* Print & Share Options */}
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 min-h-[44px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Salvar PDF</span>
              </button>

              <button
                onClick={handleCopyWhatsAppProposal}
                className="flex-1 min-h-[44px] bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-200"
              >
                <Copy className="w-4 h-4" />
                <span>Copiar Texto</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
