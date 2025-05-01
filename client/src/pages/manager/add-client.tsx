import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientForm } from '@/components/forms/ClientForm';
import { useAuth } from '@/components/auth/AuthContext';

export default function AddClientPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Log the user data and role to help debug
  console.log("🔐 User in add-client page:", user?.username, "Role ID:", user?.roleId);
  
  // If no user or not the right role, redirect to login
  if (!user) {
    console.log("⚠️ No user found, redirecting to login");
    navigate("/login");
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-start mb-8">
        <h1 className="text-3xl font-bold mb-2">Client Management</h1>
        <p className="text-gray-500">Add a new client to the system</p>
      </div>
      
      <Button 
        variant="outline" 
        className="mb-6"
        onClick={() => navigate("/manager/dashboard")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Add New Client</CardTitle>
          <CardDescription>
            Create a new client account with contact information and access settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm 
            onSuccess={() => {
              // Force a refresh of the dashboard when returning to it
              localStorage.setItem('forceRefresh', 'true');
              navigate("/manager/dashboard");
            }}
            onCancel={() => navigate("/manager/dashboard")}
          />
        </CardContent>
      </Card>
    </div>
  );
}