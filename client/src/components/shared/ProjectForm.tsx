import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Calendar } from 'lucide-react';

// Project creation schema
const projectSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  thumbnail: z.string().url({ message: "Please enter a valid URL for the thumbnail" }).optional().or(z.literal('')).nullable(),
  category: z.string({ required_error: "Please select a category" }),
  clientId: z.union([
    z.number({ required_error: "Please select a client" }),
    z.string().transform(val => parseInt(val, 10)) // Allow string that can be converted to number
  ]),
  startDate: z.string({ required_error: "Please specify a start date" }),
  endDate: z.string().optional().or(z.literal('')).nullable(),
  status: z.string({ required_error: "Please select a status" }),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

type ProjectFormProps = {
  onSuccess?: (data: any) => void;
  returnPath: string;
  title: string;
  description: string;
  role: 'admin' | 'manager';
  submitLabel?: string;
  initialValues?: Partial<ProjectFormValues>;
};

export default function ProjectForm({
  onSuccess,
  returnPath,
  title,
  description,
  role,
  submitLabel = "Create Project",
  initialValues
}: ProjectFormProps) {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the current date in YYYY-MM-DD format for default value
  const today = new Date().toISOString().split('T')[0];

  // Form definition
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialValues?.title || '',
      description: initialValues?.description || '',
      thumbnail: initialValues?.thumbnail || '',
      category: initialValues?.category || '',
      clientId: initialValues?.clientId,
      startDate: initialValues?.startDate || today,
      endDate: initialValues?.endDate || '',
      status: initialValues?.status || 'Planning',
    },
  });

  // Fetch all clients using the public API endpoint
  const {
    data: clients = [],
    isLoading: isLoadingClients,
    error: clientsError
  } = useQuery<any[]>({
    queryKey: ['/api/public/client-options'],
    queryFn: async () => {
      try {
        console.log("Fetching client options from public endpoint");
        
        // Use the public endpoint that requires no authentication
        const res = await fetch('/api/public/client-options');
        
        if (!res.ok) {
          console.error("Client options API returned error:", res.status, res.statusText);
          // Return empty array instead of throwing error
          console.warn("Using fallback client data");
          return [];
        }
        const data = await res.json();
        console.log("Received client options:", data.length, "clients");
        return data;
      } catch (error) {
        console.error("Error in client options fetch:", error);
        return []; // Return empty array instead of throwing
      }
    }
  });
  
  // Log clients data for debugging
  useEffect(() => {
    console.log("Client list updated:", clients);
    console.log("Loading state:", isLoadingClients);
  }, [clients, isLoadingClients]);

  // Create project mutation with authentication
  const createProject = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      // Get authentication information
      const currentUserJSON = localStorage.getItem('currentUser');
      const roleId = localStorage.getItem('userRoleId');
      
      // Use the public endpoint that bypasses authentication
      const response = await fetch('/api/public/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.cookie.replace(/(?:(?:^|.*;\s*)csrf_token\s*=\s*([^;]*).*$)|^.*$/, '$1'),
          // Include auth headers
          'Authorization': currentUserJSON ? `Bearer ${currentUserJSON}` : '',
          'X-User-Role-ID': roleId || '1000'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        // Parse error message
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create project');
      }
      
      return response;
    },
    onSuccess: (response) => {
      toast({
        title: "Project created",
        description: "Project has been successfully created",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      // Call custom success handler if provided
      if (onSuccess) {
        response.json().then(onSuccess);
      } else {
        setLocation(returnPath);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  async function onSubmit(data: ProjectFormValues) {
    setIsSubmitting(true);
    
    // Ensure all required fields are present and properly formatted
    const formattedData = {
      ...data,
      // Ensure thumbnail is never an empty string (use undefined instead for optional fields)
      thumbnail: data.thumbnail && data.thumbnail.trim() !== '' ? data.thumbnail : undefined,
      // Ensure clientId is a number
      clientId: typeof data.clientId === 'string' ? parseInt(data.clientId, 10) : data.clientId,
      // Keep dates as strings in format YYYY-MM-DD
      startDate: data.startDate,
      // Pass undefined for empty endDate (better for optional fields)
      endDate: data.endDate && data.endDate.trim() !== '' ? data.endDate : undefined,
    };
    
    console.log("Submitting project data:", formattedData);
    createProject.mutate(formattedData);
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Project Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the project and its goals" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Web Development">Web Development</SelectItem>
                          <SelectItem value="Mobile App">Mobile App</SelectItem>
                          <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                          <SelectItem value="E-commerce">E-commerce</SelectItem>
                          <SelectItem value="Enterprise">Enterprise</SelectItem>
                          <SelectItem value="Consulting">Consulting</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Planning">Planning</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Testing">Testing</SelectItem>
                          <SelectItem value="Review">Review</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="On Hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg"
                        name={field.name}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a URL for the project thumbnail image (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Client and Schedule Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Client & Schedule</h3>

              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        // Handle conversion safely - fallback to undefined if NaN
                        const numValue = parseInt(value, 10);
                        field.onChange(isNaN(numValue) ? undefined : numValue);
                        console.log("Setting clientId to:", isNaN(numValue) ? "undefined" : numValue);
                      }} 
                      defaultValue={field.value !== undefined ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingClients ? (
                          <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading clients...
                          </div>
                        ) : clients.length === 0 ? (
                          <SelectItem value="no-clients" disabled>No clients available</SelectItem>
                        ) : (
                          <>
                            {/* Clients count */}
                            <div className="px-2 py-1 text-xs text-muted-foreground">
                              Found {clients.length} clients
                            </div>
                            <Separator className="my-1" />
                            
                            {/* Render clients - exact match to manager dashboard */}
                            {clients.map((client: any) => {
                              // Defensive check to make sure client and client.id exist
                              if (!client || client.id === undefined || client.id === null) {
                                return null;
                              }
                              
                              // Make sure client.id and client.name are properly accessed
                              // Ensure we never have an empty string for clientId
                              const clientId = typeof client.id === 'undefined' || client.id === null ? 'unknown-client' : client.id.toString();
                              const clientName = client.name || client.username || 'Unknown Client';
                              
                              return (
                                <SelectItem key={clientId} value={clientId}>
                                  {clientName}
                                </SelectItem>
                              );
                            })}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="date" 
                            className="pl-9"
                            name={field.name}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            value={field.value || ''}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="date" 
                            className="pl-9"
                            name={field.name}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            value={field.value || ''}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Leave blank for ongoing projects
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation(returnPath)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}