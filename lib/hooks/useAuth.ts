import { useAuthContext } from '@/components/providers/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function useAuth() {
  return useAuthContext();
}

export function useUser() {
  const { user } = useAuth();
  return user;
}

export function useIsAdmin() {
  const { isAdmin } = useAuth();
  return isAdmin;
}

export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  return { user, isLoading };
}

