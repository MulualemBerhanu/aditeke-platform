import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Testimonial } from '@shared/schema';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Star,
  BuildingIcon,
  Loader2
} from 'lucide-react';

// Form schema for creating/editing testimonials
const testimonialSchema = z.object({
  clientName: z.string().min(3, "Client name must be at least 3 characters"),
  company: z.string().min(1, "Company name is required"),
  testimonial: z.string().min(10, "Testimonial must be at least 10 characters"),
  rating: z.coerce.number().min(1).max(5),
  profilePicture: z.string().nullable().optional(),
  isActive: z.boolean().default(true)
});

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

export default function TestimonialManagement() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for managing dialogs
  const [showAddTestimonial, setShowAddTestimonial] = React.useState(false);
  const [testimonialToEdit, setTestimonialToEdit] = React.useState<Testimonial | null>(null);
  const [testimonialToDelete, setTestimonialToDelete] = React.useState<number | null>(null);
  
  // Form for creating a new testimonial
  const newTestimonialForm = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      clientName: '',
      company: '',
      testimonial: '',
      rating: 5,
      profilePicture: '',
      isActive: true
    }
  });
  
  // Form for editing a testimonial
  const editTestimonialForm = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      clientName: '',
      company: '',
      testimonial: '',
      rating: 5,
      profilePicture: '',
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
    if (showAddTestimonial) {
      newTestimonialForm.reset({
        clientName: '',
        company: '',
        testimonial: '',
        rating: 5,
        profilePicture: '',
        isActive: true
      });
    }
  }, [showAddTestimonial, newTestimonialForm]);
  
  // Set initial values for edit form when a testimonial is selected
  React.useEffect(() => {
    if (testimonialToEdit) {
      editTestimonialForm.reset({
        clientName: testimonialToEdit.clientName,
        company: testimonialToEdit.company,
        testimonial: testimonialToEdit.testimonial,
        rating: testimonialToEdit.rating,
        profilePicture: testimonialToEdit.profilePicture,
        isActive: testimonialToEdit.isActive
      });
    }
  }, [testimonialToEdit, editTestimonialForm]);
  
  // Fetch testimonials
  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/testimonials');
        return await response.json();
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        return [];
      }
    },
    enabled: !!user && user.roleId === 1,
  });
  
  // Create testimonial mutation
  const createTestimonialMutation = useMutation({
    mutationFn: async (testimonialData: TestimonialFormValues) => {
      const response = await apiRequest('POST', '/api/testimonials', testimonialData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Testimonial Created',
        description: 'New testimonial has been created successfully',
      });
      setShowAddTestimonial(false);
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create testimonial',
        variant: 'destructive',
      });
    },
  });
  
  // Update testimonial mutation
  const updateTestimonialMutation = useMutation({
    mutationFn: async ({ testimonialId, testimonialData }: { testimonialId: number; testimonialData: TestimonialFormValues }) => {
      const response = await apiRequest('PATCH', `/api/testimonials/${testimonialId}`, testimonialData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Testimonial Updated',
        description: 'Testimonial has been updated successfully',
      });
      setTestimonialToEdit(null);
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update testimonial',
        variant: 'destructive',
      });
    },
  });
  
  // Delete testimonial mutation
  const deleteTestimonialMutation = useMutation({
    mutationFn: async (testimonialId: number) => {
      await apiRequest('DELETE', `/api/testimonials/${testimonialId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Testimonial Deleted',
        description: 'Testimonial has been deleted successfully',
      });
      setTestimonialToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete testimonial',
        variant: 'destructive',
      });
    },
  });
  
  // Toggle testimonial active status
  const toggleActiveStatusMutation = useMutation({
    mutationFn: async ({ testimonialId, isActive }: { testimonialId: number; isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/testimonials/${testimonialId}`, { isActive });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Status Updated',
        description: 'Testimonial status has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update testimonial status',
        variant: 'destructive',
      });
    },
  });
  
  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Render rating stars
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };
  
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
        <h1 className="text-3xl font-bold">Testimonial Management</h1>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Client Testimonials</CardTitle>
            <CardDescription>
              Manage testimonials displayed on the website
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddTestimonial(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Testimonial
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
                    <TableHead>Client</TableHead>
                    <TableHead>Testimonial</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        No testimonials found
                      </TableCell>
                    </TableRow>
                  ) : (
                    testimonials.map((testimonial) => (
                      <TableRow key={testimonial.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={testimonial.profilePicture || undefined} />
                              <AvatarFallback>{getInitials(testimonial.clientName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{testimonial.clientName}</p>
                              <p className="text-xs text-muted-foreground flex items-center">
                                <BuildingIcon className="h-3 w-3 mr-1" />
                                {testimonial.company}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="truncate">{testimonial.testimonial}</p>
                        </TableCell>
                        <TableCell>{renderRating(testimonial.rating)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Switch 
                              checked={testimonial.isActive}
                              onCheckedChange={(checked) => 
                                toggleActiveStatusMutation.mutate({ 
                                  testimonialId: testimonial.id, 
                                  isActive: checked 
                                })
                              }
                              className="mr-2"
                            />
                            {testimonial.isActive ? (
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
                            <Button variant="ghost" size="sm" onClick={() => setTestimonialToEdit(testimonial)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500"
                              onClick={() => setTestimonialToDelete(testimonial.id)}
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
      
      {/* Testimonial Cards Preview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Testimonials Preview</CardTitle>
          <CardDescription>
            How testimonials appear on the website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials
              .filter(t => t.isActive)
              .slice(0, 3)
              .map((testimonial) => (
                <Card key={testimonial.id} className="overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-16 w-16 mb-4">
                        <AvatarImage src={testimonial.profilePicture || undefined} />
                        <AvatarFallback className="text-lg">{getInitials(testimonial.clientName)}</AvatarFallback>
                      </Avatar>
                      <div className="mb-4">{renderRating(testimonial.rating)}</div>
                      <p className="italic text-muted-foreground mb-4">"{testimonial.testimonial}"</p>
                      <p className="font-medium">{testimonial.clientName}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Add Testimonial Dialog */}
      <Dialog open={showAddTestimonial} onOpenChange={setShowAddTestimonial}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Testimonial</DialogTitle>
            <DialogDescription>
              Create a new client testimonial that will be displayed on the website.
            </DialogDescription>
          </DialogHeader>
          <Form {...newTestimonialForm}>
            <form onSubmit={newTestimonialForm.handleSubmit((data) => createTestimonialMutation.mutate(data))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={newTestimonialForm.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Sarah Johnson" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={newTestimonialForm.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Future Tech, Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={newTestimonialForm.control}
                name="profilePicture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/profile.jpg" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormDescription>
                      Enter the URL for the client's profile picture
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newTestimonialForm.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (1-5)</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a rating" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 Star</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newTestimonialForm.control}
                name="testimonial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Testimonial</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Working with AdiTeke Software Solutions has been transformative for our business..." 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newTestimonialForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Make this testimonial visible on the website
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
                <Button type="submit" disabled={createTestimonialMutation.isPending}>
                  {createTestimonialMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : 'Create Testimonial'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Testimonial Dialog */}
      <Dialog open={!!testimonialToEdit} onOpenChange={(open) => !open && setTestimonialToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
            <DialogDescription>
              Update testimonial information and content
            </DialogDescription>
          </DialogHeader>
          {testimonialToEdit && (
            <Form {...editTestimonialForm}>
              <form 
                onSubmit={editTestimonialForm.handleSubmit((data) => {
                  if (testimonialToEdit) {
                    updateTestimonialMutation.mutate({
                      testimonialId: testimonialToEdit.id,
                      testimonialData: data
                    });
                  }
                })} 
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={editTestimonialForm.control}
                    name="clientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editTestimonialForm.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editTestimonialForm.control}
                  name="profilePicture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Picture URL (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormDescription>
                        Enter the URL for the client's profile picture
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editTestimonialForm.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating (1-5)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a rating" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 Star</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editTestimonialForm.control}
                  name="testimonial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Testimonial</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editTestimonialForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>
                          Make this testimonial visible on the website
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
                  <Button type="submit" disabled={updateTestimonialMutation.isPending}>
                    {updateTestimonialMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : 'Update Testimonial'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!testimonialToDelete} onOpenChange={(open) => !open && setTestimonialToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive"
              disabled={deleteTestimonialMutation.isPending}
              onClick={() => {
                if (testimonialToDelete) {
                  deleteTestimonialMutation.mutate(testimonialToDelete);
                }
              }}
            >
              {deleteTestimonialMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : 'Delete Testimonial'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}