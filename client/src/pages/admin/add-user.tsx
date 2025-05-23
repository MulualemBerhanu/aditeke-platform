import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import AdminLayout from "@/components/admin/AdminLayout";

// Form schema based on user model
const userFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  roleId: z.number({
    required_error: "Please select a role.",
    invalid_type_error: "Role must be selected",
  }),
  profilePicture: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function AddUserPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  interface Role {
    id: number;
    name: string;
    description: string | null;
  }

  // Fetch available roles from public endpoint
  const { data: roles = [], isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ['/api/public/roles'],
    retry: 3, // Increase retries for this important data
  });

  // Form with defaults
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      name: "",
      profilePicture: null,
      isActive: true,
      roleId: undefined, // Will be set when roles are loaded
    },
  });

  // Set default role once loaded
  useEffect(() => {
    if (roles && roles.length > 0) {
      // Find client role by default, or use the first available role
      const clientRole = roles.find(role => role.name.toLowerCase() === 'client');
      const defaultRoleId = clientRole ? clientRole.id : roles[0].id;
      
      form.setValue('roleId', defaultRoleId);
    }
  }, [roles, form]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormValues) => {
      try {
        // Log the exact data being sent
        console.log("Creating user with data:", JSON.stringify(userData, null, 2));
        
        // Make a copy of the userData with all the required fields explicitly
        const userDataToSend = {
          username: userData.username,
          password: userData.password,
          email: userData.email,
          name: userData.name,
          roleId: userData.roleId,
          profilePicture: userData.profilePicture || null,
          isActive: userData.isActive !== undefined ? userData.isActive : true
        };
        
        // Try a different approach using direct fetch to diagnose the issue
        const token = document.cookie
          .split(';')
          .find(cookie => cookie.trim().startsWith('csrf_token='))
          ?.split('=')[1];
        
        console.log("Using direct fetch with CSRF token:", token);
        
        const res = await fetch("/api/register", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': token || '',
          },
          credentials: 'include',
          body: JSON.stringify(userDataToSend)
        });
        
        console.log("Direct fetch response status:", res.status, res.statusText);
        
        if (!res.ok) {
          let errorMessage = "Failed to create user";
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // If response isn't JSON, use the status text
            errorMessage = `HTTP error ${res.status}: ${res.statusText}`;
          }
          throw new Error(errorMessage);
        }
        
        return await res.json();
      } catch (error) {
        console.error("Error creating user:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "User created successfully",
        description: "The new user has been added to the system.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      navigate("/admin/user-management");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  function onSubmit(data: UserFormValues) {
    console.log("Form submitted with values:", JSON.stringify(data, null, 2));
    
    // Check for any undefined values that might cause issues
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined) {
        console.warn(`Warning: Form field '${key}' is undefined`);
      }
    });
    
    // Ensure roleId is a number if it exists in the form data
    if (data.roleId) {
      data.roleId = Number(data.roleId);
    } else if (roles && roles.length > 0) {
      // If roleId is missing but roles are loaded, set to default role
      console.log("Setting default roleId from available roles");
      const clientRole = roles.find(role => role.name.toLowerCase() === 'client');
      data.roleId = clientRole ? clientRole.id : roles[0].id;
    }
    
    createUserMutation.mutate(data);
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate("/admin/user-management")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to User Management
        </Button>
        
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Add New User</CardTitle>
            <CardDescription>
              Create a new user account with the appropriate role and permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="roleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            console.log("Role selected:", value);
                            field.onChange(parseInt(value));
                          }}
                          defaultValue={field.value?.toString()}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {rolesLoading ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : (
                              roles?.map((role) => (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                  {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="profilePicture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Picture URL (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/avatar.jpg" 
                            {...field} 
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value || null)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active User</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Deactivated users cannot log in to the system.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => navigate("/admin/user-management")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create User
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}