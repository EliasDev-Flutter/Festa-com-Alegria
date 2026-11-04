import {
  supabase,
  isSupabaseConfigured,
  signInWithEmail,
  sendPasswordResetEmail,
  updateAuthenticatedUserPassword,
  signOutUser,
} from './supabase.ts';

// Clean up any legacy plain passwords from localStorage to enforce security
try {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('atelie_auth_credentials');
  }
} catch {
  // ignore
}

export interface AuthSession {
  isAuthenticated: boolean;
  userEmail: string;
  userId?: string;
  loggedAt: string;
}

/**
 * Perform login using Supabase Auth
 */
export async function authenticateWithSupabase(
  emailInput: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string; session?: AuthSession }> {
  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  if (!cleanEmail) {
    return { success: false, error: 'Por favor, informe seu e-mail de acesso.' };
  }
  if (!cleanPass) {
    return { success: false, error: 'Por favor, digite sua senha.' };
  }

  const result = await signInWithEmail(cleanEmail, cleanPass);

  if (!result.success || !result.session) {
    return { success: false, error: result.error || 'Credenciais inválidas ou usuário não autorizado.' };
  }

  const user = result.session.user;
  const authSession: AuthSession = {
    isAuthenticated: true,
    userEmail: user.email || cleanEmail,
    userId: user.id,
    loggedAt: new Date().toISOString(),
  };

  return { success: true, session: authSession };
}

/**
 * Request password reset email via Supabase
 */
export async function requestPasswordReset(emailInput: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = emailInput.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Informe um e-mail válido para receber o link de redefinição.' };
  }

  return sendPasswordResetEmail(cleanEmail);
}

/**
 * Update authenticated user password in Supabase
 */
export async function changeUserPassword(newPasswordInput: string): Promise<{ success: boolean; error?: string }> {
  const cleanPass = newPasswordInput.trim();
  if (!cleanPass || cleanPass.length < 6) {
    return { success: false, error: 'A nova senha deve ter no mínimo 6 caracteres.' };
  }

  return updateAuthenticatedUserPassword(cleanPass);
}

/**
 * Log out user from Supabase
 */
export async function logoutUser(): Promise<void> {
  await signOutUser();
}

export {
  isSupabaseConfigured,
  isInviteOrRecoveryRedirect,
  getAuthRedirectType,
  clearUrlAuthTokens,
  exchangeCodeIfPresent,
} from './supabase.ts';
