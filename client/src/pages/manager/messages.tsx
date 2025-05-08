import React, { useState, useEffect } from 'react';
import ManagerLayout from '@/components/manager/ManagerLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, Send, User, MessageSquare, UserPlus, Calendar } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistance } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Interface for message data that matches our schema
interface Message {
  id: number;
  clientId: number;
  managerId: number;
  message: string;
  createdAt: string;
  isRead: boolean;
  subject: string | null;
  type: string;
  attachments?: any;
  senderName?: string; // UI-only field, populated from user data
  fromManager?: boolean; // Indicates if the message is from manager to client
  senderRole?: string; // UI-only field, populated from role data
}

// Interface for a client with basic info
interface Client {
  id: number;
  name: string;
  email: string;
}

const ManagerMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [managerId, setManagerId] = useState<number | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<number | null>(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [replyMessageOpen, setReplyMessageOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState({
    clientId: '',
    subject: '',
    content: '',
    urgent: false
  });
  const [replyMessage, setReplyMessage] = useState({
    subject: '',
    content: '',
    urgent: false
  });

  // Set managerId from user object when user data is available
  useEffect(() => {
    if (user) {
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      setManagerId(userId);
    } else {
      // Try to get from localStorage as fallback
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const userId = typeof parsedUser.id === 'string' ? parseInt(parsedUser.id) : parsedUser.id;
          setManagerId(userId);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    }
  }, [user]);

  // Fetch manager messages using our standardized queryClient
  const { data: messages, isLoading: messagesLoading, error: messagesError } = useQuery({
    queryKey: ['/api/manager-communications', managerId],
    queryFn: async ({ queryKey }) => {
      if (!managerId) return [];
      console.log(`Fetching messages for manager ID: ${managerId}`);
      
      try {
        // Use the apiRequest helper which handles authentication properly
        const { apiRequest } = await import('@/lib/queryClient');
        const response = await apiRequest('GET', `/api/manager-communications/${managerId}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching messages: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Messages fetched successfully:', data);
        return data;
      } catch (error) {
        console.error('Error fetching messages:', error);
        // Return empty array instead of throwing to prevent UI issues
        return [];
      }
    },
    enabled: !!managerId,
    retry: 1, // Allow one retry for potential authentication issues
  });

  // Fetch clients for the dropdown
  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      try {
        const { apiRequest } = await import('@/lib/queryClient');
        const response = await apiRequest('GET', '/api/users/clients');
        
        if (!response.ok) {
          throw new Error(`Error fetching clients: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching clients:', error);
        // For now, use a sample client for testing
        return [
          { id: 2000, name: 'John Doe', email: 'client@aditeke.com' }
        ];
      }
    }
  });

  // Mark message as read
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      try {
        const { apiRequest } = await import('@/lib/queryClient');
        const response = await apiRequest('PUT', `/api/client-communications/${messageId}/read`);
        
        if (!response.ok) {
          throw new Error(`Error marking message as read: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error marking message as read:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manager-communications', managerId] });
      toast({
        title: 'Success',
        description: 'Message marked as read',
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark message as read',
        variant: 'destructive',
      });
    }
  });

  // Send new message
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      try {
        // Log the message data being sent for debugging
        console.log('Sending message data:', JSON.stringify(messageData));
        
        const { apiRequest } = await import('@/lib/queryClient');
        const response = await apiRequest('POST', '/api/client-communications', messageData);
        
        if (!response.ok) {
          throw new Error(`Error sending message: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manager-communications', managerId] });
      setNewMessageOpen(false);
      setNewMessage({
        clientId: '',
        subject: '',
        content: '',
        urgent: false
      });
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully.',
      });
    },
    onError: (error) => {
      console.error('Send message error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.clientId || !newMessage.subject.trim() || !newMessage.content.trim()) {
      toast({
        title: 'Warning',
        description: 'Please select a client and enter both subject and message content',
        variant: 'destructive',
      });
      return;
    }
    
    if (!managerId) {
      toast({
        title: 'Error',
        description: 'Manager ID not available',
        variant: 'destructive',
      });
      return;
    }
    
    // Convert clientId to number if it's a string
    const clientId = typeof newMessage.clientId === 'string' 
      ? parseInt(newMessage.clientId) 
      : newMessage.clientId;
    
    // Create message with fromManager flag set to true
    sendMessageMutation.mutate({
      managerId: managerId,
      clientId: clientId,
      subject: newMessage.urgent ? `[URGENT] ${newMessage.subject}` : newMessage.subject,
      message: newMessage.content,
      type: newMessage.urgent ? 'urgent' : 'standard',
      isRead: false, // Client hasn't read it yet
      attachments: {}, // Empty attachments for now
      fromManager: true // This is sent by the manager
    });
  };
  
  const handleReplyMessage = () => {
    if (!replyMessage.subject.trim() || !replyMessage.content.trim()) {
      toast({
        title: 'Warning',
        description: 'Please enter both subject and message content',
        variant: 'destructive',
      });
      return;
    }
    
    if (!managerId) {
      toast({
        title: 'Error',
        description: 'Manager ID not available',
        variant: 'destructive',
      });
      return;
    }
    
    const activeMessage = getActiveMessage();
    if (!activeMessage) {
      toast({
        title: 'Error',
        description: 'Original message not found',
        variant: 'destructive',
      });
      return;
    }
    
    // Create reply with fromManager flag set to true
    sendMessageMutation.mutate({
      managerId: managerId,
      clientId: activeMessage.clientId,
      subject: replyMessage.urgent ? `[URGENT] ${replyMessage.subject}` : replyMessage.subject,
      message: replyMessage.content,
      type: replyMessage.urgent ? 'urgent' : 'standard',
      isRead: false, // Client hasn't read it yet
      attachments: {}, // Empty attachments for now
      fromManager: true // This is sent by the manager
    });
    
    setReplyMessageOpen(false);
  };

  const handleMessageClick = (messageId: number) => {
    setActiveMessageId(messageId);
    
    // Find the message
    const message = messages?.find((m: Message) => m.id === messageId);
    
    // If message is unread and sent by a client (not from manager), mark it as read
    if (message && !message.isRead && !message.fromManager) {
      markAsReadMutation.mutate(messageId);
    }
  };

  const getActiveMessage = () => {
    return messages?.find((m: Message) => m.id === activeMessageId);
  };

  // Filter messages by client if a client is selected
  const filteredMessages = selectedClientId
    ? messages?.filter((m: Message) => m.clientId === selectedClientId)
    : messages || [];

  // Sort messages by date (newest first)
  const sortedMessages = [...(filteredMessages || [])].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Filter unread messages received from clients (not from manager and not read)
  const unreadMessages = sortedMessages.filter((m: Message) => 
    !m.isRead && !m.fromManager
  ) || [];
  
  // Filter messages sent by the manager
  const sentMessages = sortedMessages.filter((m: Message) => 
    m.fromManager === true
  ) || [];
  
  // Get unique client IDs from messages
  const uniqueClientIds = [...new Set((messages || []).map((m: Message) => m.clientId))];
  
  // Messages count per client
  const getClientMessagesCount = (clientId: number) => {
    return messages?.filter((m: Message) => m.clientId === clientId).length || 0;
  };
  
  // Unread messages count per client
  const getClientUnreadMessagesCount = (clientId: number) => {
    return messages?.filter((m: Message) => 
      m.clientId === clientId && !m.isRead && !m.fromManager
    ).length || 0;
  };
  
  if (messagesError) {
    toast({
      title: 'Error',
      description: 'Failed to load messages. Please try again later.',
      variant: 'destructive',
    });
  }

  const getClientName = (clientId: number) => {
    if (!clients) return `Client #${clientId}`;
    const client = clients.find((c: Client) => c.id === clientId);
    return client ? client.name : `Client #${clientId}`;
  };

  return (
    <ManagerLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Client Messages</h1>
            <p className="text-slate-500">Manage your communications with clients</p>
          </div>
          <div className="flex items-start">
            <Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Compose New Message</DialogTitle>
                  <DialogDescription>
                    Send a message to a client
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="client">Client</Label>
                    <Select 
                      value={newMessage.clientId} 
                      onValueChange={(value) => setNewMessage({...newMessage, clientId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientsLoading ? (
                          <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                        ) : clients && clients.length > 0 ? (
                          clients.map((client: Client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name} ({client.email})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No clients available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Message subject"
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here..."
                      rows={6}
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="urgent"
                      checked={newMessage.urgent}
                      onCheckedChange={(checked) => setNewMessage({...newMessage, urgent: checked})}
                    />
                    <Label htmlFor="urgent">Mark as urgent</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewMessageOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={sendMessageMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Reply Message Dialog */}
            <Dialog open={replyMessageOpen} onOpenChange={setReplyMessageOpen}>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Reply to Client</DialogTitle>
                  <DialogDescription>
                    Send a reply to this client
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="reply-subject">Subject</Label>
                    <Input
                      id="reply-subject"
                      placeholder="Message subject"
                      value={replyMessage.subject}
                      onChange={(e) => setReplyMessage({...replyMessage, subject: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reply-message">Message</Label>
                    <Textarea
                      id="reply-message"
                      placeholder="Type your reply here..."
                      rows={6}
                      value={replyMessage.content}
                      onChange={(e) => setReplyMessage({...replyMessage, content: e.target.value})}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reply-urgent"
                      checked={replyMessage.urgent}
                      onCheckedChange={(checked) => setReplyMessage({...replyMessage, urgent: checked})}
                    />
                    <Label htmlFor="reply-urgent">Mark as urgent</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setReplyMessageOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleReplyMessage}
                    disabled={sendMessageMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {sendMessageMutation.isPending ? 'Sending...' : 'Send Reply'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Client filter dropdown */}
        <div className="mb-6">
          <Label htmlFor="client-filter" className="mb-2 block">Filter by Client</Label>
          <Select 
            value={selectedClientId ? selectedClientId.toString() : ''} 
            onValueChange={(value) => setSelectedClientId(value ? parseInt(value) : null)}
          >
            <SelectTrigger className="w-full md:w-72">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Clients</SelectItem>
              {uniqueClientIds.map((clientId) => (
                <SelectItem key={clientId} value={clientId.toString()}>
                  {getClientName(clientId)} ({getClientMessagesCount(clientId)} messages, {getClientUnreadMessagesCount(clientId)} unread)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {messagesLoading ? (
          // Loading state with skeletons
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-24 mb-2" />
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-2 p-4">
                    {[...Array(5)].map((_, i) => (
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
                    <MessageSquare className="h-12 w-12 mx-auto text-slate-300" />
                    <p className="mt-2 text-slate-500">Select a message to view its contents</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (sortedMessages && sortedMessages.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Messages list */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <Tabs defaultValue="all">
                    <TabsList className="w-full">
                      <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                      <TabsTrigger value="unread" className="flex-1">
                        Unread
                        {unreadMessages.length > 0 && (
                          <Badge className="ml-2 bg-indigo-600 text-white">{unreadMessages.length}</Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="sent" className="flex-1">
                        Sent
                        {sentMessages.length > 0 && (
                          <Badge className="ml-2 bg-blue-600 text-white">{sentMessages.length}</Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="unread" className="m-0 mt-2">
                      <ScrollArea className="h-[500px]">
                        {unreadMessages.length > 0 ? (
                          <div className="space-y-1">
                            {unreadMessages.map((message: Message) => (
                              <div
                                key={message.id}
                                onClick={() => handleMessageClick(message.id)}
                                className={`p-3 cursor-pointer hover:bg-slate-50 rounded-md transition-colors ${
                                  activeMessageId === message.id ? 'bg-slate-100' : ''
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <Avatar>
                                    <AvatarFallback className="bg-green-100 text-green-600">
                                      {getClientName(message.clientId)[0] || 'C'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="font-medium text-sm truncate">
                                        {message.subject || 'No Subject'}
                                      </p>
                                      <AlertCircle className="h-3 w-3 text-indigo-600 flex-shrink-0" />
                                    </div>
                                    <p className="text-xs text-slate-700 font-medium">
                                      From: {getClientName(message.clientId)}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">{message.message}</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                      {formatDistance(new Date(message.createdAt), new Date(), { addSuffix: true })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center">
                            <p className="text-slate-500">No unread messages</p>
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="all" className="m-0 mt-2">
                      <ScrollArea className="h-[500px]">
                        {sortedMessages.length > 0 ? (
                          <div className="space-y-1">
                            {sortedMessages.map((message: Message) => (
                              <div
                                key={message.id}
                                onClick={() => handleMessageClick(message.id)}
                                className={`p-3 cursor-pointer hover:bg-slate-50 rounded-md transition-colors ${
                                  activeMessageId === message.id ? 'bg-slate-100' : ''
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <Avatar>
                                    <AvatarFallback className={`${message.fromManager ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                      {message.fromManager ? 'Y' : (getClientName(message.clientId)[0] || 'C')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className={`text-sm truncate ${(!message.isRead && !message.fromManager) ? 'font-medium' : 'font-normal'}`}>
                                        {message.subject || 'No Subject'}
                                        {message.fromManager && <span className="text-xs text-blue-600 ml-2">(Sent)</span>}
                                      </p>
                                      {!message.isRead && !message.fromManager && (
                                        <AlertCircle className="h-3 w-3 text-indigo-600 flex-shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-700 font-medium">
                                      {message.fromManager ? 
                                        `To: ${getClientName(message.clientId)}` : 
                                        `From: ${getClientName(message.clientId)}`
                                      }
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">{message.message}</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                      {formatDistance(new Date(message.createdAt), new Date(), { addSuffix: true })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center">
                            <p className="text-slate-500">No messages found</p>
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="sent" className="m-0 mt-2">
                      <ScrollArea className="h-[500px]">
                        {sentMessages.length > 0 ? (
                          <div className="space-y-1">
                            {sentMessages.map((message: Message) => (
                              <div
                                key={message.id}
                                onClick={() => handleMessageClick(message.id)}
                                className={`p-3 cursor-pointer hover:bg-slate-50 rounded-md transition-colors ${
                                  activeMessageId === message.id ? 'bg-slate-100' : ''
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <Avatar>
                                    <AvatarFallback className="bg-blue-100 text-blue-600">
                                      Y
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="text-sm font-medium truncate">
                                        {message.subject || 'No Subject'}
                                        <span className="text-xs text-blue-600 ml-1">(Sent)</span>
                                      </p>
                                    </div>
                                    <p className="text-xs text-slate-700 font-medium">
                                      To: {getClientName(message.clientId)}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">{message.message}</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                      {formatDistance(new Date(message.createdAt), new Date(), { addSuffix: true })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center">
                            <p className="text-slate-500">No sent messages found</p>
                          </div>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </CardHeader>
              </Card>
            </div>

            {/* Message content */}
            <div className="md:col-span-2">
              <Card className="h-full">
                {activeMessageId && getActiveMessage() ? (
                  <>
                    <CardHeader className="pb-2 border-b">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{getActiveMessage()?.subject}</CardTitle>
                          <CardDescription className="mt-1">
                            {getActiveMessage()?.fromManager ? 
                              <>To: {getClientName(getActiveMessage()?.clientId as number)}</> : 
                              <>From: {getClientName(getActiveMessage()?.clientId as number)}</>
                            }
                            <span className="mx-2">•</span>
                            {formatDistance(new Date(getActiveMessage()?.createdAt as string), new Date(), { addSuffix: true })}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="prose max-w-none">
                        <p>{getActiveMessage()?.message}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          // Populate reply form with active message subject and prepare for reply
                          const activeMessage = getActiveMessage();
                          if (activeMessage) {
                            setReplyMessage({
                              subject: activeMessage.subject ? `Re: ${activeMessage.subject.replace(/^Re: /, '')}` : '',
                              content: '',
                              urgent: false
                            });
                            setReplyMessageOpen(true);
                          }
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                      <div className="text-xs text-slate-500 flex items-center">
                        {getActiveMessage()?.fromManager ? (
                          <>
                            <Send className="h-3 w-3 mr-1 text-blue-500" />
                            Sent by you
                          </>
                        ) : getActiveMessage()?.isRead ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            Read
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1 text-yellow-500" />
                            Unread
                          </>
                        )}
                      </div>
                    </CardFooter>
                  </>
                ) : (
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 mx-auto text-slate-300" />
                      <p className="mt-2 text-slate-500">Select a message to view its contents</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-slate-300" />
                    <h3 className="text-xl font-semibold mt-4 mb-2">No Messages Yet</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                      {selectedClientId ? 
                        "You don't have any messages with this client yet." : 
                        "You don't have any client messages yet. Start a conversation with a client."}
                    </p>
                    <Button
                      onClick={() => setNewMessageOpen(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start Conversation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </ManagerLayout>
  );
};

export default ManagerMessages;