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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
        
        // Direct fetch with explicit content type to debug the issue
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
          credentials: 'include',
        });
        
        // Check for successful response
        if (!response.ok) {
          // Handle specific error cases from the server
          const errorText = await response.text();
          let errorMessage = 'Authentication failed';
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
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