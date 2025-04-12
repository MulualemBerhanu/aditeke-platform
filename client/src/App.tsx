import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Chatbot from "./components/layout/Chatbot";
import Home from "./pages/home";
import About from "./pages/about";
import Services from "./pages/services";
import Portfolio from "./pages/portfolio";
import Careers from "./pages/careers";
import Blog from "./pages/blog";
import Contact from "./pages/contact";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";

// Admin pages
import AdminDashboard from "./pages/admin/dashboard";
import UserManagement from "./pages/admin/user-management";
import AdminContentManagement from "./pages/admin/content-management";
import BlogManagement from "./pages/admin/content-management/blog";
import ServiceManagement from "./pages/admin/content-management/services";
import TestimonialManagement from "./pages/admin/content-management/testimonials";
import ProjectManagement from "./pages/admin/project-management";
import CreateProject from "./pages/admin/project-management/create";
import AdminSettings from "./pages/admin/settings";

// Manager pages
import ManagerDashboard from "./pages/manager/dashboard";

// Client pages
import ClientDashboard from "./pages/client/dashboard";

import { AuthProvider } from "./components/auth/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/services" component={Services} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/careers" component={Careers} />
      <Route path="/blog" component={Blog} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      
      {/* Legacy dashboard - will redirect to the appropriate role-based dashboard */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Role-based dashboards - direct components instead of protected routes for testing */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/user-management" component={UserManagement} />
      <Route path="/admin/content-management" component={AdminContentManagement} />
      <Route path="/admin/content-management/blog" component={BlogManagement} />
      <Route path="/admin/content-management/services" component={ServiceManagement} />
      <Route path="/admin/content-management/testimonials" component={TestimonialManagement} />
      <Route path="/admin/project-management" component={ProjectManagement} />
      <Route path="/admin/project-management/create" component={CreateProject} />
      <Route path="/admin/settings" component={AdminSettings} />
      
      {/* Manager Routes */}
      <Route path="/manager/dashboard" component={ManagerDashboard} />
      
      {/* Client Routes */}
      <Route path="/client/dashboard" component={ClientDashboard} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="font-sans text-dark bg-light">
          <Navbar />
          <Router />
          <Footer />
          <Chatbot />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
