import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import ProjectForm from '@/components/shared/ProjectForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateProject() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();

  // Load user data from localStorage if needed
  const userData = user || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null);

  // Convert roleId to a number if it's stored as a string
  const getRoleId = (user: any) => {
    if (!user) return null;
    return typeof user.roleId === 'string' ? parseInt(user.roleId) : user.roleId;
  };

  // Redirect if not logged in or not an admin (using sequential IDs)
  React.useEffect(() => {
    if (!userData) {
      setLocation('/login');
      return;
    }
    
    const roleId = getRoleId(userData);
    
    if (roleId !== 1002) { // Using sequential ID for admin
      // Redirect to appropriate dashboard based on role
      if (roleId === 1000) { // Manager
        setLocation('/manager/dashboard');
      } else if (roleId === 1001) { // Client
        setLocation('/client/dashboard');
      } else {
        setLocation('/');
      }
    }
  }, [userData, setLocation]);

  // Check if user is an admin based on username or roleId
  const isAdmin = userData && (
    userData.username.toLowerCase().includes('admin') ||
    getRoleId(userData) === 1002 // Using the sequential roleId for admin
  );

  if (!userData || !isAdmin) {
    return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => setLocation('/admin/project-management')} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <h1 className="text-3xl font-bold">Create New Project</h1>
      </div>

      <ProjectForm
        role="admin"
        returnPath="/admin/project-management"
        title="Project Details"
        description="Enter the details of the new project"
        submitLabel="Create Project"
        onSuccess={() => {
          // Additional logic after project creation if needed
          setLocation('/admin/project-management');
        }}
      />
    </div>
  );
}