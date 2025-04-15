import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import ProjectForm from '@/components/shared/ProjectForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ManagerCreateProject() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();

  // Load user data from localStorage if not available in context
  const userData = user || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null);

  // Check if user is a manager based on username or roleId
  const isManager = userData && (
    userData.username.toLowerCase().includes('manager') ||
    userData.roleId === 1000 // Using the sequential roleId for manager
  );

  // Redirect if not logged in or not a manager
  React.useEffect(() => {
    if (!userData) {
      setLocation('/login');
    } else if (!isManager) {
      // Redirect to appropriate dashboard based on role
      if (userData.roleId === 1001) {
        setLocation('/client/dashboard');
      } else if (userData.roleId === 1002) {
        setLocation('/admin/dashboard');
      } else {
        setLocation('/');
      }
    }
  }, [userData, isManager, setLocation]);

  if (!userData || !isManager) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
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
        title="New Project Details"
        description="Create a new project for a client"
        submitLabel="Create Project"
        onSuccess={() => {
          // Additional logic after project creation if needed
          setLocation('/manager/dashboard');
        }}
      />
    </div>
  );
}