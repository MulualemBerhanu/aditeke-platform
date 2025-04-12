import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  MessageSquare, 
  Settings, 
  ChevronLeft, 
  Plus, 
  PenTool,
  Megaphone,
  Wrench,
  Eye,
  Edit,
  Trash2 
} from 'lucide-react';

export default function AdminContentManagement() {
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

  if (!user || user.roleId !== 1) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
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
        <h1 className="text-3xl font-bold">Content Management</h1>
      </div>

      <Tabs defaultValue="services" className="mb-8">
        <TabsList className="grid grid-cols-3 w-full max-w-3xl mb-6">
          <TabsTrigger value="services">
            <Wrench className="h-4 w-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="blog">
            <FileText className="h-4 w-4 mr-2" />
            Blog Posts
          </TabsTrigger>
          <TabsTrigger value="testimonials">
            <MessageSquare className="h-4 w-4 mr-2" />
            Testimonials
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="services">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Services</CardTitle>
                <CardDescription>Manage service offerings displayed on the website</CardDescription>
              </div>
              <Button onClick={() => setLocation('/admin/content-management/services')}>
                <Wrench className="h-4 w-4 mr-2" />
                Manage Services
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">Service offerings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Featured Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">5</div>
                    <p className="text-xs text-muted-foreground">Highlighted on homepage</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Service Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="flex justify-start" onClick={() => setLocation('/admin/content-management/services/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Service
                  </Button>
                  <Button variant="outline" className="flex justify-start" onClick={() => setLocation('/admin/content-management/services')}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Services
                  </Button>
                  <Button variant="outline" className="flex justify-start" onClick={() => setLocation('/services')}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Services Page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="blog">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Blog Posts</CardTitle>
                <CardDescription>Manage blog content and articles</CardDescription>
              </div>
              <Button onClick={() => setLocation('/admin/content-management/blog')}>
                <FileText className="h-4 w-4 mr-2" />
                Manage Blog
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">Published articles</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">Pending publication</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">6</div>
                    <p className="text-xs text-muted-foreground">Blog categories</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Recent Posts</h3>
                <div className="space-y-2">
                  {[
                    "AI Integration Benefits",
                    "Cloud Migration Strategies",
                    "Advanced Security Protocols"
                  ].map((title, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                        <p className="text-sm">{title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full" onClick={() => setLocation('/admin/content-management/blog/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Blog Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="testimonials">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Testimonials</CardTitle>
                <CardDescription>Manage client testimonials and reviews</CardDescription>
              </div>
              <Button onClick={() => setLocation('/admin/content-management/testimonials')}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Manage Testimonials
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Testimonials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">15</div>
                    <p className="text-xs text-muted-foreground">Client reviews</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.8 / 5</div>
                    <p className="text-xs text-muted-foreground">Client satisfaction</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Recent Testimonials</h3>
                <div className="space-y-2">
                  {[
                    { name: "Sarah Johnson", company: "Future Tech, Inc." },
                    { name: "Michael Chen", company: "Innovate Solutions" },
                    { name: "Jessica Williams", company: "Global Systems" }
                  ].map((testimonial, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="text-sm font-medium">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full" onClick={() => setLocation('/admin/content-management/testimonials/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Testimonial
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}