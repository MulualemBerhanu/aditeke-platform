import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { auth, loginWithGoogle, logoutUser } from '@/lib/firebase';

// Define the User interface
export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  roleId: string | number; // Can be either string (Firebase doc ID) or number (legacy numeric ID)
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string | null;
  lastLogin: string | null;
  isActive: boolean;
}

// Auth context type definition
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<User>;
  register: (userData: any) => Promise<User>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
};

// Create context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Props for the AuthProvider component
type AuthProviderProps = {
  children: ReactNode;
};

// AuthProvider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to get the current user
  const { 
    data: user, 
    isLoading, 
    error 
  } = useQuery<User | null, Error>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        // Always try the API first for current authentication state
        const response = await apiRequest('GET', '/api/user');
        
        // If response is not 2xx, it will throw and go to catch block
        const userData = await response.json();
        
        if (userData) {
          // Only store user data after successful API response
          localStorage.setItem('currentUser', JSON.stringify(userData));
          return userData;
        }
        
        // If API returns empty data but success status, user is not authenticated
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return null;
      } catch (error: any) {
        if (error.status === 401) {
          // Properly handle unauthorized - clear all auth data
          localStorage.removeItem('currentUser');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          return null;
        }
        
        // For other errors (like network issues), throw the error
        // but don't fall back to potentially outdated localStorage data
        throw error;
      }
    },
    retry: false,
    refetchOnWindowFocus: false, // Disable refetch on window focus to reduce API calls 
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: false, // Disable auto refetching
    initialData: null,
  });

  // Enhanced login mutation for cross-domain authentication
  const loginMutation = useMutation<User, Error, { username: string; password: string }>({
    mutationFn: async ({ username, password }) => {
      // Validate credentials before sending to server
      if (!username || username.trim() === '') {
        throw new Error('Username is required');
      }
      
      if (!password || password.trim() === '') {
        throw new Error('Password is required');
      }
      
      // Strong password requirements in development, but don't block login in production
      // to avoid breaking existing accounts
      if (password.length < 8 && process.env.NODE_ENV === 'development') {
        console.warn('Password should be at least 8 characters (not enforced for existing accounts)');
      }
      
      try {
        // Log before making the request to help debug
        console.log(`Sending login request for: ${username.substring(0, 3)}...`);
        
        // Ensure we're sending the correct content type
        const loginData = { username, password };
        
        // Show client-side info to debug
        console.log(`Login request for ${username} with password length: ${password.length}`);
        
        // Add a slight delay to ensure database connection is ready
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Direct fetch with explicit content type to debug the issue
        console.log('Making fetch request to /api/login with credentials...');
        
        // Determine whether we're in a deployed or custom domain environment
        const isDeployedEnv = 
          typeof window !== 'undefined' && (
            window.location.host.includes('.replit.app') || 
            window.location.host.includes('.replit.dev') ||
            window.location.host.includes('aditeke.com')
          );
          
        console.log(`Login in ${isDeployedEnv ? 'deployed' : 'local'} environment...`);
        
        // We no longer need emergency credential bypasses since we have a working
        // database authentication system
        console.log('Using standard authentication flow for all environments');
        
        // Regular API login for all other cases
        // Make sure we get a CSRF token for secure requests
        try {
          // Fetch a CSRF token first
          await fetch('/api/public/csrf-test');
        } catch (err) {
          console.warn('Failed to prefetch CSRF token, but continuing with login attempt:', err);
        }

        // Get the CSRF token from cookies if available
        let csrfToken = null;
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'csrf_token') {
            csrfToken = decodeURIComponent(value);
            break;
          }
        }

        console.log('CSRF token for login request:', csrfToken ? 'Found' : 'Not found');

        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
          },
          body: JSON.stringify(loginData),
          credentials: 'include',
        });
        
        console.log('Login response status:', response.status);
        
        // Check for successful response
        if (!response.ok) {
          // Handle specific error cases from the server
          const errorText = await response.text();
          console.error('Error response content:', errorText);
          let errorMessage = 'Authentication failed';
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
            console.error('Parsed error message:', errorMessage);
          } catch (e) {
            console.error('Failed to parse error JSON:', e);
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }
        
        const userData = await response.json();
        
        // Validate user data returned from server
        if (!userData || !userData.id) {
          throw new Error('Invalid response from authentication server');
        }
        
        // Store authenticated user data and tokens
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        
        // Store JWT tokens for API authorization
        if (userData.accessToken) {
          localStorage.setItem('accessToken', userData.accessToken);
        }
        
        if (userData.refreshToken) {
          localStorage.setItem('refreshToken', userData.refreshToken);
        }
        
        // Extract and store role information
        let roleName = 'unknown';
        let roleId: string | number | null = null;
        
        // Get role from userData
        if (userData.roleName && typeof userData.roleName === 'string') {
          roleName = userData.roleName.toLowerCase();
        } else if (userData.role && typeof userData.role === 'object' && userData.role.name) {
          roleName = userData.role.name.toLowerCase();
        } 
        
        // Fallback to username pattern if role is not determined
        if (roleName === 'unknown') {
          if (username.toLowerCase().includes('admin')) {
            roleName = 'admin';
            console.log("Using username pattern to determine role: admin");
          } else if (username.toLowerCase().includes('manager')) {
            roleName = 'manager';
            console.log("Using username pattern to determine role: manager");
          } else if (username.toLowerCase().includes('client')) {
            roleName = 'client';
            console.log("Using username pattern to determine role: client");
          }
        }
        
        // Get role ID
        if (userData.roleId) {
          roleId = userData.roleId;
        } else if (userData.role && typeof userData.role === 'object' && userData.role.id) {
          roleId = userData.role.id;
        }
        
        // Map role names to IDs as fallback
        if (roleId === null) {
          if (roleName === 'admin') {
            roleId = 1002;
            console.log("Using role name to determine roleId: 1002 (admin)");
          } else if (roleName === 'manager') {
            roleId = 1000;
            console.log("Using role name to determine roleId: 1000 (manager)");
          } else if (roleName === 'client') {
            roleId = 1001;
            console.log("Using role name to determine roleId: 1001 (client)");
          }
        }
        
        // Convert roleId to a number if it's a string
        let numericRoleId = null;
        if (typeof roleId === 'string') {
          const parsedId = parseInt(roleId);
          if (!isNaN(parsedId)) {
            numericRoleId = parsedId;
            console.log("Converted string roleId to number:", numericRoleId);
          }
        } else if (typeof roleId === 'number') {
          numericRoleId = roleId;
        }
        
        // Store role information in localStorage with enhanced debugging
        console.log("🔐 Storing role information:", { 
          roleName, 
          roleId,
          numericRoleId,
          username
        });
        
        localStorage.setItem('userRole', roleName);
        
        if (roleId !== null) {
          localStorage.setItem('userRoleId', String(roleId));
        }
        
        if (numericRoleId !== null) {
          localStorage.setItem('userNumericRoleId', String(numericRoleId));
        }
        
        return userData;
      } catch (error: any) {
        console.error('Login API error:', error);
        
        // Clean error message for security (avoid exposing internal details)
        const errorMessage = error.message && !error.message.includes('fetch')
          ? error.message
          : 'Authentication failed. Please check your credentials and try again.';
          
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data);
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${data.name || data.username}!`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid username or password',
        variant: 'destructive',
      });
      throw error;
    },
  });

  // Register mutation
  const registerMutation = useMutation<User, Error, any>({
    mutationFn: async (userData) => {
      // Validate user data before submitting to server
      if (!userData.username || userData.username.trim() === '') {
        throw new Error('Username is required');
      }
      
      if (!userData.password || userData.password.trim() === '') {
        throw new Error('Password is required');
      }
      
      if (!userData.email || userData.email.trim() === '') {
        throw new Error('Email is required');
      }
      
      // Strong password validation
      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      try {
        const response = await apiRequest('POST', '/api/register', userData);
        
        // Check for successful response
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        }
        
        const data = await response.json();
        
        // Validate response data
        if (!data || !data.id) {
          throw new Error('Invalid response from server');
        }
        
        return data;
      } catch (error: any) {
        console.error('Registration error:', error);
        
        // Provide user-friendly error message
        const errorMessage = error.message && !error.message.includes('fetch')
          ? error.message
          : 'Registration failed. Please try again later.';
          
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data);
      toast({
        title: 'Registration Successful',
        description: `Welcome, ${data.name || data.username}!`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Unable to create account',
        variant: 'destructive',
      });
      throw error;
    },
  });

  // Logout mutation
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      try {
        if (auth) {
          await logoutUser();
        }
      } catch (error) {
        console.error("Firebase logout error:", error);
        // Continue with local logout even if Firebase logout fails
      }
      
      // Clear all auth-related localStorage items
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('selectedRole');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userRoleId');
      localStorage.removeItem('userNumericRoleId');
      localStorage.removeItem('forceRefresh');
      localStorage.removeItem('loginTimestamp');
      localStorage.removeItem('loginStatus');
      localStorage.removeItem('targetRedirect');
      localStorage.removeItem('authToken');
      
      // Try API logout, but don't stop if it fails
      try {
        await apiRequest('POST', '/api/logout');
      } catch (error) {
        console.error("API logout error:", error);
        // Continue with local logout even if API logout fails
      }
    },
    onSuccess: () => {
      // Clear React Query cache
      queryClient.setQueryData(['/api/user'], null);
      
      toast({
        title: 'Logout Successful',
        description: 'You have been logged out',
      });
      
      // Redirect to home page after successful logout
      window.location.href = '/';
    },
    onError: (error) => {
      console.error("Logout mutation error:", error);
      
      // Still clear localStorage and redirect even on error
      localStorage.removeItem('currentUser');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('selectedRole');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userRoleId');
      localStorage.removeItem('userNumericRoleId');
      localStorage.removeItem('forceRefresh');
      localStorage.removeItem('loginTimestamp');
      localStorage.removeItem('loginStatus');
      localStorage.removeItem('targetRedirect');
      localStorage.removeItem('authToken');
      
      toast({
        title: 'Logout Partially Successful',
        description: 'You have been logged out locally, but there was a server communication issue.',
        variant: 'destructive',
      });
      
      // Redirect to home page even if there's an error
      window.location.href = '/';
    },
  });

  // Login function - returns user data for redirection
  const login = async (username: string, password: string): Promise<User> => {
    return await loginMutation.mutateAsync({ username, password });
  };

  // Register function - returns user data for redirection
  const register = async (userData: any): Promise<User> => {
    return await registerMutation.mutateAsync(userData);
  };

  // Google login function
  const googleLogin = async (): Promise<void> => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      toast({
        title: 'Google Login Failed',
        description: 'Unable to initiate Google login',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  };

  // Return the context provider
  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        login,
        register,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};