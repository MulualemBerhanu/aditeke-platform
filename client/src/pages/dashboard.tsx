import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2 } from 'lucide-react';
import { getDashboardPath, performRedirect } from '@/lib/roleUtils';

// This is a simple redirect component to send users to their role-based dashboard
export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  const isDeployedEnv = window.location.hostname !== 'localhost';

  useEffect(() => {
    // If the user isn't loaded yet, wait
    if (isLoading) return;
    
    // Check for a fallback URL first (from failed redirects)
    const fallbackRedirect = sessionStorage.getItem('pendingRedirect') || 
                            localStorage.getItem('fallbackRedirect');
    
    if (fallbackRedirect) {
      console.log("Found fallback redirect:", fallbackRedirect);
      sessionStorage.removeItem('pendingRedirect');
      localStorage.removeItem('fallbackRedirect');
      
      // Use forceful redirection for better reliability
      performRedirect(fallbackRedirect, isDeployedEnv);
      return;
    }
    
    // Process based on authentication status
    if (user) {
      // Log user role information for debugging
      console.log("User data for dashboard redirect:", {
        id: user.id,
        username: user.username,
        roleId: user.roleId,
        type: typeof user.roleId
      });
      
      // Get the appropriate dashboard path and redirect
      const dashboardPath = getDashboardPath(user);
      console.log("🧭 Redirecting to dashboard:", dashboardPath);
      
      // In deployed environments, use the more forceful redirect
      if (isDeployedEnv) {
        performRedirect(dashboardPath, true);
      } else {
        // In development, wouter navigation is fine
        setLocation(dashboardPath);
      }
    } else {
      // If not logged in, redirect to login
      console.log("No user found, redirecting to login");
      
      // In deployed environments, use the more forceful redirect
      if (isDeployedEnv) {
        performRedirect('/login', true);
      } else {
        // In development, wouter navigation is fine
        setLocation('/login');
      }
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