import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import ClientLayout from '@/components/client/ClientLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, FileText, Clock, CheckCircle2, 
  AlertCircle, ExternalLink, Download, Calendar, Loader2,
  Receipt, DollarSign, CreditCard, FolderKanban 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Project } from '@shared/schema';
import { motion } from 'framer-motion';

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
  
  // Fetch client's projects using public API endpoint
  const { data: projects, isLoading: isLoadingProjects, error: projectsError } = useQuery<Project[]>({
    queryKey: ['/api/public/client-projects', userData?.id],
    queryFn: async () => {
      if (!userData?.id) {
        return [];
      }
      
      try {
        console.log(`Attempting to fetch projects for client ID: ${userData.id} using public API`);
        const res = await fetch(`/api/public/client-projects/${userData.id}`);
        
        if (!res.ok) {
          console.log("Public API request failed:", res.status);
          return [];
        }
        
        const data = await res.json();
        console.log("Projects fetched from public API:", data);
        
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
  
  // Fetch client's invoices
  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['/api/public/client-invoices', userData?.id],
    queryFn: async () => {
      if (!userData?.id) {
        return [];
      }
      
      try {
        const res = await fetch(`/api/public/client-invoices/${userData.id}`);
        if (!res.ok) return [];
        return await res.json();
      } catch (error) {
        console.error("Error fetching client invoices:", error);
        return [];
      }
    },
    enabled: !!userData?.id && isClient
  });
  
  // Fetch client's documents
  const { data: documents = [], isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['/api/public/client-documents', userData?.id],
    queryFn: async () => {
      if (!userData?.id) {
        return [];
      }
      
      try {
        const res = await fetch(`/api/public/client-documents/${userData.id}`);
        if (!res.ok) return [];
        return await res.json();
      } catch (error) {
        console.error("Error fetching client documents:", error);
        return [];
      }
    },
    enabled: !!userData?.id && isClient
  });
  
  // Fetch client's contracts
  const { data: contracts = [], isLoading: isLoadingContracts } = useQuery({
    queryKey: ['/api/public/client-contracts', userData?.id],
    queryFn: async () => {
      if (!userData?.id) {
        return [];
      }
      
      try {
        const res = await fetch(`/api/public/client-contracts/${userData.id}`);
        if (!res.ok) return [];
        return await res.json();
      } catch (error) {
        console.error("Error fetching client contracts:", error);
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
    <ClientLayout>
      {/* Hero Section with Client Welcome - Navy Background */}
      <section className="bg-slate-900 text-white py-12 px-6 md:px-10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold">
                Welcome, {userData.name?.split(' ')[0] || userData.username}
              </h1>
              <p className="mt-2 text-slate-300 max-w-xl">
                Track your projects, manage documents, and connect with our team from your personalized dashboard.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <FolderKanban className="h-4 w-4 mr-2" />
                View Projects
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Manager
              </Button>
            </div>
          </div>
          
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm"
            >
              <div className="flex items-start">
                <div className="p-3 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <FolderKanban className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-400">Active Projects</p>
                  <h3 className="text-2xl font-bold">{projectStats.active}</h3>
                  <p className="text-xs text-indigo-400 mt-1">
                    {projectStats.active > 0 ? 'In progress' : 'No active projects'}
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm"
            >
              <div className="flex items-start">
                <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-400">Completed</p>
                  <h3 className="text-2xl font-bold">{projectStats.completed}</h3>
                  <p className="text-xs text-green-400 mt-1">Successfully delivered</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm"
            >
              <div className="flex items-start">
                <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-400">Support Tickets</p>
                  <h3 className="text-2xl font-bold">1</h3>
                  <p className="text-xs text-amber-400 mt-1">Last updated 2h ago</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm"
            >
              <div className="flex items-start">
                <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-400">Documents</p>
                  <h3 className="text-2xl font-bold">{documents?.length || 0}</h3>
                  <p className="text-xs text-blue-400 mt-1">
                    {contracts?.length || 0} contracts, {invoices?.length || 0} invoices
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Main Dashboard Content - White Background */}
      <section className="bg-white py-12 px-6 md:px-10">
        <div className="container mx-auto">
          <Tabs defaultValue="projects" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Project Dashboard</h2>
                <p className="text-slate-500">Monitor your ongoing projects and activities</p>
              </div>
            
              <TabsList className="grid grid-cols-4 w-full max-w-md bg-slate-100 p-1 mt-4 md:mt-0">
                <TabsTrigger value="projects" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  Projects
                </TabsTrigger>
                <TabsTrigger value="support" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  Support
                </TabsTrigger>
                <TabsTrigger value="documents" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  Documents
                </TabsTrigger>
                <TabsTrigger value="account" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  Account
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="projects" className="mt-6">
              {/* Projects Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-indigo-700">Active Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <Clock className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-2xl font-bold text-indigo-700">{projectStats.active}</div>
                        <div className="text-xs text-indigo-500">In progress</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-green-700">Completed Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-2xl font-bold text-green-700">{projectStats.completed}</div>
                        <div className="text-xs text-green-500">Successfully delivered</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-amber-700">Support Tickets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="bg-amber-100 p-2 rounded-full">
                        <MessageSquare className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-2xl font-bold text-amber-700">1</div>
                        <div className="text-xs text-amber-500">Active ticket</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Project List */}
              <Card>
                <CardHeader>
                  <CardTitle>My Projects</CardTitle>
                  <CardDescription>Overview of your active and recent projects</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingProjects ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                      <span className="ml-2 text-slate-600">Loading your projects...</span>
                    </div>
                  ) : projectsError ? (
                    <div className="text-center py-8 text-red-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>Failed to load projects. Please try again later.</p>
                    </div>
                  ) : projects && projects.length > 0 ? (
                    <div className="space-y-6">
                      {projects.map((project) => (
                        <div key={project.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h3 className="text-lg font-semibold text-slate-900">{project.title}</h3>
                                <Badge className={`ml-3 ${
                                  project.status === 'Completed' ? 'bg-green-500' : 
                                  project.status === 'In Progress' ? 'bg-amber-500' :
                                  project.status === 'in-progress' ? 'bg-amber-500' :
                                  'bg-indigo-500'
                                }`}>
                                  {project.status === 'in-progress' ? 'In Progress' : project.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-500 mt-1">{project.description}</p>
                              
                              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-xs text-slate-500">Start Date</p>
                                  <p className="text-sm font-medium">{formatDate(project.startDate)}</p>
                                </div>
                                
                                {project.endDate && (
                                  <div>
                                    <p className="text-xs text-slate-500">End Date</p>
                                    <p className="text-sm font-medium">{formatDate(project.endDate)}</p>
                                  </div>
                                )}
                                
                                <div>
                                  <p className="text-xs text-slate-500">Budget</p>
                                  <p className="text-sm font-medium">${project.budget?.toLocaleString() || 'Not set'}</p>
                                </div>
                                
                                <div>
                                  <p className="text-xs text-slate-500">Team Size</p>
                                  <p className="text-sm font-medium">{project.teamSize || 'Not specified'}</p>
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <p className="text-xs text-slate-500 mb-1">Progress ({project.progress || 0}%)</p>
                                <Progress value={project.progress || 0} className="h-2" />
                              </div>
                            </div>
                            
                            {project.thumbnail && (
                              <div className="ml-4 hidden sm:block">
                                <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-200">
                                  <img 
                                    src={project.thumbnail} 
                                    alt={project.title} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                            <Button variant="outline" size="sm" className="mr-2">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Discuss
                            </Button>
                            {project.website_url && (
                              <Button variant="outline" size="sm" className="mr-2">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Visit Site
                              </Button>
                            )}
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                              <FileText className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>No projects found. New projects will appear here when assigned.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Project Payment Summary Card */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                  <CardDescription>Overview of your project payments and invoices</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingProjects || isLoadingInvoices ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                      <span className="ml-2 text-slate-600">Loading payment information...</span>
                    </div>
                  ) : projects && projects.length > 0 ? (
                    <div className="space-y-6">
                      {projects.map((project) => {
                        // Find invoices for this project
                        const projectInvoices = invoices.filter((inv: any) => inv.projectId === project.id);
                        
                        // Calculate total paid and total amount
                        const totalAmount = project.budget || 0;
                        const totalPaid = projectInvoices
                          .filter((inv: any) => inv.status === 'Paid')
                          .reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);
                        
                        // Calculate remaining amount
                        const remainingAmount = totalAmount - totalPaid;
                        
                        // Check if there's a paid invoice for this project
                        const hasPaidInvoice = projectInvoices.some((inv: any) => inv.status === 'Paid');
                        
                        return (
                          <div key={project.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-4">
                              <h3 className="text-lg font-semibold text-slate-900">{project.title}</h3>
                              <Badge className={`
                                ${project.status === 'Completed' ? 'bg-green-500' : 
                                  project.status === 'in-progress' ? 'bg-amber-500' :
                                  project.status === 'In Progress' ? 'bg-amber-500' :
                                  'bg-indigo-500'}
                              `}>
                                {project.status === 'in-progress' ? 'In Progress' : project.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center">
                                <DollarSign className="h-5 w-5 text-indigo-600 mr-2" />
                                <div>
                                  <p className="text-sm text-slate-500">Total Amount</p>
                                  <p className="font-medium">${totalAmount.toFixed(2)}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                <CreditCard className="h-5 w-5 text-green-600 mr-2" />
                                <div>
                                  <p className="text-sm text-slate-500">Amount Paid</p>
                                  <p className="font-medium">${totalPaid.toFixed(2)}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                <Receipt className="h-5 w-5 text-amber-600 mr-2" />
                                <div>
                                  <p className="text-sm text-slate-500">Remaining</p>
                                  <p className="font-medium">${remainingAmount.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                            
                            {projectInvoices.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-slate-100">
                                <p className="text-sm font-medium mb-2">Invoices & Receipts</p>
                                <div className="flex flex-wrap gap-2">
                                  {projectInvoices.map((invoice: any) => (
                                    <div key={invoice.id} className="flex gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-indigo-600 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
                                        onClick={() => {
                                          const token = localStorage.getItem('token');
                                          window.open(`/api/invoice/${invoice.id}/download?token=${token}`, '_blank');
                                        }}
                                      >
                                        <Download className="h-4 w-4 mr-1" />
                                        Invoice #{invoice.invoiceNumber}
                                      </Button>
                                      
                                      {invoice.status === 'Paid' && (
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          className="text-green-600 border-green-200 hover:border-green-300 hover:bg-green-50"
                                          onClick={() => {
                                            const token = localStorage.getItem('token');
                                            window.open(`/api/receipt/${invoice.id}/download?token=${token}`, '_blank');
                                          }}
                                        >
                                          <Receipt className="h-4 w-4 mr-1" />
                                          Receipt
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>No payment information found.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Support Tickets</CardTitle>
                  <CardDescription>Manage your support requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-slate-50 p-4 border-b">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Mobile App Login Issue</h3>
                            <p className="text-sm text-slate-500 mt-1">Reported on May 1, 2025</p>
                          </div>
                          <Badge className="bg-amber-500">In Progress</Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-slate-600 mb-4">
                          I'm experiencing issues logging into the mobile application. The authentication screen keeps loading indefinitely after entering credentials.
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-sm text-slate-500">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span>3 responses</span>
                          </div>
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            View Ticket
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Create New Support Ticket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Contracts</CardTitle>
                    <CardDescription>Review and manage project contracts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingContracts ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        <span className="ml-2 text-slate-600">Loading contracts...</span>
                      </div>
                    ) : contracts && contracts.length > 0 ? (
                      <div className="space-y-4">
                        {contracts.map((contract: any) => (
                          <div key={contract.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="flex items-center">
                              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-3">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{contract.title || `Contract #${contract.id}`}</p>
                                <p className="text-xs text-slate-500">
                                  {contract.createdAt ? formatDate(contract.createdAt) : 'No date available'}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => {
                              const token = localStorage.getItem('token');
                              window.open(`/api/contract/${contract.id}/download?token=${token}`, '_blank');
                            }}>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p>No contracts found.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Project Documents</CardTitle>
                    <CardDescription>Access project-related files and documentation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingDocuments ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        <span className="ml-2 text-slate-600">Loading documents...</span>
                      </div>
                    ) : documents && documents.length > 0 ? (
                      <div className="space-y-4">
                        {documents.map((document: any) => (
                          <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="flex items-center">
                              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg mr-3">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{document.title}</p>
                                <p className="text-xs text-slate-500">
                                  {document.createdAt ? formatDate(document.createdAt) : 'No date available'}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => {
                              const token = localStorage.getItem('token');
                              window.open(`/api/document/${document.id}/download?token=${token}`, '_blank');
                            }}>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p>No documents found.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="account" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 md:items-center">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xl font-semibold border-2 border-indigo-200">
                          {userData.profilePicture ? (
                            <img 
                              src={userData.profilePicture} 
                              alt={userData.name || userData.username} 
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span>{(userData.name || userData.username).slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium">{userData.name || userData.username}</h3>
                        <p className="text-slate-500">{userData.email}</p>
                        <div className="mt-2">
                          <Badge className="bg-indigo-600">Client</Badge>
                        </div>
                      </div>
                      <div className="md:ml-auto">
                        <Button variant="outline">Edit Profile</Button>
                      </div>
                    </div>
                    
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-medium mb-4">Account Security</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Password</p>
                            <p className="text-sm text-slate-500">Last changed 30 days ago</p>
                          </div>
                          <Button variant="outline">Change Password</Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-slate-500">Secure your account with 2FA</p>
                          </div>
                          <Button>Enable</Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Session Management</p>
                            <p className="text-sm text-slate-500">Manage active sessions</p>
                          </div>
                          <Button variant="outline">View Sessions</Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-medium mb-4">Notification Preferences</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Notifications</p>
                            <p className="text-sm text-slate-500">Receive updates via email</p>
                          </div>
                          <Button variant="outline">Configure</Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">SMS Notifications</p>
                            <p className="text-sm text-slate-500">Receive important alerts via SMS</p>
                          </div>
                          <Button variant="outline">Configure</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t flex justify-end pt-4">
                  <Button variant="outline" className="mr-2">Cancel</Button>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      {/* Project Timeline Section - Navy Background */}
      <section className="bg-slate-900 py-12 px-6 md:px-10 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Project Timeline</h2>
              <p className="text-slate-300">Track your project milestones and deadlines</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
                <Calendar className="h-4 w-4 mr-2" />
                View Full Calendar
              </Button>
            </div>
          </div>
          
          {isLoadingProjects ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              <span className="ml-2 text-slate-300">Loading timeline...</span>
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="mt-6 bg-slate-800/60 border border-slate-700/40 rounded-xl p-6">
              <div className="space-y-6">
                {projects.map((project) => (
                  <div key={`timeline-${project.id}`} className="relative pl-8 pb-6 border-l border-slate-700/50 last:pb-0">
                    <div className="absolute w-4 h-4 bg-indigo-600 rounded-full -left-2 top-0"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <p className="text-indigo-300 text-sm">
                          {formatDate(project.startDate)} 
                          {project.endDate ? ` - ${formatDate(project.endDate)}` : ' - Ongoing'}
                        </p>
                        <h3 className="text-lg font-semibold mt-1">{project.title}</h3>
                        <p className="text-slate-400 mt-1 text-sm">{project.description}</p>
                      </div>
                      
                      <div className="mt-3 md:mt-0 md:ml-4">
                        <Badge className={`inline-flex items-center ${
                          project.status === 'Completed' ? 'bg-green-600' : 
                          project.status === 'In Progress' || project.status === 'in-progress' ? 'bg-amber-600' :
                          'bg-blue-600'
                        }`}>
                          {project.status === 'in-progress' ? 'In Progress' : project.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-xs text-slate-400 mb-1">Progress ({project.progress || 0}%)</p>
                      <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            project.progress >= 75 ? 'bg-green-500' :
                            project.progress >= 25 ? 'bg-amber-500' :
                            'bg-indigo-500'
                          }`}
                          style={{ width: `${project.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No project timeline data available.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Contact Team Section - White Background */}
      <section className="bg-white py-12 px-6 md:px-10">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Have Questions?</h2>
            <p className="mt-3 text-slate-500">Our team is here to help you with any questions or issues regarding your projects.</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle>Chat Support</CardTitle>
                  <CardDescription>Connect with our support team via live chat</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Start Conversation</Button>
                </CardFooter>
              </Card>
              
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle>Email Support</CardTitle>
                  <CardDescription>Send us an email with your questions</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                  <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300">
                    Contact via Email
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <p className="mt-8 text-sm text-slate-500">
              For urgent matters, please call us directly at <span className="font-semibold">+1 (641) 481-8560</span>
            </p>
          </div>
        </div>
      </section>
    </ClientLayout>
  );
}