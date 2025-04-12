import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { UsersRound, Building2, UserCog, User } from 'lucide-react';

import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("role-select");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: selectedRole?.credentials.username || '',
      password: selectedRole?.credentials.password || '',
    },
  });

  // Update form values when selected role changes
  useEffect(() => {
    if (selectedRole) {
      loginForm.setValue('username', selectedRole.credentials.username);
      loginForm.setValue('password', selectedRole.credentials.password);
    }
  }, [selectedRole, loginForm]);

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleId: selectedRole?.id || 3, // Default to client role
    },
  });

  // Handle role selection
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setActiveTab('login');
  };

  // Handle login form submission
  const onLoginSubmit = async (data: LoginFormValues) => {
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
      
      // Show success message with manual redirect option
      toast({
        title: "Login successful!",
        description: "You will be redirected to your dashboard shortly.",
      });
      
      // Auto-navigate to dashboard tab on success
      setActiveTab("dashboard");
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
    setIsLoading(true);
    try {
      // Remove the confirmPassword field as it's not needed in the API request
      const { confirmPassword, ...registerData } = data;
      
      // Add the role ID
      registerData.roleId = selectedRole?.id || 3; // Default to client if not selected
      
      const response = await apiRequest('POST', '/api/register', registerData);
      const user = await response.json();
      
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });

      console.log('User registered:', user);
      
      // Store user in localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Show success message with manual redirect option
      toast({
        title: "Registration successful!",
        description: "You can now access your dashboard.",
      });
      
      // Auto-navigate to dashboard tab on success
      setActiveTab("dashboard");
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      
      {/* Left side: Auth form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">AdiTeke</CardTitle>
            <CardDescription>
              Welcome
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="role-select" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="role-select">Select Role</TabsTrigger>
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              </TabsList>
              
              <TabsContent value="role-select">
                <div className="space-y-4">
                  <p className="text-sm text-center mb-4">
                    Select your user role to continue:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {USER_ROLES.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleSelect(role)}
                        className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-muted hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <div className="text-primary">{role.icon}</div>
                        <h3 className="font-medium">{role.name}</h3>
                        <p className="text-xs text-center text-muted-foreground mt-1">
                          {role.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="login">
                {!selectedRole ? (
                  <div className="text-center p-4">
                    <p className="mb-4">Please select a user role first</p>
                    <Button onClick={() => setActiveTab("role-select")}>
                      Select Role
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="bg-muted/50 p-3 rounded-lg mb-4 flex items-center">
                      <div className="text-primary mr-3">{selectedRole.icon}</div>
                      <div>
                        <h3 className="font-medium">{selectedRole.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          Logging in as {selectedRole.name.toLowerCase()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={() => setActiveTab("role-select")}
                      >
                        Change
                      </Button>
                    </div>
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
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="dashboard">
                {/* Dashboard content after successful login */}
                <div className="space-y-6">
                  <div className="bg-primary/10 rounded-lg p-6 text-center">
                    <div className="mb-4">
                      <div className="h-20 w-20 rounded-full bg-primary text-white mx-auto flex items-center justify-center text-3xl">
                        <User className="h-10 w-10" />
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-bold mb-1">Welcome!</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      You're now logged in. Choose your destination below.
                    </p>
                    
                    <div className="grid gap-4">
                      <Button 
                        onClick={() => {
                          // Simple direct navigation - no complex logic
                          window.location.href = "/admin/project-management";
                        }}
                        className="w-full bg-primary text-white p-6 rounded-md hover:bg-primary/90 transition-colors text-center font-medium"
                      >
                        Go to Admin Dashboard
                      </Button>
                      
                      <Button 
                        onClick={() => {
                          // Simple direct navigation - no complex logic
                          window.location.href = "/manager/dashboard";
                        }}
                        variant="outline"
                        className="w-full border border-primary text-primary p-6 rounded-md hover:bg-primary/10 transition-colors text-center font-medium"
                      >
                        Go to Manager Dashboard
                      </Button>
                      
                      <Button 
                        onClick={() => {
                          // Simple direct navigation - no complex logic
                          window.location.href = "/client/dashboard";
                        }}
                        variant="outline"
                        className="w-full border border-primary text-primary p-6 rounded-md hover:bg-primary/10 transition-colors text-center font-medium"
                      >
                        Go to Client Dashboard
                      </Button>
                      
                      <Button
                        variant="link"
                        onClick={() => window.location.href = '/'}
                        className="text-sm text-muted-foreground hover:underline text-center mt-2"
                      >
                        Go to Home Page
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="register">
                {!selectedRole ? (
                  <div className="text-center p-4">
                    <p className="mb-4">Please select a user role first</p>
                    <Button onClick={() => setActiveTab("role-select")}>
                      Select Role
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="bg-muted/50 p-3 rounded-lg mb-4 flex items-center">
                      <div className="text-primary mr-3">{selectedRole.icon}</div>
                      <div>
                        <h3 className="font-medium">{selectedRole.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          Registering as {selectedRole.name.toLowerCase()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={() => setActiveTab("role-select")}
                      >
                        Change
                      </Button>
                    </div>
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
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-between">
            <div className="w-full my-4">
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