import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import ManagerLayout from '@/components/manager/ManagerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Users, Layout, Mail, Calendar, ClipboardList,
  Clock, CheckCircle2, AlertCircle, Plus, Loader2,
  FileText, PencilLine, UserPlus, Trash2, Edit, X,
  Eye, MoreHorizontal, Building, Star, Briefcase, Zap,
  Download, Search, DollarSign, MessageSquare, PlusCircle,
  CheckCircle, FolderPlus, Upload, Folder, FileIcon as FileIconLucide, Table,
  Info, Send, Download as FileDownIcon, ChevronUp, ChevronDown
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
  
  // Helper component for filter inputs
  const FilterInput = ({ 
    placeholder, 
    value, 
    onChange,
  }: { 
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-sm bg-background/50 focus:bg-background transition-colors"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange('')}
          className="h-5 w-5 p-0 absolute right-2 top-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full flex items-center justify-center"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
  
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
                  <div className="overflow-x-auto rounded-md border shadow-sm">
                    <table className="w-full divide-y divide-gray-200">
                      <thead className="bg-muted/50">
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Project Name</th>
                          <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Client</th>
                          <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Deadline</th>
                          <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Actions</th>
                        </tr>
                        <tr>
                          <th className="py-2 px-4">
                            <FilterInput 
                              placeholder="Search project name..."
                              value={filters.title}
                              onChange={(value) => {
                                setFilters(prev => ({ ...prev, title: value }));
                                setCurrentPage(1); // Reset to first page on search
                              }}
                            />
                          </th>
                          <th className="py-2 px-4">
                            <FilterInput 
                              placeholder="Search client..."
                              value={filters.client}
                              onChange={(value) => {
                                setFilters(prev => ({ ...prev, client: value }));
                                setCurrentPage(1);
                              }}
                            />
                          </th>
                          <th className="py-2 px-4">
                            <FilterInput 
                              placeholder="Search status..."
                              value={filters.status}
                              onChange={(value) => {
                                setFilters(prev => ({ ...prev, status: value }));
                                setCurrentPage(1);
                              }}
                            />
                          </th>
                          <th className="py-2 px-4">
                            <FilterInput 
                              placeholder="Search deadline..."
                              value={filters.deadline}
                              onChange={(value) => {
                                setFilters(prev => ({ ...prev, deadline: value }));
                                setCurrentPage(1);
                              }}
                            />
                          </th>
                          <th className="py-2 px-4">
                            {/* Global clear filters button */}
                            {Object.values(filters).some(filter => filter.trim() !== '') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setFilters({ title: '', client: '', status: '', deadline: '' });
                                  setCurrentPage(1);
                                }}
                                className="h-8 text-xs w-full flex items-center justify-center border border-dashed hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Clear all filters
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
                              <tr key={project.id} className="border-b hover:bg-muted/30 transition-colors">
                                <td className="py-4 px-4 font-medium">{project.title}</td>
                                <td className="py-4 px-4">{clientName}</td>
                                <td className="py-4 px-4">
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                    project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                    project.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                                    project.status === 'Delayed' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {project.status}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-muted-foreground">
                                  {project.endDate ? formatDate(project.endDate) : 'No deadline'}
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex space-x-2">
                                    <Button variant="outline" size="sm" className="h-8 px-3">
                                      View
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="h-8 px-3"
                                      onClick={() => {
                                        setLocation(`/manager/project/edit/${project.id}`);
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-1" />
                                      Edit
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-12 text-center">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                                <p className="text-lg font-medium">
                                  {Object.values(filters).some(filter => filter.trim() !== '') 
                                    ? 'No matching projects found' 
                                    : 'No projects found'}
                                </p>
                                <p className="text-muted-foreground text-sm max-w-md">
                                  {Object.values(filters).some(filter => filter.trim() !== '')
                                    ? 'Try adjusting your search filters or clear them to see all projects.'
                                    : 'Get started by creating your first project with the "New Project" button.'}
                                </p>
                                {Object.values(filters).some(filter => filter.trim() !== '') && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setFilters({ title: '', client: '', status: '', deadline: '' });
                                      setCurrentPage(1);
                                    }}
                                    className="mt-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Clear all filters
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    
                    {/* Pagination controls */}
                    {filteredProjects.length > 0 && (
                      <div className="flex justify-between items-center mt-6 bg-muted/40 p-3 rounded-md">
                        <div className="text-sm text-muted-foreground flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Showing <span className="font-medium mx-1">{Math.min(filteredProjects.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span className="font-medium mx-1">{Math.min(filteredProjects.length, currentPage * itemsPerPage)}</span> of <span className="font-medium mx-1">{filteredProjects.length}</span> projects
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            className="h-8 px-3 hover:bg-background"
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
                                    className="w-8 h-8 p-0 font-medium text-sm hover:bg-background"
                                    onClick={() => setCurrentPage(1)}
                                  >
                                    1
                                  </Button>
                                );
                                
                                // Ellipsis if there's a gap
                                if (startPage > 2) {
                                  pageButtons.push(
                                    <span key="ellipsis1" className="px-1 text-muted-foreground">•••</span>
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
                                    className="w-8 h-8 p-0 font-medium text-sm hover:bg-background"
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
                                    <span key="ellipsis2" className="px-1 text-muted-foreground">•••</span>
                                  );
                                }
                                
                                pageButtons.push(
                                  <Button 
                                    key="last"
                                    variant={currentPage === totalPages ? "default" : "outline"} 
                                    size="sm"
                                    className="w-8 h-8 p-0 font-medium text-sm hover:bg-background"
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
                            className="h-8 px-3 hover:bg-background"
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
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>
                  View and manage client relationships
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button size="sm" className="gap-1">
                  <UserPlus className="h-4 w-4" />
                  Add Client
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Tabs for client categories */}
              <div className="border-b mb-6">
                <nav className="-mb-px flex space-x-6">
                  {['All', 'Active', 'VIP', 'Prospects', 'Archived'].map((tab) => (
                    <button
                      key={tab}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        tab === 'All'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* Search and filter controls */}
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search clients..." className="pl-8" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select defaultValue="status">
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="status">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="projects">
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="Projects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="projects">All Projects</SelectItem>
                      <SelectItem value="active">Active Projects</SelectItem>
                      <SelectItem value="none">No Projects</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="date">
                    <SelectTrigger className="w-[160px] h-9">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Latest Contact</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="projects">Most Projects</SelectItem>
                      <SelectItem value="billed">Highest Billed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Clients Table */}
              <div className="overflow-x-auto rounded-md border shadow-sm">
                <table className="w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Client Name</th>
                      <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Email / Contact</th>
                      <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Assigned Manager</th>
                      <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Projects</th>
                      <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Total Billed</th>
                      <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Last Invoice</th>
                      <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-gray-200">
                    {/* First Client Row */}
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                            <Building className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">TechCorp Solutions</div>
                            <div className="text-xs text-muted-foreground">Business Software</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">john.doe@techcorp.com</div>
                        <div className="text-xs text-muted-foreground">+1 (555) 123-4567</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">Sarah Williams</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        3
                      </td>
                      <td className="py-4 px-4 text-sm font-medium">
                        $24,500
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        Apr 10, 2025
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Second Client Row */}
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 mr-3">
                            <Star className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">Global Marketing Ltd</div>
                            <div className="text-xs text-muted-foreground">Marketing Agency</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">jane.smith@globalmarketing.com</div>
                        <div className="text-xs text-muted-foreground">+1 (555) 987-6543</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">Mike Chen</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                          VIP
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        5
                      </td>
                      <td className="py-4 px-4 text-sm font-medium">
                        $42,300
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        Apr 03, 2025
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Third Client Row */}
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-3">
                            <Briefcase className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">Pinnacle Enterprises</div>
                            <div className="text-xs text-muted-foreground">Finance & Consulting</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">robert.johnson@pinnacle.com</div>
                        <div className="text-xs text-muted-foreground">+1 (555) 333-7777</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">Alex Johnson</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
                          Inactive
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        1
                      </td>
                      <td className="py-4 px-4 text-sm font-medium">
                        $8,750
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        Feb 20, 2025
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Fourth Client Row */}
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-800 mr-3">
                            <Zap className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">Fusion Technologies</div>
                            <div className="text-xs text-muted-foreground">Tech Startup</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">emily.wilson@fusion.tech</div>
                        <div className="text-xs text-muted-foreground">+1 (555) 222-8888</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">Sarah Williams</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                          Prospect
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        0
                      </td>
                      <td className="py-4 px-4 text-sm font-medium">
                        $0
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        -
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">4</span> of <span className="font-medium">12</span> clients
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Client View/Edit Dialog */}
          <Dialog>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Client Profile</DialogTitle>
                <DialogDescription>
                  View and manage client information, projects, billing, and files.
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="overview">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="billing">Pricing & Billing</TabsTrigger>
                  <TabsTrigger value="files">Files & Docs</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Client Info Card */}
                    <Card className="col-span-1">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Client Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-center mb-4">
                          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Building className="h-8 w-8" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-center">
                            <h3 className="font-bold text-lg">TechCorp Solutions</h3>
                            <p className="text-sm text-muted-foreground">Business Software</p>
                          </div>
                          <Separator />
                          <div className="grid grid-cols-[100px_1fr] gap-1 text-sm">
                            <div className="text-muted-foreground">Contact:</div>
                            <div className="font-medium">John Doe</div>
                            <div className="text-muted-foreground">Email:</div>
                            <div className="font-medium">john.doe@techcorp.com</div>
                            <div className="text-muted-foreground">Phone:</div>
                            <div className="font-medium">+1 (555) 123-4567</div>
                            <div className="text-muted-foreground">Address:</div>
                            <div className="font-medium">123 Tech Blvd, San Francisco, CA</div>
                          </div>
                          <div className="pt-2">
                            <Label className="text-xs text-muted-foreground mb-1 block">Tags</Label>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="bg-green-50">Active</Badge>
                              <Badge variant="outline" className="bg-blue-50">Enterprise</Badge>
                              <Badge variant="outline" className="bg-purple-50">Tech</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Projects Summary */}
                    <Card className="col-span-1 md:col-span-2">
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Project Summary</CardTitle>
                        <Button variant="ghost" size="sm" className="h-8 gap-1">
                          <Plus className="h-3.5 w-3.5" />
                          New Project
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Project Card 1 */}
                          <div className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">CRM Implementation</h4>
                              <Badge>In Progress</Badge>
                            </div>
                            <div className="mb-3 text-sm text-muted-foreground line-clamp-2">
                              Complete implementation of custom CRM solution with sales pipeline and analytics dashboard.
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex gap-3">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>Due May 30, 2025</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <DollarSign className="h-3.5 w-3.5" />
                                  <span>$12,500</span>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                58% Complete
                              </div>
                            </div>
                            <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                              <div className="bg-primary h-1.5 rounded-full" style={{ width: '58%' }}></div>
                            </div>
                          </div>
                          
                          {/* Project Card 2 */}
                          <div className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">Website Redesign</h4>
                              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">Completed</Badge>
                            </div>
                            <div className="mb-3 text-sm text-muted-foreground line-clamp-2">
                              Complete redesign of corporate website with modern UI/UX and responsive design.
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex gap-3">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>Completed Apr 10, 2025</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <DollarSign className="h-3.5 w-3.5" />
                                  <span>$8,000</span>
                                </div>
                              </div>
                              <div className="text-xs text-green-600">
                                100% Complete
                              </div>
                            </div>
                            <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                              <div className="bg-green-500 h-1.5 rounded-full w-full"></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Activity & Notes */}
                    <Card className="col-span-1 md:col-span-3">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-lg">Activity & Notes</CardTitle>
                          <Button variant="ghost" size="sm" className="h-8 gap-1">
                            <PlusCircle className="h-3.5 w-3.5" />
                            Add Note
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                              <MessageSquare className="h-4 w-4" />
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">Client Meeting Note</h4>
                                <span className="text-xs text-muted-foreground">Apr 12, 2025</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Discussion about expanding the current CRM project to include additional sales analytics features. Client is interested in Q3 implementation.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 shrink-0">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">Invoice #1043 Sent</h4>
                                <span className="text-xs text-muted-foreground">Apr 10, 2025</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Final payment invoice for the Website Redesign project sent to john.doe@techcorp.com
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 shrink-0">
                              <CheckCircle className="h-4 w-4" />
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">Project Completed</h4>
                                <span className="text-xs text-muted-foreground">Apr 10, 2025</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Website Redesign project marked as completed. All deliverables have been approved by the client.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="projects" className="pt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Client Projects</h3>
                      <Button className="gap-1">
                        <Plus className="h-4 w-4" />
                        Create New Project
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Project Card 1 */}
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle>CRM Implementation</CardTitle>
                            <Badge>In Progress</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Complete implementation of custom CRM solution with sales pipeline and analytics dashboard.
                          </p>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Timeline:</span>
                              <span>Mar 15 - May 30, 2025</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Budget:</span>
                              <span className="font-medium">$12,500</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Team:</span>
                              <span>3 members</span>
                            </div>
                            <div className="pt-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Progress:</span>
                                <span>58%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: '58%' }}></div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" size="sm">Details</Button>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Project Card 2 */}
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <CardTitle>Website Redesign</CardTitle>
                            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">Completed</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Complete redesign of corporate website with modern UI/UX and responsive design.
                          </p>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Timeline:</span>
                              <span>Feb 1 - Apr 10, 2025</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Budget:</span>
                              <span className="font-medium">$8,000</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Team:</span>
                              <span>2 members</span>
                            </div>
                            <div className="pt-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Progress:</span>
                                <span className="text-green-600">100%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end gap-2">
                            <Button variant="outline" size="sm">Details</Button>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Project Card 3 - Next Project */}
                      <Card className="border-dashed border-2">
                        <CardContent className="flex flex-col items-center justify-center h-full py-8">
                          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
                            <Plus className="h-6 w-6" />
                          </div>
                          <h3 className="font-medium text-lg mb-1">New Project</h3>
                          <p className="text-sm text-muted-foreground text-center mb-4">
                            Create a new project for this client
                          </p>
                          <Button className="gap-1">
                            <Plus className="h-4 w-4" />
                            Create Project
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="billing" className="pt-4">
                  <div className="space-y-8">
                    {/* Payment Structure Section */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Payment Structure</h3>
                      <div className="bg-muted/50 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="h-4 w-4 text-muted-foreground" />
                          <h4 className="font-medium">Default Payment Terms</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          The default payment structure for this client is <strong>40% Upfront + Remaining on Completion</strong>.
                          You can override this setting for individual projects if needed.
                        </p>
                        <div className="flex gap-4">
                          <Button variant="outline" size="sm">Edit Terms</Button>
                          <Select defaultValue="split">
                            <SelectTrigger className="w-[220px] h-9">
                              <SelectValue placeholder="Payment structure" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full">Full Payment Upfront</SelectItem>
                              <SelectItem value="split">40% Upfront + 60% on Completion</SelectItem>
                              <SelectItem value="milestones">Custom Milestones</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Billing Timeline */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Billing Timeline</h3>
                        <Button variant="outline" size="sm" className="gap-1">
                          <PlusCircle className="h-4 w-4" />
                          Add Payment Phase
                        </Button>
                      </div>
                      
                      <div className="overflow-x-auto rounded-md border shadow-sm">
                        <table className="w-full divide-y divide-border">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Payment Phase</th>
                              <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Amount</th>
                              <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Status</th>
                              <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Due Date</th>
                              <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-background divide-y divide-gray-200">
                            <tr className="hover:bg-muted/30 transition-colors">
                              <td className="py-4 px-4">
                                <div className="font-medium">Initial Payment (40%)</div>
                                <div className="text-xs text-muted-foreground">CRM Implementation</div>
                              </td>
                              <td className="py-4 px-4 font-medium">$5,000</td>
                              <td className="py-4 px-4">
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                                  Paid
                                </span>
                              </td>
                              <td className="py-4 px-4 text-muted-foreground">Mar 15, 2025</td>
                              <td className="py-4 px-4">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm" className="h-8 px-2">
                                    <FileText className="h-4 w-4 mr-1" />
                                    Receipt
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            <tr className="hover:bg-muted/30 transition-colors">
                              <td className="py-4 px-4">
                                <div className="font-medium">Final Payment (60%)</div>
                                <div className="text-xs text-muted-foreground">CRM Implementation</div>
                              </td>
                              <td className="py-4 px-4 font-medium">$7,500</td>
                              <td className="py-4 px-4">
                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                                  Pending
                                </span>
                              </td>
                              <td className="py-4 px-4 text-muted-foreground">May 30, 2025</td>
                              <td className="py-4 px-4">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm" className="h-8 px-2">
                                    <Send className="h-4 w-4 mr-1" />
                                    Send Link
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            <tr className="hover:bg-muted/30 transition-colors">
                              <td className="py-4 px-4">
                                <div className="font-medium">Full Payment</div>
                                <div className="text-xs text-muted-foreground">Website Redesign</div>
                              </td>
                              <td className="py-4 px-4 font-medium">$8,000</td>
                              <td className="py-4 px-4">
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                                  Paid
                                </span>
                              </td>
                              <td className="py-4 px-4 text-muted-foreground">Apr 10, 2025</td>
                              <td className="py-4 px-4">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm" className="h-8 px-2">
                                    <FileText className="h-4 w-4 mr-1" />
                                    Receipt
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* Invoice Generator */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Invoice Generator</h3>
                        <Button className="gap-1">
                          <FileDownIcon className="h-4 w-4" />
                          Generate Invoice
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Invoice Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-3">
                                  <div className="flex-1">
                                    <Label htmlFor="item1" className="mb-1 block">Item Description</Label>
                                    <Input id="item1" defaultValue="CRM Implementation - Final Payment" />
                                  </div>
                                  <div className="w-24 ml-4">
                                    <Label htmlFor="amount1" className="mb-1 block">Amount</Label>
                                    <Input id="amount1" defaultValue="7500" className="text-right" />
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between border-b pb-3">
                                  <div className="flex-1">
                                    <Label htmlFor="item2" className="mb-1 block">Item Description</Label>
                                    <Input id="item2" defaultValue="Additional Customization" />
                                  </div>
                                  <div className="w-24 ml-4">
                                    <Label htmlFor="amount2" className="mb-1 block">Amount</Label>
                                    <Input id="amount2" defaultValue="1200" className="text-right" />
                                  </div>
                                </div>
                                
                                <Button variant="outline" className="w-full gap-1">
                                  <Plus className="h-4 w-4" />
                                  Add Item
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium">Invoice Settings</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="invoiceNumber" className="mb-1 block">Invoice #</Label>
                                    <Input id="invoiceNumber" defaultValue="INV-1044" />
                                  </div>
                                  <div>
                                    <Label htmlFor="dueDate" className="mb-1 block">Due Date</Label>
                                    <Input id="dueDate" type="date" defaultValue="2025-05-30" />
                                  </div>
                                </div>
                                
                                <div>
                                  <Label htmlFor="taxRate" className="mb-1 block">Tax Rate (%)</Label>
                                  <Input id="taxRate" type="number" defaultValue="7.5" />
                                </div>
                                
                                <div className="border rounded-md p-3 bg-muted/50">
                                  <div className="flex justify-between mb-2">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span className="font-medium">$8,700.00</span>
                                  </div>
                                  <div className="flex justify-between mb-2">
                                    <span className="text-muted-foreground">Tax (7.5%):</span>
                                    <span className="font-medium">$652.50</span>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t">
                                    <span className="font-medium">Total:</span>
                                    <span className="font-bold">$9,352.50</span>
                                  </div>
                                </div>
                                
                                <Select defaultValue="usd">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Currency" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="usd">USD - US Dollar</SelectItem>
                                    <SelectItem value="eur">EUR - Euro</SelectItem>
                                    <SelectItem value="gbp">GBP - British Pound</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                    
                    {/* Billing History */}
                    <div>
                      <h3 className="text-lg font-medium mb-4">Billing History</h3>
                      
                      <div className="overflow-x-auto rounded-md border shadow-sm">
                        <table className="w-full divide-y divide-border">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Invoice #</th>
                              <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Date</th>
                              <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Amount</th>
                              <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Status</th>
                              <th className="text-left py-3 px-4 font-medium text-sm uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-background divide-y divide-gray-200">
                            <tr className="hover:bg-muted/30 transition-colors">
                              <td className="py-4 px-4">
                                <div className="font-medium">INV-1043</div>
                              </td>
                              <td className="py-4 px-4">Apr 10, 2025</td>
                              <td className="py-4 px-4 font-medium">$8,000.00</td>
                              <td className="py-4 px-4">
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                                  Paid
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm" className="h-8 px-2">
                                    <FileText className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 px-2">
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            <tr className="hover:bg-muted/30 transition-colors">
                              <td className="py-4 px-4">
                                <div className="font-medium">INV-1042</div>
                              </td>
                              <td className="py-4 px-4">Mar 15, 2025</td>
                              <td className="py-4 px-4 font-medium">$5,000.00</td>
                              <td className="py-4 px-4">
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                                  Paid
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm" className="h-8 px-2">
                                    <FileText className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 px-2">
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            <tr className="hover:bg-muted/30 transition-colors">
                              <td className="py-4 px-4">
                                <div className="font-medium">INV-1040</div>
                              </td>
                              <td className="py-4 px-4">Feb 20, 2025</td>
                              <td className="py-4 px-4 font-medium">$3,200.00</td>
                              <td className="py-4 px-4">
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                                  Paid
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="sm" className="h-8 px-2">
                                    <FileText className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 px-2">
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="files" className="pt-4">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Files & Documents</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <FolderPlus className="h-4 w-4" />
                          New Folder
                        </Button>
                        <Button size="sm" className="gap-1">
                          <Upload className="h-4 w-4" />
                          Upload
                        </Button>
                      </div>
                    </div>
                    
                    {/* File categories */}
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" className="rounded-full">All Files</Button>
                      <Button variant="outline" size="sm" className="rounded-full">Contracts</Button>
                      <Button variant="outline" size="sm" className="rounded-full">Invoices</Button>
                      <Button variant="outline" size="sm" className="rounded-full">Reports</Button>
                      <Button variant="outline" size="sm" className="rounded-full">Designs</Button>
                      <Button variant="outline" size="sm" className="rounded-full">Feedback</Button>
                    </div>
                    
                    {/* File grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {/* Contract folder */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex gap-2 items-center">
                              <Folder className="h-6 w-6 text-blue-500" />
                              <h4 className="font-medium">Contracts</h4>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">3 files, updated Apr 10</p>
                        </div>
                      </div>
                      
                      {/* PDF file */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="h-32 bg-red-50 flex items-center justify-center">
                          <FileText className="h-12 w-12 text-red-500" />
                        </div>
                        <div className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-sm truncate">Website_Proposal_v2.pdf</h4>
                              <p className="text-xs text-muted-foreground">Feb 15, 2025 · 1.2 MB</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Word document */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="h-32 bg-blue-50 flex items-center justify-center">
                          <FileIconLucide className="h-12 w-12 text-blue-600" />
                        </div>
                        <div className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-sm truncate">CRM_Requirements.docx</h4>
                              <p className="text-xs text-muted-foreground">Mar 22, 2025 · 650 KB</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Image file */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="h-32 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=300&auto=format')" }}>
                        </div>
                        <div className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-sm truncate">Logo_Final_Design.png</h4>
                              <p className="text-xs text-muted-foreground">Apr 5, 2025 · 2.4 MB</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Excel file */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="h-32 bg-green-50 flex items-center justify-center">
                          <Table className="h-12 w-12 text-green-600" />
                        </div>
                        <div className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-sm truncate">Project_Timeline.xlsx</h4>
                              <p className="text-xs text-muted-foreground">Mar 30, 2025 · 850 KB</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Upload Box */}
                      <div className="border border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <h4 className="font-medium text-sm">Drop files here or click to upload</h4>
                        <p className="text-xs text-muted-foreground">
                          PDF, DOCX, XLSX, PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="pt-4">
                  <div className="space-y-6">
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-medium mb-4">Client Settings</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage client account settings, preferences, and access.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">General Information</h4>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="clientName">Client Name</Label>
                            <Input id="clientName" defaultValue="TechCorp Solutions" />
                          </div>
                          <div>
                            <Label htmlFor="industry">Industry</Label>
                            <Input id="industry" defaultValue="Business Software" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="phone">Phone</Label>
                              <Input id="phone" defaultValue="+1 (555) 123-4567" />
                            </div>
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input id="email" defaultValue="john.doe@techcorp.com" />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="address">Address</Label>
                            <Textarea id="address" className="resize-none" defaultValue="123 Tech Blvd, San Francisco, CA" />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Client Portal Access</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between py-2">
                            <div>
                              <div className="font-medium">Portal Access</div>
                              <div className="text-sm text-muted-foreground">Allow client to access portal</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <div>
                              <div className="font-medium">Project Updates</div>
                              <div className="text-sm text-muted-foreground">Send automatic project updates</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <div>
                              <div className="font-medium">Invoice Emails</div>
                              <div className="text-sm text-muted-foreground">Send invoice notifications</div>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between py-2 border-t mt-2">
                            <div>
                              <div className="font-medium">Reset Password</div>
                              <div className="text-sm text-muted-foreground">Send password reset email</div>
                            </div>
                            <Button variant="outline" size="sm">Send Reset Link</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-3">Client Tags & Categories</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="bg-green-50 flex items-center gap-1">
                          Active
                          <X className="h-3 w-3 ml-1 cursor-pointer" />
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 flex items-center gap-1">
                          Enterprise
                          <X className="h-3 w-3 ml-1 cursor-pointer" />
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 flex items-center gap-1">
                          Tech
                          <X className="h-3 w-3 ml-1 cursor-pointer" />
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="Add new tag..." className="w-auto" />
                        <Button variant="outline">Add</Button>
                      </div>
                    </div>
                    
                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-3 text-red-600">Danger Zone</h4>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h5 className="font-medium text-red-800">Archive Client</h5>
                            <p className="text-sm text-red-600">
                              Archiving will hide this client from active views but keep all data intact.
                            </p>
                          </div>
                          <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-100 hover:text-red-800">
                            Archive Client
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="team">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="text-2xl font-bold">12</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-amber-500" />
                  <div className="text-2xl font-bold">85%</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Project Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Briefcase className="mr-2 h-4 w-4 text-blue-500" />
                  <div className="text-2xl font-bold">24</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Team Members</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Team Member</DialogTitle>
                        <DialogDescription>Add a new developer or designer to your team.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">Full Name</Label>
                          <Input id="name" className="col-span-3" placeholder="John Smith" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">Email</Label>
                          <Input id="email" className="col-span-3" placeholder="john.smith@example.com" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="role" className="text-right">Role</Label>
                          <Select>
                            <SelectTrigger id="role" className="col-span-3">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="frontend">Frontend Developer</SelectItem>
                              <SelectItem value="backend">Backend Developer</SelectItem>
                              <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                              <SelectItem value="ui">UI Designer</SelectItem>
                              <SelectItem value="ux">UX Designer</SelectItem>
                              <SelectItem value="qa">QA Engineer</SelectItem>
                              <SelectItem value="pm">Project Manager</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="level" className="text-right">Level</Label>
                          <Select>
                            <SelectTrigger id="level" className="col-span-3">
                              <SelectValue placeholder="Select a level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="junior">Junior</SelectItem>
                              <SelectItem value="mid">Mid-Level</SelectItem>
                              <SelectItem value="senior">Senior</SelectItem>
                              <SelectItem value="lead">Team Lead</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Team Member</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border shadow-sm">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          <div className="flex items-center gap-1">
                            Name
                            <div className="flex flex-col ml-1">
                              <ChevronUp className="h-3 w-3 text-muted-foreground/70" />
                              <ChevronDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </div>
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Projects</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">
                          <div className="flex items-center gap-1">
                            Utilization
                            <div className="flex flex-col ml-1">
                              <ChevronUp className="h-3 w-3 text-muted-foreground/70" />
                              <ChevronDown className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </div>
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-gray-200">
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                              JS
                            </div>
                            <div>
                              <div className="font-medium">James Smith</div>
                              <div className="text-sm text-muted-foreground">james.smith@example.com</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Full Stack Developer</Badge>
                            <div className="text-sm text-muted-foreground mt-1">Senior</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>3 projects</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1 w-32">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">90%</span>
                              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">High</Badge>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500 rounded-full" style={{ width: '90%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Eye className="h-4 w-4 mr-1" />
                              Profile
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>

                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                              EW
                            </div>
                            <div>
                              <div className="font-medium">Emily Williams</div>
                              <div className="text-sm text-muted-foreground">emily.williams@example.com</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <Badge variant="outline" className="bg-violet-50 text-violet-700 hover:bg-violet-50">UI Designer</Badge>
                            <div className="text-sm text-muted-foreground mt-1">Mid-Level</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>2 projects</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1 w-32">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">75%</span>
                              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Eye className="h-4 w-4 mr-1" />
                              Profile
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>

                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                              AJ
                            </div>
                            <div>
                              <div className="font-medium">Alex Johnson</div>
                              <div className="text-sm text-muted-foreground">alex.johnson@example.com</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Backend Developer</Badge>
                            <div className="text-sm text-muted-foreground mt-1">Senior</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>4 projects</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1 w-32">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">100%</span>
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overload</Badge>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Eye className="h-4 w-4 mr-1" />
                              Profile
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>

                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                              RL
                            </div>
                            <div>
                              <div className="font-medium">Rachel Lee</div>
                              <div className="text-sm text-muted-foreground">rachel.lee@example.com</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <Badge variant="outline" className="bg-rose-50 text-rose-700 hover:bg-rose-50">QA Engineer</Badge>
                            <div className="text-sm text-muted-foreground mt-1">Junior</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>2 projects</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1 w-32">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">50%</span>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: '50%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Eye className="h-4 w-4 mr-1" />
                              Profile
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>

                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                              MK
                            </div>
                            <div>
                              <div className="font-medium">Michael Kim</div>
                              <div className="text-sm text-muted-foreground">michael.kim@example.com</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50">Frontend Developer</Badge>
                            <div className="text-sm text-muted-foreground mt-1">Mid-Level</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>3 projects</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1 w-32">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">85%</span>
                              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">High</Badge>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Eye className="h-4 w-4 mr-1" />
                              Profile
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Team Skills Distribution</CardTitle>
                <CardDescription>Overview of team skill composition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="font-medium text-sm">Full Stack</div>
                      <div className="text-sm text-muted-foreground">3 members</div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="font-medium text-sm">Frontend</div>
                      <div className="text-sm text-muted-foreground">4 members</div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: '33%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="font-medium text-sm">Backend</div>
                      <div className="text-sm text-muted-foreground">2 members</div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '17%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="font-medium text-sm">UI/UX Design</div>
                      <div className="text-sm text-muted-foreground">2 members</div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: '17%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="font-medium text-sm">QA</div>
                      <div className="text-sm text-muted-foreground">1 member</div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: '8%' }}></div>
                    </div>
                  </div>

                  <Separator className="my-2" />
                  
                  <div>
                    <h4 className="font-medium mb-3">Experience Level</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="font-medium text-xl">2</div>
                        <div className="text-sm text-muted-foreground">Senior</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="font-medium text-xl">5</div>
                        <div className="text-sm text-muted-foreground">Mid-Level</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="font-medium text-xl">3</div>
                        <div className="text-sm text-muted-foreground">Junior</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="font-medium text-xl">2</div>
                        <div className="text-sm text-muted-foreground">Lead</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Current Project Assignments</CardTitle>
                <CardDescription>Team member project allocations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-md border shadow-sm">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-sm">Project</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Team Member</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Time Allocated</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-gray-200">
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium">E-commerce Platform</div>
                          <div className="text-sm text-muted-foreground">TechCorp Solutions</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-2">
                              JS
                            </div>
                            <div>James Smith</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">Lead Developer</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>40 hours/week</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Active</Badge>
                        </td>
                      </tr>

                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium">Mobile Banking App</div>
                          <div className="text-sm text-muted-foreground">Finance Plus Inc</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-2">
                              AJ
                            </div>
                            <div>Alex Johnson</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">Backend Developer</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>30 hours/week</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Active</Badge>
                        </td>
                      </tr>

                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium">CRM System Redesign</div>
                          <div className="text-sm text-muted-foreground">Global Services Ltd</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-2">
                              EW
                            </div>
                            <div>Emily Williams</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">UI Designer</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>25 hours/week</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Planning</Badge>
                        </td>
                      </tr>

                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium">Healthcare Portal</div>
                          <div className="text-sm text-muted-foreground">MediCare Systems</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-2">
                              MK
                            </div>
                            <div>Michael Kim</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">Frontend Developer</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>35 hours/week</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Active</Badge>
                        </td>
                      </tr>

                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium">Inventory Management System</div>
                          <div className="text-sm text-muted-foreground">Retail Solutions Co</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-2">
                              RL
                            </div>
                            <div>Rachel Lee</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">QA Engineer</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>20 hours/week</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Testing</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Resource Allocation</CardTitle>
                <CardDescription>Weekly hours by project</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="font-medium text-sm">E-commerce Platform</div>
                      <div className="text-sm">90 hours</div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="font-medium text-sm">Mobile Banking App</div>
                      <div className="text-sm">75 hours</div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="font-medium text-sm">CRM System Redesign</div>
                      <div className="text-sm">60 hours</div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="font-medium text-sm">Healthcare Portal</div>
                      <div className="text-sm">45 hours</div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="font-medium text-sm">Inventory Management</div>
                      <div className="text-sm">30 hours</div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  <div className="pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Assign New Project
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Assign Project</DialogTitle>
                          <DialogDescription>
                            Assign team members to a project and allocate their time.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="project">Project</Label>
                            <Select>
                              <SelectTrigger id="project">
                                <SelectValue placeholder="Select project" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ecommerce">E-commerce Platform</SelectItem>
                                <SelectItem value="banking">Mobile Banking App</SelectItem>
                                <SelectItem value="crm">CRM System Redesign</SelectItem>
                                <SelectItem value="healthcare">Healthcare Portal</SelectItem>
                                <SelectItem value="inventory">Inventory Management</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="member">Team Member</Label>
                            <Select>
                              <SelectTrigger id="member">
                                <SelectValue placeholder="Select team member" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="james">James Smith</SelectItem>
                                <SelectItem value="emily">Emily Williams</SelectItem>
                                <SelectItem value="alex">Alex Johnson</SelectItem>
                                <SelectItem value="rachel">Rachel Lee</SelectItem>
                                <SelectItem value="michael">Michael Kim</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="role">Project Role</Label>
                            <Input id="role" placeholder="e.g. Lead Developer" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="hours">Weekly Hours</Label>
                            <Input id="hours" type="number" min="1" max="40" placeholder="Hours per week" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select>
                              <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="testing">Testing</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Assign</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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