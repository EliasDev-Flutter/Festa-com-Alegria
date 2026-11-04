import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Bell,
  HelpCircle,
  RotateCcw,
  Trash2,
  Check,
  Target,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Clock,
  Volume2,
  Play,
  Upload,
  Music,
  ChevronRight,
  Info,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import { AppSettings } from '../types/index.ts';
import { soundManager } from '../utils/sound.ts';
import { formatCurrencyInput } from '../utils/formatters.ts';
import {
  changeUserPassword,
  logoutUser,
  isSupabaseConfigured,
} from '../utils/auth.ts';

interface SettingsViewProps {
  settings: AppSettings;
  userEmail?: string;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetDatabaseToZero: () => void;
  onRestoreSampleData: () => void;
  onTriggerOnboarding: () => void;
  onClose: () => void;
  onLogout?: () => void;
}

type SettingsTab = 'notificacoes' | 'apresentacao' | 'metas' | 'banco' | 'senha';

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  userEmail,
  onUpdateSettings,
  onResetDatabaseToZero,
  onRestoreSampleData,
  onTriggerOnboarding,
  onClose,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('notificacoes');

  // Auth / Password change states with Supabase
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Form states
  const [daysBefore, setDaysBefore] = useState(settings.notificationDaysBefore);
  const [notifTitle, setNotifTitle] = useState(settings.notificationTitle);
  const [notifEnabled, setNotifEnabled] = useState(settings.notificationsEnabled);
  const [soundPreset, setSoundPreset] = useState<'chime' | 'fanfare' | 'ding' | 'custom'>(
    settings.notificationSoundPreset || 'chime'
  );
  const [customSoundUrl, setCustomSoundUrl] = useState<string | undefined>(
    settings.customNotificationSoundUrl
  );
  const [monthlyTargetDisplay, setMonthlyTargetDisplay] = useState(
    formatCurrencyInput(settings.monthlyTarget).display
  );
  const [monthlyTargetNumeric, setMonthlyTargetNumeric] = useState(settings.monthlyTarget);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);

  // Live Simulated Push Banner state
  const [showNotificationSimulation, setShowNotificationSimulation] = useState(false);
  const soundFileInputRef = useRef<HTMLInputElement | null>(null);

  // Test Notification simulation with sound and vibration
  const handleTestNotification = () => {
    // Play selected audio
    soundManager.play(soundPreset, customSoundUrl);

    // Haptic vibration on devices supporting it
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {
      // ignore
    }

    setShowNotificationSimulation(true);
    setTimeout(() => {
      setShowNotificationSimulation(false);
    }, 4500);
  };

  // Upload custom audio file
  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomSoundUrl(reader.result);
        setSoundPreset('custom');
        // Play to confirm
        soundManager.play('custom', reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveAll = () => {
    onUpdateSettings({
      ...settings,
      notificationDaysBefore: daysBefore,
      notificationTitle: notifTitle.trim() || 'Lembrete de Decoração',
      notificationsEnabled: notifEnabled,
      notificationSoundPreset: soundPreset,
      customNotificationSoundUrl: customSoundUrl,
      monthlyTarget: monthlyTargetNumeric || 15000,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Change Password Handler with Supabase Auth
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!newPassword.trim()) {
      setPasswordError('Por favor, digite a nova senha.');
      return;
    }

    if (newPassword.trim().length < 6) {
      setPasswordError('A nova senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setPasswordError('A confirmação da nova senha não confere.');
      return;
    }

    setIsSavingPassword(true);
    const res = await changeUserPassword(newPassword.trim());
    setIsSavingPassword(false);

    if (res.success) {
      setPasswordSuccess('Nova senha salva com sucesso no Supabase Auth!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } else {
      setPasswordError(res.error || 'Erro ao atualizar senha no Supabase.');
    }
  };

  const handleLogoutClick = async () => {
    await logoutUser();
    onLogout?.();
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Simulated iOS Push Notification Banner */}
      {showNotificationSimulation && (
        <div className="fixed top-2 left-3 right-3 z-60 animate-in slide-in-from-top duration-300 pointer-events-auto">
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-white/20 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-white/20 flex items-center justify-center p-0.5">
                  <img
                    src="/assets/aistudio/image_971ed1a0.png"
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-bold text-[#FF4B93]">
                  {notifTitle || 'Lembrete de Decoração'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Agora</span>
            </div>

            <div className="text-xs font-bold text-white">
              Sophia Moura · Jardim das Borboletas 1 Aninho
            </div>

            <div className="text-[11px] text-slate-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#FFBF1A] shrink-0" />
              <span>
                Festa em {daysBefore} {daysBefore === 1 ? 'dia' : 'dias'}! Horário da festa de{' '}
                <strong className="text-amber-300 font-bold">15:00 horas</strong>. Buffet Splash Kids.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar strictly in 1 single line */}
      <div className="flex items-center justify-between pb-2 border-b border-rose-100">
        <button
          onClick={onClose}
          aria-label="Voltar"
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer active:scale-95 transition-all shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <h2 className="text-sm font-extrabold text-slate-800 tracking-tight whitespace-nowrap truncate px-2">
          Ajustes & Configurações
        </h2>

        {saveSuccess ? (
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 shrink-0 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            Salvo
          </span>
        ) : (
          <button
            onClick={handleSaveAll}
            className="text-xs font-bold text-[#FF4B93] hover:text-[#E03A7D] px-2 py-1 cursor-pointer shrink-0"
          >
            Salvar
          </button>
        )}
      </div>

      {/* Brand Mini Card */}
      <div className="bg-gradient-to-r from-rose-50 via-[#FFFDF0] to-amber-50 rounded-2xl p-3 shadow-sm border border-rose-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-[#FF4B93]/30 shadow-2xs bg-[#FFFDF0] shrink-0">
          <img
            src="/assets/aistudio/image_971ed1a0.png"
            alt="Ateliê Festa com alegria"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-xs font-black text-slate-900 leading-tight truncate">
            Ateliê Festa com alegria
          </h3>
          <p className="text-[11px] text-[#FF4B93] font-bold truncate">@festa_com_alegria</p>
        </div>
      </div>

      {/* Category Tabs (Flutter-style ListView Sections) */}
      <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
        <div className="grid grid-cols-5 gap-1 text-[10px]">
          {[
            { id: 'notificacoes', label: 'Notificaç.', icon: Bell },
            { id: 'apresentacao', label: 'Tutorial', icon: Sparkles },
            { id: 'metas', label: 'Metas', icon: Target },
            { id: 'banco', label: 'Dados', icon: ShieldCheck },
            { id: 'senha', label: 'Senha', icon: KeyRound },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`min-h-[44px] px-1 py-1 rounded-xl font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                  isSel
                    ? 'bg-gradient-to-r from-[#FF4B93] to-[#FF6B8B] text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 1: Notificações & Sons (Flutter-style ListTile Group) */}
      {activeTab === 'notificacoes' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Card Group */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
            {/* ListTile: Ativar Avisos */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#FF4B93] flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Avisos de Festas Próximas
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Exibe alerta no topo com horário da festa
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={notifEnabled}
                onChange={(e) => setNotifEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#FF4B93] rounded cursor-pointer"
              />
            </div>

            {/* ListTile: Dias de antecedência */}
            <div className="p-3.5 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FF4B93]" />
                <span className="text-xs font-bold text-slate-700">
                  Dias de Antecedência do Aviso:
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 5].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDaysBefore(d)}
                    className={`min-h-[38px] rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      daysBefore === d
                        ? 'bg-[#FF4B93] text-white border-[#FF4B93] shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {d === 1 ? '1 dia' : `${d} dias`}
                  </button>
                ))}
              </div>
            </div>

            {/* ListTile: Título customizado */}
            <div className="p-3.5 space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Título do Aviso / Notificação:
              </label>
              <input
                type="text"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                placeholder="Ex: Lembrete de Decoração"
                className="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93]"
              />
            </div>

            {/* ListTile: Sons de Notificação */}
            <div className="p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#FF4B93]" />
                  <span className="text-xs font-bold text-slate-800">
                    Som da Notificação:
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => soundManager.play(soundPreset, customSoundUrl)}
                  className="text-[11px] font-bold text-[#FF4B93] flex items-center gap-1 cursor-pointer bg-rose-50 px-2 py-1 rounded-lg"
                >
                  <Play className="w-3 h-3 fill-[#FF4B93]" />
                  <span>Ouvir Som</span>
                </button>
              </div>

              {/* Sound Presets */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'chime', label: '🔔 Sino Mágico' },
                  { id: 'fanfare', label: '🎺 Fanfarra' },
                  { id: 'ding', label: '✨ Ding Fofo' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSoundPreset(s.id as any);
                      soundManager.play(s.id as any);
                    }}
                    className={`min-h-[38px] px-2 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      soundPreset === s.id
                        ? 'bg-[#FF4B93] text-white border-[#FF4B93] shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Custom Audio Upload */}
              <div className="pt-1">
                <input
                  ref={soundFileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleCustomAudioUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => {
                    if (soundFileInputRef.current) {
                      soundFileInputRef.current.click();
                    }
                  }}
                  className={`w-full min-h-[40px] px-3 rounded-xl border flex items-center justify-between text-xs font-semibold cursor-pointer transition-all ${
                    soundPreset === 'custom'
                      ? 'border-[#FF4B93] bg-rose-50/70 text-[#FF4B93]'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-[#FF4B93]" />
                    {customSoundUrl ? 'Som Próprio Carregado ✓' : 'Adicionar Som Próprio dos Arquivos'}
                  </span>
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Action: Ver Exemplo de Notificação (Simulação de Push) */}
          <button
            type="button"
            onClick={handleTestNotification}
            className="w-full min-h-[48px] bg-gradient-to-r from-rose-500 via-[#FF4B93] to-amber-500 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm shadow-rose-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
          >
            <Bell className="w-4 h-4 fill-white" />
            <span>Ver Exemplo de Como Chega a Notificação</span>
          </button>
        </div>
      )}

      {/* Section 2: Apresentação & Tutorial */}
      {activeTab === 'apresentacao' && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3.5 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#FF4B93] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                Apresentação Interativa (Spotlight Tour)
              </h4>
              <p className="text-[11px] text-slate-400">
                Fundo escurecido e balão circulando cada opção
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            A apresentação circula o botão de novo pedido, o resumo de lucro, os filtros em pílulas, as abas de pedidos e catálogo com um balão explicativo em destaque.
          </p>

          <button
            type="button"
            onClick={onTriggerOnboarding}
            className="w-full min-h-[46px] bg-gradient-to-r from-[#FF4B93] to-[#FF6B8B] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Iniciar Apresentação do App Agora</span>
          </button>
        </div>
      )}

      {/* Section 3: Metas & Faturamento */}
      {activeTab === 'metas' && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3.5 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#FFBF1A] flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                Meta Mensal de Faturamento
              </h4>
              <p className="text-[11px] text-slate-400">
                Alvo de receita para o gráfico de progresso
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Valor da Meta (R$)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={monthlyTargetDisplay}
              onChange={(e) => {
                const res = formatCurrencyInput(e.target.value);
                setMonthlyTargetDisplay(res.display);
                setMonthlyTargetNumeric(res.numericValue);
              }}
              className="w-full h-11 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4B93] text-slate-800 font-bold"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            className="w-full min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Meta Mensal</span>
          </button>
        </div>
      )}

      {/* Section 4: Banco de Dados & Armazenamento */}
      {activeTab === 'banco' && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3.5 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                Banco de Dados do iPhone
              </h4>
              <p className="text-[11px] text-slate-400">
                Gerencie todos os dados locais salvos
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Seus pedidos, despesas, fotos do catálogo e stickers ficam armazenados com segurança no seu navegador Safari / iPhone.
          </p>

          {/* Reset to Zero */}
          <div className="pt-1">
            {showConfirmReset ? (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 space-y-2">
                <p className="text-xs font-bold text-rose-700">
                  Tem certeza que deseja zerar o banco de dados?
                </p>
                <p className="text-[11px] text-slate-600">
                  Isso apagará todos os pedidos, despesas e catálogo para que você comece 100% do zero.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 min-h-[40px] bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onResetDatabaseToZero();
                      setShowConfirmReset(false);
                    }}
                    className="flex-1 min-h-[40px] bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Confirmar e Zerar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmReset(true)}
                className="w-full min-h-[44px] bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Zerar Banco de Dados (Começar do Zero)</span>
              </button>
            )}
          </div>

          {/* Restore Sample Data */}
          <div className="pt-1">
            {showConfirmRestore ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2">
                <p className="text-xs font-bold text-amber-800">
                  Restaurar festas de exemplo do Ateliê?
                </p>
                <p className="text-[11px] text-slate-600">
                  Isso recarregará decorações demonstrativas (Jardim das Borboletas, Bluey, Safari).
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowConfirmRestore(false)}
                    className="flex-1 min-h-[40px] bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onRestoreSampleData();
                      setShowConfirmRestore(false);
                    }}
                    className="flex-1 min-h-[40px] bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Restaurar Exemplos
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmRestore(true)}
                className="w-full min-h-[44px] bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Restaurar Dados de Exemplo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Section 5: Senha & Segurança de Acesso */}
      {activeTab === 'senha' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Section Header */}
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#FF4B93] flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Acesso & Senha
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Proteção e credenciais de entrada do seu aplicativo
              </p>
            </div>
          </div>

          {/* Card 1: Registered Account Email */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-[#FF4B93] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Usuário Conectado
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {userEmail || 'contato@festacomalegria.com.br'}
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isSupabaseConfigured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {isSupabaseConfigured ? 'Supabase Auth' : 'Auth Local'}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 pt-1">
              Acesso exclusivo gerenciado pelo administrador. Novos membros são cadastrados por convite seguro.
            </div>
          </div>

          {/* Card 2: Alterar Senha de Acesso no Supabase */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#FF4B93] flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  Alterar Senha de Acesso
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Atualize sua senha criptografada no Supabase Auth
                </p>
              </div>
            </div>

            {/* Success Feedback */}
            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-semibold">{passwordSuccess}</span>
              </div>
            )}

            {/* Error Feedback */}
            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span className="font-semibold">{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 pt-1">
              {/* Nova Senha */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="w-full bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2.5 pr-10 text-xs text-slate-800 focus:outline-none focus:border-[#FF4B93] focus:ring-1 focus:ring-rose-200 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    aria-label="Alternar exibição da senha"
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    required
                    className="w-full bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2.5 pr-10 text-xs text-slate-800 focus:outline-none focus:border-[#FF4B93] focus:ring-1 focus:ring-rose-200 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    aria-label="Alternar exibição da senha"
                  >
                    {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSavingPassword}
                className="w-full min-h-[44px] mt-1 bg-gradient-to-r from-[#FF4B93] to-[#FF6B8B] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-sm shadow-rose-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all disabled:opacity-70"
              >
                {isSavingPassword ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Salvar Nova Senha</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Card 3: Sessão & Logout */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-600 leading-relaxed">
                <strong className="text-slate-800 block mb-0.5">Sessão Segura & Persistente</strong>
                Sua sessão é mantida com token seguro do Supabase no Safari / Vercel. Não há risco de perda de senha ou armazenamento em texto puro.
              </div>
            </div>

            {onLogout && (
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full min-h-[42px] bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all shadow-2xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair da Conta (Desconectar)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
