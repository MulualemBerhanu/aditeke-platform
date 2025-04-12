import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2 } from 'lucide-react';

// This is a simple redirect component to send users to their role-based dashboard
export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      // Redirect based on user role
      switch (user.roleId) {
        case 1: // Admin
          setLocation('/admin/dashboard');
          break;
        case 2: // Manager
          setLocation('/manager/dashboard');
          break;
        case 3: // Client
          setLocation('/client/dashboard');
          break;
        default:
          // If role is not recognized, redirect to home
          setLocation('/');
      }
    } else if (!isLoading && !user) {
      // If not logged in, redirect to login
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-gray-500">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}