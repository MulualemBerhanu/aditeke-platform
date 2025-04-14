import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, 
  DialogTitle, DialogClose 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, Search, UserPlus, Edit, Trash2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// This is a simplified model of a user for the admin panel
interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  roleId: number;
  createdAt: string;
  isActive: boolean;
}

interface Role {
  id: number;
  name: string;
  description: string | null;
}

// Form schema for adding a new user
const newUserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  roleId: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'string' ? parseInt(val) : val
  ),
  isActive: z.boolean().default(true)
});

// Form schema for editing a user
const editUserSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  roleId: z.string().transform(val => parseInt(val)),
  isActive: z.string().transform(val => val === 'active')
});

// Raw type without transformations
type EditUserFormValues = {
  name: string;
  email: string;
  roleId: string;
  isActive: string;
};

// Final type after transformations
type EditUserFormData = {
  name: string;
  email: string;
  roleId: number;
  isActive: boolean;
};

export default function UserManagement() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState<number | null>(null);
  
  // Fetch roles
  const { data: roles = [], isLoading: isLoadingRoles } = useQuery<Role[]>({
    queryKey: ['/api/roles'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/roles');
        return await response.json();
      } catch (error) {
        console.error('Error fetching roles:', error);
        return [];
      }
    },
    enabled: !!user && user.roleId === 1,
  });
  
  // Determine default role ID (use client role if available)
  const getDefaultRoleId = () => {
    const clientRole = roles.find(r => r.name.toLowerCase() === 'client');
    return clientRole ? clientRole.id.toString() : '3'; // Fallback to '3' if not found
  };
  
  // Form for adding a new user
  const newUserForm = useForm<z.infer<typeof newUserSchema>>({
    resolver: zodResolver(newUserSchema),
    defaultValues: {
      name: '',
      email: '',
      username: '',
      password: '',
      roleId: 3, // Default to client role, will be updated when roles are loaded
      isActive: true
    }
  });
  
  // Update role ID when roles are loaded
  React.useEffect(() => {
    if (roles.length > 0) {
      const defaultRoleId = parseInt(getDefaultRoleId());
      newUserForm.setValue('roleId', defaultRoleId);
    }
  }, [roles, newUserForm]);
  
  // Form for editing a user
  const editUserForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      email: '',
      roleId: getDefaultRoleId(),
      isActive: 'active'
    }
  });
  
  // Redirect if not logged in or not an admin
  React.useEffect(() => {
    if (!user) {
      setLocation('/login');
    } else if (user.roleId !== 1) { // Assuming 1 is Admin role ID
      setLocation('/admin/dashboard');
    }
  }, [user, setLocation]);

  // Fetch users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/users');
        return await response.json();
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    },
    enabled: !!user && user.roleId === 1,
  });

  // Reset form when the dialog opens/closes
  React.useEffect(() => {
    if (showAddUser) {
      const defaultRoleId = parseInt(getDefaultRoleId());
      newUserForm.reset({
        name: '',
        email: '',
        username: '',
        password: '',
        roleId: defaultRoleId,
        isActive: true
      });
    }
  }, [showAddUser, newUserForm, roles]);

  // Set initial values for edit form when a user is selected
  React.useEffect(() => {
    if (showEditUser && users) {
      const selectedUser = users.find(u => u.id === showEditUser);
      if (selectedUser) {
        editUserForm.reset({
          name: selectedUser.name,
          email: selectedUser.email,
          roleId: selectedUser.roleId.toString(),
          isActive: selectedUser.isActive ? 'active' : 'inactive'
        });
      }
    }
  }, [showEditUser, users, editUserForm]);

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof newUserSchema>) => {
      const response = await apiRequest('POST', '/api/register', formData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'User Created',
        description: 'New user has been created successfully',
      });
      setShowAddUser(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }: { userId: number; userData: EditUserFormValues }) => {
      // Transform the form values to the correct types
      const transformedData: EditUserFormData = {
        name: userData.name,
        email: userData.email,
        roleId: parseInt(userData.roleId),
        isActive: userData.isActive === 'active'
      };
      const response = await apiRequest('PATCH', `/api/users/${userId}`, transformedData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'User Updated',
        description: 'User information has been updated successfully',
      });
      setShowEditUser(null);
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
    },
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, roleId }: { userId: number; roleId: number }) => {
      const response = await apiRequest('PATCH', `/api/users/${userId}`, { roleId });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Role Updated',
        description: 'User role has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update user role',
        variant: 'destructive',
      });
    },
  });

  // Find role name by ID
  const getRoleName = (roleId: number) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle role change
  const handleRoleChange = (userId: number, newRoleId: string) => {
    updateUserRoleMutation.mutate({ userId, roleId: parseInt(newRoleId) });
  };

  if (!user || user.roleId !== 1) {
    return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>;
  }

  const isLoading = isLoadingUsers || isLoadingRoles;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          className="mr-2" 
          onClick={() => setLocation('/admin/dashboard')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage users and their access levels
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8 w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setShowAddUser(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          <Select defaultValue={user.roleId.toString()} onValueChange={(value) => handleRoleChange(user.id, value)}>
                            <SelectTrigger className="w-[140px]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Roles</SelectLabel>
                                {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.id.toString()}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowEditUser(user.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500">
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

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account and assign a role.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={newUserForm.handleSubmit((data) => createUserMutation.mutate(data))}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  {...newUserForm.register('name')}
                  aria-invalid={!!newUserForm.formState.errors.name}
                />
                {newUserForm.formState.errors.name && (
                  <p className="text-sm text-red-500">{newUserForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john.doe@example.com" 
                  {...newUserForm.register('email')}
                  aria-invalid={!!newUserForm.formState.errors.email}
                />
                {newUserForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{newUserForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">Username</label>
                <Input 
                  id="username" 
                  placeholder="johndoe" 
                  {...newUserForm.register('username')}
                  aria-invalid={!!newUserForm.formState.errors.username}
                />
                {newUserForm.formState.errors.username && (
                  <p className="text-sm text-red-500">{newUserForm.formState.errors.username.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  {...newUserForm.register('password')}
                  aria-invalid={!!newUserForm.formState.errors.password}
                />
                {newUserForm.formState.errors.password && (
                  <p className="text-sm text-red-500">{newUserForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="roleId" className="text-sm font-medium">Role</label>
                <Select 
                  defaultValue={getDefaultRoleId()}
                  onValueChange={(value) => {
                    const numValue = parseInt(value);
                    newUserForm.setValue('roleId', numValue);
                  }}
                >
                  <SelectTrigger id="roleId">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Roles</SelectLabel>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!showEditUser} onOpenChange={() => setShowEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and access level.
            </DialogDescription>
          </DialogHeader>
          {showEditUser && (
            <form onSubmit={editUserForm.handleSubmit((data) => {
              if (showEditUser) {
                updateUserMutation.mutate({
                  userId: showEditUser,
                  userData: data
                });
              }
            })}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                  <Input 
                    id="name" 
                    {...editUserForm.register('name')}
                    aria-invalid={!!editUserForm.formState.errors.name}
                  />
                  {editUserForm.formState.errors.name && (
                    <p className="text-sm text-red-500">{editUserForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="email" 
                    type="email" 
                    {...editUserForm.register('email')}
                    aria-invalid={!!editUserForm.formState.errors.email}
                  />
                  {editUserForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{editUserForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="roleId" className="text-sm font-medium">Role</label>
                  <Select 
                    defaultValue={editUserForm.watch('roleId')}
                    onValueChange={(value) => editUserForm.setValue('roleId', value)}
                  >
                    <SelectTrigger id="roleId">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Roles</SelectLabel>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">Status</label>
                  <Select 
                    defaultValue={editUserForm.watch('isActive')}
                    onValueChange={(value) => editUserForm.setValue('isActive', value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : 'Update User'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}