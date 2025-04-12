import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Settings,
  Shield,
  Bell,
  Database,
  Cloud,
  Mail,
  Globe,
  InfoIcon,
  Save,
  AlertTriangle
} from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // State for maintenance mode
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  
  // State for system notifications
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [browserNotifications, setBrowserNotifications] = React.useState(true);
  
  // State for security settings
  const [twoFactorRequired, setTwoFactorRequired] = React.useState(false);
  const [passwordExpiry, setPasswordExpiry] = React.useState(90); // days
  const [minPasswordLength, setMinPasswordLength] = React.useState(8);
  
  // State for backup settings
  const [autoBackup, setAutoBackup] = React.useState(true);
  const [backupFrequency, setBackupFrequency] = React.useState('daily');
  
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
  
  // Handle saving general settings
  const saveGeneralSettings = () => {
    toast({
      title: 'Settings Saved',
      description: 'General settings have been updated successfully',
    });
  };
  
  // Handle saving notification settings
  const saveNotificationSettings = () => {
    toast({
      title: 'Notification Settings Saved',
      description: 'Notification preferences have been updated successfully',
    });
  };
  
  // Handle saving security settings
  const saveSecuritySettings = () => {
    toast({
      title: 'Security Settings Saved',
      description: 'Security configurations have been updated successfully',
    });
  };
  
  // Handle saving backup settings
  const saveBackupSettings = () => {
    toast({
      title: 'Backup Settings Saved',
      description: 'Backup configurations have been updated successfully',
    });
  };
  
  // Handle enabling maintenance mode
  const toggleMaintenanceMode = () => {
    const newMode = !maintenanceMode;
    setMaintenanceMode(newMode);
    toast({
      title: newMode ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled',
      description: newMode ? 'Website is now in maintenance mode and inaccessible to visitors' : 'Website is now accessible to all visitors',
      variant: newMode ? 'destructive' : 'default',
    });
  };
  
  // Handle manual backup
  const triggerManualBackup = () => {
    toast({
      title: 'Backup Started',
      description: 'Manual backup has been initiated. You will be notified when it completes.',
    });
    
    // Simulate backup completion after 3 seconds
    setTimeout(() => {
      toast({
        title: 'Backup Completed',
        description: 'Manual backup has been completed successfully.',
      });
    }, 3000);
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
          onClick={() => setLocation('/admin/dashboard')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">System Settings</h1>
      </div>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Database className="h-4 w-4 mr-2" />
            Backup & Restore
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure system-wide general settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Maintenance Mode</div>
                    <div className="text-sm text-muted-foreground">
                      Temporarily disable the website for maintenance
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={maintenanceMode} 
                      onCheckedChange={setMaintenanceMode} 
                    />
                    {maintenanceMode ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Disabled
                      </Badge>
                    )}
                  </div>
                </div>
                
                {maintenanceMode && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      The website is currently in maintenance mode and is inaccessible to visitors.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="text-sm font-medium">Company Information</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="company-name" className="text-sm">Company Name</label>
                      <Input id="company-name" defaultValue="AdiTeke Software Solutions" />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="contact-email" className="text-sm">Contact Email</label>
                      <Input id="contact-email" defaultValue="contact@aditeke.com" type="email" />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm">Phone Number</label>
                      <Input id="phone" defaultValue="+1 (555) 123-4567" />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="website" className="text-sm">Website URL</label>
                      <Input id="website" defaultValue="https://aditeke.com" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm">Address</label>
                    <Textarea id="address" defaultValue="123 Tech Plaza, Suite 500, Silicon Valley, CA 94043" />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="text-sm font-medium">Site Configuration</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="site-title" className="text-sm">Site Title</label>
                      <Input id="site-title" defaultValue="AdiTeke Software Solutions" />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="tagline" className="text-sm">Tagline</label>
                      <Input id="tagline" defaultValue="Innovative Solutions for Tomorrow's Challenges" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="site-description" className="text-sm">Site Description (SEO)</label>
                    <Textarea 
                      id="site-description" 
                      defaultValue="AdiTeke Software Solutions provides cutting-edge software development, AI integration, and digital transformation services for businesses of all sizes." 
                    />
                    <p className="text-xs text-muted-foreground">This description will be used for SEO purposes.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveGeneralSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              {maintenanceMode && (
                <Button variant="destructive" className="ml-auto" onClick={toggleMaintenanceMode}>
                  Disable Maintenance Mode
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure system notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Send system notifications to admin email
                    </div>
                  </div>
                  <Switch 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications} 
                  />
                </div>
                
                <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Browser Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Show desktop notifications when logged in
                    </div>
                  </div>
                  <Switch 
                    checked={browserNotifications} 
                    onCheckedChange={setBrowserNotifications} 
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="text-sm font-medium">Notification Events</div>
                  
                  <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">New User Registrations</div>
                      <div className="text-sm text-muted-foreground">
                        Notify when a new user registers
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">New Project Assignments</div>
                      <div className="text-sm text-muted-foreground">
                        Notify when a project is assigned
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Contact Form Submissions</div>
                      <div className="text-sm text-muted-foreground">
                        Notify on new contact form submissions
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">System Alerts</div>
                      <div className="text-sm text-muted-foreground">
                        Critical system notifications
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="text-sm font-medium">Email Settings</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="smtp-server" className="text-sm">SMTP Server</label>
                      <Input id="smtp-server" defaultValue="smtp.example.com" />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="smtp-port" className="text-sm">SMTP Port</label>
                      <Input id="smtp-port" defaultValue="587" type="number" />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="smtp-username" className="text-sm">SMTP Username</label>
                      <Input id="smtp-username" defaultValue="notifications@aditeke.com" />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="smtp-password" className="text-sm">SMTP Password</label>
                      <Input id="smtp-password" type="password" defaultValue="••••••••••••" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="from-email" className="text-sm">From Email</label>
                    <Input id="from-email" defaultValue="notifications@aditeke.com" type="email" />
                    <p className="text-xs text-muted-foreground">Email address that will appear in the "From" field of outgoing emails.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveNotificationSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure system security and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground">
                      Require 2FA for all administrative accounts
                    </div>
                  </div>
                  <Switch 
                    checked={twoFactorRequired} 
                    onCheckedChange={setTwoFactorRequired} 
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="text-sm font-medium">Password Policy</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="min-length" className="text-sm">Minimum Password Length</label>
                      <Input 
                        id="min-length" 
                        type="number" 
                        value={minPasswordLength}
                        onChange={(e) => setMinPasswordLength(parseInt(e.target.value))}
                        min={6}
                        max={16}
                      />
                      <p className="text-xs text-muted-foreground">Minimum number of characters for passwords.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="password-expiry" className="text-sm">Password Expiry (days)</label>
                      <Input 
                        id="password-expiry" 
                        type="number" 
                        value={passwordExpiry}
                        onChange={(e) => setPasswordExpiry(parseInt(e.target.value))}
                        min={0}
                        max={365}
                      />
                      <p className="text-xs text-muted-foreground">Days before users must reset password (0 = never).</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Require Complex Passwords</div>
                      <div className="text-sm text-muted-foreground">
                        Password must contain uppercase, lowercase, number, and symbol
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Prevent Password Reuse</div>
                      <div className="text-sm text-muted-foreground">
                        Users cannot reuse their previous 5 passwords
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="text-sm font-medium">Session Settings</div>
                  
                  <div className="space-y-2">
                    <label htmlFor="session-timeout" className="text-sm">Session Timeout (minutes)</label>
                    <Input id="session-timeout" type="number" defaultValue="30" min={5} max={120} />
                    <p className="text-xs text-muted-foreground">Minutes of inactivity before users are logged out.</p>
                  </div>
                  
                  <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">IP Restriction</div>
                      <div className="text-sm text-muted-foreground">
                        Limit admin access to specific IP addresses
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Security Logs</div>
                  <Button variant="outline" className="w-full">
                    View Security Logs
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveSecuritySettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>
                Configure system backup settings and restore points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="default" className="border-blue-100 bg-blue-50">
                <InfoIcon className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Information</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Regular backups help protect your data from loss. We recommend setting up automatic backups to secure your information.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Automatic Backups</div>
                    <div className="text-sm text-muted-foreground">
                      Schedule regular system backups
                    </div>
                  </div>
                  <Switch 
                    checked={autoBackup} 
                    onCheckedChange={setAutoBackup} 
                  />
                </div>
                
                {autoBackup && (
                  <div className="space-y-4 ml-6">
                    <div className="space-y-2">
                      <label htmlFor="backup-frequency" className="text-sm">Backup Frequency</label>
                      <select 
                        id="backup-frequency" 
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={backupFrequency}
                        onChange={(e) => setBackupFrequency(e.target.value)}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="retention-period" className="text-sm">Retention Period (days)</label>
                      <Input id="retention-period" type="number" defaultValue="30" />
                      <p className="text-xs text-muted-foreground">Days to keep backups before deletion.</p>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="text-sm font-medium">Backup Location</div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="local-storage" name="backup-location" defaultChecked />
                      <label htmlFor="local-storage" className="text-sm">Local Storage</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="radio" id="cloud-storage" name="backup-location" />
                      <label htmlFor="cloud-storage" className="text-sm">Cloud Storage</label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="backup-path" className="text-sm">Backup Path</label>
                    <Input id="backup-path" defaultValue="/backups" />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="text-sm font-medium">Manual Backup</div>
                  
                  <Button variant="outline" className="w-full" onClick={triggerManualBackup}>
                    <Database className="mr-2 h-4 w-4" />
                    Create Backup Now
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="text-sm font-medium">Restore Points</div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Backup - April 11, 2025 (10:45 PM)</p>
                        <p className="text-xs text-muted-foreground">Complete system backup</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Restore
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Backup - April 10, 2025 (10:45 PM)</p>
                        <p className="text-xs text-muted-foreground">Complete system backup</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Restore
                      </Button>
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Backup - April 9, 2025 (10:45 PM)</p>
                        <p className="text-xs text-muted-foreground">Complete system backup</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Restore
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveBackupSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}