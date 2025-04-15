import React, { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import ProjectForm from '@/components/shared/ProjectForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function ManagerEditProject() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [match, params] = useRoute('/manager/project/edit/:id');
  const projectId = params?.id;
  
  // Load user data from localStorage if needed
  const userData = user || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null);

  // Convert roleId to a number if it's stored as a string
  const getRoleId = (user: any) => {
    if (!user) return null;
    return typeof user.roleId === 'string' ? parseInt(user.roleId) : user.roleId;
  };

  // Redirect if not logged in or not a manager (using sequential IDs)
  React.useEffect(() => {
    if (!userData) {
      setLocation('/login');
      return;
    }
    
    const roleId = getRoleId(userData);
    
    if (roleId !== 1000) { // Using sequential ID for manager
      // Redirect to appropriate dashboard based on role
      if (roleId === 1002) { // Admin
        setLocation('/admin/dashboard');
      } else if (roleId === 1001) { // Client
        setLocation('/client/dashboard');
      } else {
        setLocation('/');
      }
    }
  }, [userData, setLocation]);

  // Check if user is a manager based on username or roleId
  const isManager = userData && (
    userData.username.toLowerCase().includes('manager') ||
    getRoleId(userData) === 1000 // Using the sequential roleId for manager
  );
  
  // Fetch project data based on ID
  const { data: project, isLoading, error } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    queryFn: async () => {
      // Use a public API endpoint if available, or create one
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch project');
        }
        return res.json();
      } catch (err) {
        console.error('Error fetching project:', err);
        throw err;
      }
    },
    enabled: !!projectId // Only run query if we have a projectId
  });

  if (!userData || !isManager) {
    return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading project data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">Error loading project: {(error as Error).message}</p>
        <Button onClick={() => setLocation('/manager/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => setLocation('/manager/dashboard')} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Edit Project</h1>
      </div>

      {project ? (
        <ProjectForm
          role="manager"
          returnPath="/manager/dashboard"
          title="Edit Project Details"
          description="Update the details of this project"
          submitLabel="Save Changes"
          initialValues={{
            title: project.title,
            description: project.description,
            category: project.category,
            status: project.status,
            clientId: project.clientId,
            startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
            endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
            thumbnail: project.thumbnail || '',
          }}
          onSuccess={() => {
            // Additional logic after project update if needed
            setLocation('/manager/dashboard');
          }}
        />
      ) : (
        <div className="flex justify-center items-center py-12">
          <p>Project not found</p>
        </div>
      )}
    </div>
  );
}