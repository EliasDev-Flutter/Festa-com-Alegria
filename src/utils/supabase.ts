import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Environment variables configured in Vite (.env or Vercel Environment Variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
);

// Singleton Supabase Client with persistent secure session
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'festacomalegria_auth_token',
      },
    })
  : null;

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isPasswordRecovery: boolean;
}

/**
 * Check if the current URL contains Supabase invite or password recovery tokens
 */
export function isInviteOrRecoveryRedirect(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  return (
    hash.includes('type=invite') ||
    hash.includes('type=recovery') ||
    search.includes('type=invite') ||
    search.includes('type=recovery')
  );
}

/**
 * Get the specific redirect type from URL: 'invite' or 'recovery'
 */
export function getAuthRedirectType(): 'invite' | 'recovery' | null {
  if (typeof window === 'undefined') return null;
  const combined = (window.location.hash || '') + (window.location.search || '');
  if (combined.includes('type=invite')) return 'invite';
  if (combined.includes('type=recovery')) return 'recovery';
  return null;
}

/**
 * Clean up authentication tokens/hashes from URL bar without page reload
 */
export function clearUrlAuthTokens(): void {
  if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
    window.history.replaceState(null, '', window.location.pathname);
  }
}

/**
 * Handle PKCE authorization code exchange if present in URL query params
 */
export async function exchangeCodeIfPresent(): Promise<boolean> {
  if (!supabase || typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error && data.session) {
        return true;
      }
    } catch (e) {
      console.warn('Supabase code exchange:', e);
    }
  }
  return false;
}

/**
 * Sign in with email and password via Supabase Auth
 */
export async function signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string; session?: Session }> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase não está configurado. Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { success: false, error: 'E-mail ou senha incorretos. Apenas usuários autorizados têm acesso.' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { success: false, error: 'E-mail ainda não confirmado. Verifique a caixa de entrada do convite.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, session: data.session ?? undefined };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro inesperado na autenticação.' };
  }
}

/**
 * Send password reset link to user's email
 */
export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase não está configurado. Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
    };
  }

  try {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}` : '';
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: redirectUrl,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao enviar e-mail de redefinição.' };
  }
}

/**
 * Update authenticated user password
 */
export async function updateAuthenticatedUserPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      error: 'Supabase não está configurado.',
    };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'A nova senha deve ter no mínimo 6 caracteres no Supabase.' };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao atualizar senha no Supabase.' };
  }
}

/**
 * Sign out from Supabase Auth
 */
export async function signOutUser(): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: true };

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao encerrar sessão.' };
  }
}
