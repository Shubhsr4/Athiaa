import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8 text-center font-sans">
        <div className="space-y-3">
          <Loader2 size={32} className="animate-spin mx-auto text-primary" />
          <p className="text-xs text-gray-500 font-semibold">Verifying administrator authorization...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
