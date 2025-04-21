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
    refetchOnWindowFocus: false, // Disable refetch on window focus to reduce API calls
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: false, // Disable auto refetching
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
      
      // Process localStorage authentication and apply role-based security
      try {
        if (localStorageUser) {
          // Get the user data from localStorage
          const storedUserData = JSON.parse(localStorageUser);
          
          // Get path for security check
          const path = window.location.pathname;
          const isAdminPath = path.startsWith('/admin');
          const isManagerPath = path.startsWith('/manager');
          const isClientPath = path.startsWith('/client');
          
          // Extract role information from stored user
          const roleId = storedUserData.roleId || 
                     (storedUserData.role && typeof storedUserData.role === 'object' ? 
                        storedUserData.role.id : null);
          const userRole = typeof storedUserData.role === 'object' && storedUserData.role ? 
                       storedUserData.role.name : 
                       typeof storedUserData.roleName === 'string' ? 
                       storedUserData.roleName : null;
          
          console.log("🔐 Role-based security check:", { 
            path, 
            userRole, 
            roleId, 
            username: storedUserData.username
          });
          
          // Map role names to IDs for consistency
          const roleIdMap: Record<string, number> = {
            'admin': 1002,
            'manager': 1000,
            'client': 1001
          };
          
          // Convert roleId to number if it's a string
          let numericRoleId = null;
          if (typeof roleId === 'string') {
            numericRoleId = parseInt(roleId);
          } else if (typeof roleId === 'number') {
            numericRoleId = roleId;
          }
          
          console.log("Numeric Role ID:", numericRoleId);
          
          // Security logic checks both role name and ID
          const hasAdminAccess = 
            userRole?.toLowerCase() === 'admin' || 
            numericRoleId === roleIdMap.admin ||
            roleId === 'xG7hEVtYoYVT486Iw30z'; // Include the Firebase doc ID
          
          const hasManagerAccess = 
            userRole?.toLowerCase() === 'manager' || 
            numericRoleId === roleIdMap.manager ||
            roleId === 'YcKKrgriG70R2O9Qg4io'; // Include the Firebase doc ID
          
          const hasClientAccess = 
            userRole?.toLowerCase() === 'client' || 
            numericRoleId === roleIdMap.client ||
            roleId === 'tkIVVYpWobVjoawaozmp'; // Include the Firebase doc ID
          
          // Apply security policy based on path and role
          if (isAdminPath && !hasAdminAccess) {
            console.warn("⛔ ACCESS DENIED: Non-admin tried to access admin page");
            
            // Redirect based on role
            if (hasManagerAccess) {
              setLocation('/manager/dashboard');
              return; // Important: stop execution
            } else if (hasClientAccess) {
              setLocation('/client/dashboard');
              return; // Important: stop execution
            } else {
              setLocation('/login');
              return; // Important: stop execution
            }
          } else if (isManagerPath && !hasManagerAccess && !hasAdminAccess) {
            console.warn("⛔ ACCESS DENIED: User without manager role tried to access manager page");
            
            if (hasAdminAccess) {
              setLocation('/admin/dashboard');
              return; // Important: stop execution
            } else if (hasClientAccess) {
              setLocation('/client/dashboard');
              return; // Important: stop execution
            } else {
              setLocation('/login');
              return; // Important: stop execution
            }
          } else if (isClientPath && !hasClientAccess && !hasManagerAccess && !hasAdminAccess) {
            console.warn("⛔ ACCESS DENIED: User without client role tried to access client page");
            
            if (hasAdminAccess) {
              setLocation('/admin/dashboard');
              return; // Important: stop execution
            } else if (hasManagerAccess) {
              setLocation('/manager/dashboard');
              return; // Important: stop execution
            } else {
              setLocation('/login');
              return; // Important: stop execution
            }
          }
        }
      } catch (error) {
        console.error("Error processing role-based security:", error);
      }
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

  // Check role-based access if a requiredRole is specified
  if (requiredRole && user) {
    // Extract the role from the user object
    const userRole = typeof user.role === 'object' && user.role ? user.role.name : 
                     typeof user.roleName === 'string' ? user.roleName : 
                     'unknown';
    
    console.log("Role check:", { requiredRole, userRole, roleId: user.roleId });
    
    // Get roleId and convert to a consistent format
    const roleId = user.roleId || 
                  (user.role && typeof user.role === 'object' ? user.role.id : null);
    
    // Map role names to IDs for consistency
    const roleIdMap: Record<string, number> = {
      'admin': 1002,
      'manager': 1000,
      'client': 1001
    };

    // Convert roleId to number if it's a string
    let numericRoleId = null;
    if (typeof roleId === 'string') {
      numericRoleId = parseInt(roleId);
    } else if (typeof roleId === 'number') {
      numericRoleId = roleId;
    }
    
    console.log("Numeric Role ID (in required role check):", numericRoleId);
    
    // Check path for security - this adds defense in depth
    const path = window.location.pathname;
    const isAdminPath = path.startsWith('/admin');
    const isManagerPath = path.startsWith('/manager');
    const isClientPath = path.startsWith('/client');
    
    // Security logic checks both role name and ID when possible
    const hasAdminAccess = 
      userRole?.toLowerCase() === 'admin' || 
      numericRoleId === roleIdMap.admin ||
      roleId === 'xG7hEVtYoYVT486Iw30z'; // Include the Firebase doc ID
    
    const hasManagerAccess = 
      userRole?.toLowerCase() === 'manager' || 
      numericRoleId === roleIdMap.manager ||
      roleId === 'YcKKrgriG70R2O9Qg4io'; // Include the Firebase doc ID
    
    const hasClientAccess = 
      userRole?.toLowerCase() === 'client' || 
      numericRoleId === roleIdMap.client ||
      roleId === 'tkIVVYpWobVjoawaozmp'; // Include the Firebase doc ID
    
    // Apply security policy based on path and role
    let accessDenied = false;
    
    if (isAdminPath && !hasAdminAccess) {
      accessDenied = true;
      console.warn("Access denied: Non-admin user attempted to access admin page");
    } else if (isManagerPath && !hasManagerAccess && !hasAdminAccess) {
      accessDenied = true;
      console.warn("Access denied: User attempted to access manager page without proper role");
    } else if (isClientPath && !hasClientAccess && !hasManagerAccess && !hasAdminAccess) {
      accessDenied = true;
      console.warn("Access denied: User attempted to access client page without proper role");
    }
    
    // If access is denied, redirect to appropriate dashboard
    if (accessDenied) {
      console.error("Unauthorized access attempt. Redirecting to appropriate dashboard.");
      
      // Redirect to the appropriate dashboard based on role
      if (hasAdminAccess) {
        setLocation('/admin/dashboard');
        return (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-500">Redirecting to Admin Dashboard...</p>
            </div>
          </div>
        );
      } else if (hasManagerAccess) {
        setLocation('/manager/dashboard');
        return (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-500">Redirecting to Manager Dashboard...</p>
            </div>
          </div>
        );
      } else if (hasClientAccess) {
        setLocation('/client/dashboard');
        return (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-500">Redirecting to Client Dashboard...</p>
            </div>
          </div>
        );
      } else {
        // If we can't determine the role, redirect to login
        setLocation('/login');
        return (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-500">Redirecting to Login...</p>
            </div>
          </div>
        );
      }
    }
  }
  
  // Render children if authenticated and authorized
  return <>{children}</>;
}