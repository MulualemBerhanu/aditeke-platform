import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  FolderKanban, 
  TrendingUp, 
  MessageSquare, 
  ShoppingCart,
  Database,
  RefreshCw
} from 'lucide-react';

// Dashboard cards data
const dashboardCards = [
  {
    title: 'Users',
    value: '482',
    change: '+12%',
    description: 'Active accounts',
    icon: <Users className="h-8 w-8 text-blue-500" />,
    link: '/admin/user-management'
  },
  {
    title: 'Projects',
    value: '24',
    change: '+3',
    description: 'Ongoing projects',
    icon: <FolderKanban className="h-8 w-8 text-green-500" />,
    link: '/admin/project-management'
  },
  {
    title: 'Content',
    value: '138',
    change: '+7',
    description: 'Articles & pages',
    icon: <FileText className="h-8 w-8 text-purple-500" />,
    link: '/admin/content-management'
  },
  {
    title: 'Traffic',
    value: '24.5K',
    change: '+18%',
    description: 'Monthly visitors',
    icon: <TrendingUp className="h-8 w-8 text-amber-500" />,
    link: '/admin/analytics'
  }
];

// Quick actions data
const quickActions = [
  {
    title: 'New Project',
    description: 'Create a new project',
    icon: <FolderKanban className="h-6 w-6 text-primary" />,
    link: '/admin/project-management/create'
  },
  {
    title: 'New User',
    description: 'Add a new user',
    icon: <Users className="h-6 w-6 text-primary" />,
    link: '/admin/user-management/create'
  },
  {
    title: 'New Blog Post',
    description: 'Write a new blog post',
    icon: <FileText className="h-6 w-6 text-primary" />,
    link: '/admin/content-management/blog/create'
  },
  {
    title: 'Messages',
    description: 'View messages',
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
    link: '/admin/messages'
  },
  {
    title: 'Orders',
    description: 'View recent orders',
    icon: <ShoppingCart className="h-6 w-6 text-primary" />,
    link: '/admin/orders'
  },
  {
    title: 'Settings',
    description: 'Configure system',
    icon: <Settings className="h-6 w-6 text-primary" />,
    link: '/admin/settings'
  }
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [initializing, setInitializing] = useState(false);

  // Load user data from localStorage if not available in context
  const userData = user || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null);

  if (!userData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const handleCardClick = (link: string) => {
    setLocation(link);
  };
  
  // Function to initialize the database with sample data
  const handleInitializeDatabase = async () => {
    try {
      setInitializing(true);
      
      const response = await fetch('/api/init-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Database initialized successfully",
          description: "Sample data has been added to the database.",
          variant: "default",
        });
      } else {
        toast({
          title: "Database initialization failed",
          description: data.message || "An error occurred during initialization.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Database initialization failed",
        description: "An error occurred while connecting to the server.",
        variant: "destructive",
      });
      console.error("Error initializing database:", error);
    } finally {
      setInitializing(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {userData?.name?.split(' ')[0] || userData?.username || 'Admin'}
          </h1>
          <p className="text-gray-500">
            Here's what's happening with your website today
          </p>
        </div>
        
        {/* Database Management Section (Admin Only) */}
        <Card className="bg-slate-50 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Database Management</CardTitle>
            </div>
            <CardDescription>
              Advanced tools for database administration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Initialize Database</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Populate the database with sample data for development and testing.
                    This action will add users, services, projects, testimonials, and blog posts.
                  </p>
                  <div className="text-sm bg-amber-50 border border-amber-200 rounded-md p-2 text-amber-800">
                    <strong>Warning:</strong> This will not overwrite existing data but may create duplicates. 
                    Use only in development environments.
                  </div>
                </div>
                <div>
                  <Button 
                    onClick={handleInitializeDatabase} 
                    disabled={initializing}
                    className="bg-primary/90 hover:bg-primary"
                  >
                    {initializing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Initialize
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card, index) => (
            <Card 
              key={index}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCardClick(card.link)}
            >
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <div className="flex items-baseline mt-1">
                    <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                    <span className="ml-2 text-sm font-medium text-green-500">{card.change}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{card.description}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-full">
                  {card.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick actions section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCardClick(action.link)}
              >
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent activity section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Activity items */}
                <div className="flex items-start space-x-4 pb-4 border-b">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">New blog post published</p>
                    <p className="text-sm text-gray-500 mt-1">
                      "10 Essential Tips for Software Development" was published 2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 pb-4 border-b">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Users className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">New client account created</p>
                    <p className="text-sm text-gray-500 mt-1">
                      "Tech Innovations Inc." was added as a new client account
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <FolderKanban className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Project status updated</p>
                    <p className="text-sm text-gray-500 mt-1">
                      "E-commerce Platform" status changed from "In Progress" to "Review"
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Activity</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}