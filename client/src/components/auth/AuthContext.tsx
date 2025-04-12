import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { auth, loginWithGoogle, logoutUser } from '@/lib/firebase';
import { Auth } from 'firebase/auth';

// Define the shape of the user object
interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  roleId: number;
  profilePicture: string | null;
  createdAt: string;
  updatedAt: string | null;
  lastLogin: string | null;
  isActive: boolean;
}

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query current user
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User | null, Error>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/user');
        return await response.json();
      } catch (error: any) {
        if (error.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: null, // Explicitly set initial data as null
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/login', { username, password });
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data);
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${data.name || data.username}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid username or password',
        variant: 'destructive',
      });
      throw error;
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
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
    onError: (error: any) => {
      toast({
        title: 'Registration Failed',
        description: error.message || 'Unable to create account',
        variant: 'destructive',
      });
      throw error;
    },
  });

  // Google login mutation
  const googleLoginMutation = useMutation({
    mutationFn: async (idToken: string) => {
      const response = await apiRequest('POST', '/api/firebase/login', { idToken });
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data);
      toast({
        title: 'Login Successful',
        description: `Welcome, ${data.name || data.email}!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Google Login Failed',
        description: error.message || 'Unable to sign in with Google',
        variant: 'destructive',
      });
      throw error;
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Logout from Firebase
      if (auth) {
        await logoutUser();
      }
      
      // Logout from the server
      await apiRequest('POST', '/api/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null);
      toast({
        title: 'Logout Successful',
        description: 'You have been logged out',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Logout Failed',
        description: error.message || 'Unable to log out',
        variant: 'destructive',
      });
    },
  });

  // Login function
  const login = async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  };

  // Register function
  const register = async (userData: any) => {
    await registerMutation.mutateAsync(userData);
  };

  // Google login function
  const googleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      toast({
        title: 'Google Login Failed',
        description: 'Unable to initiate Google login',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Provide the auth context
  return (
    <AuthContext.Provider
      value={{
        user: user || null, // Ensure user is always User | null, never undefined
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
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};