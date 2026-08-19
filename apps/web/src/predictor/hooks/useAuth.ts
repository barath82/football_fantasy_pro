import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export interface AuthUser {
  id: string;
  provider: 'google' | 'x';
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
  };

  const updateFplTeamId = async (fplTeamId: string) => {
    const { data: user } = await api.patch('/auth/me', { fplTeamId });
    queryClient.setQueryData(['auth', 'me'], { authenticated: true, user });
    return user as AuthUser;
  };

  return {
    isLoading: query.isLoading,
    isAuthenticated: query.data?.authenticated ?? false,
    user: query.data?.user ?? null,
    logout,
    updateFplTeamId,
  };
}
