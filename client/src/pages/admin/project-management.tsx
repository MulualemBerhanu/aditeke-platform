import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Project } from '@shared/schema';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  ChevronLeft,
  Plus,
  Pencil,
  Eye,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  Filter,
  Loader2
} from 'lucide-react';

export default function ProjectManagement() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  
  // Redirect if not logged in or not an admin
  React.useEffect(() => {
    if (!user) {
      setLocation('/login');
    } else if (user.roleId !== 1) { // Assuming 1 is Admin role ID
      // Redirect to appropriate dashboard based on role
      if (user.roleId === 2) setLocation('/manager/dashboard');
      else if (user.roleId === 3) setLocation('/client/dashboard');
      else setLocation('/');
    }
  }, [user, setLocation]);
  
  // Fetch projects
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/projects');
        return await response.json();
      } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
      }
    },
    enabled: !!user && user.roleId === 1,
  });
  
  // Format date to readable string
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Filter projects by status
  const activeProjects = projects.filter(project => project.status === 'In Progress' || project.status === 'Planning');
  const completedProjects = projects.filter(project => project.status === 'Completed');
  const onHoldProjects = projects.filter(project => project.status === 'On Hold');
  
  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Planning':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Planning</Badge>;
      case 'In Progress':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">In Progress</Badge>;
      case 'Testing':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Testing</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Completed</Badge>;
      case 'On Hold':
        return <Badge variant="outline" className="bg-red-50 text-red-700">On Hold</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (!user || user.roleId !== 1) {
    return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>;
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          className="mr-2" 
          onClick={() => setLocation('/admin/dashboard')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Project Management</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects.length}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onHoldProjects.length}</div>
            <p className="text-xs text-muted-foreground text-amber-500">Require attention</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end mb-4">
        <Button onClick={() => setLocation('/admin/project-management/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Project
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="on-hold">On Hold</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Project List</CardTitle>
              <CardDescription>Manage all projects</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                            No projects found
                          </TableCell>
                        </TableRow>
                      ) : (
                        projects.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell className="font-medium">{project.title}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{project.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                {formatDate(project.startDate)}
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(project.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setLocation(`/admin/project-management/detail/${project.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setLocation(`/admin/project-management/edit/${project.id}`)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Projects that are currently in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeProjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          No active projects found
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeProjects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{project.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                              {formatDate(project.startDate)}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(project.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setLocation(`/admin/project-management/detail/${project.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setLocation(`/admin/project-management/edit/${project.id}`)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Projects</CardTitle>
              <CardDescription>Successfully delivered projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedProjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          No completed projects found
                        </TableCell>
                      </TableRow>
                    ) : (
                      completedProjects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{project.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                              {formatDate(project.startDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-1 text-green-500" />
                              {project.endDate ? formatDate(project.endDate) : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setLocation(`/admin/project-management/detail/${project.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="on-hold">
          <Card>
            <CardHeader>
              <CardTitle>On Hold Projects</CardTitle>
              <CardDescription>Projects that require attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {onHoldProjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          No on-hold projects found
                        </TableCell>
                      </TableRow>
                    ) : (
                      onHoldProjects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{project.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                              {formatDate(project.startDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-red-50 text-red-700">On Hold</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setLocation(`/admin/project-management/detail/${project.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setLocation(`/admin/project-management/edit/${project.id}`)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
          <CardDescription>Overview of all project timelines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-between">
              {projects.slice(0, 5).map((project, index) => (
                <div key={project.id} className="flex flex-col items-center">
                  <div className={`px-2 py-1 rounded-full text-xs mb-1 ${
                    project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    project.status === 'On Hold' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {project.status}
                  </div>
                  <div className={`w-4 h-4 rounded-full ${
                    project.status === 'Completed' ? 'bg-green-500' :
                    project.status === 'In Progress' ? 'bg-yellow-500' :
                    project.status === 'On Hold' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="mt-2 text-xs text-center max-w-[80px] truncate">{project.title}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-4">
            <div>Jan 2025</div>
            <div>Apr 2025</div>
            <div>Jul 2025</div>
            <div>Oct 2025</div>
            <div>Jan 2026</div>
          </div>
          <div className="mt-6">
            <Button variant="outline" className="w-full">View Detailed Timeline</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}