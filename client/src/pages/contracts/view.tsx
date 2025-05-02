import React from 'react';
import { useParams, useLocation } from 'wouter';
import ClientLayout from '@/components/client/ClientLayout';
import { useAuth } from '@/components/auth/AuthContext';
import ContractViewer from '@/components/client/ContractViewer';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft } from 'lucide-react';

export default function ContractViewPage() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  
  // Convert id to number
  const contractId = id ? parseInt(id) : undefined;
  
  const handleBack = () => {
    navigate('/client/dashboard');
  };
  
  if (!contractId) {
    return (
      <ClientLayout>
        <div className="container mx-auto py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-semibold mb-2">Contract Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The contract you're looking for doesn't exist or couldn't be loaded.
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </ClientLayout>
    );
  }
  
  return (
    <ClientLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Contract Details</h1>
        </div>
        
        <ContractViewer contractId={contractId} onBack={handleBack} />
      </div>
    </ClientLayout>
  );
}