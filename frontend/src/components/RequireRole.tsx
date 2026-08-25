import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface RequireRoleProps {
  role?: string;
  roles?: string[];
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export default function RequireRole({ 
  role, 
  roles, 
  children, 
  redirectTo = '/login',
  fallback 
}: RequireRoleProps) {
  const { user, hasRole, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3 font-sans">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-xs font-bold text-gray-400">Verifying security credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  const requiredRoleList = roles || (role ? [role] : []);
  const isAuthorized = requiredRoleList.length === 0 || requiredRoleList.some((r) => hasRole(r));

  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-orange-100 shadow-warm text-center space-y-4 font-sans">
        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-600">
          <ShieldAlert size={28} />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-extrabold font-baloo text-slate-800">Access Restricted</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            This module requires <span className="font-bold text-slate-700 font-mono uppercase">{requiredRoleList.join(' or ')}</span> authorization permissions.
          </p>
        </div>
        <div className="pt-2">
          <a
            href="/"
            className="inline-block bg-primary hover:bg-primary-hover text-white font-bold px-6 py-2.5 rounded-xl text-xs font-baloo shadow-sm cursor-pointer"
          >
            Return to Public Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
