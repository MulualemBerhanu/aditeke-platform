import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, FileText, Clock, CheckCircle2, 
  AlertCircle, ExternalLink, Download, Calendar, Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Project } from '@shared/schema';

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const [_, setLocation] = useLocation();
  
  // Function to format dates - handling different date formats (Firebase Timestamp format)
  const formatDate = (dateInput: any) => {
    // If it's a Firebase Timestamp with _seconds property
    if (dateInput && typeof dateInput === 'object' && '_seconds' in dateInput) {
      const date = new Date(dateInput._seconds * 1000);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    // If it's a regular Date object or string
    try {
      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error("Failed to format date:", dateInput);
      return "Invalid date";
    }
  };

  // Redirect if not logged in or not a client - check both API and localStorage
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
      // Get roleId - either directly or convert from string if needed
      const roleIdNum = typeof userData.roleId === 'string' ? parseInt(userData.roleId) : userData.roleId;
      const username = userData.username.toLowerCase();
      
      console.log("🔍 DEBUG - Role check:", { username, roleId: roleIdNum });

      // First, check username pattern for legacy compatibility
      // But immediately after, also check roleId which is more reliable
      if (username.includes('admin') || roleIdNum === 1002) {
        console.log("⚠️ Redirecting to admin dashboard based on role identification");
        window.location.href = '/admin/dashboard';
        return;
      }
      
      if (username.includes('manager') || roleIdNum === 1000) {
        console.log("⚠️ Redirecting to manager dashboard based on role identification");
        window.location.href = '/manager/dashboard';
        return;
      }

      // If not admin or manager, check if the user is a client based on roleId
      if (!username.includes('client') && roleIdNum !== 1001) {
        console.log("⚠️ Not a client by username or roleId, redirecting to home");
        window.location.href = '/';
        return;
      }
      
      // If we reach here, user is confirmed client - either by username or roleId
      console.log("✓ Confirmed client access - either by username or roleId:", roleIdNum);
    }
  }, [user, setLocation]);

  // Load user data from localStorage if not available in context
  const userData = user || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null);

  // Check if user is a client based on either username or roleId
  const isClient = userData && (
    userData.username.toLowerCase().includes('client') || 
    (userData.roleId === 1001 || userData.roleId === "1001")
  );
  
  // Empty projects array - we'll use real data from the API only
  const emptyProjects: Project[] = [];
  
  // Fetch client's projects - only using real data from API
  const { data: projects, isLoading: isLoadingProjects, error: projectsError } = useQuery<Project[]>({
    queryKey: ['/api/clients', userData?.id, 'projects'],
    queryFn: async () => {
      if (!userData?.id) {
        return [];
      }
      
      try {
        console.log(`Attempting to fetch projects for client ID: ${userData.id}`);
        const res = await fetch(`/api/clients/${userData.id}/projects`);
        
        if (!res.ok) {
          console.log("API request failed");
          return [];
        }
        
        const data = await res.json();
        console.log("Projects fetched from API:", data);
        
        // Return an empty array if the API returns no data
        if (!data || !Array.isArray(data)) {
          console.log("API returned invalid data format");
          return [];
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching client projects:", error);
        return [];
      }
    },
    enabled: !!userData?.id && isClient
  });
  
  // Calculate project statistics
  const projectStats = React.useMemo(() => {
    if (!projects) return { active: 0, completed: 0 };
    
    const active = projects.filter(p => p.status !== 'Completed').length;
    const completed = projects.filter(p => p.status === 'Completed').length;
    
    return { active, completed };
  }, [projects]);

  if (!userData || !isClient) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Client Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium">{userData.name}</p>
            <p className="text-sm text-muted-foreground">Client</p>
          </div>
          <Button variant="outline" onClick={() => logout()}>Logout</Button>
        </div>
      </div>

      <Tabs defaultValue="projects" className="mb-8">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-amber-500" />
                  <div className="text-2xl font-bold">{projectStats.active}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  <div className="text-2xl font-bold">{projectStats.completed}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4 text-blue-500" />
                  <div className="text-2xl font-bold">1</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 mt-6">
            {isLoadingProjects ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading projects...</span>
              </div>
            ) : projectsError ? (
              <Card className="py-8">
                <CardContent className="flex flex-col items-center">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-xl font-medium mb-2">Error loading projects</h3>
                  <p className="text-muted-foreground text-center">
                    There was an error loading your projects. Please try again later.
                  </p>
                </CardContent>
              </Card>
            ) : projects && projects.length > 0 ? (
              <>
                {projects.map((project) => {
                  // Calculate progress (for demo purposes - we could add a progress field to the schema)
                  const progress = project.status === 'Completed' ? 100 : 
                                   project.status === 'In Progress' ? 65 :
                                   project.status === 'Design Phase' ? 25 : 10;
                  
                  return (
                    <Card key={project.id}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>{project.title}</CardTitle>
                            <CardDescription>{project.description}</CardDescription>
                          </div>
                          <Badge 
                            className={
                              project.status === 'Completed' ? 'bg-green-500' : 
                              project.status === 'In Progress' ? 'bg-amber-500' :
                              'bg-blue-500'
                            }
                          >
                            {project.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1 text-sm">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Start Date</p>
                              <p className="font-medium">{formatDate(project.startDate)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Expected Completion</p>
                              <p className="font-medium">{project.endDate ? formatDate(project.endDate) : 'TBD'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Category</p>
                              <p className="font-medium">{project.category}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Project ID</p>
                              <p className="font-medium">#{project.id}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2 border-t pt-4">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Contact
                        </Button>
                        <Button size="sm">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Project
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </>
            ) : (
              <Card className="py-8">
                <CardContent className="flex flex-col items-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No projects found</h3>
                  <p className="text-muted-foreground text-center">
                    You don't have any projects assigned to you yet. Please contact your project manager.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="support">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Support Tickets</CardTitle>
                <Button size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  New Ticket
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Ticket ID</th>
                      <th className="text-left py-3 px-2 font-medium">Subject</th>
                      <th className="text-left py-3 px-2 font-medium">Status</th>
                      <th className="text-left py-3 px-2 font-medium">Date</th>
                      <th className="text-left py-3 px-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-2">#45678</td>
                      <td className="py-3 px-2">Issue with payment gateway integration</td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-amber-100 text-amber-800">
                          In Progress
                        </span>
                      </td>
                      <td className="py-3 px-2">Apr 08, 2025</td>
                      <td className="py-3 px-2">
                        <Button variant="ghost" size="sm">View</Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2" colSpan={5}>
                        <div className="flex justify-center text-muted-foreground">
                          No other tickets found
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule a Meeting</CardTitle>
              <CardDescription>Book a meeting with your project manager</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <Button variant="outline" className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Discovery Call
                </Button>
                <Button variant="outline" className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Progress Update
                </Button>
                <Button variant="outline" className="flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Support Call
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Project Documents</CardTitle>
              <CardDescription>Access and download project-related documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">E-commerce Website Project Plan</h3>
                      <p className="text-sm text-muted-foreground">PDF document • 2.4 MB • Uploaded on Mar 12, 2025</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Mobile App Wireframes</h3>
                      <p className="text-sm text-muted-foreground">ZIP archive • 8.7 MB • Uploaded on Apr 05, 2025</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Service Agreement</h3>
                      <p className="text-sm text-muted-foreground">PDF document • 1.2 MB • Uploaded on Mar 10, 2025</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Account settings interface will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}