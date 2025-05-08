import React, { useState, useEffect } from 'react';
import ClientLayout from '@/components/client/ClientLayout';
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

const ClientMessages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [clientId, setClientId] = useState<number | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<number | null>(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [replyMessageOpen, setReplyMessageOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    urgent: false
  });
  const [replyMessage, setReplyMessage] = useState({
    subject: '',
    content: '',
    urgent: false
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

  // Fetch client messages using our standardized queryClient
  const { data: messages, isLoading, error } = useQuery({
    queryKey: ['/api/client-communications', clientId],
    queryFn: async ({ queryKey }) => {
      if (!clientId) return [];
      console.log(`Fetching messages for client ID: ${clientId}`);
      
      try {
        // Use the apiRequest helper which handles authentication properly
        const { apiRequest } = await import('@/lib/queryClient');
        const response = await apiRequest('GET', `/api/client-communications/${clientId}`);
        
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
    enabled: !!clientId,
    retry: 1, // Allow one retry for potential authentication issues
  });

  // Mark message as read
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      try {
        // Use the apiRequest helper which handles authentication properly
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
      queryClient.invalidateQueries({ queryKey: ['/api/client-communications', clientId] });
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
        
        // Use the apiRequest helper which handles authentication properly
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
      queryClient.invalidateQueries({ queryKey: ['/api/client-communications', clientId] });
      setNewMessageOpen(false);
      setNewMessage({
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
    if (!newMessage.subject.trim() || !newMessage.content.trim()) {
      toast({
        title: 'Warning',
        description: 'Please enter both subject and message content',
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
    
    // Send to manager (using manager ID 50000 as found in database)
    // We use the clientCommunications schema format now
    // IMPORTANT: We should NOT include clientId in the request body
    // The server will automatically set it based on the authenticated user
    sendMessageMutation.mutate({
      // Remove clientId from request to avoid permissions issues
      managerId: 50000, // Manager ID from our database
      subject: newMessage.urgent ? `[URGENT] ${newMessage.subject}` : newMessage.subject,
      message: newMessage.content,
      type: newMessage.urgent ? 'urgent' : 'standard',
      isRead: false,
      attachments: {} // Empty attachments for now
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
    
    // Ensure clientId is a valid number
    if (!clientId || typeof clientId !== 'number') {
      // Try to get clientId directly from user object or localStorage
      let userId = null;
      if (user) {
        userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      } else {
        // Try to get from localStorage as fallback
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            userId = typeof parsedUser.id === 'string' ? parseInt(parsedUser.id) : parsedUser.id;
          } catch (error) {
            console.error('Error parsing user from localStorage:', error);
          }
        }
      }
      
      if (!userId) {
        toast({
          title: 'Error',
          description: 'Client ID not available. Please try logging in again.',
          variant: 'destructive',
        });
        return;
      }
      
      // If clientId wasn't set but we found a userId, use it
      setClientId(userId);
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
    
    console.log('Sending reply message with clientId:', clientId);
    
    // Ensure we have a valid numeric clientId (using 2000 as a direct reference for testing if needed)
    const finalClientId = clientId || 2000;
    
    // Create a properly formatted message object
    // IMPORTANT: We should NOT include clientId in the request body
    // The server will automatically set it based on the authenticated user
    sendMessageMutation.mutate({
      // Remove clientId from request to avoid permissions issues
      // The server will automatically use the authenticated user's ID
      managerId: activeMessage.managerId, // Reply to the same manager
      subject: replyMessage.urgent ? `[URGENT] ${replyMessage.subject}` : replyMessage.subject,
      message: replyMessage.content,
      type: replyMessage.urgent ? 'urgent' : 'standard',
      isRead: false,
      attachments: {} // Empty attachments for now
    });
    
    // Close the reply dialog after sending
    setReplyMessageOpen(false);
  };

  const handleMessageClick = (messageId: number) => {
    setActiveMessageId(messageId);
    
    // Find the message
    const message = messages?.find((m: Message) => m.id === messageId);
    
    // If message is unread, mark it as read
    if (message && !message.isRead) {
      markAsReadMutation.mutate(messageId);
    }
  };

  const getActiveMessage = () => {
    return messages?.find((m: Message) => m.id === activeMessageId);
  };

  // Sort messages by date (newest first)
  const sortedMessages = [...(messages || [])].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Filter messages by unread/read using isRead property
  // Only show unread messages FROM managers (received messages)
  const unreadMessages = sortedMessages.filter((m: Message) => 
    !m.isRead && m.fromManager === true
  ) || [];
  
  // Determine if a message is sent by the client (outgoing)
  // A message is sent by the client if fromManager is false
  const sentMessages = sortedMessages.filter((m: Message) => 
    m.fromManager === false
  ) || [];
  
  // Messages that are not sent by the client (incoming) and are read
  const readMessages = sortedMessages.filter((m: Message) => 
    m.isRead && m.fromManager === true
  ) || [];
  
  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load messages. Please try again later.',
      variant: 'destructive',
    });
  }

  return (
    <ClientLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Messages</h1>
            <p className="text-slate-500">Communicate with your project manager and support team</p>
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
                    Send a message to your project manager or support team
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
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
                  <DialogTitle>Reply to Message</DialogTitle>
                  <DialogDescription>
                    Send a reply to this message
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
        ) : (messages && messages.length > 0) ? (
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
                                    <AvatarFallback className="bg-indigo-100 text-indigo-600">
                                      {message.senderName?.[0] || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="font-medium text-sm truncate">
                                        {message.subject || 'No Subject'}
                                      </p>
                                      <AlertCircle className="h-3 w-3 text-indigo-600 flex-shrink-0" />
                                    </div>
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
                                    <AvatarFallback className={`${!message.fromManager ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                      {!message.fromManager ? 'Y' : (message.senderName?.[0] || 'M')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className={`text-sm truncate ${message.isRead ? 'font-normal' : 'font-medium'}`}>
                                        {message.subject || 'No Subject'}
                                        {!message.fromManager && <span className="text-xs text-blue-600 ml-2">(Sent)</span>}
                                      </p>
                                      {!message.isRead && (
                                        <AlertCircle className="h-3 w-3 text-indigo-600 flex-shrink-0" />
                                      )}
                                    </div>
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
                            From: {getActiveMessage()?.senderName || 'Support Team'}
                            <span className="mx-2">•</span>
                            {formatDistance(new Date(getActiveMessage()?.createdAt), new Date(), { addSuffix: true })}
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
                        <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                        {getActiveMessage()?.isRead ? 'Read' : 'Marked as read'}
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
                      You don't have any messages yet. Start a conversation with your project manager 
                      or support team.
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
    </ClientLayout>
  );
};

export default ClientMessages;