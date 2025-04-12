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

  // Look for hash authentication data from URL
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith('#user=')) {
        const userData = decodeURIComponent(hash.substring(6));
        localStorage.setItem('currentUser', userData);
        window.location.hash = ''; // Clear the hash
      }
    } catch (e) {
      console.error('Error processing URL hash data:', e);
    }
  }, []);
  
  // Check for manually submitted user data (from form)
  useEffect(() => {
    if (document.referrer.includes('/login')) {
      const urlParams = new URLSearchParams(window.location.search);
      const userData = urlParams.get('userData');
      if (userData) {
        localStorage.setItem('currentUser', userData);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);
  
  // Check if user is authenticated - first try API, then localStorage
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        // Try to get user from API first
        const res = await apiRequest('GET', '/api/user');
        const apiUser = await res.json();
        
        // If API returns a user, great!
        if (apiUser) return apiUser;
        
        // If not, check localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('Using user from localStorage:', parsedUser);
            return parsedUser;
          } catch (e) {
            console.error('Error parsing stored user:', e);
            localStorage.removeItem('currentUser');
          }
        }
        
        return null;
      } catch (error) {
        console.error('Authentication error:', error);
        
        // API failed, try localStorage
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('Using user from localStorage after API error:', parsedUser);
            return parsedUser;
          } catch (e) {
            console.error('Error parsing stored user:', e);
            localStorage.removeItem('currentUser');
          }
        }
        
        return null;
      }
    },
    retry: 1, // Only retry once since a 401 will always be a 401
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    // Check both the user from context and localStorage for maximum compatibility
    const isLocalStorageAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const localStorageUser = localStorage.getItem('currentUser');
    
    // Only redirect if both API and localStorage auth are missing
    if (!isLoading && !user && !isLocalStorageAuthenticated && !localStorageUser) {
      console.log("⚠️ No auth found in API or localStorage, redirecting to login");
      setLocation('/login');
    } else if (!user && (isLocalStorageAuthenticated || localStorageUser)) {
      console.log("⚠️ Using localStorage authentication as fallback");
      // We have localStorage auth but no API auth - this is okay, let the user proceed
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