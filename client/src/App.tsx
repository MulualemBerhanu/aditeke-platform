import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Chatbot from "./components/layout/Chatbot";
import FirebaseInit from "./components/firebase/FirebaseInit";
import Home from "./pages/home";
import AboutPage from "./pages/about-page";
import Services from "./pages/services";
import Portfolio from "./pages/portfolio";
import Careers from "./pages/careers";
import Blog from "./pages/blog";
import Contact from "./pages/contact";
import Login from "./pages/login";
import Auth from "./pages/auth";
import DirectLogin from "./pages/direct-login";
import Dashboard from "./pages/dashboard";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import SetNewPassword from "./pages/set-new-password";
// Security test page removed for production

// Admin pages
import AdminDashboard from "./pages/admin/dashboard";
import UserManagement from "./pages/admin/user-management";
import AddUser from "./pages/admin/add-user";
import AdminContentManagement from "./pages/admin/content-management";
import BlogManagement from "./pages/admin/content-management/blog";
import ServiceManagement from "./pages/admin/content-management/services";
import TestimonialManagement from "./pages/admin/content-management/testimonials";
import ProjectManagement from "./pages/admin/project-management";
import CreateProject from "./pages/admin/project-management/create";
import AdminSettings from "./pages/admin/settings";

// Manager pages
import ManagerDashboard from "./pages/manager/dashboard";
import ManagerCreateProject from "./pages/manager/project/create";
import ManagerEditProject from "./pages/manager/project/edit";
import AddClientPage from "./pages/manager/add-client";

// Client pages
import ClientDashboard from "./pages/client/dashboard";
import ContractViewPage from "./pages/contracts/view";

import { AuthProvider } from "./components/auth/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={AboutPage} />
      <Route path="/services" component={Services} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/careers" component={Careers} />
      <Route path="/blog" component={Blog} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/auth" component={Auth} />
      <Route path="/direct-login" component={DirectLogin} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      
      {/* First-time password reset - requires authentication */}
      <Route path="/set-new-password">
        <ProtectedRoute>
          <SetNewPassword />
        </ProtectedRoute>
      </Route>
      
      {/* Legacy dashboard - will redirect to the appropriate role-based dashboard */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Admin Routes - Protected with ProtectedRoute and role requirement */}
      <Route path="/admin/dashboard">
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/user-management">
        <ProtectedRoute requiredRole="admin">
          <UserManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/add-user">
        <ProtectedRoute requiredRole="admin">
          <AddUser />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/content-management">
        <ProtectedRoute requiredRole="admin">
          <AdminContentManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/content-management/blog">
        <ProtectedRoute requiredRole="admin">
          <BlogManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/content-management/services">
        <ProtectedRoute requiredRole="admin">
          <ServiceManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/content-management/testimonials">
        <ProtectedRoute requiredRole="admin">
          <TestimonialManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/project-management">
        <ProtectedRoute requiredRole="admin">
          <ProjectManagement />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/project-management/create">
        <ProtectedRoute requiredRole="admin">
          <CreateProject />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute requiredRole="admin">
          <AdminSettings />
        </ProtectedRoute>
      </Route>
      
      {/* Manager Routes */}
      <Route path="/manager/dashboard">
        <ProtectedRoute requiredRole="manager">
          <ManagerDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/manager/project/create">
        <ProtectedRoute requiredRole="manager">
          <ManagerCreateProject />
        </ProtectedRoute>
      </Route>
      <Route path="/manager/project/edit/:id">
        <ProtectedRoute requiredRole="manager">
          <ManagerEditProject />
        </ProtectedRoute>
      </Route>
      <Route path="/manager/add-client">
        <ProtectedRoute requiredRole="manager">
          <AddClientPage />
        </ProtectedRoute>
      </Route>
      
      {/* Client Routes */}
      <Route path="/client/dashboard">
        <ProtectedRoute requiredRole="client">
          <ClientDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/contracts/view/:id">
        <ProtectedRoute requiredRole="client">
          <ContractViewPage />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // We'll use pathname directly from window.location
  const pathname = window.location.pathname;
  
  // Determine if we're on an admin, manager, or client dashboard page
  const isAdminRoute = pathname.startsWith('/admin');
  const isManagerRoute = pathname.startsWith('/manager');
  const isClientRoute = pathname.startsWith('/client');
  const isDashboardRoute = isAdminRoute || isManagerRoute || isClientRoute;
  
  // Production environment special handling:
  // Check for root URL redirection needs based on authenticated user's role
  React.useEffect(() => {
    // Only run on production and only for the root path
    const isProduction = window.location.hostname !== 'localhost';
    const isRootPath = pathname === '/';
    
    if (isProduction && isRootPath) {
      console.log("💫 Production environment root path detection");
      
      // Check for login credentials in storage
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const userDataStr = localStorage.getItem('currentUser');
      const pendingRedirect = localStorage.getItem('pendingRedirect');
      
      if (isAuthenticated && userDataStr) {
        try {
          // Parse stored user data
          const userData = JSON.parse(userDataStr);
          
          // Determine redirect based on role
          let redirectUrl = '/dashboard';
          
          // First try numeric roleId
          const roleId = typeof userData.roleId === 'string' 
            ? parseInt(userData.roleId) 
            : (typeof userData.roleId === 'number' ? userData.roleId : null);
            
          if (roleId === 1002) {
            redirectUrl = '/admin/dashboard';
          } else if (roleId === 1000) {
            redirectUrl = '/manager/dashboard';
          } else if (roleId === 1001) {
            redirectUrl = '/client/dashboard';
          } else if (userData.username) {
            // Fallback to username check
            const username = userData.username.toLowerCase();
            if (username.includes('admin')) {
              redirectUrl = '/admin/dashboard';
            } else if (username.includes('manager')) {
              redirectUrl = '/manager/dashboard';
            } else if (username.includes('client')) {
              redirectUrl = '/client/dashboard';
            }
          }
          
          console.log("🧭 Production root redirect:", redirectUrl);
          
          // Store the destination
          sessionStorage.setItem('pendingRedirect', redirectUrl);
          
          // Perform the redirect using the most reliable method for production
          setTimeout(() => {
            try {
              window.location.href = redirectUrl;
            } catch (e) {
              console.error("Direct navigation failed:", e);
              window.location.replace(redirectUrl);
            }
          }, 50);
        } catch (error) {
          console.error("Error processing stored user data:", error);
        }
      } else if (pendingRedirect) {
        // If we have a pending redirect, use it
        console.log("Using stored pending redirect:", pendingRedirect);
        localStorage.removeItem('pendingRedirect');
        
        setTimeout(() => {
          try {
            window.location.href = pendingRedirect;
          } catch (e) {
            console.error("Pending redirect failed:", e);
            window.location.replace(pendingRedirect);
          }
        }, 50);
      }
    }
  }, [pathname]);
  
  // Standard application setup with Firebase initialization
  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseInit>
        <AuthProvider>
          <div className="font-sans text-dark bg-light">
            {/* Only show navbar on non-dashboard routes */}
            {!isDashboardRoute && <Navbar />}
            
            <Router />
            
            {/* Only show footer and chatbot on non-dashboard routes */}
            {!isDashboardRoute && <Footer />}
            {!isDashboardRoute && <Chatbot />}
            
            <Toaster />
          </div>
        </AuthProvider>
      </FirebaseInit>
    </QueryClientProvider>
  );
}

export default App;
