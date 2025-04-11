import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { loginWithGoogle, getAuthResult, auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

// Register form schema
const registerSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is already logged in
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/user');
        return await res.json();
      } catch (error) {
        return null;
      }
    },
    retry: false
  });

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    }
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
    }
  });

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (currentUser && !userLoading) {
      setLocation('/dashboard');
    }
  }, [currentUser, userLoading, setLocation]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await apiRequest('POST', '/api/login', data);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.name || data.username}!`,
      });
      
      // Redirect to dashboard after successful login
      setTimeout(() => setLocation('/dashboard'), 500);
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = data;
      const response = await apiRequest('POST', '/api/register', userData);
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data);
      
      toast({
        title: "Registration Successful",
        description: `Welcome to AdiTeke, ${data.name || data.username}!`,
      });
      
      // Redirect to dashboard after successful registration
      setTimeout(() => setLocation('/dashboard'), 500);
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Firebase login handler (convert token to session)
  const firebaseLoginMutation = useMutation({
    mutationFn: async (idToken: string) => {
      const response = await apiRequest('POST', '/api/firebase/login', { idToken });
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data);
      
      toast({
        title: "Login Successful",
        description: `Welcome, ${data.name || data.email}!`,
      });
      
      // Redirect to dashboard after successful login
      setTimeout(() => setLocation('/dashboard'), 500);
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Unable to verify your Firebase credentials",
        variant: "destructive",
      });
    }
  });

  // Check for redirect result on page load
  useEffect(() => {
    const checkAuthResult = async () => {
      try {
        const user = await getAuthResult();
        if (user) {
          // Get the Firebase ID token
          const idToken = await user.getIdToken();
          
          // Convert Firebase token to session
          firebaseLoginMutation.mutate(idToken);
        }
      } catch (error) {
        console.error("Error getting auth result:", error);
        toast({
          title: "Authentication Error",
          description: "There was a problem with Google authentication. Please try again.",
          variant: "destructive",
        });
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuthResult();
  }, [toast, setLocation]);

  // Google login handler
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // Redirect will happen automatically, we'll handle the result in useEffect
    } catch (error) {
      toast({
        title: "Google Login Failed",
        description: "Unable to sign in with Google. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  // Loading state while checking authentication
  if (userLoading || checkingAuth) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-light">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-500">Checking authentication status...</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>Login | AdiTeke Software Solutions</title>
        <meta name="description" content="Log in to your AdiTeke account to access your dashboard, project updates, and more." />
      </Helmet>

      <section className="py-20 min-h-screen flex items-center bg-light">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="text-2xl font-bold font-accent">
                      <span className="text-primary">Adi</span>
                      <span className="text-blue-600">Teke</span>
                    </div>
                  </div>
                  <CardTitle className="text-center text-2xl">Welcome</CardTitle>
                  <CardDescription className="text-center">
                    {activeTab === 'login' ? 
                      'Log in to access your dashboard' : 
                      'Create an account to get started'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs 
                    defaultValue="login" 
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                    
                    {/* Login Form */}
                    <TabsContent value="login">
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="johndoe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="text-right">
                            <a href="#reset-password" className="text-sm text-primary hover:underline">
                              Forgot password?
                            </a>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? 'Logging in...' : 'Login'}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                    
                    {/* Register Form */}
                    <TabsContent value="register">
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="johndoe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">Or continue with</span>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleGoogleLogin}
                        disabled={firebaseLoginMutation.isPending}
                      >
                        {firebaseLoginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            Authenticating with Google...
                          </>
                        ) : (
                          <>
                            <svg 
                              className="mr-2 h-4 w-4" 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 48 48"
                            >
                              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                            </svg>
                            Continue with Google
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-gray-500">
                    By signing in, you agree to our{' '}
                    <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                  </p>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LoginPage;
