import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import TokenAuthAlert from '@/components/auth/TokenAuthAlert';
import {
  BarChart3,
  Users,
  FileText,
  Settings,
  LogOut,
  Home,
  FolderKanban,
  Menu,
  X,
  ChevronDown,
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
import { useState, useEffect } from 'react';

// Navigation items for the sidebar
const ADMIN_NAV_ITEMS = [
  { 
    label: 'Dashboard', 
    href: '/admin/dashboard', 
    icon: <BarChart3 className="h-5 w-5" /> 
  },
  { 
    label: 'User Management', 
    href: '/admin/user-management', 
    icon: <Users className="h-5 w-5" /> 
  },
  { 
    label: 'Content Management', 
    href: '/admin/content-management', 
    icon: <FileText className="h-5 w-5" />,
    subItems: [
      { label: 'Blog Posts', href: '/admin/content-management/blog' },
      { label: 'Services', href: '/admin/content-management/services' },
      { label: 'Testimonials', href: '/admin/content-management/testimonials' },
    ]
  },
  { 
    label: 'Project Management', 
    href: '/admin/project-management', 
    icon: <FolderKanban className="h-5 w-5" /> 
  },
  { 
    label: 'Settings', 
    href: '/admin/settings', 
    icon: <Settings className="h-5 w-5" /> 
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

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

  // Toggle submenu open/close
  const toggleSubmenu = (label: string) => {
    if (openSubmenu === label) {
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu(label);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Check if the current route is active using both location from wouter and real pathname
  const isRouteActive = (href: string) => {
    const pathname = window.location.pathname; // Use real pathname as backup
    
    if (href === '/admin/dashboard') {
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
    <div className="flex h-screen bg-gray-100">
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
      <aside 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isMobile ? 'fixed inset-y-0 left-0 z-30' : 'relative'
        } w-64 transition-transform duration-300 ease-in-out bg-white border-r border-gray-200 flex flex-col`}
      >
        {/* Sidebar header */}
        <div className="px-6 py-6 border-b border-gray-200 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              <span>AdiTeke</span>
            </div>
          </Link>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1">
            {ADMIN_NAV_ITEMS.map((item) => (
              <div key={item.label}>
                {item.subItems ? (
                  <div className="mb-1">
                    <button
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                        isRouteActive(item.href)
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleSubmenu(item.label)}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openSubmenu === item.label ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openSubmenu === item.label && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                              location === subItem.href
                                ? 'bg-primary/5 text-primary font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                      isRouteActive(item.href)
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar footer with user profile */}
        <div className="p-4 border-t border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarImage src={userData.profilePicture || ''} alt={userData.name} />
                  <AvatarFallback>{getInitials(userData.name || userData.username)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-medium truncate">{userData.name || userData.username}</p>
                  <p className="text-xs text-gray-500 truncate">Administrator</p>
                </div>
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="cursor-pointer">Profile Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => logout()}>
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden mr-2"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/" className="text-gray-700 hover:text-primary transition-colors">
                <Home className="h-5 w-5" />
              </Link>
              <Button variant="outline" onClick={() => logout()}>
                <LogOut className="h-4 w-4 mr-2" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main content area with scrollability */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;