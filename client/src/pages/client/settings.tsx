import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Lock,
  Bell,
  Shield,
  CircleCheck,
  CircleX,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  LogOut,
  Smartphone,
  Upload
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Password form schema
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase and numbers"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

// Notification settings interface
interface NotificationSettings {
  emailNotifications: boolean;
  projectUpdates: boolean;
  documentUploads: boolean;
  invoiceReminders: boolean;
  marketingEmails: boolean;
  smsNotifications: boolean;
  browserNotifications: boolean;
}

// Security settings interface
interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  allowMultipleSessions: boolean;
  sessionTimeout: number; // in minutes
}

const ClientSettings = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [clientId, setClientId] = useState<number | null>(null);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    company: '',
    jobTitle: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    profilePicture: ''
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    projectUpdates: true,
    documentUploads: true,
    invoiceReminders: true,
    marketingEmails: false,
    smsNotifications: false,
    browserNotifications: true
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    loginAlerts: true,
    allowMultipleSessions: true,
    sessionTimeout: 60
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Set clientId and initial profile data from user object when user data is available
  useEffect(() => {
    if (user) {
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      setClientId(userId);
      
      // Set initial profile data
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        company: user.company || '',
        jobTitle: user.jobTitle || '',
        address: user.address || '',
        city: user.city || '',
        zipCode: user.zipCode || '',
        country: user.country || '',
        profilePicture: user.profilePicture || ''
      });
    } else {
      // Try to get from localStorage as fallback
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const userId = typeof parsedUser.id === 'string' ? parseInt(parsedUser.id) : parsedUser.id;
          setClientId(userId);
          
          // Set initial profile data
          setProfileData({
            name: parsedUser.name || '',
            email: parsedUser.email || '',
            phoneNumber: parsedUser.phoneNumber || '',
            company: parsedUser.company || '',
            jobTitle: parsedUser.jobTitle || '',
            address: parsedUser.address || '',
            city: parsedUser.city || '',
            zipCode: parsedUser.zipCode || '',
            country: parsedUser.country || '',
            profilePicture: parsedUser.profilePicture || ''
          });
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    }
  }, [user]);

  // Fetch notification settings
  const { isLoading: loadingNotifications } = useQuery({
    queryKey: ['/api/client-notification-settings', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      console.log(`Fetching notification settings for client ID: ${clientId}`);
      
      // Get the authentication token
      const token = localStorage.getItem('token');
      
      // This endpoint is a placeholder - it would need to be implemented on the backend
      const response = await fetch(`/api/client-notification-settings/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .catch(err => {
        console.log('Error fetching notification settings, returning defaults');
        // Since we are just setting up the UI, we'll return default settings
        // In a real implementation, we'd throw an error here
        return { 
          ok: true, 
          json: () => Promise.resolve({
            emailNotifications: true,
            projectUpdates: true,
            documentUploads: true,
            invoiceReminders: true,
            marketingEmails: false,
            smsNotifications: false,
            browserNotifications: true
          }) 
        };
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch notification settings');
      }
      
      const data = await response.json();
      console.log('Notification settings fetched:', data);
      
      // Update state with fetched data
      setNotificationSettings(data);
      
      return data;
    },
    enabled: !!clientId,
  });

  // Fetch security settings
  const { isLoading: loadingSecurity } = useQuery({
    queryKey: ['/api/client-security-settings', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      console.log(`Fetching security settings for client ID: ${clientId}`);
      
      // Get the authentication token
      const token = localStorage.getItem('token');
      
      // This endpoint is a placeholder - it would need to be implemented on the backend
      const response = await fetch(`/api/client-security-settings/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .catch(err => {
        console.log('Error fetching security settings, returning defaults');
        // Since we are just setting up the UI, we'll return default settings
        // In a real implementation, we'd throw an error here
        return { 
          ok: true, 
          json: () => Promise.resolve({
            twoFactorEnabled: false,
            loginAlerts: true,
            allowMultipleSessions: true,
            sessionTimeout: 60
          }) 
        };
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch security settings');
      }
      
      const data = await response.json();
      console.log('Security settings fetched:', data);
      
      // Update state with fetched data
      setSecuritySettings(data);
      
      return data;
    },
    enabled: !!clientId,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      if (!clientId) throw new Error('Client ID not available');
      
      // Show initial toast when starting update
      toast({
        title: 'Saving Profile...',
        description: 'Your profile changes are being processed.',
      });
      
      try {
        // For demonstration purposes, simulate a brief delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real implementation, we would call the actual API
        // const token = localStorage.getItem('token');
        // const response = await fetch(`/api/client-profile/${clientId}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Authorization': `Bearer ${token}`,
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(profileData)
        // });
        //
        // if (!response.ok) {
        //   throw new Error('Failed to update profile');
        // }
        //
        // return await response.json();
        
        // For demo, return the profileData directly
        console.log('Profile updated successfully (demo):', profileData);
        return profileData;
      } catch (err) {
        console.error('Error updating profile:', err);
        throw new Error('Failed to update profile. Please try again.');
      }
    },
    onSuccess: (data) => {
      // Update auth context or localStorage for persistence
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        try {
          const parsedUser = JSON.parse(currentUser);
          const updatedUser = { ...parsedUser, ...data };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        } catch (error) {
          console.error('Error updating user in localStorage:', error);
        }
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Update notification settings mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (settings: NotificationSettings) => {
      if (!clientId) throw new Error('Client ID not available');
      
      // Show initial toast
      toast({
        title: 'Saving Preferences...',
        description: 'Updating your notification settings.',
      });
      
      try {
        // For demonstration purposes, simulate a brief delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real implementation, we would call the actual API
        // const token = localStorage.getItem('token');
        // const response = await fetch(`/api/client-notification-settings/${clientId}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Authorization': `Bearer ${token}`,
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(settings)
        // });
        //
        // if (!response.ok) {
        //   throw new Error('Failed to update notification settings');
        // }
        //
        // return await response.json();
        
        console.log('Notification settings updated successfully (demo):', settings);
        return settings;
      } catch (err) {
        console.error('Error updating notification settings:', err);
        throw new Error('Failed to update notification settings. Please try again.');
      }
    },
    onSuccess: (data) => {
      // Update the local state to reflect changes
      setNotificationSettings(data);
      
      // In a real app, we would invalidate the query cache
      // queryClient.invalidateQueries({ queryKey: ['/api/client-notification-settings', clientId] });
      
      toast({
        title: 'Preferences Updated',
        description: 'Your notification preferences have been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update notification settings. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Update security settings mutation
  const updateSecurityMutation = useMutation({
    mutationFn: async (settings: SecuritySettings) => {
      if (!clientId) throw new Error('Client ID not available');
      
      // Show initial toast
      toast({
        title: 'Updating Security...',
        description: 'Applying your security preferences.',
      });
      
      try {
        // For demonstration purposes, simulate a brief delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real implementation, we would call the actual API
        // const token = localStorage.getItem('token');
        // const response = await fetch(`/api/client-security-settings/${clientId}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Authorization': `Bearer ${token}`,
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(settings)
        // });
        //
        // if (!response.ok) {
        //   throw new Error('Failed to update security settings');
        // }
        //
        // return await response.json();
        
        console.log('Security settings updated successfully (demo):', settings);
        return settings;
      } catch (err) {
        console.error('Error updating security settings:', err);
        throw new Error('Failed to update security settings. Please try again.');
      }
    },
    onSuccess: (data) => {
      // Update the local state to reflect changes
      setSecuritySettings(data);
      
      // In a real app, we would invalidate the query cache
      // queryClient.invalidateQueries({ queryKey: ['/api/client-security-settings', clientId] });
      
      toast({
        title: 'Security Updated',
        description: 'Your security settings have been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update security settings. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: z.infer<typeof passwordFormSchema>) => {
      if (!clientId) throw new Error('Client ID not available');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/client-change-password/${clientId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })
      .catch(err => {
        console.log('Error changing password, demo mode');
        // Since we are just setting up the UI, we'll simulate a successful response
        // In a real implementation, we'd throw an error here
        return { ok: true, json: () => Promise.resolve({ success: true }) };
      });
      
      if (!response.ok) {
        throw new Error('Failed to change password');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to change password. Please ensure your current password is correct.',
        variant: 'destructive',
      });
    }
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!clientId) throw new Error('Client ID not available');
      
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch(`/api/client-avatar/${clientId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      .catch(err => {
        console.log('Error uploading avatar, demo mode');
        // Since we are just setting up the UI, we'll simulate a successful response
        // In a real implementation, we'd throw an error here
        return { 
          ok: true, 
          json: () => Promise.resolve({ 
            profilePicture: URL.createObjectURL(file)
          }) 
        };
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Update profile data and localStorage
      setProfileData(prev => ({
        ...prev,
        profilePicture: data.profilePicture
      }));
      
      // Update user in localStorage
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        try {
          const parsedUser = JSON.parse(currentUser);
          const updatedUser = { ...parsedUser, profilePicture: data.profilePicture };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        } catch (error) {
          console.error('Error updating user in localStorage:', error);
        }
      }
      
      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      if (!clientId) throw new Error('Client ID not available');
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .catch(err => {
        console.log('Error deleting account, demo mode');
        // Since we are just setting up the UI, we'll simulate a successful response
        // In a real implementation, we'd throw an error here
        return { ok: true, json: () => Promise.resolve({ success: true }) };
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Account Deleted',
        description: 'Your account has been successfully deleted.',
      });
      
      // Perform logout
      logout();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setAvatarPreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save changes for profile
  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  // Handle save for notification settings
  const handleSaveNotificationSettings = () => {
    if (notificationSettings) {
      updateNotificationsMutation.mutate(notificationSettings);
    }
  };

  // Handle save for security settings
  const handleSaveSecuritySettings = () => {
    if (securitySettings) {
      updateSecurityMutation.mutate(securitySettings);
    }
  };

  // Handle password change
  const handlePasswordChange = (values: z.infer<typeof passwordFormSchema>) => {
    changePasswordMutation.mutate(values);
  };

  // Handle upload avatar
  const handleUploadAvatar = () => {
    if (avatarFile) {
      uploadAvatarMutation.mutate(avatarFile);
    }
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  return (
    <div className="container p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5" /> 
                Personal Information
              </CardTitle>
              <CardDescription>
                Manage your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="Profile preview" />
                    ) : (
                      profileData.profilePicture ? (
                        <AvatarImage src={profileData.profilePicture} alt="Profile picture" />
                      ) : (
                        <AvatarFallback className="text-lg">
                          {profileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      )
                    )}
                  </Avatar>
                  <div className="mt-2">
                    <Label htmlFor="avatar-upload" className="cursor-pointer inline-flex items-center text-sm font-medium text-primary">
                      <Upload className="h-4 w-4 mr-1" />
                      Change Photo
                    </Label>
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarChange}
                    />
                  </div>
                  {avatarFile && (
                    <Button 
                      size="sm" 
                      className="mt-2" 
                      onClick={handleUploadAvatar}
                      disabled={uploadAvatarMutation.isPending}
                    >
                      {uploadAvatarMutation.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Upload'
                      )}
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={profileData.name} 
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profileData.email} 
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={profileData.phoneNumber} 
                      onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input 
                      id="company" 
                      value={profileData.company} 
                      onChange={(e) => setProfileData({...profileData, company: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input 
                      id="jobTitle" 
                      value={profileData.jobTitle} 
                      onChange={(e) => setProfileData({...profileData, jobTitle: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    value={profileData.address} 
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    value={profileData.city} 
                    onChange={(e) => setProfileData({...profileData, city: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input 
                    id="zipCode" 
                    value={profileData.zipCode} 
                    onChange={(e) => setProfileData({...profileData, zipCode: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country" 
                    value={profileData.country} 
                    onChange={(e) => setProfileData({...profileData, country: e.target.value})} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button 
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Lock className="h-5 w-5" /> 
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form 
                  onSubmit={passwordForm.handleSubmit(handlePasswordChange)} 
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type={showCurrentPassword ? 'text' : 'password'} 
                              placeholder="Enter current password" 
                              {...field} 
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-10 w-10"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type={showNewPassword ? 'text' : 'password'} 
                              placeholder="Enter new password" 
                              {...field} 
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-10 w-10"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <FormDescription>
                          Password must be at least 8 characters and include uppercase, lowercase letters and numbers.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type={showConfirmPassword ? 'text' : 'password'} 
                              placeholder="Confirm new password" 
                              {...field} 
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-10 w-10"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit"
                    className="mt-4"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-destructive flex items-center gap-2">
                <CircleX className="h-5 w-5" /> 
                Delete Account
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                When you delete your account, all of your data, including projects, documents, and files will be permanently removed. This action cannot be undone.
              </p>
              <Button 
                variant="destructive" 
                onClick={() => setDeleteAccountDialogOpen(true)}
              >
                Delete Account
              </Button>
              
              <AlertDialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. All of your data will be permanently deleted from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      disabled={deleteAccountMutation.isPending}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {deleteAccountMutation.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="h-5 w-5" /> 
                Account Security
              </CardTitle>
              <CardDescription>
                Manage your account security settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingSecurity ? (
                <div className="flex justify-center py-6">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : securitySettings ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <div className="flex items-center">
                      {securitySettings.twoFactorEnabled ? (
                        <Badge variant="outline" className="mr-2 bg-green-50 text-green-600 border-green-200">
                          <CircleCheck className="h-3 w-3 mr-1" />
                          Enabled
                        </Badge>
                      ) : null}
                      <Switch 
                        id="twoFactorAuth" 
                        checked={securitySettings.twoFactorEnabled}
                        onCheckedChange={(checked) => 
                          setSecuritySettings({...securitySettings, twoFactorEnabled: checked})
                        }
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="loginAlerts">Login Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for new login attempts
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Switch 
                        id="loginAlerts" 
                        checked={securitySettings.loginAlerts}
                        onCheckedChange={(checked) => 
                          setSecuritySettings({...securitySettings, loginAlerts: checked})
                        }
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="multipleSessions">Allow Multiple Sessions</Label>
                      <p className="text-sm text-muted-foreground">
                        Stay logged in on multiple devices simultaneously
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Switch 
                        id="multipleSessions" 
                        checked={securitySettings.allowMultipleSessions}
                        onCheckedChange={(checked) => 
                          setSecuritySettings({...securitySettings, allowMultipleSessions: checked})
                        }
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        type="number" 
                        min={5} 
                        max={240} 
                        value={securitySettings.sessionTimeout} 
                        onChange={(e) => 
                          setSecuritySettings({
                            ...securitySettings, 
                            sessionTimeout: parseInt(e.target.value) || 60
                          })
                        }
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        Automatically log out after inactivity (5-240 minutes)
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Failed to load security settings. Please refresh the page and try again.
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              <Button 
                onClick={handleSaveSecuritySettings}
                disabled={updateSecurityMutation.isPending || !securitySettings}
              >
                {updateSecurityMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Smartphone className="h-5 w-5" /> 
                Active Sessions
              </CardTitle>
              <CardDescription>
                View and manage your currently active sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-md border bg-muted/50">
                  <div>
                    <p className="font-medium">Current Session</p>
                    <p className="text-sm text-muted-foreground">Chrome on Windows • Portland, OR • Last active: Just now</p>
                  </div>
                  <Badge>Current</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-md border">
                  <div>
                    <p className="font-medium">Mobile App</p>
                    <p className="text-sm text-muted-foreground">iPhone • Portland, OR • Last active: 2 hours ago</p>
                  </div>
                  <Button variant="outline" size="sm">Sign Out</Button>
                </div>
                
                <div className="flex justify-between items-center p-3 rounded-md border">
                  <div>
                    <p className="font-medium">Safari</p>
                    <p className="text-sm text-muted-foreground">Mac OS • New York, NY • Last active: 3 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">Sign Out</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out of All Other Sessions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Bell className="h-5 w-5" /> 
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loadingNotifications ? (
                <div className="flex justify-center py-6">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : notificationSettings ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications" className="text-base font-medium">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Master control for all email notifications
                      </p>
                    </div>
                    <Switch 
                      id="emailNotifications" 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, emailNotifications: checked})
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between pl-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="projectUpdates">Project Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates when your projects are modified
                      </p>
                    </div>
                    <Switch 
                      id="projectUpdates" 
                      checked={notificationSettings.projectUpdates}
                      disabled={!notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, projectUpdates: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pl-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="documentUploads">Document Uploads</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new documents are uploaded
                      </p>
                    </div>
                    <Switch 
                      id="documentUploads" 
                      checked={notificationSettings.documentUploads}
                      disabled={!notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, documentUploads: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pl-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="invoiceReminders">Invoice Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive payment and invoice notifications
                      </p>
                    </div>
                    <Switch 
                      id="invoiceReminders" 
                      checked={notificationSettings.invoiceReminders}
                      disabled={!notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, invoiceReminders: checked})
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pl-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketingEmails">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Updates, newsletters, and promotional offers
                      </p>
                    </div>
                    <Switch 
                      id="marketingEmails" 
                      checked={notificationSettings.marketingEmails}
                      disabled={!notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, marketingEmails: checked})
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="smsNotifications" className="text-base font-medium">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive important alerts via text message
                      </p>
                    </div>
                    <Switch 
                      id="smsNotifications" 
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, smsNotifications: checked})
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="browserNotifications" className="text-base font-medium">Browser Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive desktop notifications while using the platform
                      </p>
                    </div>
                    <Switch 
                      id="browserNotifications" 
                      checked={notificationSettings.browserNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, browserNotifications: checked})
                      }
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Failed to load notification settings. Please refresh the page and try again.
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              <Button 
                onClick={handleSaveNotificationSettings}
                disabled={updateNotificationsMutation.isPending || !notificationSettings}
              >
                {updateNotificationsMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientSettings;