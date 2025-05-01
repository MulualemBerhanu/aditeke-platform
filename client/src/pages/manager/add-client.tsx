import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientForm } from '@/components/forms/ClientForm';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function AddClientPage() {
  const [, navigate] = useLocation();

  return (
    <>
      <DashboardHeader heading="Client Management" text="Add a new client to the system" />
      <DashboardShell>
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
      </DashboardShell>
    </>
  );
}