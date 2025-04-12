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
import AdminDashboard from "./pages/admin/dashboard";
import UserManagement from "./pages/admin/user-management";
import ManagerDashboard from "./pages/manager/dashboard";
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
      
      {/* Role-based dashboards */}
      <Route path="/admin/dashboard">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/users">
        <ProtectedRoute>
          <UserManagement />
        </ProtectedRoute>
      </Route>
      
      <Route path="/manager/dashboard">
        <ProtectedRoute>
          <ManagerDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/client/dashboard">
        <ProtectedRoute>
          <ClientDashboard />
        </ProtectedRoute>
      </Route>
      
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
