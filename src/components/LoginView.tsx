import React, { useState, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Mail,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Info,
} from 'lucide-react';
import {
  authenticateWithSupabase,
  requestPasswordReset,
  changeUserPassword,
  isSupabaseConfigured,
  isInviteOrRecoveryRedirect,
  getAuthRedirectType,
  clearUrlAuthTokens,
  exchangeCodeIfPresent,
  AuthSession,
} from '../utils/auth.ts';
import { supabase } from '../utils/supabase.ts';

interface LoginViewProps {
  onLoginSuccess: (session: AuthSession) => void;
  forcePasswordSetup?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  forcePasswordSetup = false,
}) => {
  // Check immediately on mount if URL contains invite or recovery tokens
  const [isInviteOrRecovery, setIsInviteOrRecovery] = useState<boolean>(() => {
    return forcePasswordSetup || isInviteOrRecoveryRedirect();
  });

  const [flowType, setFlowType] = useState<'invite' | 'recovery'>(() => {
    return getAuthRedirectType() === 'invite' ? 'invite' : 'recovery';
  });

  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  // Standard Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password Setup (Invite / Recovery) state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [setupSuccess, setSetupSuccess] = useState(false);

  // Forgot Password Modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);

  useEffect(() => {
    // 1. Check if PKCE code needs exchange
    exchangeCodeIfPresent().then((exchanged) => {
      if (exchanged && isInviteOrRecoveryRedirect()) {
        setIsInviteOrRecovery(true);
      }
    });

    // 2. Fetch current user email from session if available
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          setCurrentUserEmail(session.user.email);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session?.user?.email) {
            setCurrentUserEmail(session.user.email);
          }

          if (event === 'PASSWORD_RECOVERY') {
            setIsInviteOrRecovery(true);
            setFlowType('recovery');
          } else if (event === 'SIGNED_IN' && session?.user) {
            // If the user entered via an invite or recovery URL, DO NOT auto-login to dashboard!
            // Keep them on the password creation view so they can define their password
            if (isInviteOrRecoveryRedirect() || forcePasswordSetup) {
              setIsInviteOrRecovery(true);
            }
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [forcePasswordSetup]);

  // Handle standard Login with email & password
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const result = await authenticateWithSupabase(email, password);
      setIsLoading(false);

      if (result.success && result.session) {
        onLoginSuccess(result.session);
      } else {
        setErrorMsg(result.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Erro ao conectar ao serviço de autenticação.');
    }
  };

  // Handle Password Reset Request by Email
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setIsSendingReset(true);

    const result = await requestPasswordReset(forgotEmail);
    setIsSendingReset(false);

    if (result.success) {
      setForgotSuccess(true);
    } else {
      setForgotError(result.error || 'Não foi possível enviar o e-mail de recuperação.');
    }
  };

  // Handle setting/confirming password after Invite or Recovery link
  const handlePasswordSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newPassword.trim() || newPassword.trim().length < 6) {
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setErrorMsg('As senhas digitadas não coincidem. Digite a mesma senha em ambos os campos.');
      return;
    }

    setIsLoading(true);
    const result = await changeUserPassword(newPassword.trim());
    setIsLoading(false);

    if (result.success) {
      setSetupSuccess(true);
      clearUrlAuthTokens();

      // Retrieve confirmed session and transition user into dashboard
      setTimeout(async () => {
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            onLoginSuccess({
              isAuthenticated: true,
              userEmail: data.session.user.email || currentUserEmail,
              userId: data.session.user.id,
              loggedAt: new Date().toISOString(),
            });
            return;
          }
        }

        // Fallback session state
        onLoginSuccess({
          isAuthenticated: true,
          userEmail: currentUserEmail || email,
          loggedAt: new Date().toISOString(),
        });
      }, 1400);
    } else {
      setErrorMsg(result.error || 'Não foi possível salvar a nova senha. O link pode ter expirado.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
      {/* Central Login Card Preserving Exact Attached Visual */}
      <div className="w-full max-w-[370px] bg-white rounded-[32px] p-7 shadow-2xl border border-white/60 relative overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Decorative Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-200/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-pink-100/60 rounded-full blur-2xl pointer-events-none" />

        {/* 1. INVITE / PASSWORD SETUP FLOW (When clicking Supabase Invite or Recovery link) */}
        {isInviteOrRecovery ? (
          <div>
            {/* Top Brand Header */}
            <div className="text-center mb-5">
              <div className="flex items-center justify-center gap-1.5 text-[#FF4B93] text-xs font-black uppercase tracking-wider mb-2">
                <span className="text-sm">✿</span>
                <span>FESTA COM ALEGRIA</span>
                <span className="text-sm">✿</span>
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                {flowType === 'invite' ? 'Criar sua Senha' : 'Definir Nova Senha'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {flowType === 'invite'
                  ? 'Boas-vindas ao ateliê! Crie sua senha de acesso 💕'
                  : 'Crie uma nova senha segura para acessar seu ateliê 💕'}
              </p>
            </div>

            {/* User identification badge */}
            {currentUserEmail && (
              <div className="mb-4 p-2.5 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center gap-2 text-xs text-slate-700">
                <Mail className="w-3.5 h-3.5 text-[#FF4B93] shrink-0" />
                <span className="text-[11px] truncate font-medium">
                  Convite para: <strong className="text-slate-900">{currentUserEmail}</strong>
                </span>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span className="leading-tight font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Success Feedback */}
            {setupSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">
                  {flowType === 'invite' ? 'Senha criada com sucesso!' : 'Senha atualizada com sucesso!'}
                </h4>
                <p className="text-xs text-emerald-700">Entrando no seu painel...</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordSetupSubmit} className="space-y-4">
                {/* Nova Senha */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {flowType === 'invite' ? 'Crie sua Senha' : 'Nova Senha'}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      autoComplete="new-password"
                      className="w-full bg-white rounded-2xl border border-slate-200/90 px-4 py-3.5 pr-11 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF4B93] focus:ring-2 focus:ring-rose-100 transition-all shadow-2xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      aria-label="Alternar exibição da senha"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a mesma senha"
                      required
                      autoComplete="new-password"
                      className="w-full bg-white rounded-2xl border border-slate-200/90 px-4 py-3.5 pr-11 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF4B93] focus:ring-2 focus:ring-rose-100 transition-all shadow-2xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      aria-label="Alternar exibição da confirmação de senha"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 bg-[#FF4B93] hover:bg-[#eb3c81] active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-rose-200/70 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Salvar Senha e Entrar no Painel</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Subtext */}
            <div className="text-center mt-4">
              <span className="text-[11px] text-slate-400 font-medium">
                Acesso exclusivo e protegido
              </span>
            </div>
          </div>
        ) : (
          /* 2. STANDARD LOGIN VIEW MATCHING SCREENSHOT EXACTLY */
          <div>
            {/* Top Brand Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-1.5 text-[#FF4B93] text-xs font-black uppercase tracking-wider mb-2">
                <span className="text-sm">✿</span>
                <span>FESTA COM ALEGRIA</span>
                <span className="text-sm">✿</span>
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                Bem-vinda de volta!
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Seu cantinho para organizar cada festa 💕
              </p>
            </div>

            {/* Config Warning when variables are missing */}
            {!isSupabaseConfigured && (
              <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Configuração do Supabase Auth</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-700">
                  Adicione as variáveis <strong>VITE_SUPABASE_URL</strong> e <strong>VITE_SUPABASE_ANON_KEY</strong> na sua Vercel ou arquivo local .env para autenticar os usuários autorizados.
                </p>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span className="leading-tight font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* E-mail Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    autoCapitalize="none"
                    required
                    className="w-full bg-white rounded-2xl border border-slate-200/90 px-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF4B93] focus:ring-2 focus:ring-rose-100 transition-all shadow-2xs"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Senha Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotSuccess(false);
                      setForgotError(null);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] font-semibold text-[#FF4B93] hover:underline cursor-pointer"
                  >
                    Esqueceu?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full bg-white rounded-2xl border border-slate-200/90 px-4 py-3.5 pr-11 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF4B93] focus:ring-2 focus:ring-rose-100 transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Button: Entrar no meu painel */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-[#FF4B93] hover:bg-[#eb3c81] active:scale-[0.98] text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-rose-200/70 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar no meu painel</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Subtext */}
            <div className="text-center mt-4">
              <span className="text-[11px] text-slate-400 font-medium">
                Acesso exclusivo e protegido
              </span>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: REDEFINIÇÃO DE SENHA POR E-MAIL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#FF4B93] flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800">Recuperar Acesso</h4>
                <p className="text-[11px] text-slate-500">Enviaremos um link de redefinição</p>
              </div>
            </div>

            {forgotSuccess ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-900">
                  E-mail de redefinição enviado!
                </p>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Verifique a caixa de entrada de <strong>{forgotEmail}</strong> e clique no link para definir sua nova senha.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="mt-2 w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                {forgotError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                    {forgotError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail do Usuário Autorizado
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full bg-slate-50 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#FF4B93]"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="flex-1 py-2.5 rounded-xl bg-[#FF4B93] hover:bg-[#eb3c81] text-white text-xs font-bold shadow-xs disabled:opacity-70 flex items-center justify-center gap-1"
                  >
                    {isSendingReset ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Enviar Link</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
