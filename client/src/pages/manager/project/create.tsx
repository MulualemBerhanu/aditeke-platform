import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import ProjectForm from '@/components/shared/ProjectForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ManagerCreateProject() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();

  // Redirect if not logged in or not a manager (using sequential IDs)
  React.useEffect(() => {
    if (!user) {
      setLocation('/login');
    } else if (user.roleId !== 1000) { // Using sequential ID for manager
      // Redirect to appropriate dashboard based on role
      if (user.roleId === 1002) { // Admin
        setLocation('/admin/dashboard');
      } else if (user.roleId === 1001) { // Client
        setLocation('/client/dashboard');
      } else {
        setLocation('/');
      }
    }
  }, [user, setLocation]);

  // Check if user is a manager based on username or roleId
  const isManager = user && (
    user.username.toLowerCase().includes('manager') ||
    user.roleId === 1000 // Using the sequential roleId for manager
  );

  if (!user || !isManager) {
    return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => setLocation('/manager/dashboard')} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Create New Project</h1>
      </div>

      <ProjectForm
        role="manager"
        returnPath="/manager/dashboard"
        title="Project Details"
        description="Enter the details of the new project"
        submitLabel="Create Project"
        onSuccess={() => {
          // Additional logic after project creation if needed
          setLocation('/manager/dashboard');
        }}
      />
    </div>
  );
}