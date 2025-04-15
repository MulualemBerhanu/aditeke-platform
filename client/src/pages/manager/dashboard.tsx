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
  CheckCircle, FolderPlus, Upload, Folder, FileIcon as FileIconLucide,
  Info, Send, Download as FileDownIcon, ChevronUp, ChevronDown, 
  Phone, Briefcase as BriefcaseIcon
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
import ClientProfileView from '@/components/shared/ClientProfileView';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const [clientPage, setClientPage] = React.useState(1);
  const [clientsPerPage] = React.useState(10);
  
  // Column-specific search state
  const [filters, setFilters] = React.useState({
    title: '',
    client: '',
    status: '',
    deadline: ''
  });
  
  // Client filter state
  const [clientFilters, setClientFilters] = React.useState({
    name: '',
    email: '',
    company: '',
    status: ''
  });
  
  // Function to handle viewing client profile
  const handleViewClient = (clientId: string | number) => {
    setSelectedClientId(String(clientId));
  };
  
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
  
  // Filter clients based on filters
  const filteredClients = React.useMemo(() => {
    if (!clients) return [];
    
    return clients.filter(client => {
      // Apply all filters (return true only if all active filters match)
      const nameMatch = !clientFilters.name || 
        ((client.name || client.username || '').toLowerCase().includes(clientFilters.name.toLowerCase()));
      
      const emailMatch = !clientFilters.email || 
        ((client.email || '').toLowerCase().includes(clientFilters.email.toLowerCase()));
      
      const companyMatch = !clientFilters.company || 
        ((client.company || '').toLowerCase().includes(clientFilters.company.toLowerCase()));
      
      const statusMatch = !clientFilters.status || clientFilters.status === 'all' || 
        (clientFilters.status === 'active' && client.isActive) ||
        (clientFilters.status === 'vip' && client.isVip) ||
        (clientFilters.status === 'inactive' && !client.isActive);
      
      return nameMatch && emailMatch && companyMatch && statusMatch;
    });
  }, [clients, clientFilters]);
  
  // Paginate clients
  const paginatedClients = React.useMemo(() => {
    const indexOfLastClient = clientPage * clientsPerPage;
    const indexOfFirstClient = indexOfLastClient - clientsPerPage;
    return filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  }, [filteredClients, clientPage, clientsPerPage]);
  
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

          {/* Projects Tab */}
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
                                        onClick={() => setLocation(`/manager/project/edit/${project.id}`)}
                                      >
                                        Edit
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-8 text-center">
                                <div className="flex flex-col items-center">
                                  <FileText className="h-10 w-10 text-muted-foreground/50 mb-2" />
                                  <h3 className="text-lg font-medium">No projects found</h3>
                                  <p className="text-muted-foreground max-w-md mt-1">
                                    {Object.values(filters).some(filter => filter.trim() !== '') 
                                      ? 'No projects match your search criteria. Try adjusting your filters or create a new project.'
                                      : 'Get started by creating your first project.'}
                                  </p>
                                  <Button onClick={() => setLocation('/manager/project/create')} className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Project
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {/* Pagination controls */}
                  {filteredProjects.length > 0 && (
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {Math.min(1, filteredProjects.length)}-{Math.min(currentPage * itemsPerPage, filteredProjects.length)} of {filteredProjects.length}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => prev + 1)}
                          disabled={currentPage * itemsPerPage >= filteredProjects.length}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="mt-6">
            {selectedClientId ? (
              <div className="mb-6">
                <ClientProfileView 
                  clientId={selectedClientId} 
                  onClose={() => setSelectedClientId(null)} 
                />
              </div>
            ) : (
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
                          onClick={() => {
                            const status = tab.toLowerCase();
                            setClientFilters(prev => ({
                              ...prev, 
                              status: status === 'all' ? '' : status
                            }));
                            setClientPage(1);
                          }}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            (tab === 'All' && !clientFilters.status) || 
                            (clientFilters.status === tab.toLowerCase())
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
                      <Input 
                        placeholder="Search clients..." 
                        className="pl-8" 
                        value={clientFilters.name}
                        onChange={(e) => {
                          setClientFilters(prev => ({ ...prev, name: e.target.value }));
                          setClientPage(1);
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Select 
                        value={clientFilters.status || "all"}
                        onValueChange={(value) => {
                          setClientFilters(prev => ({ ...prev, status: value === "all" ? "" : value }));
                          setClientPage(1);
                        }}
                      >
                        <SelectTrigger className="w-[140px] h-9">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="vip">VIP</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-[140px] h-9">
                          <SelectValue placeholder="Projects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Projects</SelectItem>
                          <SelectItem value="active">Active Projects</SelectItem>
                          <SelectItem value="none">No Projects</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="name">
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
                  {isLoadingClients ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                      <span>Loading clients...</span>
                    </div>
                  ) : clientsError ? (
                    <div className="flex flex-col items-center py-8">
                      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                      <h3 className="text-xl font-medium mb-2">Error loading clients</h3>
                      <p className="text-muted-foreground text-center">
                        There was an error loading clients. Please try again later.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-md border shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Projects</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredClients.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8">
                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                  <Users className="h-12 w-12 mb-2 opacity-20" />
                                  <h3 className="font-medium text-lg mb-1">No clients found</h3>
                                  <p className="text-sm max-w-md">
                                    No clients match your current search filters. Try adjusting your search or add a new client.
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedClients.map((client) => (
                              <TableRow key={client.id} className="hover:bg-muted/30">
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar>
                                      <AvatarImage src={client.profilePicture || undefined} alt={client.name || client.username} />
                                      <AvatarFallback>
                                        {(client.name || client.username || '').substring(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{client.name || client.username}</div>
                                      <div className="text-sm text-muted-foreground">{client.company || 'No company'}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <div className="flex items-center">
                                      <Mail className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                      <span className="text-sm">{client.email || 'No email'}</span>
                                    </div>
                                    <div className="flex items-center mt-1">
                                      <Phone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                      <span className="text-sm">{client.phone || 'No phone'}</span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <Badge 
                                      variant={client.isActive ? "default" : "secondary"}
                                      className="w-fit"
                                    >
                                      {client.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    {client.isVip && (
                                      <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-300 w-fit">
                                        <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" /> VIP
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1.5">
                                    <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                      {
                                        projects?.filter(p => {
                                          const pClientId = typeof p.clientId === 'string' ? parseInt(p.clientId) : p.clientId;
                                          const cId = typeof client.id === 'string' ? parseInt(client.id) : client.id;
                                          return pClientId === cId;
                                        }).length || 0
                                      }
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-8 px-3"
                                      onClick={() => handleViewClient(client.id)}
                                    >
                                      <Eye className="h-3.5 w-3.5 mr-1" />
                                      View
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                          <Edit className="h-4 w-4 mr-2" />
                                          Edit Client
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Mail className="h-4 w-4 mr-2" />
                                          Send Email
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Plus className="h-4 w-4 mr-2" />
                                          Add Project
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Pagination controls */}
                  {filteredClients.length > 0 && (
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {Math.min(1, filteredClients.length)}-{Math.min(clientPage * clientsPerPage, filteredClients.length)} of {filteredClients.length}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setClientPage(prev => Math.max(prev - 1, 1))}
                          disabled={clientPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setClientPage(prev => prev + 1)}
                          disabled={clientPage * clientsPerPage >= filteredClients.length}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team">
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-medium mb-2">Team Management</h3>
              <p>Team management functionality will be implemented soon.</p>
            </div>
          </TabsContent>
          
          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="text-center py-12 text-muted-foreground">
              <BarChart2 className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-medium mb-2">Reports & Analytics</h3>
              <p>Reports and analytics functionality will be implemented soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ManagerLayout>
  );
}