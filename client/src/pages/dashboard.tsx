import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

// This is a simple redirect component to send users to their role-based dashboard
export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  const [redirectError, setRedirectError] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Redirecting to your dashboard...");

  // Check localStorage for user data if context isn't loaded yet
  const getStoredUserData = () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      return null;
    }
  };
  
  // Manual redirect function with multiple methods
  const redirectToDashboard = (path) => {
    console.log(`Attempting redirect to ${path} (attempt ${redirectAttempts + 1})`);
    
    // Different redirect methods based on attempt number
    if (redirectAttempts === 0) {
      setLocation(path);
    } else if (redirectAttempts === 1) {
      window.location.href = path;
    } else if (redirectAttempts >= 2) {
      window.location.replace(path);
    }
    
    setRedirectAttempts(prev => prev + 1);
  };

  useEffect(() => {
    // Prevent infinite redirects
    if (redirectAttempts >= 5) {
      setRedirectError(true);
      setStatusMessage("Redirection failed. Please try clicking the button below.");
      return;
    }
    
    // First try with Auth context
    if (!isLoading) {
      const userData = user || getStoredUserData();
      
      if (userData) {
        // Log user role information for debugging
        console.log("User data roleId:", userData.roleId, "type:", typeof userData.roleId);
        
        // Get numeric roleId - either directly or convert from string if needed
        const roleIdNum = typeof userData.roleId === 'string' ? parseInt(userData.roleId) : userData.roleId;
        
        // Check for role by numeric ID
        if (roleIdNum === 1002) {
          console.log("Using role ID for redirection:", roleIdNum, "-> URL:", "/admin/dashboard");
          redirectToDashboard('/admin/dashboard');
        } else if (roleIdNum === 1000) {
          console.log("Using role ID for redirection:", roleIdNum, "-> URL:", "/manager/dashboard");
          redirectToDashboard('/manager/dashboard');
        } else if (roleIdNum === 1001) {
          console.log("Using role ID for redirection:", roleIdNum, "-> URL:", "/client/dashboard");
          redirectToDashboard('/client/dashboard');
        } else {
          // If role is not recognized, redirect to home
          console.log("Role not recognized:", roleIdNum, "redirecting to home");
          redirectToDashboard('/');
        }
      } else {
        // If not logged in, redirect to login
        redirectToDashboard('/login');
      }
    }
  }, [user, isLoading, redirectAttempts, setLocation]);

  // Manual redirect buttons if automatic redirection fails
  const renderManualRedirectButtons = () => {
    return (
      <div className="flex flex-col space-y-4 mt-6">
        <button 
          onClick={() => window.location.href = '/client/dashboard'}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Go to Client Dashboard
        </button>
        <button 
          onClick={() => window.location.href = '/manager/dashboard'}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Go to Manager Dashboard
        </button>
        <button 
          onClick={() => window.location.href = '/admin/dashboard'}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Go to Admin Dashboard
        </button>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Return to Login
        </button>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center p-8 max-w-md">
        {redirectError ? (
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-amber-500" />
        ) : (
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        )}
        <p className="text-gray-600 mb-4">{statusMessage}</p>
        
        {redirectError && renderManualRedirectButtons()}
      </div>
    </div>
  );
}