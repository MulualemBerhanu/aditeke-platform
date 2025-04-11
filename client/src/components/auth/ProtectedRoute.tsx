import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: string; // Optional: specify a required role for additional authorization
};

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [_, setLocation] = useLocation();

  // Check if user is authenticated
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/user');
        return await res.json();
      } catch (error) {
        console.error('Authentication error:', error);
        return null;
      }
    },
    retry: 1, // Only retry once since a 401 will always be a 401
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/login');
    }
  }, [isLoading, user, setLocation]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state (unlikely, as we'd usually redirect)
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Authentication Error</div>
          <p className="text-gray-500">Please try logging in again.</p>
          <button 
            onClick={() => setLocation('/login')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
}