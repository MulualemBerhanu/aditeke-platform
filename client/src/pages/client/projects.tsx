import React, { useState, useEffect } from 'react';
import ClientLayout from '@/components/client/ClientLayout';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, DollarSign, Users, Clock, ExternalLink, FileText, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

const ClientProjects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientId, setClientId] = useState<number | null>(null);

  // Set clientId from user object when user data is available
  useEffect(() => {
    if (user) {
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      setClientId(userId);
    } else {
      // Try to get from localStorage as fallback
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const userId = typeof parsedUser.id === 'string' ? parseInt(parsedUser.id) : parsedUser.id;
          setClientId(userId);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    }
  }, [user]);

  // Fetch client projects
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['/api/public/client-projects', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      console.log(`Attempting to fetch projects for client ID: ${clientId} using public API`);
      
      const response = await fetch(`/api/public/client-projects/${clientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      console.log('Projects fetched from public API:', data);
      return data;
    },
    enabled: !!clientId,
  });

  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load projects. Please try again later.',
      variant: 'destructive',
    });
  }

  return (
    <ClientLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Projects</h1>
          <p className="text-slate-500">View and manage all your projects with AdiTeke Software Solutions</p>
        </div>

        {isLoading ? (
          // Loading state with skeletons
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="border border-slate-200">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex justify-between mb-4">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-4 w-full mt-4" />
                  <Skeleton className="h-2 w-1/3 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <Card key={project.id} className="border border-slate-200 hover:border-indigo-300 transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <Badge className={`${
                      project.status === 'completed' ? 'bg-green-500' :
                      project.status === 'planning' ? 'bg-blue-500' :
                      project.status === 'in-progress' ? 'bg-amber-500' :
                      project.status === 'In Progress' ? 'bg-amber-500' :
                      'bg-indigo-500'
                    }`}>
                      {project.status === 'in-progress' ? 'In Progress' : project.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-indigo-600 mr-2" />
                      <div className="text-sm">
                        <p className="text-slate-500">Start Date</p>
                        <p className="font-medium">{project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                      <div className="text-sm">
                        <p className="text-slate-500">Budget</p>
                        <p className="font-medium">${project.budget?.toLocaleString() || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-xs text-slate-400 mb-1">
                      Progress ({project.progress || 0}%)
                    </p>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          (project.progress || 0) >= 75 ? 'bg-green-500' :
                          (project.progress || 0) >= 25 ? 'bg-amber-500' :
                          'bg-indigo-500'
                        }`}
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-6">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = '/client/messages'}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Discuss
                    </Button>
                    {project.website_url && (
                      <Button 
                        variant="ghost" 
                        className="text-indigo-600"
                        onClick={() => window.open(project.website_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Site
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-slate-50 rounded-xl p-6 max-w-lg mx-auto">
              <h3 className="text-xl font-semibold mb-2">No Projects Found</h3>
              <p className="text-slate-500 mb-4">
                You don't have any active projects at the moment. Your projects will appear here once they are created.
              </p>
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => window.location.href = '/client/messages'}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Manager
              </Button>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
};

export default ClientProjects;