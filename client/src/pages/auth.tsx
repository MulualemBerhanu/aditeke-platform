import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCog, Building2, UsersRound, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Direct roleId to component mapping for reliable routing
const ROLE_REDIRECTS: Record<number, string> = {
  1000: '/manager/dashboard',
  1001: '/client/dashboard',
  1002: '/admin/dashboard'
};

export default function AuthPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { toast } = useToast();

  // Clear any previous login data on page load
  useEffect(() => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userRoleId');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  // Direct login handler - completely bypasses complex authentication
  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log(`Login attempt for: ${username}`);

      // Check if this is a demo account
      let userData = null;
      let redirectUrl = '/dashboard';
      
      if (username === 'admin@aditeke.com' && password === 'adminPassword123') {
        userData = {
          id: 60002,
          username: 'admin',
          email: 'admin@aditeke.com',
          name: 'Admin User',
          roleId: 1002,
          profilePicture: null,
          createdAt: new Date().toISOString(),
          updatedAt: null,
          lastLogin: new Date().toISOString(),
          isActive: true
        };
        redirectUrl = '/admin/dashboard';
        console.log('✅ Admin login successful');
      } 
      else if (username === 'manager@aditeke.com' && password === 'managerPassword123') {
        userData = {
          id: 50000,
          username: 'manager',
          email: 'manager@aditeke.com',
          name: 'Manager User',
          roleId: 1000,
          profilePicture: null,
          createdAt: new Date().toISOString(),
          updatedAt: null,
          lastLogin: new Date().toISOString(),
          isActive: true
        };
        redirectUrl = '/manager/dashboard';
        console.log('✅ Manager login successful');
      } 
      else if (username === 'client@example.com' && password === 'clientPassword123') {
        userData = {
          id: 2000,
          username: 'client',
          email: 'client@example.com',
          name: 'Client User',
          roleId: 1001,
          profilePicture: null,
          createdAt: new Date().toISOString(),
          updatedAt: null,
          lastLogin: new Date().toISOString(),
          isActive: true
        };
        redirectUrl = '/client/dashboard';
        console.log('✅ Client login successful');
      } 
      else {
        // If not a demo account, try the actual API login
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('Authentication failed');
          }

          userData = await response.json();
          
          // Determine redirect URL based on roleId
          if (userData.roleId) {
            const roleId = typeof userData.roleId === 'string' ? parseInt(userData.roleId) : userData.roleId;
            redirectUrl = ROLE_REDIRECTS[roleId] || '/dashboard';
          }
        } catch (error) {
          console.error('API login failed:', error);
          throw new Error('Login failed. Please check your credentials.');
        }
      }

      if (!userData) {
        throw new Error('Authentication failed');
      }

      // Store user data in localStorage for persistence
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Store role information
      if (userData.roleId) {
        localStorage.setItem('userRoleId', String(userData.roleId));
        
        // Map roleId to role name
        const roleMap: Record<number, string> = {
          1000: 'manager',
          1001: 'client',
          1002: 'admin'
        };
        
        const roleId = typeof userData.roleId === 'string' ? parseInt(userData.roleId) : userData.roleId;
        const roleName = roleMap[roleId] || 'user';
        localStorage.setItem('userRole', roleName);
      }
      
      // Login success notification
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${userData.name || userData.username}!`,
      });
      
      // Short delay before redirect
      setTimeout(() => {
        console.log('Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
      }, 500);
      
    } catch (error) {
      console.error('Login error:', error);
      
      toast({
        title: 'Authentication Failed',
        description: 'Your login credentials are incorrect. Please try again.',
        variant: 'destructive',
      });
      
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side: Auth form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 mb-2 flex items-center justify-center">
              <LogIn className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription>
              Access your AdiTeke Software Solutions dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleDirectLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Email or Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="e.g., admin@aditeke.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin mr-2"></div>
                    Logging in...
                  </div>
                ) : (
                  'Login'
                )}
              </Button>
            </form>
            
            <div className="mt-6">
              <p className="text-center text-sm text-muted-foreground mb-2">Demo Accounts:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setUsername('admin@aditeke.com');
                    setPassword('adminPassword123');
                  }}
                  className="flex flex-col items-center p-2 h-auto"
                >
                  <UserCog className="h-4 w-4 mb-1" />
                  <span className="text-xs">Admin</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setUsername('manager@aditeke.com');
                    setPassword('managerPassword123');
                  }}
                  className="flex flex-col items-center p-2 h-auto"
                >
                  <Building2 className="h-4 w-4 mb-1" />
                  <span className="text-xs">Manager</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setUsername('client@example.com');
                    setPassword('clientPassword123');
                  }}
                  className="flex flex-col items-center p-2 h-auto"
                >
                  <UsersRound className="h-4 w-4 mb-1" />
                  <span className="text-xs">Client</span>
                </Button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <p className="text-xs text-center text-muted-foreground mt-2">
              AdiTeke Software Solutions © {new Date().getFullYear()}
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Right side: Hero/Overview */}
      <div className="flex-1 bg-primary/10 hidden lg:flex flex-col items-center justify-center p-8">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-6">
            Welcome to AdiTeke Software Solutions
          </h1>
          <p className="text-xl mb-6">
            An all-in-one platform for managing your software development projects,
            client communications, and team collaboration.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background rounded-lg p-4 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center mb-2">
                <UserCog className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium mb-1">Project Management</h3>
              <p className="text-sm text-muted-foreground">
                Track progress, assign tasks, and manage resources efficiently.
              </p>
            </div>
            <div className="bg-background rounded-lg p-4 shadow-sm">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center mb-2">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium mb-1">Client Portal</h3>
              <p className="text-sm text-muted-foreground">
                Share updates, documents, and project status with your clients.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}