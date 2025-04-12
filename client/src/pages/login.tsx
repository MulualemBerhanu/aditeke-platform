import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { UsersRound, Building2, UserCog, User, ArrowLeft } from 'lucide-react';

import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

// User role type
type UserRole = {
  id: number;
  name: string;
  icon: React.ReactNode;
  description: string;
  credentials: {
    username: string;
    password: string;
  };
};

// Available user roles
const USER_ROLES: UserRole[] = [
  {
    id: 1,
    name: 'Admin',
    icon: <UserCog className="h-10 w-10 mb-2" />,
    description: 'Full access to all features and settings',
    credentials: {
      username: 'admin',
      password: 'password123',
    },
  },
  {
    id: 2,
    name: 'Manager',
    icon: <Building2 className="h-10 w-10 mb-2" />,
    description: 'Manage projects and team members',
    credentials: {
      username: 'manager',
      password: 'password123',
    },
  },
  {
    id: 3,
    name: 'Client',
    icon: <UsersRound className="h-10 w-10 mb-2" />,
    description: 'View and track project progress',
    credentials: {
      username: 'client',
      password: 'password123',
    },
  },
];

// Define the form schema with zod
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  roleId: z.number().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoginView, setIsLoginView] = useState<boolean>(true);
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleId: 3, // Default to client role
    },
  });

  // Set role from URL parameter if available
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    
    if (roleParam) {
      const foundRole = USER_ROLES.find(role => 
        role.name.toLowerCase() === roleParam.toLowerCase()
      );
      
      if (foundRole) {
        setSelectedRole(foundRole);
        // Auto-fill credentials for demo convenience
        loginForm.setValue('username', foundRole.credentials.username);
        loginForm.setValue('password', foundRole.credentials.password);
        registerForm.setValue('roleId', foundRole.id);
      }
    }
  }, []);

  // Handle login form submission
  const onLoginSubmit = async (data: LoginFormValues) => {
    if (!selectedRole) {
      toast({
        title: "Role selection required",
        description: "Please select a user role from the navbar dropdown",
        variant: "destructive",
      });
      window.location.href = "/";
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/login', data);
      const user = await response.json();
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
      
      console.log('User authenticated:', user);
      
      // Store user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Redirect to appropriate dashboard based on role
      const dashboardUrl = selectedRole.name.toLowerCase() === 'admin' 
        ? '/admin/dashboard'
        : selectedRole.name.toLowerCase() === 'manager'
          ? '/manager/dashboard'
          : '/client/dashboard';
          
      // Redirect immediately
      window.location.href = dashboardUrl;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle register form submission
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    if (!selectedRole) {
      toast({
        title: "Role selection required",
        description: "Please select a user role from the navbar dropdown",
        variant: "destructive",
      });
      window.location.href = "/";
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      registerData.roleId = selectedRole.id;
      
      const response = await apiRequest('POST', '/api/register', registerData);
      const user = await response.json();
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
      
      // Store user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Redirect to appropriate dashboard based on role
      const dashboardUrl = selectedRole.name.toLowerCase() === 'admin' 
        ? '/admin/dashboard'
        : selectedRole.name.toLowerCase() === 'manager'
          ? '/manager/dashboard'
          : '/client/dashboard';
          
      // Redirect immediately
      window.location.href = dashboardUrl;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If no role is selected, show message and redirect back
  if (!selectedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">AdiTeke</CardTitle>
            <CardDescription>Role Selection Required</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="my-6 flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-amber-100 mb-4 flex items-center justify-center">
                <ArrowLeft className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-medium mb-2">Please select a role first</h3>
              <p className="text-muted-foreground mb-6">
                You need to select a user role from the navbar dropdown menu before accessing this page.
              </p>
              <Button 
                onClick={() => window.location.href = "/"}
                className="w-full"
              >
                Go Back Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side: Auth form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">AdiTeke</CardTitle>
            <CardDescription>
              {isLoginView ? 'Sign in to your account' : 'Create a new account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role indicator */}
            <div className="bg-muted/50 p-3 rounded-lg mb-6 flex items-center">
              <div className="text-primary mr-3">{selectedRole.icon}</div>
              <div>
                <h3 className="font-medium">{selectedRole.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {isLoginView ? `Logging in as ${selectedRole.name.toLowerCase()}` : `Registering as ${selectedRole.name.toLowerCase()}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => window.location.href = "/"}
              >
                Change
              </Button>
            </div>

            {isLoginView ? (
              // Login Form
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      {...loginForm.register('username')}
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-sm text-red-500">
                        {loginForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button 
                        variant="link" 
                        className="px-0 text-sm"
                        type="button"
                        onClick={() => toast({
                          title: "Password Reset",
                          description: "This feature is not available in the demo version."
                        })}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <Input 
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      {...loginForm.register('password')}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
              </form>
            ) : (
              // Register Form
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input 
                      id="register-name"
                      type="text"
                      placeholder="Enter your name"
                      {...registerForm.register('name')}
                    />
                    {registerForm.formState.errors.name && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input 
                      id="register-username"
                      type="text"
                      placeholder="Choose a username"
                      {...registerForm.register('username')}
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input 
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      {...registerForm.register('email')}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input 
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      {...registerForm.register('password')}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <Input 
                      id="register-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      {...registerForm.register('confirmPassword')}
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            )}

            {/* Toggle between login and register */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLoginView ? "Don't have an account?" : "Already have an account?"}
                <Button 
                  variant="link" 
                  className="ml-1 p-0"
                  onClick={() => setIsLoginView(!isLoginView)}
                >
                  {isLoginView ? "Sign up" : "Sign in"}
                </Button>
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-between">
            <div className="w-full my-2">
              <Separator />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Right side: Hero banner */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-500 to-indigo-700 text-white">
        <div className="flex flex-col justify-center px-12 max-w-xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">AdiTeke Software Solutions</h1>
          <p className="text-lg mb-6">
            Advanced Software Development Company providing cutting-edge technology solutions for businesses of all sizes.
          </p>
          <ul className="space-y-3">
            <li className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Professional Web & Mobile Applications</span>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>AI-powered Business Solutions</span>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Custom Software Development</span>
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>24/7 Technical Support</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}