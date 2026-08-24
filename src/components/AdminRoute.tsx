import React from 'react';
import RequireRole from './RequireRole';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  return (
    <RequireRole roles={['admin', 'staff', 'super_admin']}>
      {children}
    </RequireRole>
  );
}
