'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'Admin' | 'Vendor' | 'Customer';
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(fallbackPath);
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        switch (user.role) {
          case 'Admin':
            router.push('/admin/dashboard');
            break;
          case 'Vendor':
            router.push('/vendor/dashboard');
            break;
          case 'Customer':
            router.push('/customer/dashboard');
            break;
          default:
            router.push('/');
        }
        return;
      }
    }
  }, [isAuthenticated, user, loading, requiredRole, router, fallbackPath]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <div className="text-xl text-gray-700 font-medium">লোড হচ্ছে...</div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (redirect happens in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // If role doesn't match, don't render children (redirect happens in useEffect)
  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}