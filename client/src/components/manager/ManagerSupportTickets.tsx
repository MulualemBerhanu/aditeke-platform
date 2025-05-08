import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User,
  Loader2, 
  ChevronLeft, 
  Send,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';

// Interface for ticket data
interface SupportTicket {
  id: number;
  clientId: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string | null;
  assignedToId: number | null;
  assigneeName?: string | null;
  clientName?: string;
  clientEmail?: string;
  clientCompany?: string;
  messages?: TicketMessage[];
}

interface TicketMessage {
  id: number;
  ticketId: number;
  userId: number;
  userName: string;
  userRole: string;
  message: string;
  createdAt: string;
}

interface ManagerSupportTicketsProps {
  selectedClientId?: string | null;
}

const ManagerSupportTickets: React.FC<ManagerSupportTicketsProps> = ({ selectedClientId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
  const [newReply, setNewReply] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>(selectedClientId || 'all');
  const [activeView, setActiveView] = useState<'list' | 'detail'>('list');
  
  // Reset to list view when selectedClientId changes
  useEffect(() => {
    setActiveView('list');
    setActiveTicketId(null);
    setClientFilter(selectedClientId || 'all');
  }, [selectedClientId]);

  // Fetch all support tickets visible to the manager
  const { 
    data: tickets = [], 
    isLoading: isLoadingTickets, 
    error: ticketsError
  } = useQuery({
    queryKey: ['/api/all-support-tickets', selectedClientId],
    queryFn: async () => {
      try {
        console.log('Fetching support tickets for manager view');
        
        // Use different endpoint depending on whether we're viewing all tickets or client-specific
        const endpoint = selectedClientId 
          ? `/api/client-support-tickets/${selectedClientId}` 
          : '/api/all-support-tickets';
        
        const response = await apiRequest('GET', endpoint);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch support tickets');
        }
        
        const data = await response.json();
        console.log('Support tickets fetched:', data);
        return data;
      } catch (error) {
        console.error('Error fetching support tickets:', error);
        throw error;
      }
    },
    retry: 1
  });

  // Fetch client list for filtering
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/public/client-options'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/public/client-options');
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching clients:', error);
        return [];
      }
    }
  });

  // Fetch team members for assigning tickets
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['/api/team-members'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/team-members');
        if (!response.ok) {
          // Return empty array if endpoint doesn't exist yet
          return [];
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching team members:', error);
        return [];
      }
    }
  });

  // Fetch specific ticket details when viewing a ticket
  const { 
    data: activeTicket,
    isLoading: isLoadingTicketDetails
  } = useQuery({
    queryKey: ['/api/support-tickets', activeTicketId],
    queryFn: async () => {
      if (!activeTicketId) return null;
      
      try {
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
        throw error;
      }
    },
    enabled: activeTicketId !== null,
    retry: 1
  });

  // Update ticket status mutation
  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: number, status: string }) => {
      console.log(`Updating ticket ${ticketId} status to ${status}`);
      const response = await apiRequest('PUT', `/api/support-tickets/${ticketId}`, { status });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update ticket status');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Status updated',
        description: 'The ticket status has been updated successfully.'
      });
      
      // Refresh ticket data
      queryClient.invalidateQueries({ queryKey: ['/api/all-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', activeTicketId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Assign ticket to team member mutation
  const assignTicketMutation = useMutation({
    mutationFn: async ({ ticketId, assignedToId }: { ticketId: number, assignedToId: number }) => {
      console.log(`Assigning ticket ${ticketId} to user ${assignedToId}`);
      const response = await apiRequest('PUT', `/api/support-tickets/${ticketId}/assign`, { assignedToId });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign ticket');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Ticket assigned',
        description: 'The ticket has been assigned successfully.'
      });
      
      // Refresh ticket data
      queryClient.invalidateQueries({ queryKey: ['/api/all-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', activeTicketId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error assigning ticket',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Reply to ticket mutation
  const replyToTicketMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: number, message: string }) => {
      console.log(`Sending reply to ticket ${ticketId}`);
      const response = await apiRequest('POST', `/api/support-tickets/${ticketId}/reply`, { message });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send reply');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Reply sent',
        description: 'Your reply has been sent successfully.'
      });
      
      // Clear the reply input
      setNewReply('');
      
      // Refresh ticket data
      queryClient.invalidateQueries({ queryKey: ['/api/manager-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', activeTicketId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error sending reply',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Apply filters to tickets
  const filteredTickets = tickets.filter((ticket: SupportTicket) => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.clientName && ticket.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesClient = clientFilter === 'all' || String(ticket.clientId) === clientFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesClient;
  });

  // Get status badge display
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-300">Open</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-300">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300">Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-300">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get priority badge display
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">Low</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200">Medium</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-50 border-orange-200">High</Badge>;
      case 'critical':
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200">Critical</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Handle sending a reply
  const handleSendReply = () => {
    if (!newReply.trim() || !activeTicketId) return;
    
    replyToTicketMutation.mutate({
      ticketId: activeTicketId,
      message: newReply
    });
  };

  // Handle status change
  const handleStatusChange = (status: string) => {
    if (!activeTicketId) return;
    
    updateTicketStatusMutation.mutate({
      ticketId: activeTicketId,
      status
    });
  };

  // Handle assignment change
  const handleAssignTicket = (assignedToId: number) => {
    if (!activeTicketId) return;
    
    assignTicketMutation.mutate({
      ticketId: activeTicketId,
      assignedToId
    });
  };

  // View ticket details
  const handleViewTicket = (ticketId: number) => {
    setActiveTicketId(ticketId);
    setActiveView('detail');
  };

  // Back to list view
  const handleBackToList = () => {
    setActiveView('list');
    setActiveTicketId(null);
  };

  // Get ticket conversation including the description as first message
  const getTicketConversation = () => {
    if (!activeTicket) return [];
    
    const messages = activeTicket.messages || [];
    
    // Add the initial ticket description as the first "message"
    const initialMessage = {
      id: 0,
      ticketId: activeTicket.id,
      userId: activeTicket.clientId,
      userName: activeTicket.clientName || 'Client',
      userRole: 'client',
      message: activeTicket.description,
      createdAt: activeTicket.createdAt
    };
    
    return [initialMessage, ...messages];
  };

  // UI for the ticket detail view
  const renderTicketDetail = () => {
    if (isLoadingTicketDetails) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Loading ticket details...</span>
        </div>
      );
    }
    
    if (!activeTicket) {
      return (
        <div className="flex flex-col items-center py-8">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-medium mb-2">Ticket not found</h3>
          <p className="text-muted-foreground text-center">
            The requested ticket could not be found.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleBackToList}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to tickets
          </Button>
        </div>
      );
    }
    
    const conversation = getTicketConversation();
    
    return (
      <div>
        <div className="mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToList}
            className="mb-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to all tickets
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between gap-3 mb-2">
            <div>
              <h2 className="text-xl font-semibold">{activeTicket.subject}</h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                <span className="flex items-center">
                  <User className="h-3.5 w-3.5 mr-1" />
                  {activeTicket.clientName || `Client #${activeTicket.clientId}`}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {formatDate(activeTicket.createdAt)}
                </span>
                <span>•</span>
                <span>Ticket #{activeTicket.id}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge(activeTicket.status)}
              {getPriorityBadge(activeTicket.priority)}
              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                {activeTicket.category}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Select 
                value={activeTicket.status} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Assigned to:</span>
              <Select 
                value={String(activeTicket.assignedToId || '')} 
                onValueChange={(value) => handleAssignTicket(parseInt(value))}
              >
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {teamMembers.map((member: any) => (
                    <SelectItem key={member.id} value={String(member.id)}>
                      {member.name || member.username}
                    </SelectItem>
                  ))}
                  {/* Always include the current user if not in list */}
                  {user && !teamMembers.some((m: any) => m.id === user.id) && (
                    <SelectItem value={String(user.id)}>
                      {user.name || user.username} (You)
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="border rounded-md mb-4">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="font-medium">Conversation</h3>
          </div>
          
          <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
            {conversation.map((message, index) => (
              <div 
                key={index} 
                className={`flex gap-3 ${
                  message.userRole === 'client' ? '' : 'justify-end'
                }`}
              >
                <div 
                  className={`flex max-w-[80%] ${
                    message.userRole === 'client' ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <Avatar className={`h-8 w-8 ${message.userRole === 'client' ? 'mr-2' : 'ml-2'}`}>
                    <AvatarFallback className={
                      message.userRole === 'client' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-green-100 text-green-700'
                    }>
                      {message.userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div 
                      className={`px-3 py-2 rounded-md ${
                        message.userRole === 'client' 
                          ? 'bg-blue-50 text-foreground' 
                          : 'bg-green-50 text-foreground'
                      }`}
                    >
                      <div className="text-xs font-medium mb-1">
                        {message.userName}
                        <span className="text-muted-foreground ml-2">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap">{message.message}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {conversation.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No messages in this conversation.
              </div>
            )}
          </div>
        </div>
        
        <div className="border rounded-md">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="font-medium">Reply</h3>
          </div>
          
          <div className="p-4">
            <Textarea
              placeholder="Type your reply here..."
              className="mb-3 min-h-[100px]"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
            />
            
            <div className="flex justify-end">
              <Button 
                onClick={handleSendReply}
                disabled={!newReply.trim() || replyToTicketMutation.isPending}
              >
                {replyToTicketMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // UI for the tickets list view
  const renderTicketsList = () => {
    if (isLoadingTickets) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Loading support tickets...</span>
        </div>
      );
    }
    
    if (ticketsError) {
      return (
        <div className="flex flex-col items-center py-8">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-medium mb-2">Error loading tickets</h3>
          <p className="text-muted-foreground text-center">
            There was an error loading support tickets. Please try again later.
          </p>
        </div>
      );
    }
    
    if (filteredTickets.length === 0) {
      return (
        <div className="flex flex-col items-center py-8 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-medium mb-2">No support tickets found</h3>
          <p className="text-muted-foreground max-w-md">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || clientFilter !== 'all'
              ? "No tickets match your current filters. Try adjusting your search criteria."
              : "There are no support tickets in the system yet."}
          </p>
        </div>
      );
    }
    
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket: SupportTicket) => (
              <TableRow key={ticket.id} className="cursor-pointer" onClick={() => handleViewTicket(ticket.id)}>
                <TableCell className="font-medium">{ticket.subject}</TableCell>
                <TableCell>{ticket.clientName || `Client #${ticket.clientId}`}</TableCell>
                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                <TableCell>
                  {ticket.assigneeName || 
                    <span className="text-muted-foreground text-sm">Unassigned</span>
                  }
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTicket(ticket.id);
                    }}
                    className="h-8 px-2 text-xs"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div>
      {activeView === 'list' ? (
        <>
          {/* Filters and search for list view */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={priorityFilter}
                onValueChange={setPriorityFilter}
              >
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              
              {!selectedClientId && (
                <Select
                  value={clientFilter}
                  onValueChange={setClientFilter}
                >
                  <SelectTrigger className="w-[180px] h-9">
                    <SelectValue placeholder="Client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((client: any) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.name || client.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          {/* Tabs for ticket categories */}
          <div className="border-b mb-6">
            <nav className="-mb-px flex space-x-6">
              {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((tab) => {
                const value = tab === 'All' ? 'all' : tab.toLowerCase().replace(' ', '-');
                return (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(value)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      statusFilter === value
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {renderTicketsList()}
        </>
      ) : (
        renderTicketDetail()
      )}
    </div>
  );
};

export default ManagerSupportTickets;