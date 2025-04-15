import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import ManagerLayout from '@/components/manager/ManagerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Users, Layout, Mail, Calendar, ClipboardList,
  Clock, CheckCircle2, AlertCircle, Plus, Loader2,
  FileText, PencilLine, UserPlus, Trash2, Edit, X
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Project, User } from '@shared/schema';

export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [isAssignProjectDialogOpen, setIsAssignProjectDialogOpen] = React.useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(10);
  
  // Column-specific search state
  const [filters, setFilters] = React.useState({
    title: '',
    client: '',
    status: '',
    deadline: ''
  });
  
  // Format dates - handles various formats including Firestore timestamps
  const formatDate = (dateInput: any) => {
    if (!dateInput) return 'No deadline';
    
    try {
      // Handle Firestore timestamp format which contains _seconds property
      if (dateInput && typeof dateInput === 'object' && '_seconds' in dateInput) {
        // Convert Firestore timestamp to Date object
        const seconds = dateInput._seconds;
        const date = new Date(seconds * 1000); // Convert seconds to milliseconds
        
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      
      // Handle regular Date objects or strings
      let date: Date;
      if (typeof dateInput === 'string') {
        date = new Date(dateInput);
      } else if (dateInput instanceof Date) {
        date = dateInput;
      } else {
        console.error('Unrecognized date format:', dateInput);
        return 'Invalid date';
      }
      
      // Verify it's a valid date
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.error('Invalid date object or timestamp:', date);
        return 'Invalid date';
      }
      
      // Format the date safely
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Fetch all projects
  const { 
    data: projects, 
    isLoading: isLoadingProjects, 
    error: projectsError 
  } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) {
        throw new Error('Failed to load projects');
      }
      return res.json();
    }
  });
  
  // Fetch all clients (users with roleId = 1001) - using dedicated endpoint
  const {
    data: clients,
    isLoading: isLoadingClients,
    error: clientsError,
    refetch: refetchClients
  } = useQuery<User[]>({
    queryKey: ['/api/public/client-options'],
    queryFn: async () => {
      try {
        console.log("[CLIENT-OPTIONS] Starting PUBLIC API request");
        
        // No auth needed for public API
        const res = await fetch('/api/public/client-options');
        
        console.log("[CLIENT-OPTIONS] Response status:", res.status);
        
        if (!res.ok) {
          console.error("[CLIENT-OPTIONS] API error:", res.status, res.statusText);
          
          // Return empty array instead of throwing to prevent UI errors
          console.warn("[CLIENT-OPTIONS] Returning empty array due to API error");
          return [];
        }
        
        // Parse response
        const data = await res.json();
        console.log("[CLIENT-OPTIONS] Received clients:", data.length);
        return data;
      } catch (error) {
        console.error("[CLIENT-OPTIONS] Fetch error:", error);
        // Return empty array instead of throwing to prevent UI errors
        return [];
      }
    },
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: 1000, // Wait 1 second between retries
    refetchOnWindowFocus: false // Don't refetch when window regains focus
  });
  
  // Mutation to assign a project to a client - using real API endpoint
  const assignProjectMutation = useMutation({
    mutationFn: async ({ projectId, clientId }: { projectId: number, clientId: number }) => {
      try {
        console.log(`Assigning project ${projectId} to client ${clientId} via API endpoint`);
        
        // Make a real API call to the backend
        const response = await fetch('/api/projects/assign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectId, clientId }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to assign project');
        }
        
        // Parse and return the response
        const data = await response.json();
        console.log("Project assignment API response:", data);
        
        return data;
      } catch (error) {
        console.error("Error in project assignment:", error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      toast({
        title: "Project assigned successfully",
        description: `The project has been assigned to the client.`,
      });
      setIsAssignProjectDialogOpen(false);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to assign project",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Filter projects based on column filters
  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];
    
    return projects.filter(project => {
      // Find client name for searching
      const client = clients?.find(c => {
        if (!project.clientId) return false;
        const cId = typeof c.id === 'string' ? parseInt(c.id) : c.id;
        const pClientId = typeof project.clientId === 'string' ? parseInt(project.clientId) : project.clientId;
        return cId === pClientId;
      });
      const clientName = client ? (client.name || client.username || '') : '';
      const formattedDeadline = project.endDate ? formatDate(project.endDate) : 'No deadline';
      
      // Apply all filters (return true only if all active filters match)
      const titleMatch = !filters.title || 
        (project.title?.toLowerCase().includes(filters.title.toLowerCase()) || false);
      
      const clientMatch = !filters.client || 
        clientName.toLowerCase().includes(filters.client.toLowerCase());
      
      const statusMatch = !filters.status || 
        (project.status?.toLowerCase().includes(filters.status.toLowerCase()) || false);
      
      const deadlineMatch = !filters.deadline || 
        formattedDeadline.toLowerCase().includes(filters.deadline.toLowerCase());
      
      return titleMatch && clientMatch && statusMatch && deadlineMatch;
    });
  }, [projects, clients, filters, formatDate]);
  
  // Calculate pagination
  const paginatedProjects = React.useMemo(() => {
    const indexOfLastProject = currentPage * itemsPerPage;
    const indexOfFirstProject = indexOfLastProject - itemsPerPage;
    return filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  }, [filteredProjects, currentPage, itemsPerPage]);
  
  // Calculate project statistics
  const projectStats = React.useMemo(() => {
    if (!projects) return { total: 0, inProgress: 0, completed: 0 };
    
    const total = projects.length;
    const inProgress = projects.filter(p => p.status !== 'Completed').length;
    const completed = projects.filter(p => p.status === 'Completed').length;
    
    return { total, inProgress, completed };
  }, [projects]);

  // Redirect if not logged in or not a manager - check both API and localStorage
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
    
    // Check role permissions and redirect if needed
    const userData = user || (storedUser ? JSON.parse(storedUser) : null);
    if (userData) {
      const username = userData.username.toLowerCase();
      
      // First, check role based on username (most reliable)
      if (!username.includes('manager')) {
        console.log("⚠️ Not authorized as manager based on username, redirecting");
        if (username.includes('admin')) {
          window.location.href = '/admin/dashboard';
        } else if (username.includes('client')) {
          window.location.href = '/client/dashboard';
        } else {
          // Try to get numeric roleId - either directly or convert from string if needed
          const roleIdNum = typeof userData.roleId === 'string' ? parseInt(userData.roleId) : userData.roleId;
          
          // If still can't determine role, use roleId
          if (roleIdNum !== 1000) { // 1000 is the manager role ID in Firebase
            console.log("⚠️ Not authorized as manager based on roleId, redirecting");
            if (roleIdNum === 1002) { // 1002 is the admin role ID in Firebase
              window.location.href = '/admin/dashboard';
            } else if (roleIdNum === 1001) { // 1001 is the client role ID in Firebase
              window.location.href = '/client/dashboard';
            } else {
              window.location.href = '/';
            }
          }
        }
      }
    }
  }, [user, setLocation]);

  // Load user data from localStorage if not available in context
  const userData = user || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null);

  // Check if user is a manager based on username (most reliable method)
  const isManager = userData && userData.username.toLowerCase().includes('manager');

  if (!userData || !isManager) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <ManagerLayout>
      <div className="container mx-auto py-2">
        <h2 className="text-2xl font-semibold mb-6">Projects Overview</h2>
        
        <Tabs defaultValue="projects" className="mb-8">
          <TabsList className="grid grid-cols-4 w-full max-w-3xl">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

        <TabsContent value="projects" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Layout className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="text-2xl font-bold">{projectStats.total}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-amber-500" />
                  <div className="text-2xl font-bold">{projectStats.inProgress}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  <div className="text-2xl font-bold">{projectStats.completed}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Active Projects</CardTitle>
                  <Button size="sm" onClick={() => setLocation('/manager/project/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </div>
                {/* Column-specific search fields will be added in the table header */}
              </CardHeader>
              <CardContent>
                {isLoadingProjects ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                    <span>Loading projects...</span>
                  </div>
                ) : projectsError ? (
                  <div className="flex flex-col items-center py-8">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <h3 className="text-xl font-medium mb-2">Error loading projects</h3>
                    <p className="text-muted-foreground text-center">
                      There was an error loading projects. Please try again later.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-medium">Project Name</th>
                          <th className="text-left py-3 px-2 font-medium">Client</th>
                          <th className="text-left py-3 px-2 font-medium">Status</th>
                          <th className="text-left py-3 px-2 font-medium">Deadline</th>
                          <th className="text-left py-3 px-2 font-medium">Actions</th>
                        </tr>
                        <tr>
                          <th className="py-2 px-2">
                            <Input
                              placeholder="Search project name..."
                              value={filters.title}
                              onChange={(e) => {
                                setFilters(prev => ({ ...prev, title: e.target.value }));
                                setCurrentPage(1); // Reset to first page on search
                              }}
                              className="h-8 text-sm"
                            />
                          </th>
                          <th className="py-2 px-2">
                            <Input
                              placeholder="Search client..."
                              value={filters.client}
                              onChange={(e) => {
                                setFilters(prev => ({ ...prev, client: e.target.value }));
                                setCurrentPage(1);
                              }}
                              className="h-8 text-sm"
                            />
                          </th>
                          <th className="py-2 px-2">
                            <Input
                              placeholder="Search status..."
                              value={filters.status}
                              onChange={(e) => {
                                setFilters(prev => ({ ...prev, status: e.target.value }));
                                setCurrentPage(1);
                              }}
                              className="h-8 text-sm"
                            />
                          </th>
                          <th className="py-2 px-2">
                            <Input
                              placeholder="Search deadline..."
                              value={filters.deadline}
                              onChange={(e) => {
                                setFilters(prev => ({ ...prev, deadline: e.target.value }));
                                setCurrentPage(1);
                              }}
                              className="h-8 text-sm"
                            />
                          </th>
                          <th className="py-2 px-2">
                            {/* Clear filters button */}
                            {Object.values(filters).some(filter => filter.trim() !== '') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setFilters({ title: '', client: '', status: '', deadline: '' });
                                  setCurrentPage(1);
                                }}
                                className="h-8 text-xs w-full"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Clear
                              </Button>
                            )}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.length > 0 ? (
                          paginatedProjects.map((project) => {
                            // Find client name for the project if it has a clientId
                            // Handle both numeric and string IDs when comparing
                            const client = clients?.find(c => {
                              if (!project.clientId) return false;
                              const cId = typeof c.id === 'string' ? parseInt(c.id) : c.id;
                              const pClientId = typeof project.clientId === 'string' ? parseInt(project.clientId) : project.clientId;
                              return cId === pClientId;
                            });
                            const clientName = client ? (client.name || client.username || 'Unknown') : 'Unassigned';
                            
                            return (
                              <tr key={project.id} className="border-b">
                                <td className="py-3 px-2">{project.title}</td>
                                <td className="py-3 px-2">{clientName}</td>
                                <td className="py-3 px-2">
                                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                                    project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                    project.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                                    project.status === 'Delayed' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {project.status}
                                  </span>
                                </td>
                                <td className="py-3 px-2">
                                  {project.endDate ? formatDate(project.endDate) : 'No deadline'}
                                </td>
                                <td className="py-3 px-2 flex space-x-1">
                                  <Button variant="ghost" size="sm">View</Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      setLocation(`/manager/project/edit/${project.id}`);
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-muted-foreground">
                              {Object.values(filters).some(filter => filter.trim() !== '') 
                                ? 'No matching projects found' 
                                : 'No projects found'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    
                    {/* Pagination controls */}
                    {filteredProjects.length > 0 && (
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-muted-foreground">
                          Showing {Math.min(filteredProjects.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredProjects.length, currentPage * itemsPerPage)} of {filteredProjects.length} projects
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          >
                            Previous
                          </Button>
                          <div className="flex items-center space-x-1">
                            {(() => {
                              const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
                              const maxVisiblePages = 5; // Show at most 5 page buttons at a time
                              
                              // Calculate which page buttons to show
                              let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                              let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                              
                              // Adjust if we're near the end
                              if (endPage - startPage + 1 < maxVisiblePages) {
                                startPage = Math.max(1, endPage - maxVisiblePages + 1);
                              }
                              
                              const pageButtons = [];
                              
                              // First page button
                              if (startPage > 1) {
                                pageButtons.push(
                                  <Button 
                                    key="first"
                                    variant={currentPage === 1 ? "default" : "outline"} 
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() => setCurrentPage(1)}
                                  >
                                    1
                                  </Button>
                                );
                                
                                // Ellipsis if there's a gap
                                if (startPage > 2) {
                                  pageButtons.push(
                                    <span key="ellipsis1" className="px-2">...</span>
                                  );
                                }
                              }
                              
                              // Page buttons
                              for (let i = startPage; i <= endPage; i++) {
                                pageButtons.push(
                                  <Button 
                                    key={i}
                                    variant={currentPage === i ? "default" : "outline"} 
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() => setCurrentPage(i)}
                                  >
                                    {i}
                                  </Button>
                                );
                              }
                              
                              // Last page button
                              if (endPage < totalPages) {
                                // Ellipsis if there's a gap
                                if (endPage < totalPages - 1) {
                                  pageButtons.push(
                                    <span key="ellipsis2" className="px-2">...</span>
                                  );
                                }
                                
                                pageButtons.push(
                                  <Button 
                                    key="last"
                                    variant={currentPage === totalPages ? "default" : "outline"} 
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() => setCurrentPage(totalPages)}
                                  >
                                    {totalPages}
                                  </Button>
                                );
                              }
                              
                              return pageButtons;
                            })()}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={currentPage >= Math.ceil(filteredProjects.length / itemsPerPage)}
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredProjects.length / itemsPerPage)))}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Project Assignment Dialog */}
                <Dialog open={isAssignProjectDialogOpen} onOpenChange={setIsAssignProjectDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Project to Client</DialogTitle>
                      <DialogDescription>
                        Select a client to assign this project to.
                      </DialogDescription>
                    </DialogHeader>
                    
                    {isLoadingClients ? (
                      <div className="flex justify-center items-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                        <span>Loading clients...</span>
                      </div>
                    ) : clientsError ? (
                      <div className="text-center py-6 text-destructive">
                        <p>Error loading clients. Please try again.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="client">Client</Label>
                          <Select 
                            value={selectedClientId || undefined} 
                            onValueChange={setSelectedClientId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client" />
                            </SelectTrigger>
                            <SelectContent>
                              {/* Always ensure a default option for when client list is empty */}
                              {(!clients || clients.length === 0) && (
                                <SelectItem value="no-client">No clients available</SelectItem>
                              )}
                              
                              {clients && clients.length > 0 ? (
                                clients.map((client) => {
                                  // Defensive check to make sure client and client.id exist
                                  if (!client || client.id === undefined || client.id === null) {
                                    return null;
                                  }
                                  
                                  // Make sure client.id and client.name are properly accessed
                                  const clientId = typeof client.id === 'undefined' ? '' : client.id.toString();
                                  const clientName = client.name || client.username || 'Unknown Client';
                                  
                                  return (
                                    <SelectItem key={clientId} value={clientId}>
                                      {clientName}
                                    </SelectItem>
                                  );
                                })
                              ) : (
                                <SelectItem value="none" disabled>
                                  No clients available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAssignProjectDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={!selectedClientId || !selectedProjectId || assignProjectMutation.isPending}
                        onClick={() => {
                          if (selectedClientId && selectedProjectId) {
                            assignProjectMutation.mutate({
                              projectId: parseInt(selectedProjectId),
                              clientId: parseInt(selectedClientId)
                            });
                          }
                        }}
                      >
                        {assignProjectMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Assigning...
                          </>
                        ) : (
                          <>Assign Project</>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { project: 'E-commerce Platform', date: 'Jun 15, 2025', days: 28 },
                    { project: 'CRM Integration', date: 'May 30, 2025', days: 12 },
                    { project: 'Mobile App Development', date: 'Apr 10, 2025', days: -8 }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.project}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                      <div className={`text-sm font-medium ${
                        item.days < 0 ? 'text-red-500' : item.days < 14 ? 'text-amber-500' : 'text-green-500'
                      }`}>
                        {item.days < 0 ? `${Math.abs(item.days)} days overdue` : `${item.days} days left`}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Team Workload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Alex Johnson', role: 'Developer', projects: 3, availability: 'High' },
                    { name: 'Sarah Williams', role: 'Designer', projects: 4, availability: 'Medium' },
                    { name: 'Mike Chen', role: 'Developer', projects: 5, availability: 'Low' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{item.projects} projects</p>
                        <p className={`text-xs ${
                          item.availability === 'Low' ? 'text-red-500' : 
                          item.availability === 'Medium' ? 'text-amber-500' : 
                          'text-green-500'
                        }`}>
                          {item.availability} availability
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Client Management</CardTitle>
              <CardDescription>
                View and manage client relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Client management interface will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Manage team members and their assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Team management interface will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                View and export project and team reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Reports interface will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </ManagerLayout>
  );
}