import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function DirectLogin() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Simple direct login functions that bypass everything
  const loginAsAdmin = () => {
    setLoading(true);
    
    // Create admin user data directly
    const adminData = {
      id: 60002,
      username: 'admin',
      email: 'admin@aditeke.com',
      name: 'Admin User',
      roleId: 1002,
      role: { id: 1002, name: 'admin' },
      profilePicture: null,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      lastLogin: new Date().toISOString(),
      isActive: true
    };
    
    // Store in localStorage
    localStorage.setItem('currentUser', JSON.stringify(adminData));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', 'admin');
    localStorage.setItem('userRoleId', '1002');
    
    // Show success message
    toast({
      title: 'Admin Login Successful',
      description: 'Redirecting to admin dashboard...'
    });
    
    // Redirect (with some delay to let localStorage update)
    setTimeout(() => {
      window.location.href = '/admin/dashboard';
    }, 800);
  };
  
  const loginAsManager = () => {
    setLoading(true);
    
    // Create manager user data directly
    const managerData = {
      id: 50000,
      username: 'manager',
      email: 'manager@aditeke.com',
      name: 'Manager User',
      roleId: 1000,
      role: { id: 1000, name: 'manager' },
      profilePicture: null,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      lastLogin: new Date().toISOString(),
      isActive: true
    };
    
    // Store in localStorage
    localStorage.setItem('currentUser', JSON.stringify(managerData));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', 'manager');
    localStorage.setItem('userRoleId', '1000');
    
    // Show success message
    toast({
      title: 'Manager Login Successful',
      description: 'Redirecting to manager dashboard...'
    });
    
    // Redirect (with some delay to let localStorage update)
    setTimeout(() => {
      window.location.href = '/manager/dashboard';
    }, 800);
  };
  
  const loginAsClient = () => {
    setLoading(true);
    
    // Create client user data directly
    const clientData = {
      id: 2000,
      username: 'client',
      email: 'client@example.com',
      name: 'Client User',
      roleId: 1001,
      role: { id: 1001, name: 'client' },
      profilePicture: null,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      lastLogin: new Date().toISOString(),
      isActive: true
    };
    
    // Store in localStorage
    localStorage.setItem('currentUser', JSON.stringify(clientData));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', 'client');
    localStorage.setItem('userRoleId', '1001');
    
    // Show success message
    toast({
      title: 'Client Login Successful',
      description: 'Redirecting to client dashboard...'
    });
    
    // Redirect (with some delay to let localStorage update)
    setTimeout(() => {
      window.location.href = '/client/dashboard';
    }, 800);
  };
  
  // Clear any existing auth data on page load
  useEffect(() => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userRoleId');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Direct Login</CardTitle>
          <CardDescription className="text-center">
            Choose a role to login directly (no password needed)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button 
            onClick={loginAsAdmin} 
            disabled={loading}
            className="w-full h-16 text-lg bg-red-600 hover:bg-red-700"
          >
            Login as Admin
          </Button>
          <Button 
            onClick={loginAsManager} 
            disabled={loading}
            className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700"
          >
            Login as Manager
          </Button>
          <Button 
            onClick={loginAsClient} 
            disabled={loading}
            className="w-full h-16 text-lg bg-green-600 hover:bg-green-700"
          >
            Login as Client
          </Button>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <p className="text-xs text-center w-full text-muted-foreground">
            This page bypasses all authentication and directly logs you in with the selected role.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}