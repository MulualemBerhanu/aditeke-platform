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
        const response = await apiRequest('GET', '/api/user');
        const userData = await response.json();
        
        if (userData) {
          localStorage.setItem('currentUser', JSON.stringify(userData));
          return userData;
        }
        
        // Try to get user from localStorage if API returns nothing
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          return JSON.parse(storedUser) as User;
        }
        
        return null;
      } catch (error: any) {
        // Try localStorage as fallback
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          return JSON.parse(storedUser) as User;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: null,
  });

  // Enhanced login mutation for cross-domain authentication
  const loginMutation = useMutation<User, Error, { username: string; password: string }>({
    mutationFn: async ({ username, password }) => {
      try {
        // Try to login with the API first
        const response = await apiRequest('POST', '/api/login', { username, password });
        const userData = await response.json();
        
        // Store user data in localStorage as a fallback
        if (userData) {
          localStorage.setItem('currentUser', JSON.stringify(userData));
          localStorage.setItem('isAuthenticated', 'true');
          
          // For cross-domain deployments, we need an additional fallback mechanism
          // Store JWT tokens in localStorage if they're included in the response
          if (userData.accessToken) {
            localStorage.setItem('accessToken', userData.accessToken);
          }
          
          if (userData.refreshToken) {
            localStorage.setItem('refreshToken', userData.refreshToken);
          }
        }
        
        return userData;
      } catch (error: any) {
        console.error('Login API error:', error);
        
        // For demonstration/testing ONLY in development:
        // If we're in development and this is a CORS error, try to find the user by username
        // This allows testing the UI even if the backend auth is having issues
        if (process.env.NODE_ENV === 'development' && 
            (error.message.includes('Failed to fetch') || error.message.includes('CORS'))) {
          console.warn('⚠️ Using localStorage authentication as fallback');
          
          // This is just for development convenience - in production, authenticate properly
          // Look for matching user in localStorage (fallback for development only)
          const storedUsers = [
            { username: 'admin', roleId: 1002 },
            { username: 'manager', roleId: 1000 },
            { username: 'client', roleId: 1001 }
          ];
          
          const matchedUser = storedUsers.find(user => user.username === username);
          if (matchedUser && username === password) {
            // Create minimal user data for development fallback
            const fallbackUser = {
              id: 123,
              username,
              email: `${username}@example.com`,
              name: username.charAt(0).toUpperCase() + username.slice(1),
              roleId: matchedUser.roleId,
              profilePicture: null,
              createdAt: new Date().toISOString(),
              updatedAt: null,
              lastLogin: new Date().toISOString(),
              isActive: true
            };
            
            localStorage.setItem('currentUser', JSON.stringify(fallbackUser));
            localStorage.setItem('isAuthenticated', 'true');
            
            return fallbackUser;
          }
        }
        
        // If we get here, authentication truly failed
        throw error;
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
      const response = await apiRequest('POST', '/api/register', userData);
      return await response.json();
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