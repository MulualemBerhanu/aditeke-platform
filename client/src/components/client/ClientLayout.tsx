import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import TokenAuthAlert from '@/components/auth/TokenAuthAlert';
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Home,
  Menu,
  X,
  ChevronDown,
  Mail,
  HelpCircle,
  Download,
  Bell,
  Search,
  User,
  CreditCard,
  BarChart3,
  Calendar,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Navigation items for the sidebar
const CLIENT_NAV_ITEMS = [
  { 
    label: 'Dashboard', 
    href: '/client/dashboard', 
    icon: <LayoutDashboard className="h-5 w-5" /> 
  },
  { 
    label: 'My Projects', 
    href: '/client/projects', 
    icon: <FolderKanban className="h-5 w-5" /> 
  },
  { 
    label: 'Messages', 
    href: '/client/messages', 
    icon: <MessageSquare className="h-5 w-5" /> 
  },
  { 
    label: 'Documents', 
    href: '/client/documents', 
    icon: <FileText className="h-5 w-5" /> 
  },
  { 
    label: 'Support', 
    href: '/client/support', 
    icon: <HelpCircle className="h-5 w-5" /> 
  },
  { 
    label: 'Downloads', 
    href: '/client/downloads', 
    icon: <Download className="h-5 w-5" /> 
  },
  { 
    label: 'Settings', 
    href: '/client/settings', 
    icon: <Settings className="h-5 w-5" /> 
  },
];

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
        setIsMobile(true);
      } else {
        setIsSidebarOpen(true);
        setIsMobile(false);
      }
    };

    handleResize(); // Initialize on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar on navigation
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location, isMobile]);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Check if the current route is active
  const isRouteActive = (href: string) => {
    const pathname = window.location.pathname;
    
    if (href === '/client/dashboard') {
      return location === href || pathname === href;
    }
    return location.startsWith(href) || pathname.startsWith(href);
  };

  // Get user data from context or localStorage
  const userData = user || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!) : null);

  if (!userData) {
    return <div className="flex justify-center items-center min-h-screen">Loading user data...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Token Auth Alert for cross-domain environments */}
      <TokenAuthAlert />
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: isMobile ? -320 : 0 }}
        animate={{ 
          x: isSidebarOpen ? 0 : (isMobile ? -320 : -320),
          boxShadow: isMobile && isSidebarOpen ? '5px 0 25px rgba(0,0,0,0.1)' : 'none'
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`${
          isMobile ? 'fixed inset-y-0 left-0 z-30' : 'relative'
        } w-80 bg-slate-900 flex flex-col`}
      >
        {/* Sidebar header */}
        <div className="px-6 py-8 border-b border-slate-700/30 flex items-center justify-between">
          <Link href="/client/dashboard" className="flex items-center space-x-2">
            <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-indigo-300">
              <span>AdiTeke</span>
              <span className="text-indigo-100 ml-1 text-sm font-normal">Client</span>
            </div>
          </Link>
          {isMobile && (
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800/80" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* User profile highlight in sidebar */}
        <div className="mt-6 px-6">
          <div className="flex items-center p-3 rounded-lg bg-gradient-to-br from-slate-800/80 to-slate-700/30 border border-slate-700/30 shadow-lg">
            <Avatar className="h-12 w-12 mr-3 border-2 border-indigo-400/30">
              <AvatarImage src={userData.profilePicture || ''} alt={userData.name} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                {getInitials(userData.name || userData.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {userData.name || userData.username}
              </p>
              <div className="flex items-center">
                <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 border border-indigo-400/20 text-xs">
                  Client
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="ml-2 text-slate-400 hover:text-indigo-200 hover:bg-indigo-500/10">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto py-6 px-4 mt-4">
          <div className="px-2 mb-4">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2 ml-2">Main Menu</p>
          </div>
          <nav className="space-y-1.5">
            {CLIENT_NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center px-4 py-2.5 rounded-lg transition-all ${
                  isRouteActive(item.href)
                    ? 'bg-gradient-to-r from-indigo-600/60 to-indigo-800/60 text-white font-medium shadow-md shadow-indigo-900/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span className="mr-3 opacity-80">{item.icon}</span>
                <span>{item.label}</span>
                {item.label === 'Messages' && (
                  <Badge className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-xs text-white">2</Badge>
                )}
              </Link>
            ))}
          </nav>
          
          <div className="mt-8 px-2">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-medium mb-2 ml-2">Quick Links</p>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
              <Button variant="outline" className="w-full bg-slate-700/30 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white mb-2">
                <Shield className="h-4 w-4 mr-2 text-indigo-400" />
                <span>Security Center</span>
              </Button>
              <Button variant="outline" className="w-full bg-slate-700/30 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white">
                <HelpCircle className="h-4 w-4 mr-2 text-indigo-400" />
                <span>Help & Resources</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar footer with user actions */}
        <div className="p-4 border-t border-slate-700/30 mt-auto">
          <Button 
            variant="outline" 
            className="w-full bg-red-500/10 text-red-300 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Logout</span>
          </Button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-slate-200 shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 hover:bg-slate-100"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="relative hidden md:block mx-4 w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search..." 
                  className="pl-8 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href="/" className="p-2 text-slate-500 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-100">
                <Home className="h-5 w-5" />
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-600"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-medium">Notifications</p>
                    <p className="text-xs text-slate-500">You have 3 unread messages</p>
                  </div>
                  <DropdownMenuItem className="cursor-pointer py-3 px-4">
                    <div className="flex items-start">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback className="bg-indigo-500 text-white text-xs">TM</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">New message from Team</p>
                        <p className="text-xs text-slate-500 truncate">Your project has been updated with new details...</p>
                        <p className="text-xs text-indigo-600 mt-1">2 hours ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer py-3 px-4">
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Document ready</p>
                        <p className="text-xs text-slate-500 truncate">Contract document has been finalized and ready for review</p>
                        <p className="text-xs text-indigo-600 mt-1">Yesterday</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <div className="p-2 border-t border-slate-100 text-center">
                    <Button variant="ghost" className="text-xs w-full text-indigo-600 hover:text-indigo-700">View all notifications</Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userData.profilePicture || ''} alt={userData.name} />
                      <AvatarFallback className="bg-indigo-600 text-white text-xs">
                        {getInitials(userData.name || userData.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2 border-b border-slate-100">
                    <p className="font-medium">{userData.name || userData.username}</p>
                    <p className="text-xs text-slate-500">{userData.email}</p>
                  </div>
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>Contact Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => logout()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content area with scrollability */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;