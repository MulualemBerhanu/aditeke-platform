import React, { useState, useEffect } from 'react';
import ClientLayout from '@/components/client/ClientLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HelpCircle,
  LifeBuoy,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  FileText,
  ExternalLink,
  ChevronRight,
  Search,
  BookOpen,
  Archive
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistance } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Interface for support ticket
interface SupportTicket {
  id: number;
  clientId: number;
  title?: string;
  subject?: string; // For backward compatibility with API
  description?: string;
  status?: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  createdAt: string;
  updatedAt?: string | null;
  assignedTo?: number;
  assigneeName?: string;
}

// FAQ data
const faqData = [
  {
    question: "How do I request changes to my project?",
    answer: "You can request changes to your project by creating a new support ticket with the category 'Change Request'. Please provide as much detail as possible about the changes you need."
  },
  {
    question: "What information should I include in a bug report?",
    answer: "For effective bug reports, please include: 1) Steps to reproduce the issue, 2) Expected behavior, 3) Actual behavior, 4) Screenshots if applicable, 5) Your browser/device information, and 6) How critical the issue is to your workflow."
  },
  {
    question: "How long does it typically take to resolve a support ticket?",
    answer: "Resolution times vary based on the complexity of the issue and the current support queue. For urgent matters, we aim to respond within 4 hours. Standard tickets are typically addressed within 1-2 business days."
  },
  {
    question: "Can I upgrade my support priority level?",
    answer: "Yes, if you have an urgent issue that requires immediate attention, please create a ticket and mark it as 'Urgent'. For recurring priority support, you may want to discuss a premium support package with your account manager."
  },
  {
    question: "How do I access documentation for my project?",
    answer: "Project documentation is available in the Documents section of your client dashboard. If you're missing specific documentation, please create a support ticket requesting the information you need."
  }
];

const ClientSupport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [clientId, setClientId] = useState<number | null>(null);
  
  // Get ticket ID from URL parameters
  const params = useParams();
  const urlTicketId = params.id ? parseInt(params.id, 10) : null;
  
  // Use URL parameter for activeTicketId if available
  const [activeTicketId, setActiveTicketId] = useState<number | null>(urlTicketId);
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Technical Issue'
  });

  // Set clientId from user object when user data is available
  useEffect(() => {
    if (user) {
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      setClientId(userId);
    } else {
      // Try to get from localStorage as fallback
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const userId = typeof parsedUser.id === 'string' ? parseInt(parsedUser.id) : parsedUser.id;
          setClientId(userId);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    }
  }, [user]);
  
  // Auto-select ticket from URL parameter on load
  useEffect(() => {
    if (urlTicketId && urlTicketId !== activeTicketId) {
      console.log(`Setting active ticket from URL parameter: ${urlTicketId}`);
      setActiveTicketId(urlTicketId);
    }
  }, [urlTicketId]);

  // Fetch client support tickets (using updated endpoint)
  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ['/api/client-support-tickets', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      console.log(`Fetching support tickets for client ID: ${clientId}`);
      
      try {
        // Use the apiRequest helper which handles authentication properly
        const { apiRequest } = await import('@/lib/queryClient');
        
        // Try the client-specific endpoint first, fall back to the direct one if needed
        let response = await apiRequest('GET', `/api/client-support-tickets/${clientId}`);
        let retryWithDirectEndpoint = false;
        
        if (!response.ok) {
          console.log(`Client-specific endpoint failed, trying direct endpoint`);
          retryWithDirectEndpoint = true;
        }
        
        // If the client-specific endpoint failed, try the direct endpoint
        if (retryWithDirectEndpoint) {
          response = await apiRequest('GET', `/api/client-support-tickets/by-client/${clientId}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch support tickets');
          }
        }
        
        const data = await response.json();
        console.log('Support tickets fetched:', data);
        return data;
      } catch (error) {
        console.error('Error fetching support tickets:', error);
        // Return empty array instead of throwing to prevent UI issues
        return [];
      }
    },
    enabled: !!clientId,
    retry: 2, // Increase retries for authentication issues
  });

  // Helper function to try multiple approaches for ticket status updates
  const tryUpdateTicketStatus = async (ticketId: number, status: string): Promise<any> => {
    // Input validation
    if (!ticketId || typeof ticketId !== 'number') {
      throw new Error(`Invalid ticket ID: ${ticketId} (${typeof ticketId})`);
    }
    
    if (!status || typeof status !== 'string') {
      throw new Error(`Invalid status: ${status} (${typeof status})`);
    }
    
    console.log(`🔄 Attempting to update ticket ${ticketId} to status ${status} with multiple approaches`);
    console.log(`🔄 Current time: ${new Date().toISOString()}`);
    console.log(`🔄 Ticket ID type: ${typeof ticketId}`);
    
    // Check authentication details
    const authToken = localStorage.getItem('access_token');
    const csrfToken = document.cookie.match(/csrf_token=([^;]+)/)?.[1] || '';
    
    console.log(`🔐 Auth token available: ${!!authToken}`);
    console.log(`🔐 Auth token length: ${authToken?.length || 0}`);
    console.log(`🔐 CSRF token available: ${!!csrfToken}`);
    console.log(`🔐 CSRF token: ${csrfToken}`);
    
    // Prepare the status data
    const statusData = { status };
    
    // Collection of error messages for better debugging
    const errors: string[] = [];
    
    // 1. Try the POST endpoint first with direct fetch
    try {
      console.log(`📤 Approach 1: POST to /api/ticket-status-update/${ticketId}`);
      console.log(`POST request data: ${JSON.stringify(statusData)}`);
      
      const postResponse = await fetch(`/api/ticket-status-update/${ticketId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(statusData),
        credentials: 'include'
      });
      
      if (postResponse.ok) {
        console.log(`✅ Successfully updated ticket ${ticketId} using POST endpoint`);
        return await postResponse.json();
      } else {
        const errorText = await postResponse.text();
        errors.push(`POST approach failed: ${postResponse.status} - ${errorText}`);
        console.warn(`⚠️ POST approach failed: ${postResponse.status}`, errorText);
      }
    } catch (err) {
      const error = err as Error;
      errors.push(`POST approach error: ${error.message || 'Unknown error'}`);
      console.warn(`⚠️ POST approach error:`, error);
    }
    
    // 2. Try the PUT endpoint as a fallback
    try {
      console.log(`📤 Approach 2: PUT to /api/client-ticket-status/${ticketId}`);
      
      const putResponse = await fetch(`/api/client-ticket-status/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(statusData),
        credentials: 'include'
      });
      
      if (putResponse.ok) {
        console.log(`✅ Successfully updated ticket ${ticketId} using PUT endpoint`);
        return await putResponse.json();
      } else {
        const errorText = await putResponse.text();
        errors.push(`PUT approach failed: ${putResponse.status} - ${errorText}`);
        console.warn(`⚠️ PUT approach failed: ${putResponse.status}`, errorText);
      }
    } catch (err) {
      const error = err as Error;
      errors.push(`PUT approach error: ${error.message || 'Unknown error'}`);
      console.warn(`⚠️ PUT approach error:`, error);
    }
    
    // 3. Try the GET endpoint as last resort
    try {
      console.log(`📤 Approach 3: GET to /api/simple-resolve-ticket/${ticketId}/${status}`);
      
      const getResponse = await fetch(`/api/simple-resolve-ticket/${ticketId}/${status}`);
      
      if (getResponse.ok) {
        console.log(`✅ Successfully updated ticket ${ticketId} using GET endpoint`);
        return await getResponse.json();
      } else {
        const errorText = await getResponse.text();
        errors.push(`GET approach failed: ${getResponse.status} - ${errorText}`);
        console.warn(`⚠️ GET approach failed: ${getResponse.status}`, errorText);
      }
    } catch (err) {
      const error = err as Error;
      errors.push(`GET approach error: ${error.message || 'Unknown error'}`);
      console.warn(`⚠️ GET approach error:`, error);
    }
    
    // 4. Try our new minimal endpoint that's specially designed to be extremely robust
    try {
      console.log(`📤 Approach 4: POST to /api/minimal-ticket-update/${ticketId}/${status}`);
      
      const minimalResponse = await fetch(`/api/minimal-ticket-update/${ticketId}/${status}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include'
      });
      
      if (minimalResponse.ok) {
        console.log(`✅ Successfully updated ticket ${ticketId} using minimal endpoint`);
        return await minimalResponse.json();
      } else {
        const errorText = await minimalResponse.text();
        errors.push(`Minimal endpoint approach failed: ${minimalResponse.status} - ${errorText}`);
        console.warn(`⚠️ Minimal endpoint approach failed: ${minimalResponse.status}`, errorText);
      }
    } catch (err) {
      const error = err as Error;
      errors.push(`Minimal endpoint approach error: ${error.message || 'Unknown error'}`);
      console.warn(`⚠️ Minimal endpoint approach error:`, error);
    }
    
    // 5. Try direct query parameter approach
    try {
      console.log(`📤 Approach 5: POST with query params to /api/ticket-status-update/${ticketId}?status=${status}`);
      
      const queryResponse = await fetch(`/api/ticket-status-update/${ticketId}?status=${status}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-CSRF-Token': csrfToken
        },
        credentials: 'include'
      });
      
      if (queryResponse.ok) {
        console.log(`✅ Successfully updated ticket ${ticketId} using query parameter approach`);
        return await queryResponse.json();
      } else {
        const errorText = await queryResponse.text();
        errors.push(`Query param approach failed: ${queryResponse.status} - ${errorText}`);
        console.warn(`⚠️ Query param approach failed: ${queryResponse.status}`, errorText);
      }
    } catch (error) {
      errors.push(`Query param approach error: ${error.message}`);
      console.warn(`⚠️ Query param approach error:`, error);
    }
    
    // If all approaches failed, throw a comprehensive error
    throw new Error(`All update approaches failed: ${errors.join('; ')}`);
  };

  // Update ticket mutation using dedicated client endpoint for status updates
  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, updateData }: { ticketId: number, updateData: any }) => {
      try {
        console.log(`🔄 Starting status update for ticket ${ticketId}...`);
        console.log(`🔄 Updating ticket ${ticketId} status to: ${updateData.status}`);
        console.log(`🔄 Current time: ${new Date().toISOString()}`);
        console.log(`🔄 Ticket ID type: ${typeof ticketId}`);
        
        // Log authentication state for debugging
        console.log(`🔐 Auth token available: ${!!localStorage.getItem('access_token')}`);
        console.log(`🔐 CSRF token available: ${!!document.cookie.match(/csrf_token=([^;]+)/)?.[1]}`);
        
        // Try our multi-approach update function
        const result = await tryUpdateTicketStatus(ticketId, updateData.status);
        console.log(`✅ Successfully updated ticket status:`, result);
        return result;
      } catch (error) {
        console.error('❌ Error updating support ticket:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log(`✅ Status update mutation succeeded with result:`, data);
      
      // Invalidate queries to refresh data
      console.log(`🔄 Refreshing ticket data for client ID ${clientId} and ticket ID ${activeTicketId}`);
      queryClient.invalidateQueries({ queryKey: ['/api/client-support-tickets', clientId] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', activeTicketId] });
      
      // Show success message with action-specific text
      const ticket = getActiveTicket();
      const statusText = ticket?.status === 'resolved' ? 'resolved' : 
                         ticket?.status === 'closed' ? 'closed' : 
                         ticket?.status || 'updated';
      
      toast({
        title: 'Success',
        description: `Your support ticket has been ${statusText} successfully.`,
      });
    },
    onError: (error) => {
      console.error('❌ Error details:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      // Create descriptive error message
      let errorMessage = 'Failed to update the ticket. ';
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.message?.includes('401') || error.message?.includes('auth')) {
        errorMessage += 'Your session may have expired. Please try logging in again.';
      } else if (error.message?.includes('404')) {
        errorMessage += 'The ticket could not be found. It may have been deleted.';
      } else {
        errorMessage += error.message || 'Please try again later.';
      }
      
      toast({
        title: 'Error Updating Ticket',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Invalidate queries to ensure UI is updated with latest data even after error
      queryClient.invalidateQueries({ queryKey: ['/api/client-support-tickets', clientId] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', activeTicketId] });
    }
  });
  
  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      try {
        // Use the apiRequest helper which handles authentication properly
        const { apiRequest } = await import('@/lib/queryClient');
        console.log('Sending ticket data to API:', ticketData);
        
        // Try our new raw endpoint first
        try {
          // Prepare the ticket data with the proper field names
          const ticketPayload = {
            ...ticketData,
            subject: ticketData.title || ticketData.subject,
            description: ticketData.description,
            status: 'open',
            createdAt: new Date().toISOString()
          };
          
          console.log('Using raw endpoint for ticket creation:', ticketPayload);
          // Get current auth tokens
          const authToken = localStorage.getItem('access_token');
          const csrfToken = document.cookie.match(/csrf_token=([^;]+)/)?.[1] || '';
          
          console.log(`🔐 Auth token available for ticket creation: ${!!authToken}`);
          console.log(`🔐 Auth token length: ${authToken?.length || 0}`);
          console.log(`🔐 CSRF token available: ${!!csrfToken}`);
          
          const rawResponse = await fetch('/api/raw-support-tickets', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
              'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(ticketPayload),
            credentials: 'include'
          });
          
          if (!rawResponse.ok) {
            throw new Error(`Raw endpoint failed: ${rawResponse.status}`);
          }
          
          return await rawResponse.json();
        } catch (rawError) {
          console.error('Raw endpoint failed:', rawError);
          console.log('Falling back to standard endpoint...');
          
          // Fall back to the standard endpoint if raw fails
          const response = await apiRequest('POST', '/api/support-tickets', {
            ...ticketData,
            // Ensure we're sending the right fields
            subject: ticketData.title || ticketData.subject,
            description: ticketData.description
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create support ticket');
          }
          
          return await response.json();
        }
      } catch (error) {
        console.error('Error creating support ticket:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log(`✅ Ticket creation succeeded with result:`, data);
      
      // Invalidate queries to refresh data
      console.log(`🔄 Refreshing ticket data for client ID ${clientId}`);
      queryClient.invalidateQueries({ queryKey: ['/api/client-support-tickets', clientId] });
      
      // Reset form and close dialog
      setCreateTicketOpen(false);
      setNewTicket({
        title: '',
        description: '',
        priority: 'medium',
        category: 'Technical Issue'
      });
      
      toast({
        title: 'Support Ticket Created',
        description: 'Your support ticket has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('❌ Error creating support ticket:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      // Create descriptive error message
      let errorMessage = 'Failed to create the ticket. ';
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.message?.includes('401') || error.message?.includes('auth')) {
        errorMessage += 'Your session may have expired. Please try logging in again.';
      } else {
        errorMessage += error.message || 'Please try again later.';
      }
      
      toast({
        title: 'Error Creating Ticket',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  });

  const handleCreateTicket = () => {
    if (!newTicket.title.trim() || !newTicket.description.trim()) {
      toast({
        title: 'Warning',
        description: 'Please provide both title and description',
        variant: 'destructive',
      });
      return;
    }
    
    if (!clientId) {
      toast({
        title: 'Error',
        description: 'Client ID not available',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('Creating support ticket with data:', {
      clientId,
      subject: newTicket.title,
      description: newTicket.description,
      priority: newTicket.priority,
      category: newTicket.category
    });
    
    createTicketMutation.mutate({
      clientId,
      subject: newTicket.title, // Changed from title to subject to match schema
      description: newTicket.description,
      priority: newTicket.priority,
      category: newTicket.category,
      status: 'open',
      createdAt: new Date().toISOString()
    });
  };

  // Fetch individual support ticket details
  const { data: activeTicketData, isLoading: isLoadingTicket } = useQuery({
    queryKey: ['/api/support-tickets', activeTicketId],
    queryFn: async () => {
      if (!activeTicketId) return null;
      
      try {
        // Use the apiRequest helper which handles authentication properly
        const { apiRequest } = await import('@/lib/queryClient');
        const response = await apiRequest('GET', `/api/support-tickets/${activeTicketId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch ticket details');
        }
        
        const data = await response.json();
        console.log('Ticket details fetched:', data);
        return data;
      } catch (error) {
        console.error('Error fetching ticket details:', error);
        // Return null instead of throwing to prevent UI issues
        return null;
      }
    },
    enabled: !!activeTicketId,
    retry: 2, // Increase retries for authentication issues
  });

  const handleTicketClick = (ticketId: number) => {
    // Update state
    setActiveTicketId(ticketId);
    
    // Update URL without full page reload for better navigation
    const newUrl = `/client/support/${ticketId}`;
    window.history.pushState({}, '', newUrl);
  };

  const getActiveTicket = (): SupportTicket | null | undefined => {
    // Use the fetched ticket data if available, otherwise fall back to the ticket from the list
    const ticket = activeTicketData || tickets?.find((t: SupportTicket) => t.id === activeTicketId);
    
    // Ensure we return a ticket with all the expected properties even if some are missing
    if (ticket) {
      return {
        id: ticket.id,
        clientId: ticket.clientId,
        title: ticket.title || ticket.subject || 'Support Request',
        subject: ticket.subject || ticket.title || 'Support Request',
        description: ticket.description || 'No description provided',
        status: ticket.status || 'open',
        priority: ticket.priority || 'medium',
        category: ticket.category || 'General',
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt || null,
        assignedTo: ticket.assignedTo || null,
        assigneeName: ticket.assigneeName || 'Unassigned'
      };
    }
    
    return null;
  };

  const filteredFaqs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter tickets by status
  const openTickets = tickets?.filter((t: SupportTicket) => t.status === 'open' || t.status === 'in-progress') || [];
  const closedTickets = tickets?.filter((t: SupportTicket) => t.status === 'resolved' || t.status === 'closed') || [];
  
  return (
    <ClientLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Support Center</h1>
            <p className="text-slate-500">Get help with your projects and account</p>
          </div>
          <div className="flex items-start">
            <Dialog open={createTicketOpen} onOpenChange={setCreateTicketOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <LifeBuoy className="h-4 w-4 mr-2" />
                  Create Support Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Create Support Ticket</DialogTitle>
                  <DialogDescription>
                    Submit a new support request to our team
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Brief summary of your issue"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Please provide detailed information about your issue..."
                      rows={6}
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        value={newTicket.category}
                        onValueChange={(value) => setNewTicket({...newTicket, category: value})}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                          <SelectItem value="Billing Question">Billing Question</SelectItem>
                          <SelectItem value="Feature Request">Feature Request</SelectItem>
                          <SelectItem value="Account Issue">Account Issue</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={newTicket.priority}
                        onValueChange={(value) => setNewTicket({...newTicket, priority: value})}
                      >
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateTicketOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleCreateTicket} 
                    disabled={createTicketMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {createTicketMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="tickets">
          <TabsList className="mb-4">
            <TabsTrigger value="tickets">My Support Tickets</TabsTrigger>
            <TabsTrigger value="faq">FAQ & Knowledge Base</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tickets">
            {isLoading ? (
              // Loading state with skeletons
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-5 w-24 mb-2" />
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-2 p-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center space-x-2 p-2">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-1 flex-1">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-3 w-2/3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="md:col-span-2">
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="text-center py-12">
                        <HelpCircle className="h-12 w-12 mx-auto text-slate-300" />
                        <p className="mt-2 text-slate-500">Select a ticket to view details</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : tickets && tickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tickets list */}
                <div className="md:col-span-1">
                  <Card>
                    <CardHeader className="pb-2">
                      <Tabs defaultValue="open">
                        <TabsList className="w-full">
                          <TabsTrigger value="open" className="flex-1">
                            Open
                            {openTickets.length > 0 && (
                              <Badge className="ml-2 bg-indigo-600 text-white">{openTickets.length}</Badge>
                            )}
                          </TabsTrigger>
                          <TabsTrigger value="closed" className="flex-1">Closed</TabsTrigger>
                        </TabsList>

                        <TabsContent value="open" className="m-0 mt-2">
                          <ScrollArea className="h-[500px]">
                            {openTickets.length > 0 ? (
                              <div className="space-y-1">
                                {openTickets.map((ticket: SupportTicket) => (
                                  <div
                                    key={ticket.id}
                                    onClick={() => handleTicketClick(ticket.id)}
                                    className={`p-3 cursor-pointer hover:bg-slate-50 rounded-md transition-colors ${
                                      activeTicketId === ticket.id ? 'bg-slate-100' : ''
                                    }`}
                                  >
                                    <div className="flex items-start">
                                      <div className="mr-3 mt-0.5">
                                        {ticket.status === 'open' ? (
                                          <AlertCircle className="h-5 w-5 text-amber-500" />
                                        ) : (
                                          <Clock className="h-5 w-5 text-indigo-500" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm mb-1 truncate">
                                          {ticket.title || ticket.subject || 'Support Request'}
                                        </p>
                                        <div className="flex items-center">
                                          <Badge className={`mr-2 ${
                                            ticket.priority === 'urgent' ? 'bg-red-500' :
                                            ticket.priority === 'high' ? 'bg-amber-500' :
                                            ticket.priority === 'medium' ? 'bg-indigo-500' :
                                            'bg-green-500'
                                          }`}>
                                            {ticket.priority && typeof ticket.priority === 'string' 
                                              ? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)
                                              : 'Normal'}
                                          </Badge>
                                          <p className="text-xs text-slate-500">
                                            {ticket.createdAt 
                                              ? formatDistance(new Date(ticket.createdAt), new Date(), { addSuffix: true })
                                              : 'Recently'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-6 text-center">
                                <p className="text-slate-500">No open tickets</p>
                              </div>
                            )}
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="closed" className="m-0 mt-2">
                          <ScrollArea className="h-[500px]">
                            {closedTickets.length > 0 ? (
                              <div className="space-y-1">
                                {closedTickets.map((ticket: SupportTicket) => (
                                  <div
                                    key={ticket.id}
                                    onClick={() => handleTicketClick(ticket.id)}
                                    className={`p-3 cursor-pointer hover:bg-slate-50 rounded-md transition-colors ${
                                      activeTicketId === ticket.id ? 'bg-slate-100' : ''
                                    }`}
                                  >
                                    <div className="flex items-start">
                                      <div className="mr-3 mt-0.5">
                                        {ticket.status === 'resolved' ? (
                                          <CheckCircle className="h-5 w-5 text-amber-500" />
                                        ) : (
                                          <Archive className="h-5 w-5 text-slate-500" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm mb-1 truncate">
                                          {ticket.title || ticket.subject || 'Support Request'}
                                        </p>
                                        <div className="flex items-center">
                                          <Badge 
                                            variant={ticket.status === 'resolved' ? 'default' : 'outline'} 
                                            className={`mr-2 ${
                                              ticket.status === 'resolved' 
                                                ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200' 
                                                : 'text-slate-500 border-slate-200'
                                            }`}
                                          >
                                            {ticket.status === 'resolved' ? 'Resolved' : 'Closed'}
                                          </Badge>
                                          <p className="text-xs text-slate-500">
                                            {ticket.updatedAt
                                              ? formatDistance(new Date(ticket.updatedAt), new Date(), { addSuffix: true })
                                              : 'Recently'}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-6 text-center">
                                <p className="text-slate-500">No closed tickets</p>
                              </div>
                            )}
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                    </CardHeader>
                  </Card>
                </div>

                {/* Ticket details */}
                <div className="md:col-span-2">
                  <Card className="h-full">
                    {activeTicketId && getActiveTicket() ? (
                      <>
                        <CardHeader className="pb-2 border-b">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{getActiveTicket()?.title}</CardTitle>
                              {/* Using div instead of CardDescription to avoid DOM nesting issues */}
                              <div className="mt-1 text-sm text-muted-foreground">
                                <div className="flex items-center flex-wrap gap-2">
                                  <Badge className={`${
                                    getActiveTicket()?.status === 'open' ? 'bg-amber-500' :
                                    getActiveTicket()?.status === 'in-progress' ? 'bg-indigo-500' :
                                    getActiveTicket()?.status === 'resolved' ? 'bg-amber-500 text-amber-950' :
                                    'bg-slate-500'
                                  }`}>
                                    {(() => {
                                      const status = getActiveTicket()?.status;
                                      if (status === 'in-progress') return 'In Progress';
                                      if (status && typeof status === 'string') {
                                        return status.charAt(0).toUpperCase() + status.slice(1);
                                      }
                                      return 'Open';
                                    })()}
                                  </Badge>
                                  <Badge className={`${
                                    getActiveTicket()?.priority === 'urgent' ? 'bg-red-500' :
                                    getActiveTicket()?.priority === 'high' ? 'bg-amber-500' :
                                    getActiveTicket()?.priority === 'medium' ? 'bg-indigo-500' :
                                    'bg-green-500'
                                  }`}>
                                    {(() => {
                                      const priority = getActiveTicket()?.priority;
                                      if (priority && typeof priority === 'string') {
                                        return priority.charAt(0).toUpperCase() + priority.slice(1);
                                      }
                                      return 'Normal';
                                    })()} Priority
                                  </Badge>
                                  <span className="text-sm text-slate-500">
                                    Created {(() => {
                                      const createdAt = getActiveTicket()?.createdAt;
                                      if (createdAt && typeof createdAt === 'string') {
                                        return formatDistance(new Date(createdAt), new Date(), { addSuffix: true });
                                      }
                                      return 'recently';
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="prose max-w-none text-slate-700">
                            <p>{getActiveTicket()?.description || 'No additional details provided.'}</p>
                          </div>
                          
                          {getActiveTicket()?.assignedTo && (
                            <div className="mt-6 pt-4 border-t border-slate-100">
                              <p className="text-sm font-medium mb-2">Assigned To</p>
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                    {getActiveTicket()?.assigneeName?.[0] || 'S'}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{getActiveTicket()?.assigneeName || 'Support Team'}</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-6 pt-4 border-t border-slate-100">
                            <p className="text-sm font-medium mb-2">Ticket Updates</p>
                            {(() => {
                              const status = getActiveTicket()?.status;
                              
                              if (status === 'open') {
                                return (
                                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-700">
                                    <p className="text-sm">Your ticket has been received and is pending review.</p>
                                    <div className="mt-3 flex space-x-2">
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-amber-700 border-amber-300 hover:bg-amber-100"
                                        onClick={async () => {
                                          if (!activeTicketId) return;
                                          
                                          console.log(`Cancelling ticket ${activeTicketId}`);
                                          
                                          try {
                                            // Try using both methods to maximize chance of success
                                            
                                            // 1. First try our mutation (this is what wasn't working reliably)
                                            updateTicketMutation.mutate({ 
                                              ticketId: activeTicketId, 
                                              updateData: { 
                                                status: 'closed'
                                              } 
                                            });
                                            
                                            // 2. Also try our fallback method with direct GET request
                                            console.log("ALSO TRYING FALLBACK DIRECT METHOD");
                                            const fallbackUrl = `/api/simple-resolve-ticket/${activeTicketId}/closed`;
                                            console.log(`Fallback URL: ${fallbackUrl}`);
                                            
                                            // Make a direct fetch to the fallback endpoint
                                            const fallbackResponse = await fetch(fallbackUrl);
                                            console.log("Fallback response:", fallbackResponse.status);
                                            
                                            if (fallbackResponse.ok) {
                                              console.log("Fallback successful, refreshing data");
                                              // Refresh our data immediately
                                              queryClient.invalidateQueries({ queryKey: ['/api/client-support-tickets', clientId] });
                                              queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', activeTicketId] });
                                              
                                              // Force a manual refetch of the active ticket
                                              const { apiRequest } = await import('@/lib/queryClient');
                                              apiRequest('GET', `/api/support-tickets/${activeTicketId}`);
                                            }
                                          } catch (error) {
                                            console.error("Error cancelling ticket:", error);
                                            // Try to refresh anyway in case server-side update worked
                                            queryClient.invalidateQueries({ queryKey: ['/api/client-support-tickets', clientId] });
                                          }
                                        }}
                                        disabled={updateTicketMutation.isPending}
                                      >
                                        {updateTicketMutation.isPending ? 'Updating...' : 'Cancel Ticket'}
                                      </Button>
                                    </div>
                                  </div>
                                );
                              } else if (status === 'in-progress') {
                                return (
                                  <div className="bg-indigo-50 border border-indigo-200 rounded-md p-3 text-indigo-700">
                                    <p className="text-sm">A support representative is currently working on your ticket.</p>
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="bg-green-50 border border-green-200 rounded-md p-3 text-green-700">
                                    <p className="text-sm">This ticket has been resolved. Please let us know if you need further assistance.</p>
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        </CardContent>
                        <CardFooter className="border-t pt-4 flex justify-between">
                          <Button variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Add Comment
                          </Button>
                          {(() => {
                            const status = getActiveTicket()?.status;
                            if (status === 'closed') {
                              return null;
                            }
                            
                            const isResolved = status === 'resolved';
                            const newStatus = isResolved ? 'closed' : 'resolved';
                            
                            return (
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  className={`${
                                    isResolved
                                      ? 'border-red-200 text-red-600 hover:bg-red-50' 
                                      : 'border-amber-200 text-amber-600 hover:bg-amber-50'
                                  }`}
                                  onClick={() => {
                                    if (!activeTicketId) return;
                                    
                                    // Show what we're sending
                                    console.log(`Setting ticket ${activeTicketId} status to ${newStatus}`);
                                    console.log('Status update payload:', { status: newStatus });
                                    
                                    // Use our improved mutation with multiple fallback approaches
                                    updateTicketMutation.mutate({ 
                                      ticketId: activeTicketId, 
                                      updateData: { 
                                        status: newStatus 
                                      } 
                                    });
                                  }}
                                  disabled={updateTicketMutation.isPending}
                                >
                                  {isResolved 
                                    ? <Archive className="h-4 w-4 mr-2" /> 
                                    : <CheckCircle className="h-4 w-4 mr-2" />
                                  }
                                  
                                  {updateTicketMutation.isPending 
                                    ? 'Updating...' 
                                    : isResolved
                                      ? 'Close Ticket' 
                                      : 'Mark as Resolved'
                                  }
                                </Button>
                                
                                {updateTicketMutation.isPending && (
                                  <span className="text-xs flex items-center text-slate-500">
                                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    Processing...
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </CardFooter>
                      </>
                    ) : (
                      <CardContent className="p-6">
                        <div className="text-center py-12">
                          <HelpCircle className="h-12 w-12 mx-auto text-slate-300" />
                          <h3 className="text-xl font-semibold mt-4 mb-2">No Support Ticket Selected</h3>
                          <p className="text-slate-500 max-w-md mx-auto mb-6">
                            Select a ticket from the list to view its details, or create a new ticket.
                          </p>
                          <Button
                            onClick={() => setCreateTicketOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            <LifeBuoy className="h-4 w-4 mr-2" />
                            Create New Support Ticket
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <LifeBuoy className="h-12 w-12 mx-auto text-slate-300" />
                    <h3 className="text-xl font-semibold mt-4 mb-2">No Support Tickets</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                      You haven't created any support tickets yet. Create a new ticket to get help from our support team.
                    </p>
                    <Button
                      onClick={() => setCreateTicketOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <LifeBuoy className="h-4 w-4 mr-2" />
                      Create Your First Support Ticket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions about our services and platform
                </CardDescription>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search FAQs..." 
                    className="pl-8 bg-slate-50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {filteredFaqs.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-slate-600">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-500">No FAQs found matching your search query.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t flex flex-col items-start pt-4">
                <p className="text-sm text-slate-600 mb-2">
                  Need more comprehensive documentation?
                </p>
                <Button variant="outline" className="text-indigo-600">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Visit Knowledge Base
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Options</CardTitle>
                    <CardDescription>
                      Choose how you'd like to reach our support team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border border-slate-200 rounded-md p-4 hover:border-indigo-300 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-start">
                          <div className="bg-indigo-100 p-2 rounded mr-3">
                            <LifeBuoy className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-base">Support Ticket</h4>
                            <p className="text-sm text-slate-500 mt-1">
                              Create a support ticket for technical issues or account-related questions
                            </p>
                            <Button 
                              variant="link" 
                              className="text-indigo-600 p-0 h-auto mt-1 font-medium"
                              onClick={() => setCreateTicketOpen(true)}
                            >
                              Create Ticket <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-slate-200 rounded-md p-4 hover:border-indigo-300 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-start">
                          <div className="bg-indigo-100 p-2 rounded mr-3">
                            <MessageSquare className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-base">Live Chat</h4>
                            <p className="text-sm text-slate-500 mt-1">
                              Chat with our support team in real-time during business hours
                            </p>
                            <Button 
                              variant="link" 
                              className="text-indigo-600 p-0 h-auto mt-1 font-medium"
                              onClick={() => window.location.href = '/client/messages'}
                            >
                              Start Chat <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-slate-200 rounded-md p-4 hover:border-indigo-300 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-start">
                          <div className="bg-indigo-100 p-2 rounded mr-3">
                            <FileText className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-base">Documentation</h4>
                            <p className="text-sm text-slate-500 mt-1">
                              Browse our comprehensive documentation and guides
                            </p>
                            <Button 
                              variant="link" 
                              className="text-indigo-600 p-0 h-auto mt-1 font-medium"
                              onClick={() => window.location.href = '/client/documents'}
                            >
                              View Docs <ExternalLink className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Support</CardTitle>
                    <CardDescription>
                      Send a detailed message to our support team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" placeholder="Your name" defaultValue={user?.name || ''} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" placeholder="Your email address" defaultValue={user?.email || ''} />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" placeholder="Brief summary of your issue" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Please provide detailed information about your issue..."
                          rows={6}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <div className="text-xs text-slate-500">
                      <p>Our support team typically responds within 24 hours during business days.</p>
                    </div>
                    <Button 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => {
                        const subject = (document.getElementById('subject') as HTMLInputElement)?.value || 'Support Request';
                        const message = (document.getElementById('message') as HTMLTextAreaElement)?.value || '';
                        window.location.href = `mailto:support@aditeke.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ClientLayout>
  );
};

export default ClientSupport;