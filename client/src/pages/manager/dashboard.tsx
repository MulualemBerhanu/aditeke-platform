import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Users, Layout, Mail, Calendar, ClipboardList,
  Clock, CheckCircle2, AlertCircle, Plus
} from 'lucide-react';

export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const [_, setLocation] = useLocation();

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
                  <div className="text-2xl font-bold">24</div>
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
                  <div className="text-2xl font-bold">14</div>
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
                  <div className="text-2xl font-bold">10</div>
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Project Name</th>
                        <th className="text-left py-3 px-2 font-medium">Client</th>
                        <th className="text-left py-3 px-2 font-medium">Status</th>
                        <th className="text-left py-3 px-2 font-medium">Deadline</th>
                        <th className="text-left py-3 px-2 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-2">E-commerce Platform</td>
                        <td className="py-3 px-2">FashionTrend Inc.</td>
                        <td className="py-3 px-2">
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-amber-100 text-amber-800">
                            In Progress
                          </span>
                        </td>
                        <td className="py-3 px-2">Jun 15, 2025</td>
                        <td className="py-3 px-2">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-2">CRM Integration</td>
                        <td className="py-3 px-2">SalesPro Solutions</td>
                        <td className="py-3 px-2">
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-green-100 text-green-800">
                            Completed
                          </span>
                        </td>
                        <td className="py-3 px-2">May 30, 2025</td>
                        <td className="py-3 px-2">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-2">Mobile App Development</td>
                        <td className="py-3 px-2">HealthTech Solutions</td>
                        <td className="py-3 px-2">
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-red-100 text-red-800">
                            Delayed
                          </span>
                        </td>
                        <td className="py-3 px-2">Apr 10, 2025</td>
                        <td className="py-3 px-2">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-4">View All Projects</Button>
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