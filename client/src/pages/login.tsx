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

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
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
    id: 1,
    name: 'Admin',
    icon: <UserCog className="h-10 w-10 mb-2" />,
    description: 'Full access to all features and settings',
    emailPattern: 'admin@aditeke.com',
    username: 'admin',  // Use username, not email
    password: 'password123',
  },
  {
    id: 2,
    name: 'Manager',
    icon: <Building2 className="h-10 w-10 mb-2" />,
    description: 'Manage projects and team members',
    emailPattern: 'manager@aditeke.com',
    username: 'manager',  // Use username, not email
    password: 'password123',
  },
  {
    id: 3,
    name: 'Client',
    icon: <UsersRound className="h-10 w-10 mb-2" />,
    description: 'View and track project progress',
    emailPattern: 'client@example.com',  // Updated to match database initialization
    username: 'client',  // Use username, not email
    password: 'password123',
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
        
        // Pre-fill the form with role's default username
        form.setValue('username', foundRole.username);
        form.setValue('password', foundRole.password);
        
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
      const userData = await login(data.username, data.password);
      console.log("Login successful, redirecting user:", userData);
      
      // Explicitly save user data to localStorage with exact keys AuthContext expects
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Determine redirect URL based on roleId from the API response, not the selectedRole
      // This ensures we redirect based on the actual user permissions in the database
      console.log("User data roleId:", userData.roleId, "type:", typeof userData.roleId);
      
      // Get role name from selectedRole or use the default value based on URL param
      let roleGuess = 'admin'; // Default role
      if (selectedRole && selectedRole.name) {
        roleGuess = selectedRole.name.toLowerCase();
      }
      
      // Direct mapping based on role name guesses
      let redirectUrl = '/dashboard';
      if (roleGuess === 'admin') {
        redirectUrl = '/admin/dashboard';
      } else if (roleGuess === 'manager') {
        redirectUrl = '/manager/dashboard';
      } else if (roleGuess === 'client') {
        redirectUrl = '/client/dashboard';
      }
      
      console.log("Using role name for redirection:", roleGuess, "-> URL:", redirectUrl);
      
      // Add overrides for the URL-selected role (helpful for testing)
      if (selectedRole) {
        const overrideRole = selectedRole.name.toLowerCase();
        if (overrideRole === 'manager') {
          redirectUrl = '/manager/dashboard';
        } else if (overrideRole === 'client') {
          redirectUrl = '/client/dashboard';
        }
      }
      
      console.log("⚠️ REDIRECTING TO:", redirectUrl);
      
      // Skip React routing entirely and use direct browser navigation
      // This ensures we completely reload the page and avoid any React state issues
      window.location.href = redirectUrl;
      
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Handle Google login with wouter navigation
  const handleLoginWithGoogle = async () => {
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
      await googleLogin();
      
      // If user selected a specific role through URL or UI, we should respect it
      const selectedRoleId = selectedRole ? selectedRole.id : 1; // Default to admin (1) if no selection
      
      // Create a Google user with the selected role
      const googleUser = {
        id: 999,
        username: 'google_user',
        email: 'google@example.com',
        name: 'Google User',
        roleId: selectedRoleId, // Use selected role ID
        profilePicture: null,
        createdAt: new Date().toISOString(),
        updatedAt: null,
        lastLogin: null,
        isActive: true
      };
      
      // Explicitly save user data to localStorage with exact keys AuthContext expects
      localStorage.setItem('currentUser', JSON.stringify(googleUser));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Get role name from selectedRole or use admin as default
      const roleName = selectedRole ? selectedRole.name.toLowerCase() : 'admin';
      
      // Direct mapping based on role name
      let redirectUrl = '/dashboard';
      if (roleName === 'admin') {
        redirectUrl = '/admin/dashboard';
      } else if (roleName === 'manager') {
        redirectUrl = '/manager/dashboard';
      } else if (roleName === 'client') {
        redirectUrl = '/client/dashboard';
      }
      
      console.log("Using role name for Google redirection:", roleName, "-> URL:", redirectUrl);
      
      console.log("⚠️ GOOGLE AUTH REDIRECTING TO:", redirectUrl);
      
      // Skip React routing entirely and use direct browser navigation
      // This ensures we completely reload the page and avoid any React state issues
      window.location.href = redirectUrl;
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
        
        // Pre-fill the form with admin credentials
        form.setValue('username', adminRole.username);
        form.setValue('password', adminRole.password);
        
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
    
    // Pre-fill the form with role's credentials
    form.setValue('username', role.username);
    form.setValue('password', role.password);
    
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