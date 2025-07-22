import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@shared/schema';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/');
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      setLocation('/unauthorized');
      return;
    }
  }, [isAuthenticated, user, allowedRoles, setLocation]);

  if (!isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
