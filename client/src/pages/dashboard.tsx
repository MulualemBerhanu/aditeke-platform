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
      // Log user role information for debugging
      console.log("User data roleId:", user.roleId, "type:", typeof user.roleId);
      
      // Check for role by ID (both numeric legacy IDs and string Firebase IDs)
      if (user.roleId === 1 || user.roleId === 'xG7hEVtYoYVT486Iw30z') {
        console.log("Using role name for redirection:", "admin", "-> URL:", "/admin/dashboard");
        setLocation('/admin/dashboard');
      } else if (user.roleId === 2 || user.roleId === 'YcKKrgriG70R2O9Qg4io') {
        console.log("Using role name for redirection:", "manager", "-> URL:", "/manager/dashboard");
        setLocation('/manager/dashboard');
      } else if (user.roleId === 3 || user.roleId === 'tkIVVYpWobVjoawaozmp') {
        console.log("Using role name for redirection:", "client", "-> URL:", "/client/dashboard");
        setLocation('/client/dashboard');
      } else {
        // If role is not recognized, redirect to home
        console.log("Role not recognized, redirecting to home");
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