import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ClipboardSignature, Download, FileText, ArrowLeft, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ClientContract } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';

interface ContractViewerProps {
  contractId: number;
  onBack?: () => void;
}

const formatDate = (dateInput: any) => {
  if (!dateInput) return 'N/A';
  
  if (dateInput && typeof dateInput === 'object' && '_seconds' in dateInput) {
    const date = new Date(dateInput._seconds * 1000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  // For normal Date objects or ISO strings
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function ContractViewer({ contractId, onBack }: ContractViewerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [signature, setSignature] = useState('');
  const [showSignDialog, setShowSignDialog] = useState(false);
  
  // Fetch contract details
  const { data: contract, isLoading, error } = useQuery({
    queryKey: [`/api/contracts/${contractId}`],
    queryFn: async () => {
      const res = await fetch(`/api/contracts/${contractId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch contract');
      }
      return res.json();
    }
  });
  
  // Sign contract mutation
  const signMutation = useMutation({
    mutationFn: async ({ signature }: { signature: string }) => {
      // Get the CSRF token from cookies if available
      let csrfToken = null;
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrf_token') {
          csrfToken = decodeURIComponent(value);
          break;
        }
      }
      
      console.log('CSRF token for contract signing:', csrfToken ? 'Found' : 'Not found');
      
      const res = await fetch(`/api/contracts/${contractId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
        },
        body: JSON.stringify({ 
          signature, 
          signedById: user?.id
        }),
        credentials: 'include'
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to sign contract');
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Contract Signed',
        description: 'The contract has been successfully signed.',
        variant: 'default',
      });
      setShowSignDialog(false);
      
      // Invalidate contract query to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/contracts/${contractId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign contract',
        variant: 'destructive',
      });
    }
  });
  
  const handleSignContract = () => {
    if (!signature.trim()) {
      toast({
        title: 'Missing Signature',
        description: 'Please enter your signature to continue',
        variant: 'destructive',
      });
      return;
    }
    
    signMutation.mutate({ signature });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (error || !contract) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Contract Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested contract could not be loaded or doesn't exist.
            </p>
            {onBack && (
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <CardTitle>{contract.title}</CardTitle>
            <CardDescription>
              Created on {formatDate(contract.createdAt)}
              {contract.version && ` • Version ${contract.version}`}
            </CardDescription>
          </div>
          <Badge className={
            contract.status === 'signed' ? 'bg-green-500' : 
            contract.status === 'pending' ? 'bg-amber-500' :
            contract.status === 'rejected' ? 'bg-red-500' :
            'bg-blue-500'
          }>
            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="details">
          <TabsList className="w-full rounded-none px-6 pt-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Contract Summary</h3>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div>
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <p className="font-medium">{contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Created Date</Label>
                    <p className="font-medium">{formatDate(contract.createdAt)}</p>
                  </div>
                  {contract.signedAt && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Signed Date</Label>
                      <p className="font-medium">{formatDate(contract.signedAt)}</p>
                    </div>
                  )}
                  {contract.signatureData && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Signature</Label>
                      <p className="font-medium italic">{contract.signatureData}</p>
                    </div>
                  )}
                  {contract.notes && (
                    <div className="col-span-2">
                      <Label className="text-sm text-muted-foreground">Notes</Label>
                      <p className="font-medium">{contract.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="document" className="p-6">
            <div className="border rounded-md p-4 max-h-[500px] overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: contract.content }} />
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-primary/10 p-1.5 rounded-full mr-4">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Contract Created</p>
                  <p className="text-sm text-muted-foreground">{formatDate(contract.createdAt)}</p>
                </div>
              </div>
              
              {contract.signedAt && (
                <div className="flex items-start">
                  <div className="bg-green-500/10 p-1.5 rounded-full mr-4">
                    <ClipboardSignature className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Contract Signed</p>
                    <p className="text-sm text-muted-foreground">{formatDate(contract.signedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t p-6 flex flex-wrap gap-3 justify-between">
        <div>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => {
            const token = localStorage.getItem('token');
            window.open(`/api/contracts/${contractId}/pdf?token=${token}`, '_blank');
          }}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          
          {contract.status === 'pending' && (
            <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
              <DialogTrigger asChild>
                <Button>
                  <ClipboardSignature className="mr-2 h-4 w-4" />
                  Sign Contract
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sign Contract</DialogTitle>
                  <DialogDescription>
                    Please review the contract carefully before signing. Your signature indicates that you agree to all terms and conditions.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="signature">Your Signature</Label>
                    <Textarea
                      id="signature"
                      placeholder="Type your full legal name to sign"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      By typing your name above, you agree that this electronic signature is as legally binding as a physical signature.
                    </p>
                  </div>
                </div>
                
                <DialogFooter className="flex space-x-2 justify-end">
                  <Button variant="outline" onClick={() => setShowSignDialog(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSignContract}
                    disabled={signMutation.isPending}
                  >
                    {signMutation.isPending ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Sign Contract
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}