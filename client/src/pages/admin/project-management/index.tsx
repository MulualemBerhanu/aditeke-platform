import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Briefcase,
  CalendarDays,
  Tag,
  Loader2
} from 'lucide-react';

// Type for projects from the API
type Project = {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  clientId: number;
  startDate: string;
  endDate: string | null;
  status: string;
};

// Helper function to get status badge styling
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Planning':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700">Planning</Badge>;
    case 'In Progress':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">In Progress</Badge>;
    case 'Testing':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700">Testing</Badge>;
    case 'Review':
      return <Badge variant="outline" className="bg-indigo-50 text-indigo-700">Review</Badge>;
    case 'Completed':
      return <Badge variant="outline" className="bg-green-50 text-green-700">Completed</Badge>;
    case 'On Hold':
      return <Badge variant="outline" className="bg-orange-50 text-orange-700">On Hold</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function ProjectManagement() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Fetch all projects
  const { data: projects = [], isLoading, isError } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/projects');
      return await response.json();
    },
  });
  
  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/projects/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Project Deleted',
        description: 'Project has been successfully deleted',
      });
      // Refresh projects data
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete project',
        variant: 'destructive',
      });
    },
  });
  
  // Handle deleting a project
  const handleDeleteProject = (id: number) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProjectMutation.mutate(id);
    }
  };
  
  // Handle creating a new project
  const handleNewProject = () => {
    setLocation('/admin/project-management/create');
  };
  
  // Filter and search projects
  const filteredProjects = projects.filter((project: Project) => {
    // Apply search term filter
    const matchesSearch = searchTerm === '' || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply category filter
    const matchesCategory = categoryFilter === null || project.category === categoryFilter;
    
    // Apply status filter
    const matchesStatus = statusFilter === null || project.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
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
  
  // Extract unique categories for filtering
  const uniqueCategories = [...new Set(projects.map((project: Project) => project.category))];
  
  // Extract unique statuses for filtering
  const uniqueStatuses = [...new Set(projects.map((project: Project) => project.status))];
  
  if (!user || user.roleId !== 1) {
    return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>;
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Project Management</h1>
          <p className="text-muted-foreground mt-1">Manage and track all projects in one place</p>
        </div>
        <Button onClick={handleNewProject}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Projects Overview</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter Projects</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuLabel className="text-xs font-medium mt-2">Category</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setCategoryFilter(null)}>
                    <span className={categoryFilter === null ? "font-bold" : ""}>All Categories</span>
                  </DropdownMenuItem>
                  {uniqueCategories.map((category) => (
                    <DropdownMenuItem 
                      key={category} 
                      onClick={() => setCategoryFilter(category)}
                    >
                      <span className={categoryFilter === category ? "font-bold" : ""}>{category}</span>
                    </DropdownMenuItem>
                  ))}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuLabel className="text-xs font-medium">Status</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                    <span className={statusFilter === null ? "font-bold" : ""}>All Statuses</span>
                  </DropdownMenuItem>
                  {uniqueStatuses.map((status) => (
                    <DropdownMenuItem 
                      key={status} 
                      onClick={() => setStatusFilter(status)}
                    >
                      <span className={statusFilter === status ? "font-bold" : ""}>{status}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="flex justify-center items-center py-8 text-destructive">
              <AlertCircle className="h-6 w-6 mr-2" />
              <p>Failed to load projects. Please try again.</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No projects found</h3>
              <p className="text-muted-foreground mt-1">
                {searchTerm || categoryFilter || statusFilter 
                  ? "Try adjusting your filters or search term"
                  : "Get started by creating your first project"}
              </p>
              {!searchTerm && !categoryFilter && !statusFilter && (
                <Button onClick={handleNewProject} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Project Name</TableHead>
                    <TableHead className="w-[150px]">Category</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[120px]">Start Date</TableHead>
                    <TableHead className="w-[80px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project: Project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {project.thumbnail ? (
                            <img 
                              src={project.thumbnail} 
                              alt={project.title} 
                              className="h-10 w-10 mr-3 rounded object-cover" 
                            />
                          ) : (
                            <div className="h-10 w-10 mr-3 bg-muted rounded flex items-center justify-center">
                              <Briefcase className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <span className="font-medium">{project.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Tag className="h-3 w-3 mr-1" />
                          {project.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CalendarDays className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          {new Date(project.startDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setLocation(`/admin/project-management/${project.id}`)}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLocation(`/admin/project-management/${project.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Project
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteProject(project.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Project Statistics</CardTitle>
          <CardDescription>Overview of project status and distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <h3 className="text-2xl font-bold">{projects.length}</h3>
                </div>
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <h3 className="text-2xl font-bold">
                    {projects.filter((p: Project) => p.status === 'In Progress').length}
                  </h3>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <h3 className="text-2xl font-bold">
                    {projects.filter((p: Project) => p.status === 'Completed').length}
                  </h3>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}