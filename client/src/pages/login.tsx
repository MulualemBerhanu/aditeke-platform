import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { UserCog, Building2, UsersRound, LogIn, Mail, Key } from 'lucide-react';
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

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Set role from URL parameter if available
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    
    if (roleParam) {
      console.log("⚠️ URL param detected:", roleParam);
      
      // Try different ways to match the role
      const foundRole = USER_ROLES.find(role => 
        role.name.toLowerCase() === roleParam.toLowerCase() || 
        `role=${role.id}` === roleParam.toLowerCase() ||
        String(role.id) === roleParam
      );
      
      if (foundRole) {
        console.log("⚠️ Found matching role:", foundRole.name);
        setSelectedRole(foundRole);
        
        // Save to localStorage for persistence
        localStorage.setItem('selectedRole', JSON.stringify(foundRole));
      } else {
        console.log("⚠️ No matching role found for:", roleParam);
      }
    }
  }, [form]);

  // Handle form submission with wouter navigation
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
        
      console.log(`🔄 Attempting login in ${isDeployedEnv ? 'deployed' : 'local'} environment...`);
      
      // If in deployed environment, store explicit role information before login attempt
      if (isDeployedEnv && selectedRole) {
        // Double check if this is a manager username trying to log in as admin
        if (selectedRole.id === 1002 && data.username.toLowerCase().includes('manager')) {
          console.warn("⚠️ Security check: Manager username with Admin role selected!");
          // Force correction to manager role
          const managerRole = USER_ROLES.find(role => role.id === 1000);
          if (managerRole) {
            console.log("🔒 Security override: Switching from Admin to Manager role");
            localStorage.setItem('userRole', managerRole.name.toLowerCase());
            localStorage.setItem('userRoleId', managerRole.id.toString());
            setSelectedRole(managerRole);
            console.log(`Security-corrected role information: ${managerRole.name} (${managerRole.id})`);
          } else {
            localStorage.setItem('userRole', 'manager');
            localStorage.setItem('userRoleId', '1000');
            console.log(`Security-enforced role information: Manager (1000)`);
          }
        } else {
          localStorage.setItem('userRole', selectedRole.name.toLowerCase());
          localStorage.setItem('userRoleId', selectedRole.id.toString());
          console.log(`Pre-storing selected role information: ${selectedRole.name} (${selectedRole.id})`);
        }
      }
      
      // Use direct fetch in all environments to ensure reliable authentication
      let userData;
      try {
        // Try to construct a reliable user representation for hardcoded users in emergency scenarios
        console.log("Using direct fetch for authentication");
        
        // We no longer need emergency credential logic since we have a working database
        // authentication system with real users
        console.log('Using database authentication for all environments');
        
        // Normal login process for all cases
        console.log("Attempting normal authentication flow");
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: data.username,
            password: data.password
          }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Login error response:', errorText);
          throw new Error('Authentication failed. Please check your credentials.');
        }
        
        userData = await response.json();
        console.log("Direct fetch authentication successful:", userData);
      } catch (error) {
        console.error("Direct fetch authentication failed:", error);
        
        // Special case for deployed environment with very specific credentials
        // Try the context login as fallback
        if (!isDeployedEnv) {
          try {
            console.log("Falling back to context auth method...");
            userData = await login(data.username, data.password);
          } catch (contextError) {
            console.error("Context auth method also failed:", contextError);
            throw error; // Throw the original error
          }
        } else {
          throw error; // Rethrow to be handled by the outer catch block
        }
      }
      console.log("✅ Login successful, redirecting user:", userData);
      
      // Explicitly save user data to localStorage with exact keys AuthContext expects
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Store JWT tokens if they're in the response
      if (userData.accessToken) {
        localStorage.setItem('accessToken', userData.accessToken);
        console.log("Saved access token to localStorage");
      }
      
      if (userData.refreshToken) {
        localStorage.setItem('refreshToken', userData.refreshToken);
        console.log("Saved refresh token to localStorage");
      }
      
      // Also save numeric role ID explicitly for better cross-environment compatibility
      if (userData.roleId) {
        let roleIdNum = typeof userData.roleId === 'string' ? parseInt(userData.roleId) : userData.roleId;
        if (!isNaN(roleIdNum)) {
          localStorage.setItem('userNumericRoleId', roleIdNum.toString());
          console.log(`Saved numeric role ID to localStorage: ${roleIdNum}`);
        }
      }
      
      // Use a simpler, more consistent approach: just use the dashboard path
      // This will handle all redirection logic in one place
      let redirectUrl = '/dashboard';
      
      console.log("🔍 DEBUG - User data:", userData);
      console.log("🔍 DEBUG - Username:", userData.username);
      console.log("🔍 DEBUG - Role ID:", userData.roleId);
      
      // Convert roleId to a numeric value for consistency
      let numericRoleId = null;
      if (typeof userData.roleId === 'string') {
        const parsedId = parseInt(userData.roleId);
        if (!isNaN(parsedId)) {
          numericRoleId = parsedId;
          console.log("Converted string roleId to number:", numericRoleId);
        }
      } else if (typeof userData.roleId === 'number') {
        numericRoleId = userData.roleId;
      }
      
      // Direct dashboard redirect based on roleId
      if (numericRoleId === 1002) {
        redirectUrl = '/admin/dashboard';
        console.log("Direct redirect to admin dashboard based on roleId 1002");
      } else if (numericRoleId === 1000) {
        redirectUrl = '/manager/dashboard';
        console.log("Direct redirect to manager dashboard based on roleId 1000");
        // Force a refresh to help get around any state issues
        localStorage.setItem('forceRefresh', 'true');
      } else if (numericRoleId === 1001) {
        redirectUrl = '/client/dashboard';
        console.log("Direct redirect to client dashboard based on roleId 1001");
      } else {
        // Fallback to username pattern if roleId is not recognized
        const username = userData.username.toLowerCase();
        if (username.includes('admin')) {
          redirectUrl = '/admin/dashboard';
          console.log("Fallback redirect to admin dashboard based on username");
        } else if (username.includes('manager')) {
          redirectUrl = '/manager/dashboard';
          console.log("Fallback redirect to manager dashboard based on username");
        } else if (username.includes('client')) {
          redirectUrl = '/client/dashboard';
          console.log("Fallback redirect to client dashboard based on username");
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
          
          console.log("Using role selection for redirection fallback:", roleGuess, "-> URL:", redirectUrl);
        }
      }
      
      console.log("⚠️ REDIRECTING TO:", redirectUrl);
      
      // If in a deployed environment, set additional flags to help with troubleshooting
      if (isDeployedEnv) {
        localStorage.setItem('loginTimestamp', Date.now().toString());
        localStorage.setItem('loginStatus', 'success');
        localStorage.setItem('targetRedirect', redirectUrl);
        console.log("Login completed at:", new Date().toISOString());
      }
      
      // Force a small delay to give time for localStorage to update
      setTimeout(() => {
        // Skip React routing entirely and use direct browser navigation
        // This ensures we completely reload the page and avoid any React state issues
        window.location.href = redirectUrl;
      }, 800); // Slightly longer delay for deployed environments
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Check if we're in a deployed environment
      const isDeployedEnv = 
        window.location.host.includes('.replit.app') || 
        window.location.host.includes('.replit.dev');
        
      // We've removed insecure fallback authentication - proper authentication is required
      // Remove any auth-related localStorage items to prevent confusion
      localStorage.removeItem('loginStatus');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('currentUser');
      
      // For debug logging in deployed environment
      if (isDeployedEnv) {
        console.error("Login attempt failed:", {
          timestamp: new Date().toISOString(),
          username: data.username ? "Provided" : "Missing",
          password: data.password ? "Provided (length: " + data.password.length + ")" : "Missing"
        });
      }
      
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
      console.log("Initiated Google authentication flow");
      
      // We don't need to do anything else here
      // The Firebase auth handler will manage the process
      toast({
        title: "Google Authentication",
        description: "Redirecting to Google for authentication...",
      });
      
      // Don't use setTimeout or manual redirects
      // The googleLogin() function should handle all redirections
    } catch (error) {
      console.error('Google login error:', error);
      toast({
        title: "Login failed",
        description: "There was a problem logging in with Google. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Instead of showing a separate message screen, automatically set the admin role
  useEffect(() => {
    if (!selectedRole) {
      // Default to admin role for instant access
      const adminRole = USER_ROLES.find(role => role.name === 'Admin');
      if (adminRole) {
        setSelectedRole(adminRole);
        
        // Store it in localStorage for persistence
        localStorage.setItem('selectedRole', JSON.stringify(adminRole));
      }
    }
  }, []);

  // Set default role to Admin if none selected
  const currentRole = selectedRole || USER_ROLES[0];
  
  // Function to handle role selection
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    localStorage.setItem('selectedRole', JSON.stringify(role));
    
    // Close the dialog
    setIsRoleDialogOpen(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side: Auth form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 mb-4 flex items-center justify-center">
              {currentRole.icon}
            </div>
            <CardTitle className="text-2xl">Welcome!</CardTitle>
            <CardDescription>
              Sign in as {currentRole.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role selection info */}
            <div className="bg-muted/50 p-3 rounded-lg flex items-center">
              <div className="text-primary mr-3">{currentRole.icon}</div>
              <div>
                <h3 className="font-medium">{currentRole.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {currentRole.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => setIsRoleDialogOpen(true)}
              >
                Change
              </Button>
            </div>
            
            {/* Role selection dialog */}
            {isRoleDialogOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md mx-4">
                  <CardHeader>
                    <CardTitle>Select User Role</CardTitle>
                    <CardDescription>Choose a role to continue</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {USER_ROLES.map((role) => (
                      <div 
                        key={role.id}
                        className="p-4 border rounded-lg hover:bg-muted cursor-pointer flex items-center"
                        onClick={() => handleRoleSelect(role)}
                      >
                        <div className="text-primary mr-4">{role.icon}</div>
                        <div>
                          <h3 className="font-medium">{role.name}</h3>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsRoleDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
            
            {/* Authentication method toggle */}
            <div className="flex rounded-md overflow-hidden">
              <Button
                type="button"
                variant={authMethod === 'password' ? 'default' : 'outline'}
                className="flex-1 rounded-none"
                onClick={() => setAuthMethod('password')}
              >
                <Key className="h-4 w-4 mr-2" />
                Password
              </Button>
              <Button
                type="button"
                variant={authMethod === 'google' ? 'default' : 'outline'}
                className="flex-1 rounded-none"
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter your password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit"
                    className="w-full mt-2" 
                    disabled={isLoading || authLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </Form>
            ) : (
              /* Google Login Button */
              <Button 
                onClick={handleLoginWithGoogle}
                className="w-full h-12 flex items-center justify-center gap-2"
                disabled={isLoading || authLoading}
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"></path>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"></path>
                  <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"></path>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"></path>
                </svg>
                {isLoading ? 'Signing in...' : 'Continue with Google'}
              </Button>
            )}
            
            <Separator className="my-4" />
            
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-semibold mb-1">Demo Account</p>
              <p className="font-medium">Username: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-primary">{currentRole.username}</span></p>
              <p className="font-medium">Password: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-primary">{currentRole.password}</span></p>
              <div className="mt-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs">
                <p className="font-semibold">Important: Use username (not email) to login</p>
              </div>
              <p className="mt-4 text-xs">
                This is a demo application. In a production environment, real user authentication would be required.
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