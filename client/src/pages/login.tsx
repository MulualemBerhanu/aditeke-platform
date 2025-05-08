import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  UserCog, 
  Building2, 
  UsersRound, 
  LogIn, 
  Mail, 
  Key, 
  Eye, 
  EyeOff, 
  Lock, 
  ShieldCheck, 
  Rocket,
  Award,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Form validation schema with stronger requirements
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string()
    .min(3, 'Password must be at least 3 characters')
    .refine(val => val.length > 0, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// User role type
type UserRole = {
  id: number;
  name: string;
  icon: React.ReactNode;
  description: string;
  emailPattern: string;
  username: string;  // Default username for this role
  password: string;  // Default password for this role
};

// Available user roles
const USER_ROLES: UserRole[] = [
  {
    id: 1002, // Match Firebase roleId
    name: 'Admin',
    icon: <UserCog className="h-10 w-10 mb-2" />,
    description: 'Full access to all features and settings',
    emailPattern: 'admin@aditeke.com',
    username: '', // No default username
    password: '', // No default password
  },
  {
    id: 1000, // Match Firebase roleId
    name: 'Manager',
    icon: <Building2 className="h-10 w-10 mb-2" />,
    description: 'Manage projects and team members',
    emailPattern: 'manager@aditeke.com',
    username: '', // No default username
    password: '', // No default password
  },
  {
    id: 1001, // Match Firebase roleId
    name: 'Client',
    icon: <UsersRound className="h-10 w-10 mb-2" />,
    description: 'View and track project progress',
    emailPattern: 'client@example.com',
    username: '', // No default username
    password: '', // No default password
  },
];

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, googleLogin, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [authMethod, setAuthMethod] = useState<'password' | 'google'>('password');
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Single unified useEffect for role selection from URL
  useEffect(() => {
    // First check URL path for role indicators (e.g., /login?role=manager or /login/manager)
    const pathname = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    
    // Check if URL path contains role information
    let roleFromPath = null;
    if (pathname.includes('/manager')) {
      roleFromPath = 'manager';
    } else if (pathname.includes('/client')) {
      roleFromPath = 'client';
    } else if (pathname.includes('/admin')) {
      roleFromPath = 'admin';
    }
    
    // Use path role first, then query param (role from path takes precedence)
    const roleToUse = roleFromPath || roleParam;
    
    // Log role detection for debugging
    console.log('Role detection - Path:', roleFromPath, 'Param:', roleParam, 'Using:', roleToUse || 'none');
    
    if (roleToUse) {
      // Try different ways to match the role
      const foundRole = USER_ROLES.find(role => 
        role.name.toLowerCase() === roleToUse.toLowerCase() || 
        `role=${role.id}` === roleToUse.toLowerCase() ||
        String(role.id) === roleToUse
      );
      
      if (foundRole) {
        console.log('Setting role to:', foundRole.name);
        setSelectedRole(foundRole);
        
        // Save to localStorage for persistence
        localStorage.setItem('selectedRole', JSON.stringify(foundRole));
      } else {
        // Default to Admin if role not found
        setDefaultRole();
      }
    } else {
      // No role specified in URL, set default
      setDefaultRole();
    }
  }, []);
  
  // Helper function to set default admin role
  const setDefaultRole = () => {
    const adminRole = USER_ROLES.find(role => role.name === 'Admin');
    if (adminRole) {
      console.log('No role in URL, defaulting to Admin');
      setSelectedRole(adminRole);
      localStorage.setItem('selectedRole', JSON.stringify(adminRole));
    }
  };

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    // Auto select admin role if no role is selected
    if (!selectedRole) {
      const adminRole = USER_ROLES.find(role => role.name === 'Admin');
      if (adminRole) {
        setSelectedRole(adminRole);
        localStorage.setItem('selectedRole', JSON.stringify(adminRole));
      } else {
        // Fallback if we somehow can't find the admin role (unlikely)
        toast({
          title: "Role selection required",
          description: "Please select a user role and try again",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      // Track if we're in a deployed environment
      const isDeployedEnv = 
        window.location.host.includes('.replit.app') || 
        window.location.host.includes('.replit.dev');
        
      // If in deployed environment, store explicit role information before login attempt
      if (isDeployedEnv && selectedRole) {
        // Double check if this is a manager username trying to log in as admin
        if (selectedRole.id === 1002 && data.username.toLowerCase().includes('manager')) {
          // Force correction to manager role for security
          const managerRole = USER_ROLES.find(role => role.id === 1000);
          if (managerRole) {
            localStorage.setItem('userRole', managerRole.name.toLowerCase());
            localStorage.setItem('userRoleId', managerRole.id.toString());
            setSelectedRole(managerRole);
          } else {
            localStorage.setItem('userRole', 'manager');
            localStorage.setItem('userRoleId', '1000');
          }
        } else {
          localStorage.setItem('userRole', selectedRole.name.toLowerCase());
          localStorage.setItem('userRoleId', selectedRole.id.toString());
        }
      }
      
      // Use direct fetch in all environments to ensure reliable authentication
      let userData;
      try {
        // Make sure we get a CSRF token for the secure login request
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
        
        // Normal authentication flow using API
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
          },
          body: JSON.stringify({
            username: data.username,
            password: data.password
          }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Authentication failed. Please check your credentials.');
        }
        
        userData = await response.json();
      } catch (error) {
        // Try the context login as fallback
        if (!isDeployedEnv) {
          try {
            userData = await login(data.username, data.password);
          } catch (contextError) {
            throw error; // Throw the original error
          }
        } else {
          throw error; // Rethrow to be handled by the outer catch block
        }
      }
      
      // Explicitly save user data to localStorage with exact keys AuthContext expects
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Store JWT tokens if they're in the response
      if (userData.accessToken) {
        localStorage.setItem('accessToken', userData.accessToken);
      }
      
      if (userData.refreshToken) {
        localStorage.setItem('refreshToken', userData.refreshToken);
      }
      
      // Also save numeric role ID explicitly for better cross-environment compatibility
      if (userData.roleId) {
        let roleIdNum = typeof userData.roleId === 'string' ? parseInt(userData.roleId) : userData.roleId;
        if (!isNaN(roleIdNum)) {
          localStorage.setItem('userNumericRoleId', roleIdNum.toString());
        }
      }
      
      // Use a simpler, more consistent approach: just use the dashboard path
      let redirectUrl = '/dashboard';
      
      // Convert roleId to a numeric value for consistency
      let numericRoleId = null;
      if (typeof userData.roleId === 'string') {
        const parsedId = parseInt(userData.roleId);
        if (!isNaN(parsedId)) {
          numericRoleId = parsedId;
        }
      } else if (typeof userData.roleId === 'number') {
        numericRoleId = userData.roleId;
      }
      
      // Direct dashboard redirect based on roleId
      if (numericRoleId === 1002) {
        redirectUrl = '/admin/dashboard';
      } else if (numericRoleId === 1000) {
        redirectUrl = '/manager/dashboard';
        // Force a refresh to help get around any state issues
        localStorage.setItem('forceRefresh', 'true');
      } else if (numericRoleId === 1001) {
        redirectUrl = '/client/dashboard';
      } else {
        // Fallback to username pattern if roleId is not recognized
        const username = userData.username.toLowerCase();
        if (username.includes('admin')) {
          redirectUrl = '/admin/dashboard';
        } else if (username.includes('manager')) {
          redirectUrl = '/manager/dashboard';
        } else if (username.includes('client')) {
          redirectUrl = '/client/dashboard';
        } else {
          // Final fallback to using the selected role from UI
          let roleGuess = selectedRole ? selectedRole.name.toLowerCase() : 'admin';
          
          // Map role names
          if (roleGuess === 'admin') {
            redirectUrl = '/admin/dashboard';
          } else if (roleGuess === 'manager') {
            redirectUrl = '/manager/dashboard';
          } else if (roleGuess === 'client') {
            redirectUrl = '/client/dashboard';
          }
        }
      }
      
      // If in a deployed environment, set additional flags to help with login tracking
      if (isDeployedEnv) {
        localStorage.setItem('loginTimestamp', Date.now().toString());
        localStorage.setItem('loginStatus', 'success');
        localStorage.setItem('targetRedirect', redirectUrl);
      }
      
      // Force a small delay to give time for localStorage to update
      setTimeout(() => {
        // Skip React routing entirely and use direct browser navigation with forced reload
        // This ensures we completely reload the page and avoid any React state issues
        if (redirectUrl.includes('/client/')) {
          console.log('Redirecting to client dashboard with special handling');
          
          // For client dashboard, use an extra flag to help with redirection
          sessionStorage.setItem('redirectAfterLoad', 'true');
          sessionStorage.setItem('redirectUrl', redirectUrl);
          
          // Add timestamp to URL to avoid caching issues during redirection
          window.location.href = redirectUrl + '?ts=' + Date.now();
        } else {
          // Standard redirect for other roles
          window.location.href = redirectUrl;
        }
      }, 1000); // Longer delay for more reliable redirection
      
    } catch (error) {
      // Remove any auth-related localStorage items to prevent confusion
      localStorage.removeItem('loginStatus');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('currentUser');
      
      // Standard error handling for all environments
      toast({
        title: "Authentication Failed",
        description: "Your login credentials are incorrect. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Handle Google login with wouter navigation
  const handleLoginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Use the real authentication system through Firebase
      // This will redirect to Google for authentication
      await googleLogin();
      
      // The user's authentication status will be determined by the server
      // upon their return from the Google OAuth flow
      
      toast({
        title: "Google Authentication",
        description: "Redirecting to Google for authentication...",
      });
      
    } catch (error) {
      toast({
        title: "Login failed",
        description: "There was a problem logging in with Google. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };


  
  // Function to handle role selection
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    localStorage.setItem('selectedRole', JSON.stringify(role));
    
    // Close the dialog
    setIsRoleDialogOpen(false);
  };

  // Get the current role (with admin as default)
  const currentRole = selectedRole || USER_ROLES[0];
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navy Hero Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-b from-primary to-blue-800 text-white">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.05),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-block mb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="h-px w-8 bg-blue-300/50"></div>
                <div className="mx-2 text-blue-300 text-lg">🔐</div>
                <div className="h-px w-8 bg-blue-300/50"></div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">Secure Login</h1>
            <p className="text-xl md:text-2xl text-blue-100/90 mb-6 max-w-2xl mx-auto">
              Sign in to access your dashboard and manage your projects
            </p>
          </motion.div>
        </div>
      </section>

      {/* White Login Form Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-full h-20 bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>
        
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-10 items-center">
              {/* Left Side: Login Form Card */}
              <motion.div 
                className="w-full lg:w-1/2"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                <Card className="w-full shadow-xl border border-primary/10 overflow-hidden">
                  {/* Card Header with Gradient */}
                  <div className="bg-gradient-to-r from-primary to-blue-600 p-6 text-white text-center">
                    <div className="mx-auto h-24 w-24 rounded-full bg-white/10 mb-4 flex items-center justify-center">
                      {currentRole.name === 'Admin' ? (
                        <UserCog className="h-12 w-12" />
                      ) : currentRole.name === 'Manager' ? (
                        <Building2 className="h-12 w-12" />
                      ) : (
                        <UsersRound className="h-12 w-12" />
                      )}
                    </div>
                    <CardTitle className="text-2xl mb-2">Welcome!</CardTitle>
                    <p className="text-blue-100">
                      Sign in as <span className="font-bold">{currentRole.name}</span>
                    </p>
                  </div>
                  
                  <CardContent className="space-y-6 pt-6">
                    {/* Role selection info */}
                    <div className="bg-primary/5 p-4 rounded-lg flex items-center border border-primary/10">
                      <div className="bg-gradient-to-br from-primary/20 to-blue-400/20 p-3 rounded-full text-primary mr-4">
                        {currentRole.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{currentRole.name}</h3>
                        <p className="text-sm text-gray-600">
                          {currentRole.description}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                        onClick={() => setIsRoleDialogOpen(true)}
                      >
                        Change Role
                      </Button>
                    </div>
                    
                    {/* Role selection dialog */}
                    {isRoleDialogOpen && (
                      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className="w-full max-w-md mx-4 border border-primary/10 shadow-2xl">
                            <div className="bg-gradient-to-r from-primary to-blue-600 p-5 text-white">
                              <CardTitle className="mb-1">Select User Role</CardTitle>
                              <CardDescription className="text-blue-100">
                                Choose a role to continue
                              </CardDescription>
                            </div>
                            <CardContent className="space-y-4 pt-6">
                              {USER_ROLES.map((role) => (
                                <motion.div 
                                  key={role.id}
                                  className="p-4 border border-primary/10 rounded-lg hover:bg-primary/5 cursor-pointer flex items-center transition-all"
                                  onClick={() => handleRoleSelect(role)}
                                  whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)' }}
                                >
                                  <div className="bg-gradient-to-br from-primary/10 to-blue-400/10 p-3 rounded-full text-primary mr-4">
                                    {role.icon}
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-gray-800">{role.name}</h3>
                                    <p className="text-sm text-gray-600">{role.description}</p>
                                  </div>
                                  <ChevronRight className="ml-auto h-5 w-5 text-primary/40" />
                                </motion.div>
                              ))}
                            </CardContent>
                            <CardFooter className="flex justify-end border-t border-gray-100 pt-4">
                              <Button 
                                variant="outline" 
                                onClick={() => setIsRoleDialogOpen(false)}
                                className="border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                              >
                                Cancel
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      </div>
                    )}
                    
                    {/* Authentication method toggle */}
                    <div className="flex rounded-md overflow-hidden border border-primary/20">
                      <Button
                        type="button"
                        variant={authMethod === 'password' ? 'default' : 'outline'}
                        className={`flex-1 rounded-none ${authMethod === 'password' ? 'bg-gradient-to-r from-primary to-blue-600 text-white' : 'hover:bg-primary/5'}`}
                        onClick={() => setAuthMethod('password')}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Password
                      </Button>
                      <Button
                        type="button"
                        variant={authMethod === 'google' ? 'default' : 'outline'}
                        className={`flex-1 rounded-none ${authMethod === 'google' ? 'bg-gradient-to-r from-primary to-blue-600 text-white' : 'hover:bg-primary/5'}`}
                        onClick={() => setAuthMethod('google')}
                      >
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 18 18">
                          <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"></path>
                          <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"></path>
                          <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"></path>
                          <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"></path>
                        </svg>
                        Google
                      </Button>
                    </div>
                    
                    {authMethod === 'password' ? (
                      /* Password Login Form */
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                              control={form.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700">Username</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input 
                                        placeholder="Enter your username" 
                                        className="border-gray-300 pl-9 focus:border-primary/50 focus:ring focus:ring-primary/20" 
                                        {...field} 
                                      />
                                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center justify-between">
                                    <FormLabel className="text-gray-700">Password</FormLabel>
                                    <a 
                                      href="/forgot-password" 
                                      className="text-xs text-primary hover:underline"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setLocation('/forgot-password');
                                      }}
                                    >
                                      Forgot password?
                                    </a>
                                  </div>
                                  <FormControl>
                                    <div className="relative">
                                      <Input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="Enter your password" 
                                        className="border-gray-300 pl-9 focus:border-primary/50 focus:ring focus:ring-primary/20"
                                        {...field} 
                                      />
                                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                      <button 
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                      >
                                        {showPassword ? (
                                          <EyeOff className="h-4 w-4" />
                                        ) : (
                                          <Eye className="h-4 w-4" />
                                        )}
                                      </button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button 
                                type="submit"
                                className="w-full h-11 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white mt-3" 
                                disabled={isLoading || authLoading}
                              >
                                {isLoading ? (
                                  <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Sign In Securely
                                  </div>
                                )}
                              </Button>
                            </motion.div>
                          </form>
                        </Form>
                      </motion.div>
                    ) : (
                      /* Google Login Button */
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button 
                          onClick={handleLoginWithGoogle}
                          className="w-full h-12 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm flex items-center justify-center gap-3"
                          disabled={isLoading || authLoading}
                        >
                          <svg width="20" height="20" viewBox="0 0 18 18">
                            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"></path>
                            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"></path>
                            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"></path>
                            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"></path>
                          </svg>
                          {isLoading ? 'Signing in...' : 'Continue with Google'}
                        </Button>
                      </motion.div>
                    )}
                    
                    <Separator className="my-6" />
                    
                    <p className="text-sm text-gray-500 text-center">
                      By signing in, you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Right Side: Features */}
              <motion.div 
                className="w-full lg:w-1/2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <div className="bg-gradient-to-br from-primary/5 to-blue-400/5 border border-primary/10 rounded-2xl p-8 md:p-10">
                  <div>
                    <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700">
                      Welcome to AdiTeke
                    </h2>
                    <p className="text-gray-600 mb-8 text-lg">
                      Access your personalized dashboard to manage your software development projects and collaborate with our team.
                    </p>
                    
                    <div className="space-y-5">
                      {[
                        {
                          title: "Secure Access",
                          description: "End-to-end encrypted communication and strict access controls",
                          icon: <ShieldCheck className="h-6 w-6 text-white" />,
                          color: "from-green-500 to-emerald-600"
                        },
                        {
                          title: "Project Management",
                          description: "Track your project progress, timeline and resource allocation",
                          icon: <Building2 className="h-6 w-6 text-white" />,
                          color: "from-blue-500 to-indigo-600"
                        },
                        {
                          title: "Real-time Updates",
                          description: "Get instant notifications about project milestones and activities",
                          icon: <Rocket className="h-6 w-6 text-white" />,
                          color: "from-purple-500 to-indigo-600"
                        },
                        {
                          title: "Premium Support",
                          description: "Access to dedicated support team and personalized assistance",
                          icon: <Award className="h-6 w-6 text-white" />,
                          color: "from-amber-500 to-orange-600"
                        }
                      ].map((feature, index) => (
                        <motion.div 
                          key={index}
                          className="flex gap-4 items-start"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                        >
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                            {feature.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Navy CTA Section */}
      <section className="py-16 bg-gradient-to-b from-blue-950 to-blue-900 text-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_70%,rgba(255,255,255,0.03),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.03),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="flex flex-col md:flex-row items-center max-w-5xl mx-auto gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold mb-4">Don't have an account yet?</h2>
              <p className="text-blue-100/80 text-lg">
                Contact us to set up your client portal and start managing your software development projects with AdiTeke.
              </p>
            </div>
            <div className="md:w-1/3 flex justify-center md:justify-end">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  className="bg-white text-primary hover:bg-white/90 py-6 px-8 text-lg font-medium shadow-lg"
                  onClick={() => window.location.href = '/contact'}
                >
                  Contact Us Now
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}