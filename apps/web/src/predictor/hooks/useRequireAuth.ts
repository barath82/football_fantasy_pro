import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

/** Redirects to sign-in if not authenticated, once the auth check has actually resolved. */
export function useRequireAuth(returnTo: string) {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      navigate(`/signup?returnTo=${encodeURIComponent(returnTo)}`);
    }
  }, [auth.isLoading, auth.isAuthenticated, returnTo, navigate]);

  return auth;
}
