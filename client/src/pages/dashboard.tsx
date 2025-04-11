import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { User, Project } from '@shared/schema';

const Dashboard = () => {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check user authentication status
  useEffect(() => {
    const unsubscribe = auth?.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        // Redirect to login if not authenticated
        toast({
          title: "Authentication Required",
          description: "Please log in to access the dashboard",
          variant: "destructive",
        });
        setLocation('/login');
      }
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [setLocation, toast]);

  // Fetch user data from API if Firebase auth is available
  const { data: userData, isLoading: isUserLoading } = useQuery<User>({
    queryKey: ['/api/users/1'], // This should be the current user's ID in a real implementation
    enabled: !!currentUser, // Only run query if user is authenticated
  });

  // Fetch projects data
  const { data: projectsData, isLoading: isProjectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    enabled: !!currentUser, // Only run query if user is authenticated
  });

  // Sample activity data (in a real app, this would come from the API)
  const recentActivities = [
    { id: 1, type: 'comment', message: 'Michael left a comment on your project', time: '2 hours ago' },
    { id: 2, type: 'file', message: 'New file uploaded: project_requirements.pdf', time: '1 day ago' },
    { id: 3, type: 'status', message: 'E-commerce Platform project status changed to In Progress', time: '2 days ago' },
    { id: 4, type: 'meeting', message: 'Scheduled meeting: Project Review on June 15, 2023', time: '3 days ago' },
  ];

  // Loading state
  if (loading || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Client Dashboard | AdiTeke Software Solutions</title>
        <meta name="description" content="Access your projects, files, and communications with AdiTeke Software Solutions team." />
      </Helmet>

      <div className="min-h-screen bg-light py-8">
        <div className="container mx-auto px-4">
          {/* Dashboard Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, {userData?.name || currentUser?.displayName || 'Client'}</h1>
                <p className="text-gray-600">Here's what's happening with your projects</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button className="bg-primary text-white">
                  <i className="fas fa-plus mr-2"></i> New Request
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Dashboard Content */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8 bg-white p-1 rounded-lg shadow-sm">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <i className="fas fa-th-large mr-2"></i> Overview
              </TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <i className="fas fa-folder mr-2"></i> Projects
              </TabsTrigger>
              <TabsTrigger value="files" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <i className="fas fa-file-alt mr-2"></i> Files
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <i className="fas fa-comments mr-2"></i> Messages
              </TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <i className="fas fa-credit-card mr-2"></i> Billing
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Active Projects</CardTitle>
                      <CardDescription>Current ongoing projects</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">
                        {projectsData?.filter(p => p.status === "in-progress").length || 0}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Completed Projects</CardTitle>
                      <CardDescription>Successfully delivered projects</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-500">
                        {projectsData?.filter(p => p.status === "completed").length || 0}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Support Tickets</CardTitle>
                      <CardDescription>Active support requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-amber-500">
                        2
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Project Progress */}
                <motion.div
                  className="lg:col-span-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Project Progress</CardTitle>
                      <CardDescription>Current status of your active projects</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isProjectsLoading ? (
                        <div className="space-y-4">
                          {[1, 2].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                              <div className="h-2 bg-gray-200 rounded mb-4"></div>
                            </div>
                          ))}
                        </div>
                      ) : projectsData && projectsData.filter(p => p.status === "in-progress").length > 0 ? (
                        <div className="space-y-6">
                          {projectsData
                            .filter(project => project.status === "in-progress")
                            .slice(0, 3)
                            .map((project, index) => {
                              // Calculate a mock progress percentage (in a real app, this would come from the API)
                              const progress = Math.floor(Math.random() * 80) + 10;
                              return (
                                <div key={project.id}>
                                  <div className="flex justify-between mb-2">
                                    <h4 className="font-medium">{project.title}</h4>
                                    <span className="text-sm text-gray-500">{progress}%</span>
                                  </div>
                                  <Progress value={progress} className="h-2" />
                                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                                    <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                                    <span>
                                      End: {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-folder-open text-gray-400 text-xl"></i>
                          </div>
                          <h3 className="text-gray-500">No active projects</h3>
                          <p className="text-gray-400 text-sm mt-1">Projects in progress will appear here</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" onClick={() => setActiveTab('projects')} className="w-full">
                        View All Projects
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest updates and notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivities.map((activity) => (
                          <div key={activity.id} className="flex items-start">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 flex-shrink-0">
                              <i className={`fas fa-${
                                activity.type === 'comment' ? 'comment' :
                                activity.type === 'file' ? 'file-alt' :
                                activity.type === 'status' ? 'info-circle' : 'calendar'
                              } text-sm`}></i>
                            </div>
                            <div>
                              <p className="text-sm text-gray-700">{activity.message}</p>
                              <span className="text-xs text-gray-500">{activity.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View All Activity
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              </div>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <Card>
                <CardHeader>
                  <CardTitle>Your Projects</CardTitle>
                  <CardDescription>Manage and track all your projects</CardDescription>
                </CardHeader>
                <CardContent>
                  {isProjectsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((_, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                          <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : projectsData && projectsData.length > 0 ? (
                    <div className="space-y-4">
                      {projectsData.map((project) => (
                        <div 
                          key={project.id} 
                          className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div className="mb-3 md:mb-0">
                              <div className="flex items-center">
                                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                  project.status === 'completed' ? 'bg-green-500' :
                                  project.status === 'in-progress' ? 'bg-amber-500' : 'bg-gray-500'
                                }`}></span>
                                <h3 className="font-bold">{project.title}</h3>
                              </div>
                              <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {project.category.split(' ').map((cat, idx) => (
                                  <span 
                                    key={idx}
                                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                                  >
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button variant="outline" size="sm">
                                <i className="fas fa-eye mr-1"></i> Details
                              </Button>
                              <Button variant="outline" size="sm">
                                <i className="fas fa-file mr-1"></i> Files
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-folder-open text-gray-400 text-2xl"></i>
                      </div>
                      <h3 className="text-lg font-medium text-gray-600">No Projects Found</h3>
                      <p className="text-gray-500 mt-1 mb-6">You don't have any projects yet</p>
                      <Button className="bg-primary text-white">
                        <i className="fas fa-plus mr-2"></i> Start a New Project
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files">
              <Card>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <CardTitle>Project Files</CardTitle>
                      <CardDescription>Access all your project documents and files</CardDescription>
                    </div>
                    <Button className="mt-4 md:mt-0 bg-primary text-white">
                      <i className="fas fa-upload mr-2"></i> Upload New File
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">File Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Project</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Uploaded</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Size</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'project_requirements.pdf', project: 'E-commerce Platform', date: '2023-06-10', size: '2.4 MB' },
                          { name: 'design_mockups.zip', project: 'Mobile Banking App', date: '2023-06-08', size: '15.7 MB' },
                          { name: 'api_documentation.docx', project: 'E-commerce Platform', date: '2023-06-05', size: '1.2 MB' },
                          { name: 'presentation.pptx', project: 'Analytics Dashboard', date: '2023-06-01', size: '8.5 MB' },
                        ].map((file, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <i className={`fas fa-${
                                  file.name.endsWith('.pdf') ? 'file-pdf text-red-500' :
                                  file.name.endsWith('.zip') ? 'file-archive text-yellow-500' :
                                  file.name.endsWith('.docx') ? 'file-word text-blue-500' :
                                  file.name.endsWith('.pptx') ? 'file-powerpoint text-orange-500' :
                                  'file text-gray-500'
                                } mr-3`}></i>
                                <span>{file.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">{file.project}</td>
                            <td className="py-3 px-4 text-gray-600">{new Date(file.date).toLocaleDateString()}</td>
                            <td className="py-3 px-4 text-gray-600">{file.size}</td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" size="sm" className="mr-1">
                                <i className="fas fa-download"></i>
                              </Button>
                              <Button variant="ghost" size="sm">
                                <i className="fas fa-ellipsis-v"></i>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <Card>
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>Communicate with our team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
                    {/* Contacts List */}
                    <div className="bg-light rounded-lg overflow-hidden">
                      <div className="p-3 bg-white border-b">
                        <h3 className="font-medium">Recent Conversations</h3>
                      </div>
                      <div className="overflow-y-auto h-[calc(600px-53px)]">
                        {[
                          { id: 1, name: 'Sarah Johnson', role: 'Project Manager', active: true, unread: 2 },
                          { id: 2, name: 'Michael Chen', role: 'Developer', active: false, unread: 0 },
                          { id: 3, name: 'Elena Rodriguez', role: 'Designer', active: true, unread: 0 },
                        ].map((contact) => (
                          <div 
                            key={contact.id}
                            className={`flex items-center p-4 hover:bg-gray-100 cursor-pointer ${contact.id === 1 ? 'bg-gray-100' : ''}`}
                          >
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <i className="fas fa-user"></i>
                              </div>
                              {contact.active && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div className="ml-3 flex-grow">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{contact.name}</h4>
                                {contact.unread > 0 && (
                                  <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {contact.unread}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-500 text-sm">{contact.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chat Area */}
                    <div className="md:col-span-2 bg-white rounded-lg border shadow-sm flex flex-col">
                      <div className="p-4 border-b">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                            <i className="fas fa-user"></i>
                          </div>
                          <div>
                            <h4 className="font-medium">Sarah Johnson</h4>
                            <p className="text-green-500 text-xs">Online</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex-grow p-4 overflow-y-auto space-y-4">
                        <div className="flex justify-center">
                          <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1">June 12, 2023</span>
                        </div>
                        
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                            <p className="text-gray-800">Hi there! I wanted to check in on the progress of the E-commerce Platform project. How's everything going?</p>
                            <span className="text-xs text-gray-500 mt-1 block">10:24 AM</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <div className="bg-primary text-white rounded-lg p-3 max-w-[80%]">
                            <p>Hi Sarah! Things are going well. We're currently working on the payment integration and should have an update for you by tomorrow.</p>
                            <span className="text-xs text-white/80 mt-1 block">10:30 AM</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                            <p className="text-gray-800">That sounds great! Do you have any questions or concerns that I can help with?</p>
                            <span className="text-xs text-gray-500 mt-1 block">10:32 AM</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <div className="bg-primary text-white rounded-lg p-3 max-w-[80%]">
                            <p>Actually, we might need some clarification on the shipping calculation requirements. Could we schedule a quick call to discuss?</p>
                            <span className="text-xs text-white/80 mt-1 block">10:35 AM</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                            <p className="text-gray-800">Of course! I'm available tomorrow at 10 AM or 2 PM. Which works better for you?</p>
                            <span className="text-xs text-gray-500 mt-1 block">10:38 AM</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border-t">
                        <div className="flex">
                          <Button variant="outline" size="icon" className="mr-2">
                            <i className="fas fa-paperclip"></i>
                          </Button>
                          <input
                            type="text"
                            placeholder="Type your message..."
                            className="flex-grow border rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <Button className="rounded-l-none bg-primary text-white">
                            <i className="fas fa-paper-plane"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing & Payments</CardTitle>
                  <CardDescription>Manage your invoices and payment methods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
                      <div className="bg-white border rounded-lg p-4 mb-4 flex items-center">
                        <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <i className="fab fa-cc-visa text-blue-800 text-xl"></i>
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium">Visa ending in 4242</p>
                          <p className="text-sm text-gray-500">Expires 12/24</p>
                        </div>
                        <div>
                          <Button variant="ghost" size="sm">
                            <i className="fas fa-ellipsis-v"></i>
                          </Button>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        <i className="fas fa-plus mr-2"></i> Add Payment Method
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Billing Address</h3>
                      <div className="bg-white border rounded-lg p-4">
                        <p className="font-medium">John Doe</p>
                        <p className="text-gray-600">123 Main Street</p>
                        <p className="text-gray-600">Suite 456</p>
                        <p className="text-gray-600">San Francisco, CA 94103</p>
                        <p className="text-gray-600">United States</p>
                        
                        <Button variant="link" className="px-0 mt-2">
                          <i className="fas fa-edit mr-2"></i> Edit Address
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium mb-4">Recent Invoices</h3>
                  <div className="overflow-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Invoice #</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { id: 'INV-2023-001', date: '2023-06-01', amount: '$2,999.00', status: 'Paid' },
                          { id: 'INV-2023-002', date: '2023-05-15', amount: '$1,500.00', status: 'Paid' },
                          { id: 'INV-2023-003', date: '2023-04-30', amount: '$3,750.00', status: 'Paid' },
                        ].map((invoice, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{invoice.id}</td>
                            <td className="py-3 px-4 text-gray-600">{new Date(invoice.date).toLocaleDateString()}</td>
                            <td className="py-3 px-4">{invoice.amount}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                {invoice.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" size="sm">
                                <i className="fas fa-download mr-1"></i> Download
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
