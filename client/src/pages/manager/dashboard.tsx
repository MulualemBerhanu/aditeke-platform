import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Users, Layout, Mail, Calendar, ClipboardList,
  Clock, CheckCircle2, AlertCircle, Plus, Loader2,
  FileText, PencilLine, UserPlus, Trash2
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
  
  // Fetch all clients (users with roleId = 3) - using dedicated endpoint
  const {
    data: clients,
    isLoading: isLoadingClients,
    error: clientsError
  } = useQuery<User[]>({
    queryKey: ['/api/manager/client-options'],
    queryFn: async () => {
      try {
        console.log("Fetching client options from dedicated endpoint");
        const res = await fetch('/api/manager/client-options');
        if (!res.ok) {
          console.error("Client options API returned error:", res.status, res.statusText);
          throw new Error('Failed to load clients');
        }
        const data = await res.json();
        console.log("Received client options:", data);
        return data;
      } catch (error) {
        console.error("Error in client options fetch:", error);
        throw error;
      }
    }
  });
  
  // Mutation to assign a project to a client
  const assignProjectMutation = useMutation({
    mutationFn: async ({ projectId, clientId }: { projectId: number, clientId: number }) => {
      const res = await apiRequest('POST', `/api/projects/${projectId}/assign`, { clientId });
      return await res.json();
    },
    onSuccess: (data: Project) => {
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
      // Get numeric roleId - either directly or convert from string if needed
      const roleIdNum = typeof userData.roleId === 'string' ? parseInt(userData.roleId) : userData.roleId;
      
      // If not a manager (roleId 2), redirect
      if (roleIdNum !== 2) {
        console.log("⚠️ Not authorized as manager, redirecting");
        if (roleIdNum === 1) {
          window.location.href = '/admin/dashboard';
        } else if (roleIdNum === 3) {
          window.location.href = '/client/dashboard';
        } else {
          window.location.href = '/';
        }
      }
    }
  }, [user, setLocation]);

  // Load user data from localStorage if not available in context
  const userData = user || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null);

  // Get numeric roleId for validation
  const roleIdNum = userData ? (typeof userData.roleId === 'string' ? parseInt(userData.roleId) : userData.roleId) : null;
  
  // Check if user is a manager (roleId 2)
  const isManager = userData && roleIdNum === 2;

  if (!userData || !isManager) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium">{userData.name}</p>
            <p className="text-sm text-muted-foreground">Project Manager</p>
          </div>
          <Button variant="outline" onClick={() => logout()}>Logout</Button>
        </div>
      </div>

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
                  <Button size="sm">
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
                      </thead>
                      <tbody>
                        {projects && projects.length > 0 ? (
                          projects.map((project) => {
                            // Find client name for the project if it has a clientId
                            const client = clients?.find(c => c.id === project.clientId);
                            const clientName = client ? client.name : 'Unassigned';
                            
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
                                      setSelectedProjectId(project.id.toString());
                                      setIsAssignProjectDialogOpen(true);
                                    }}
                                  >
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    Assign
                                  </Button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-muted-foreground">
                              No projects found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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
                              {clients && clients.length > 0 ? (
                                clients.map((client) => (
                                  <SelectItem key={client.id} value={client.id.toString()}>
                                    {client.name}
                                  </SelectItem>
                                ))
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
  );
}