import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Users, Settings, FileText, BarChart3, Layout, 
  Mail, ShieldAlert, Bell, Plus 
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
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

  if (!user || user.roleId !== 1) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">Administrator</p>
          </div>
          <Button variant="outline" onClick={() => logout()}>Logout</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="grid grid-cols-5 w-full max-w-4xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="text-2xl font-bold">128</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">+5.2% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Layout className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="text-2xl font-bold">24</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="text-2xl font-bold">7</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">-3 from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ShieldAlert className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="text-2xl font-bold">2</div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-amber-500">Requires attention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      <p className="text-sm flex-1">User registration completed for client #{45 + i}</p>
                      <p className="text-xs text-muted-foreground">{i}h ago</p>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" className="w-full">View All Activities</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage users and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    className="flex w-full justify-between items-center"
                    onClick={() => setLocation('/admin/user-management')}
                  >
                    <span className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Users
                    </span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex w-full justify-between items-center"
                    onClick={() => setLocation('/admin/content-management')}
                  >
                    <span className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Manage Content
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    View and manage all users in the system
                  </CardDescription>
                </div>
                <Button onClick={() => setLocation('/admin/user-management')}>
                  Manage Users
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">128</div>
                    <p className="text-xs text-muted-foreground mt-2">Active accounts</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Administrators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground mt-2">With full system access</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">New Registrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground mt-2">In the last 30 days</p>
                  </CardContent>
                </Card>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setLocation('/admin/user-management')}>
                <Plus className="mr-2 h-4 w-4" />
                Add New User
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Content Management</CardTitle>
                  <CardDescription>
                    Manage website content, blog posts, and services
                  </CardDescription>
                </div>
                <Button onClick={() => setLocation('/admin/content-management')}>
                  Manage Content
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">Published articles</p>
                    <Button variant="outline" size="sm" className="w-full mt-2"
                      onClick={() => setLocation('/admin/content-management/blog')}>
                      Manage Blog
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Services</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">Active services</p>
                    <Button variant="outline" size="sm" className="w-full mt-2"
                      onClick={() => setLocation('/admin/content-management/services')}>
                      Manage Services
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Testimonials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-2xl font-bold">15</div>
                    <p className="text-xs text-muted-foreground">Client testimonials</p>
                    <Button variant="outline" size="sm" className="w-full mt-2"
                      onClick={() => setLocation('/admin/content-management/testimonials')}>
                      Manage Testimonials
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Recent Content Updates</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center border-b pb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      <p className="text-sm flex-1">
                        Blog post "{['AI Integration Benefits', 'Cloud Migration Strategies', 'Advanced Security Protocols'][i-1]}" published
                      </p>
                      <p className="text-xs text-muted-foreground">{i} day{i > 1 ? 's' : ''} ago</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Project Management</CardTitle>
                  <CardDescription>
                    Overview of all client projects and their status
                  </CardDescription>
                </div>
                <Button onClick={() => setLocation('/admin/project-management')}>
                  Manage Projects
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">42</div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">In progress</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Complete Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">16</div>
                    <p className="text-xs text-muted-foreground">Successfully delivered</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Project Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7</div>
                    <p className="text-xs text-muted-foreground text-amber-500">Require attention</p>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Projects by Status</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: 'Planning', count: 6, color: 'bg-blue-100 text-blue-800' },
                      { name: 'In Progress', count: 12, color: 'bg-yellow-100 text-yellow-800' },
                      { name: 'Testing', count: 4, color: 'bg-purple-100 text-purple-800' },
                      { name: 'Review', count: 2, color: 'bg-indigo-100 text-indigo-800' },
                      { name: 'Complete', count: 16, color: 'bg-green-100 text-green-800' },
                      { name: 'On Hold', count: 2, color: 'bg-red-100 text-red-800' },
                    ].map((status, index) => (
                      <div key={index} className={`${status.color} rounded-lg p-4 flex flex-col items-center justify-center`}>
                        <span className="text-xl font-bold">{status.count}</span>
                        <span className="text-xs">{status.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full" 
                onClick={() => setLocation('/admin/project-management/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Project
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>
                    Configure system-wide settings and preferences
                  </CardDescription>
                </div>
                <Button onClick={() => setLocation('/admin/settings')}>
                  Advanced Settings
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">General Settings</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Maintenance Mode</h4>
                        <p className="text-xs text-muted-foreground">Temporarily disable the site for maintenance</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <h4 className="text-sm font-medium">System Notifications</h4>
                        <p className="text-xs text-muted-foreground">Enable system-wide alert notifications</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <h4 className="text-sm font-medium">Backup & Restore</h4>
                        <p className="text-xs text-muted-foreground">Manage system backup schedules</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Settings
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Security Settings</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                        <p className="text-xs text-muted-foreground">Configure 2FA for administrator accounts</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <h4 className="text-sm font-medium">Password Policy</h4>
                        <p className="text-xs text-muted-foreground">Update system-wide password requirements</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Modify
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <h4 className="text-sm font-medium">Security Log</h4>
                        <p className="text-xs text-muted-foreground">View security events and access logs</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Logs
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">System Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">System Status</h4>
                    <div className="flex items-center mt-1">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <p className="text-sm">Operational</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Last Backup</h4>
                    <p className="text-sm mt-1">April 11, 2025 - 10:45 PM</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Software Version</h4>
                    <p className="text-sm mt-1">v2.4.1</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Database Status</h4>
                    <div className="flex items-center mt-1">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <p className="text-sm">Connected</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}