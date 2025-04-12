import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCog, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [_, setLocation] = useLocation();

  // Redirect if not logged in - check both user context and localStorage
  React.useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    const isLocalStorageAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    if (!user && !storedUser && !isLocalStorageAuthenticated) {
      console.log("⚠️ No authentication found, redirecting to login");
      window.location.href = '/login';  // Use direct navigation for more reliable redirect
    } else if (!user && (storedUser || isLocalStorageAuthenticated)) {
      console.log("⚠️ Using localStorage authentication");
      // Continue with localStorage auth
    }
  }, [user, setLocation]);

  // Load user data from localStorage if not available in context
  const userData = user || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null);

  if (!userData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary/5 to-primary/10 p-4">
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 mb-4 flex items-center justify-center">
            <UserCog className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome, Admin!</CardTitle>
          <CardDescription>
            You are logged in as <span className="font-semibold text-primary">{userData.name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">
            This is a simple admin dashboard for the AdiTeke Software Solutions website.
            From here, you can manage users, content, and projects.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => setLocation('/')}
            >
              <span>Home Page</span>
              <span className="text-xs text-muted-foreground mt-1">View website</span>
            </Button>
            
            <Button
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => setLocation('/admin/project-management')}
            >
              <span>Projects</span>
              <span className="text-xs text-muted-foreground mt-1">Manage clients</span>
            </Button>
          </div>
          
          <Button 
            variant="default"
            className="w-full mt-6" 
            onClick={() => logout()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}