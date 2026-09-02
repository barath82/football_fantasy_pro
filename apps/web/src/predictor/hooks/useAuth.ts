import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { identifyUser, resetAnalyticsIdentity, trackEvent } from '../../lib/analytics';

export interface AuthUser {
  id: string;
  provider: 'google' | 'x' | 'email';
  displayName: string;
  avatarUrl: string | null;
  email: string | null;
  handle: string | null;
  fplTeamId: string | null;
}

interface MeResponse {
  authenticated: boolean;
  user?: AuthUser;
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

/** Absolute (non-proxied) URL to start an OAuth login — needs a real browser navigation. */
export function loginUrl(provider: 'google' | 'x', returnTo: string): string {
  return `${API_URL}/api/auth/${provider}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const query = useQuery<MeResponse>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data;
    },
    staleTime: 60 * 1000,
  });

  const logout = async () => {
    await api.post('/auth/logout');
    queryClient.setQueryData(['auth', 'me'], { authenticated: false });
    trackEvent({ name: 'logout' });
    resetAnalyticsIdentity();
  };

  const updateFplTeamId = async (fplTeamId: string) => {
    const { data: user } = await api.patch('/auth/me', { fplTeamId });
    queryClient.setQueryData(['auth', 'me'], { authenticated: true, user });
    return user as AuthUser;
  };

  /** Refetches /auth/me so the session cookie a register/login response just set actually takes effect app-wide. */
  const refreshSession = () => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

  const register = async (email: string, password: string, displayName: string, fplTeamId?: string) => {
    const { data: user } = await api.post('/auth/register', { email, password, displayName, fplTeamId: fplTeamId || undefined });
    await refreshSession();
    identifyUser({ id: user.id, provider: 'email' });
    trackEvent({ name: 'signup_completed', props: { provider: 'email' } });
  };

  const login = async (email: string, password: string) => {
    const { data: user } = await api.post('/auth/login', { email, password });
    await refreshSession();
    identifyUser({ id: user.id, provider: 'email' });
    trackEvent({ name: 'login_completed', props: { provider: 'email' } });
  };

  const forgotPassword = async (email: string) => {
    await api.post('/auth/forgot-password', { email });
  };

  const resetPassword = async (token: string, password: string) => {
    await api.post('/auth/reset-password', { token, password });
  };

  return {
    isLoading: query.isLoading,
    isAuthenticated: query.data?.authenticated ?? false,
    user: query.data?.user ?? null,
    logout,
    updateFplTeamId,
    register,
    login,
    forgotPassword,
    resetPassword,
  };
}
