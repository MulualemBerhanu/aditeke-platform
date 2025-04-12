import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Service } from '@shared/schema';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  ChevronLeft,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Check,
  X,
  Loader2
} from 'lucide-react';

// Form schema for creating/editing services
const serviceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  icon: z.string().min(1, "Icon is required"),
  shortDescription: z.string().min(10, "Short description must be at least 10 characters"),
  description: z.string().min(20, "Full description must be at least 20 characters"),
  isActive: z.boolean().default(true)
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function ServiceManagement() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for managing dialogs
  const [showAddService, setShowAddService] = React.useState(false);
  const [serviceToEdit, setServiceToEdit] = React.useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = React.useState<number | null>(null);
  
  // Form for creating a new service
  const newServiceForm = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: '',
      icon: '',
      shortDescription: '',
      description: '',
      isActive: true
    }
  });
  
  // Form for editing a service
  const editServiceForm = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: '',
      icon: '',
      shortDescription: '',
      description: '',
      isActive: true
    }
  });
  
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
  
  // Reset form when the dialog opens/closes
  React.useEffect(() => {
    if (showAddService) {
      newServiceForm.reset({
        title: '',
        icon: '',
        shortDescription: '',
        description: '',
        isActive: true
      });
    }
  }, [showAddService, newServiceForm]);
  
  // Set initial values for edit form when a service is selected
  React.useEffect(() => {
    if (serviceToEdit) {
      editServiceForm.reset({
        title: serviceToEdit.title,
        icon: serviceToEdit.icon,
        shortDescription: serviceToEdit.shortDescription,
        description: serviceToEdit.description,
        isActive: serviceToEdit.isActive
      });
    }
  }, [serviceToEdit, editServiceForm]);
  
  // Fetch services
  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['/api/services'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/services');
        return await response.json();
      } catch (error) {
        console.error('Error fetching services:', error);
        return [];
      }
    },
    enabled: !!user && user.roleId === 1,
  });
  
  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: ServiceFormValues) => {
      const response = await apiRequest('POST', '/api/services', serviceData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Service Created',
        description: 'New service has been created successfully',
      });
      setShowAddService(false);
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create service',
        variant: 'destructive',
      });
    },
  });
  
  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async ({ serviceId, serviceData }: { serviceId: number; serviceData: ServiceFormValues }) => {
      const response = await apiRequest('PATCH', `/api/services/${serviceId}`, serviceData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Service Updated',
        description: 'Service information has been updated successfully',
      });
      setServiceToEdit(null);
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update service',
        variant: 'destructive',
      });
    },
  });
  
  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      await apiRequest('DELETE', `/api/services/${serviceId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Service Deleted',
        description: 'Service has been deleted successfully',
      });
      setServiceToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete service',
        variant: 'destructive',
      });
    },
  });
  
  // Toggle service active status
  const toggleServiceStatusMutation = useMutation({
    mutationFn: async ({ serviceId, isActive }: { serviceId: number; isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/services/${serviceId}`, { isActive });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Status Updated',
        description: 'Service status has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update service status',
        variant: 'destructive',
      });
    },
  });
  
  if (!user || user.roleId !== 1) {
    return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>;
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          className="mr-2" 
          onClick={() => setLocation('/admin/content-management')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Content Management
        </Button>
        <h1 className="text-3xl font-bold">Service Management</h1>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Services</CardTitle>
            <CardDescription>
              Manage services displayed on the website
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddService(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Service
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        No services found
                      </TableCell>
                    </TableRow>
                  ) : (
                    services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.title}</TableCell>
                        <TableCell>
                          <div className="bg-muted p-2 rounded-md w-10 h-10 flex items-center justify-center">
                            <span className="text-lg">{service.icon}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md truncate">{service.shortDescription}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Switch 
                              checked={service.isActive}
                              onCheckedChange={(checked) => 
                                toggleServiceStatusMutation.mutate({ 
                                  serviceId: service.id, 
                                  isActive: checked 
                                })
                              }
                              className="mr-2"
                            />
                            {service.isActive ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => window.open(`/services#${service.id}`, '_blank')}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setServiceToEdit(service)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500"
                              onClick={() => setServiceToDelete(service.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Service Dialog */}
      <Dialog open={showAddService} onOpenChange={setShowAddService}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Create a new service that will be displayed on the website.
            </DialogDescription>
          </DialogHeader>
          <Form {...newServiceForm}>
            <form onSubmit={newServiceForm.handleSubmit((data) => createServiceMutation.mutate(data))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={newServiceForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Web Development" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={newServiceForm.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <FormControl>
                        <Input placeholder="💻" {...field} />
                      </FormControl>
                      <FormDescription>
                        Use an emoji or icon name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={newServiceForm.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Briefly describe the service" {...field} />
                    </FormControl>
                    <FormDescription>
                      A short summary that appears in service cards
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newServiceForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed description of the service" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newServiceForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Make this service visible on the website
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={createServiceMutation.isPending}>
                  {createServiceMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : 'Create Service'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Service Dialog */}
      <Dialog open={!!serviceToEdit} onOpenChange={(open) => !open && setServiceToEdit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update service information and visibility
            </DialogDescription>
          </DialogHeader>
          {serviceToEdit && (
            <Form {...editServiceForm}>
              <form 
                onSubmit={editServiceForm.handleSubmit((data) => {
                  if (serviceToEdit) {
                    updateServiceMutation.mutate({
                      serviceId: serviceToEdit.id,
                      serviceData: data
                    });
                  }
                })} 
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={editServiceForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editServiceForm.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Use an emoji or icon name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editServiceForm.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        A short summary that appears in service cards
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editServiceForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description</FormLabel>
                      <FormControl>
                        <Textarea className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editServiceForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Make this service visible on the website
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={updateServiceMutation.isPending}>
                    {updateServiceMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : 'Update Service'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive"
              disabled={deleteServiceMutation.isPending}
              onClick={() => {
                if (serviceToDelete) {
                  deleteServiceMutation.mutate(serviceToDelete);
                }
              }}
            >
              {deleteServiceMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : 'Delete Service'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}