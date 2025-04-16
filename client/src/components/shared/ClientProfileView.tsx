import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Project } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Users, Building, Mail, Phone, Globe, Calendar, FileText, 
  CreditCard, DollarSign, File, FilePlus, Tag, CheckCircle, 
  Clock, AlertCircle, MoreHorizontal, Trash2, Download, Send,
  Paperclip, Upload, Eye, Edit, Plus, PlusCircle, FileCheck, 
  MessageSquare, Star, PieChart, BarChart2, Share2, Clipboard
} from 'lucide-react';

interface ClientProfileViewProps {
  clientId: number | string;
  onClose?: () => void;
}

export default function ClientProfileView({ clientId, onClose }: ClientProfileViewProps) {
  const { toast } = useToast();
  const [clientNotes, setClientNotes] = React.useState('');
  const [selectedPaymentPlan, setSelectedPaymentPlan] = React.useState('fixed');
  const [customAmount, setCustomAmount] = React.useState('');
  
  // Invoice form state
  const [invoiceFormData, setInvoiceFormData] = React.useState({
    projectId: '',
    amount: '',
    dueDate: '',
    description: '',
    invoiceNumber: `INV-${Date.now().toString().substring(6)}`
  });
  
  // Create invoice mutation
  const createInvoice = useMutation({
    mutationFn: async (data: any) => {
      // Get auth token from localStorage for direct authentication
      const authToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('currentUser');
      
      // Create headers with authentication
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      };
      
      // Add authorization header if token exists
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      // Prepare request payload
      const payload = {
        clientId: Number(clientId),
        projectId: data.projectId ? Number(data.projectId) : null,
        invoiceNumber: data.invoiceNumber,
        amount: data.amount,
        currency: 'USD',
        status: 'pending',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: data.dueDate,
        description: data.description,
        items: [
          {
            description: data.description || 'Services',
            amount: parseFloat(data.amount),
            quantity: 1
          }
        ],
        notes: ''
      };
      
      console.log('Creating invoice with payload:', payload);
      
      try {
        // First try with our utility function
        const response = await apiRequest('POST', '/api/client-invoices', payload);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create invoice');
        }
        
        return response.json();
      } catch (error) {
        console.error('Error creating invoice with apiRequest:', error);
        
        // Fallback to direct fetch if apiRequest fails
        const response = await fetch('/api/client-invoices', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create invoice');
        }
        
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: 'Invoice Created',
        description: 'The invoice has been created successfully.',
      });
      // Reset form and close dialog
      setInvoiceFormData({
        projectId: '',
        amount: '',
        dueDate: '',
        description: '',
        invoiceNumber: `INV-${Date.now().toString().substring(6)}`
      });
      // Refresh invoices data
      queryClient.invalidateQueries({ queryKey: ['/api/client-invoices', clientId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Creating Invoice',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Fetch client details
  const { 
    data: client, 
    isLoading: isLoadingClient 
  } = useQuery<User>({
    queryKey: ['/api/clients', clientId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/public/clients/${clientId}`);
        if (!res.ok) throw new Error('Failed to fetch client details');
        return res.json();
      } catch (error) {
        console.error('Error fetching client:', error);
        throw error;
      }
    },
    enabled: !!clientId
  });

  // Fetch client projects
  const { 
    data: clientProjects, 
    isLoading: isLoadingProjects 
  } = useQuery<Project[]>({
    queryKey: ['/api/projects/client', clientId],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/public/client-projects/${clientId}`);
        if (!res.ok) throw new Error('Failed to fetch client projects');
        return res.json();
      } catch (error) {
        console.error('Error fetching client projects:', error);
        return [];
      }
    },
    enabled: !!clientId
  });

  // Calculate project statistics
  const projectStats = React.useMemo(() => {
    if (!clientProjects || clientProjects.length === 0) {
      return { total: 0, inProgress: 0, completed: 0, onHold: 0 };
    }
    
    const total = clientProjects.length;
    const inProgress = clientProjects.filter(p => p.status === 'In Progress').length;
    const completed = clientProjects.filter(p => p.status === 'Completed').length;
    const onHold = clientProjects.filter(p => p.status === 'On Hold').length;
    
    return { total, inProgress, completed, onHold };
  }, [clientProjects]);

  // Function to update client notes
  const updateClientNotes = useMutation({
    mutationFn: async (notes: string) => {
      const res = await apiRequest('PATCH', `/api/clients/${clientId}/notes`, { notes });
      if (!res.ok) throw new Error('Failed to update notes');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Notes Updated',
        description: 'Client notes have been saved successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to Update Notes',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Dummy invoices data for the UI
  const invoices = [
    {
      id: 'INV-001',
      project: 'Website Redesign',
      amount: 2000,
      status: 'Paid',
      date: '2025-03-15',
      dueDate: '2025-03-30'
    },
    {
      id: 'INV-002',
      project: 'Mobile App Development',
      amount: 5000,
      status: 'Pending',
      date: '2025-04-01',
      dueDate: '2025-04-15'
    },
    {
      id: 'INV-003',
      project: 'SEO Optimization',
      amount: 1200,
      status: 'Overdue',
      date: '2025-02-15',
      dueDate: '2025-03-01'
    }
  ];

  // Dummy payment phases for the UI
  const paymentPhases = [
    {
      phase: 'Initial (40%)',
      amount: 2000,
      status: 'Paid',
      dueDate: '2025-04-15'
    },
    {
      phase: 'Remaining (60%)',
      amount: 3000,
      status: 'Pending',
      dueDate: '2025-05-10'
    }
  ];

  // Dummy files for the UI
  const clientFiles = [
    {
      id: 'file-001',
      name: 'Contract_2025.pdf',
      type: 'pdf',
      size: '1.2 MB',
      uploadDate: '2025-03-10',
      category: 'Contract'
    },
    {
      id: 'file-002',
      name: 'Project_Specifications.docx',
      type: 'docx',
      size: '845 KB',
      uploadDate: '2025-03-12',
      category: 'Specification'
    },
    {
      id: 'file-003',
      name: 'Invoice_March.pdf',
      type: 'pdf',
      size: '520 KB',
      uploadDate: '2025-03-31',
      category: 'Invoice'
    },
    {
      id: 'file-004',
      name: 'Logo_Options.png',
      type: 'png',
      size: '2.4 MB',
      uploadDate: '2025-04-05',
      category: 'Design'
    }
  ];

  // Dummy activity feed
  const activityFeed = [
    {
      id: 1,
      type: 'project_created',
      message: 'New project "Website Redesign" created',
      date: '2025-04-10T14:32:00Z'
    },
    {
      id: 2,
      type: 'payment_received',
      message: 'Payment of $2,000 received for INV-001',
      date: '2025-04-08T10:15:00Z'
    },
    {
      id: 3,
      type: 'document_uploaded',
      message: 'New document "Project Brief" uploaded',
      date: '2025-04-05T16:45:00Z'
    },
    {
      id: 4,
      type: 'comment_added',
      message: 'Comment added to project "Mobile App Development"',
      date: '2025-04-02T11:22:00Z'
    }
  ];

  // Format date for display
  const formatDate = (dateInput: string | Date) => {
    try {
      if (!dateInput) return 'N/A';
      // Validate date before formatting
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Calculate payment based on selected plan
  const calculatePayment = (total: number) => {
    switch (selectedPaymentPlan) {
      case 'fixed':
        return { initial: total, remaining: 0 };
      case '40-60':
        return { initial: total * 0.4, remaining: total * 0.6 };
      case 'custom':
        const initialAmount = parseFloat(customAmount) || 0;
        return { initial: initialAmount, remaining: total - initialAmount };
      default:
        return { initial: total, remaining: 0 };
    }
  };

  if (isLoadingClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Loading client profile...</span>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-10 w-10 text-destructive mb-2" />
        <h3 className="text-lg font-medium">Client not found</h3>
        <p className="text-muted-foreground">The requested client could not be found.</p>
        {onClose && (
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg shadow-md overflow-hidden">
      {/* Client Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Avatar className="h-16 w-16 mr-4">
              <AvatarImage src={client.profilePicture || ''} alt={client.name || client.username} />
              <AvatarFallback className="text-lg font-semibold">
                {(client.name || client.username || '').substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{client.name || client.username}</h2>
              <div className="flex items-center text-muted-foreground">
                <Building className="h-4 w-4 mr-1" />
                <span>{client.company || 'No company specified'}</span>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant={client.isActive ? 'default' : 'secondary'}>
                  {client.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {client.isVip && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300">
                    <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" /> VIP
                  </Badge>
                )}
                {client.isPriority && (
                  <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200 border-red-300">
                    High Priority
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-1" /> Email
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-1" /> Call
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start px-6 border-b rounded-none bg-background">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & Billing</TabsTrigger>
          <TabsTrigger value="files">Files & Docs</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{projectStats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{projectStats.inProgress}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{projectStats.completed}</div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                      <p>{client.email || 'No email specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
                      <p>{client.phone || 'No phone specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Company</h4>
                      <p>{client.company || 'No company specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Website</h4>
                      <p>{client.website || 'No website specified'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Client Since</h4>
                      <p>{client.createdAt ? formatDate(client.createdAt) : 'Unknown'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Activity</h4>
                      <p>{client.lastLogin ? formatDate(client.lastLogin) : 'Never'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] pr-4">
                    {activityFeed.map((activity) => (
                      <div key={activity.id} className="mb-4 pb-4 border-b last:border-0">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div className="rounded-full bg-primary/10 p-2 mr-3">
                              {activity.type === 'project_created' && <FileText className="h-4 w-4 text-primary" />}
                              {activity.type === 'payment_received' && <DollarSign className="h-4 w-4 text-green-500" />}
                              {activity.type === 'document_uploaded' && <FileCheck className="h-4 w-4 text-blue-500" />}
                              {activity.type === 'comment_added' && <MessageSquare className="h-4 w-4 text-amber-500" />}
                            </div>
                            <div>
                              <p className="text-sm">{activity.message}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(activity.date)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-1">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Client Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    placeholder="Add notes about this client..." 
                    className="min-h-[150px]"
                    value={clientNotes || (client.notes || '')}
                    onChange={(e) => setClientNotes(e.target.value)}
                  />
                  <Button 
                    className="mt-2 w-full" 
                    onClick={() => updateClientNotes.mutate(clientNotes)}
                    disabled={updateClientNotes.isPending}
                  >
                    {updateClientNotes.isPending ? 'Saving...' : 'Save Notes'}
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tags & Labels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {client.isVip && (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300">
                        <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" /> VIP
                      </Badge>
                    )}
                    {client.isPriority && (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-300">
                        High Priority
                      </Badge>
                    )}
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300">
                      {client.industry || 'Technology'}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300">
                      {client.referralSource || 'Website'}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="mt-2">
                          <PlusCircle className="h-3 w-3 mr-1" /> Add Tag
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Tag</DialogTitle>
                          <DialogDescription>
                            Create a new tag for this client.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tagName" className="text-right">
                              Tag Name
                            </Label>
                            <Input id="tagName" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="tagColor" className="text-right">
                              Color
                            </Label>
                            <Select>
                              <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a color" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="blue">Blue</SelectItem>
                                <SelectItem value="green">Green</SelectItem>
                                <SelectItem value="red">Red</SelectItem>
                                <SelectItem value="purple">Purple</SelectItem>
                                <SelectItem value="yellow">Yellow</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit">Add Tag</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Projects Tab */}
        <TabsContent value="projects" className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Client Projects</h3>
            <Button onClick={() => window.location.href = '/manager/project/create'}>
              <Plus className="h-4 w-4 mr-2" /> New Project
            </Button>
          </div>
          
          {isLoadingProjects ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Loading projects...</span>
            </div>
          ) : clientProjects && clientProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {clientProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {project.description && project.description.length > 100 
                            ? `${project.description.substring(0, 100)}...` 
                            : project.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      <Badge 
                        className={
                          project.status === 'Completed' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                          project.status === 'In Progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                          'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }
                      >
                        {project.status === 'Completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {project.status === 'In Progress' && <Clock className="h-3 w-3 mr-1" />}
                        {project.status === 'On Hold' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {project.status || 'Unknown'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{project.progress || 0}%</span>
                      </div>
                      <Progress value={project.progress || 0} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Start Date:</span>
                        <span className="ml-2">
                          {project.startDate ? formatDate(project.startDate) : 'Not set'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Deadline:</span>
                        <span className="ml-2">
                          {project.endDate ? formatDate(project.endDate) : 'No deadline'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="ml-2">
                          ${project.budget ? project.budget.toLocaleString() : 'Not set'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Team Size:</span>
                        <span className="ml-2">{project.teamSize || 'Not specified'}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" /> View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" /> Edit Project
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No projects found</h3>
                <p className="text-muted-foreground text-center mb-6">
                  This client doesn't have any projects yet.
                </p>
                <Button onClick={() => window.location.href = '/manager/project/create'}>
                  <Plus className="h-4 w-4 mr-2" /> Create First Project
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Pricing & Billing Tab */}
        <TabsContent value="pricing" className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Payment Structure</CardTitle>
                  <CardDescription>Set up the client's payment structure</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment-plan">Payment Plan</Label>
                      <Select value={selectedPaymentPlan} onValueChange={setSelectedPaymentPlan}>
                        <SelectTrigger id="payment-plan">
                          <SelectValue placeholder="Select payment plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Full Payment</SelectItem>
                          <SelectItem value="40-60">40% Upfront + 60% on Completion</SelectItem>
                          <SelectItem value="custom">Custom Payment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedPaymentPlan === 'custom' && (
                      <div className="space-y-2">
                        <Label htmlFor="custom-amount">Initial Payment Amount ($)</Label>
                        <Input 
                          id="custom-amount" 
                          type="number" 
                          placeholder="Enter amount" 
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                        />
                      </div>
                    )}
                    
                    <div className="rounded-lg border p-4 mt-4">
                      <h4 className="font-medium mb-2">Billing Breakdown</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Project Amount:</span>
                          <span className="font-medium">$5,000.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Initial Payment:</span>
                          <span className="font-medium">${calculatePayment(5000).initial.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Remaining Balance:</span>
                          <span className="font-medium">${calculatePayment(5000).remaining.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full">Save Payment Structure</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Billing Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-3 text-left font-medium">Payment Phase</th>
                          <th className="py-2 px-3 text-left font-medium">Amount</th>
                          <th className="py-2 px-3 text-left font-medium">Status</th>
                          <th className="py-2 px-3 text-left font-medium">Due Date</th>
                          <th className="py-2 px-3 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentPhases.map((phase, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-3 px-3">{phase.phase}</td>
                            <td className="py-3 px-3">${phase.amount.toLocaleString()}</td>
                            <td className="py-3 px-3">
                              <Badge className={
                                phase.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                phase.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {phase.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-3">{formatDate(phase.dueDate)}</td>
                            <td className="py-3 px-3">
                              {phase.status === 'Pending' ? (
                                <Button size="sm" variant="outline">
                                  <DollarSign className="h-3 w-3 mr-1" /> Record Payment
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline">
                                  <Download className="h-3 w-3 mr-1" /> Receipt
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Recent Invoices</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-1" /> Create Invoice
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xl">
                        <DialogHeader>
                          <DialogTitle>Create New Invoice</DialogTitle>
                          <DialogDescription>
                            Generate a new invoice for this client.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          createInvoice.mutate(invoiceFormData);
                        }}>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="invoice-project" className="text-right">
                                Project
                              </Label>
                              <Select 
                                onValueChange={(value) => 
                                  setInvoiceFormData({...invoiceFormData, projectId: value})
                                }
                                value={invoiceFormData.projectId}
                              >
                                <SelectTrigger id="invoice-project" className="col-span-3">
                                  <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                  {clientProjects?.map(project => (
                                    <SelectItem key={project.id} value={project.id.toString()}>
                                      {project.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="invoice-amount" className="text-right">
                                Amount
                              </Label>
                              <Input 
                                id="invoice-amount" 
                                type="number" 
                                className="col-span-3" 
                                placeholder="0.00" 
                                value={invoiceFormData.amount}
                                onChange={(e) => 
                                  setInvoiceFormData({...invoiceFormData, amount: e.target.value})
                                }
                                required
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="invoice-date" className="text-right">
                                Due Date
                              </Label>
                              <Input 
                                id="invoice-date" 
                                type="date" 
                                className="col-span-3" 
                                value={invoiceFormData.dueDate}
                                onChange={(e) => 
                                  setInvoiceFormData({...invoiceFormData, dueDate: e.target.value})
                                }
                                required
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="invoice-description" className="text-right">
                                Description
                              </Label>
                              <Textarea 
                                id="invoice-description" 
                                className="col-span-3" 
                                placeholder="Invoice details..." 
                                value={invoiceFormData.description}
                                onChange={(e) => 
                                  setInvoiceFormData({...invoiceFormData, description: e.target.value})
                                }
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="invoice-number" className="text-right">
                                Invoice #
                              </Label>
                              <Input 
                                id="invoice-number" 
                                className="col-span-3" 
                                value={invoiceFormData.invoiceNumber}
                                onChange={(e) => 
                                  setInvoiceFormData({...invoiceFormData, invoiceNumber: e.target.value})
                                }
                                required
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              type="submit" 
                              disabled={createInvoice.isPending}
                            >
                              {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoices.map((invoice, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-muted/40 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-primary" />
                              {invoice.id} - {invoice.project}
                            </h4>
                            <div className="text-sm text-muted-foreground mt-1">
                              Issued: {formatDate(invoice.date)} • Due: {formatDate(invoice.dueDate)}
                            </div>
                          </div>
                          <Badge className={
                            invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'Pending' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {invoice.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <div className="text-lg font-semibold">${invoice.amount.toLocaleString()}</div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" /> View
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" /> Download
                            </Button>
                            {invoice.status !== 'Paid' && (
                              <Button size="sm">
                                <Send className="h-3 w-3 mr-1" /> Send
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold">$3,200</div>
                            <p className="text-sm text-muted-foreground">Paid Amount</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <CreditCard className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                            <div className="text-2xl font-bold">$5,000</div>
                            <p className="text-sm text-muted-foreground">Outstanding</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium mb-3">Payment Statistics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Payment on time:</span>
                          <div className="flex items-center">
                            <span className="text-sm font-medium">80%</span>
                            <div className="w-24 h-2 bg-muted ml-2 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 w-4/5"></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Average payment time:</span>
                          <span className="text-sm font-medium">5 days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Total projects value:</span>
                          <span className="text-sm font-medium">$12,500</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Files & Docs Tab */}
        <TabsContent value="files" className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Client Files & Documents</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" /> Upload File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload New File</DialogTitle>
                  <DialogDescription>
                    Upload a file to associate with this client.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop files here, or click to browse
                    </p>
                    <Input id="file-upload" type="file" className="hidden" />
                    <Button size="sm" variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                      Browse Files
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Max file size: 25MB
                    </p>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="file-category" className="text-right">
                      Category
                    </Label>
                    <Select>
                      <SelectTrigger id="file-category" className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="invoice">Invoice</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="specification">Specification</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="file-description" className="text-right">
                      Description
                    </Label>
                    <Input id="file-description" className="col-span-3" placeholder="Optional description" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Upload</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {clientFiles.map((file) => (
              <Card key={file.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center justify-center py-4 mb-3 bg-muted/40 rounded-lg">
                    {file.type === 'pdf' && <File className="h-12 w-12 text-red-500" />}
                    {file.type === 'docx' && <File className="h-12 w-12 text-blue-500" />}
                    {file.type === 'png' && <ImageIcon className="h-12 w-12 text-green-500" />}
                    {file.type === 'jpg' && <ImageIcon className="h-12 w-12 text-amber-500" />}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium truncate" title={file.name}>{file.name}</h4>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>{file.size}</span>
                      <Badge variant="outline" className="text-xs font-normal">
                        {file.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(file.uploadDate)}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-2 pb-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" /> View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3 mr-1" /> Download
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Use a named ImageIcon component for image files
const ImageIcon = (props: any) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
};