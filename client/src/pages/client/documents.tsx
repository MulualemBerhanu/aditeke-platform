import React, { useState, useEffect } from 'react';
import ClientLayout from '@/components/client/ClientLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Upload, Trash2, FilePlus, File, AlertTriangle } from 'lucide-react';
import { formatDistance } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Interface for document data
interface Document {
  id: number;
  clientId: number;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  category: string;
}

const ClientDocuments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [clientId, setClientId] = useState<number | null>(null);
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [documentDetails, setDocumentDetails] = useState({
    title: '',
    description: '',
    category: 'Contract'
  });

  // Set clientId from user object when user data is available
  useEffect(() => {
    if (user) {
      const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
      setClientId(userId);
    } else {
      // Try to get from localStorage as fallback
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const userId = typeof parsedUser.id === 'string' ? parseInt(parsedUser.id) : parsedUser.id;
          setClientId(userId);
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    }
  }, [user]);

  // Fetch client documents
  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['/api/client-documents', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      console.log(`Fetching documents for client ID: ${clientId}`);
      
      // Get the authentication token
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/client-documents/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      console.log('Documents fetched:', data);
      return data;
    },
    enabled: !!clientId,
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/client-documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload document');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-documents', clientId] });
      setUploadDialogOpen(false);
      setFileUpload(null);
      setDocumentDetails({
        title: '',
        description: '',
        category: 'Contract'
      });
      toast({
        title: 'Document Uploaded',
        description: 'Your document has been uploaded successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/client-documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/client-documents', clientId] });
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      toast({
        title: 'Document Deleted',
        description: 'The document has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete document. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileUpload(file);
      
      // Auto-fill title from filename (without extension)
      const fileName = file.name.split('.').slice(0, -1).join('.');
      setDocumentDetails({
        ...documentDetails,
        title: fileName || file.name
      });
    }
  };

  const handleUploadDocument = () => {
    if (!fileUpload) {
      toast({
        title: 'Warning',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }
    
    if (!documentDetails.title.trim()) {
      toast({
        title: 'Warning',
        description: 'Please enter a document title',
        variant: 'destructive',
      });
      return;
    }
    
    if (!clientId) {
      toast({
        title: 'Error',
        description: 'Client ID not available',
        variant: 'destructive',
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('file', fileUpload);
    formData.append('title', documentDetails.title);
    formData.append('description', documentDetails.description);
    formData.append('category', documentDetails.category);
    formData.append('clientId', clientId.toString());
    
    uploadDocumentMutation.mutate(formData);
  };

  const handleDownloadDocument = (document: Document) => {
    if (!clientId) {
      toast({
        title: 'Error',
        description: 'Client ID not available',
        variant: 'destructive',
      });
      return;
    }
    
    // Get the authentication token
    const token = localStorage.getItem('token');
    
    // Open download in new tab
    window.open(`/api/client-documents/download/${document.id}?token=${token}`, '_blank');
  };

  const handleDeleteClick = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (documentToDelete) {
      deleteDocumentMutation.mutate(documentToDelete.id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Group documents by category
  const groupedDocuments = documents?.reduce((acc: Record<string, Document[]>, doc: Document) => {
    const category = doc.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(doc);
    return acc;
  }, {});

  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load documents. Please try again later.',
      variant: 'destructive',
    });
  }

  return (
    <ClientLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Documents</h1>
            <p className="text-slate-500">View and manage your project documents and files</p>
          </div>
          <div className="flex items-start">
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Upload a document to share with your project team
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="file" className="block mb-2">Select File</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    {fileUpload && (
                      <p className="text-xs text-slate-500 mt-1">
                        {fileUpload.name} ({formatFileSize(fileUpload.size)})
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="title">Document Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter document title"
                      value={documentDetails.title}
                      onChange={(e) => setDocumentDetails({...documentDetails, title: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="Brief description of this document"
                      value={documentDetails.description}
                      onChange={(e) => setDocumentDetails({...documentDetails, description: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={documentDetails.category}
                      onChange={(e) => setDocumentDetails({...documentDetails, category: e.target.value})}
                    >
                      <option value="Contract">Contract</option>
                      <option value="Invoice">Invoice</option>
                      <option value="Report">Report</option>
                      <option value="Specification">Specification</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleUploadDocument} 
                    disabled={uploadDocumentMutation.isPending || !fileUpload}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          // Loading state with skeletons
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-24 mb-2" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4 p-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Skeleton className="h-8 w-8 rounded mr-3" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                      </div>
                      <Skeleton className="h-3 w-full mt-2" />
                      <div className="flex justify-between mt-3">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : documents && documents.length > 0 ? (
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Documents</TabsTrigger>
              {Object.keys(groupedDocuments || {}).map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category} 
                  <Badge className="ml-2 bg-slate-200 text-slate-700 hover:bg-slate-200">{groupedDocuments[category].length}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>All Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents.map((doc: Document) => (
                      <div key={doc.id} className="p-4 border border-slate-200 rounded-md hover:border-indigo-200 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <div className="bg-indigo-100 p-2 rounded mr-3">
                              <FileText className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-base">{doc.title}</h4>
                              {doc.description && (
                                <p className="text-sm text-slate-500 mt-1">{doc.description}</p>
                              )}
                              <div className="flex items-center text-xs text-slate-500 mt-2">
                                <Badge variant="outline" className="mr-2 bg-slate-50">
                                  {doc.category || 'Other'}
                                </Badge>
                                <span className="mr-2">{doc.fileName}</span>
                                <span className="mr-2">•</span>
                                <span>{formatFileSize(doc.fileSize)}</span>
                                <span className="mx-2">•</span>
                                <span>
                                  Uploaded {formatDistance(new Date(doc.uploadedAt), new Date(), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-indigo-600 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
                              onClick={() => handleDownloadDocument(doc)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50"
                              onClick={() => handleDeleteClick(doc)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {Object.keys(groupedDocuments || {}).map((category) => (
              <TabsContent key={category} value={category}>
                <Card>
                  <CardHeader>
                    <CardTitle>{category} Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {groupedDocuments[category].map((doc: Document) => (
                        <div key={doc.id} className="p-4 border border-slate-200 rounded-md hover:border-indigo-200 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <div className="bg-indigo-100 p-2 rounded mr-3">
                                <FileText className="h-6 w-6 text-indigo-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-base">{doc.title}</h4>
                                {doc.description && (
                                  <p className="text-sm text-slate-500 mt-1">{doc.description}</p>
                                )}
                                <div className="flex items-center text-xs text-slate-500 mt-2">
                                  <span className="mr-2">{doc.fileName}</span>
                                  <span className="mr-2">•</span>
                                  <span>{formatFileSize(doc.fileSize)}</span>
                                  <span className="mx-2">•</span>
                                  <span>
                                    Uploaded {formatDistance(new Date(doc.uploadedAt), new Date(), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-indigo-600 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
                                onClick={() => handleDownloadDocument(doc)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50"
                                onClick={() => handleDeleteClick(doc)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <File className="h-12 w-12 mx-auto text-slate-300" />
                <h3 className="text-xl font-semibold mt-4 mb-2">No Documents Found</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                  You don't have any documents yet. Upload a document to get started.
                </p>
                <Button
                  onClick={() => setUploadDialogOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <FilePlus className="h-4 w-4 mr-2" />
                  Upload Your First Document
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p>This action cannot be undone. This will permanently delete the document:</p>
                  <p className="font-medium text-indigo-600 mt-1">{documentToDelete?.title}</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteDocumentMutation.isPending ? 'Deleting...' : 'Delete Document'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ClientLayout>
  );
};

export default ClientDocuments;