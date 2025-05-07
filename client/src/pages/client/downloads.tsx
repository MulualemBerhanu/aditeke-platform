import React, { useState, useEffect } from 'react';
import ClientLayout from '@/components/client/ClientLayout';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Download,
  FileText,
  File,
  Search,
  Calendar,
  Box,
  BarChart,
  Package,
  HardDrive,
  Laptop,
  Smartphone,
  LayoutGrid,
  LayoutList
} from 'lucide-react';
import { formatDistance, format } from 'date-fns';

// Interface for download data
interface DownloadItem {
  id: number;
  title: string;
  description: string;
  fileSize: number;
  fileType: string;
  version: string;
  category: string;
  releaseDate: string;
  downloadUrl: string;
  platform: 'all' | 'windows' | 'mac' | 'linux' | 'ios' | 'android';
}

const ClientDownloads = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientId, setClientId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  // Sample downloadable files for demo purposes
  const demoDownloads: DownloadItem[] = [
    {
      id: 1,
      title: 'AdiTeke CRM User Manual',
      description: 'Comprehensive guide on how to use the AdiTeke CRM system efficiently',
      fileSize: 3_500_000,
      fileType: 'application/pdf',
      version: '1.2.0',
      category: 'Documentation',
      releaseDate: '2025-04-15',
      downloadUrl: '/downloads/aditeke-crm-manual.pdf',
      platform: 'all'
    },
    {
      id: 2,
      title: 'Project Management Dashboard Setup',
      description: 'Installation and configuration instructions for the project management dashboard',
      fileSize: 2_100_000,
      fileType: 'application/pdf',
      version: '1.0.1',
      category: 'Documentation',
      releaseDate: '2025-04-02',
      downloadUrl: '/downloads/pm-dashboard-setup.pdf',
      platform: 'all'
    },
    {
      id: 3,
      title: 'AdiTeke Mobile App',
      description: 'Mobile application for accessing your projects on the go',
      fileSize: 45_000_000,
      fileType: 'application/zip',
      version: '2.1.3',
      category: 'Software',
      releaseDate: '2025-05-01',
      downloadUrl: '/downloads/aditeke-mobile.zip',
      platform: 'android'
    },
    {
      id: 4,
      title: 'Database Structure Overview',
      description: 'Visual guide to the structure of your project database',
      fileSize: 1_500_000,
      fileType: 'application/pdf',
      version: '1.0.0',
      category: 'Technical',
      releaseDate: '2025-04-10',
      downloadUrl: '/downloads/database-overview.pdf',
      platform: 'all'
    },
    {
      id: 5,
      title: 'Desktop Client Installer',
      description: 'Windows desktop application for enhanced project management',
      fileSize: 85_000_000,
      fileType: 'application/exe',
      version: '3.0.2',
      category: 'Software',
      releaseDate: '2025-04-28',
      downloadUrl: '/downloads/desktop-client.exe',
      platform: 'windows'
    }
  ];

  // Fetch downloads
  const { data: downloads, isLoading, error } = useQuery({
    queryKey: ['/api/client-downloads', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      console.log(`Fetching downloads for client ID: ${clientId}`);
      
      try {
        // Get the authentication token
        const token = localStorage.getItem('token');
        
        // This endpoint is a placeholder - it would need to be implemented on the backend
        // For now, return demo downloads after a small delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        return demoDownloads;
      } catch (err) {
        console.error('Error fetching downloads:', err);
        throw new Error('Failed to fetch downloads');
      }
    },
    enabled: !!clientId,
  });

  const handleDownload = (downloadItem: DownloadItem) => {
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
    
    // Show download starting toast with proper file type indicator
    toast({
      title: 'Download Started',
      description: `Downloading ${downloadItem.title} (${formatFileSize(downloadItem.fileSize)})`,
      variant: 'default',
    });
    
    // Simulate download process
    setTimeout(() => {
      toast({
        title: 'Download Complete',
        description: `${downloadItem.title} has been downloaded successfully.`,
      });
    }, 2000);
    
    // In a real implementation, we would initialize the download
    // For demo purposes, we'll just simulate it
    console.log(`Download initiated for: ${downloadItem.title}`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  // Group downloads by category
  const groupedDownloads = downloads?.reduce((acc: Record<string, DownloadItem[]>, item: DownloadItem) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Filter downloads based on search query
  const filteredDownloads = downloads ? downloads.filter((item: DownloadItem) => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'windows':
        return <Laptop className="h-4 w-4" />;
      case 'mac':
        return <Laptop className="h-4 w-4" />;
      case 'linux':
        return <HardDrive className="h-4 w-4" />;
      case 'ios':
      case 'android':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Box className="h-4 w-4" />;
    }
  };

  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load downloads. Please try again later.',
      variant: 'destructive',
    });
  }

  return (
    <ClientLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Downloads</h1>
            <p className="text-slate-500">Access software, documents, and resources for your projects</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search downloads..." 
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-r-none ${viewMode === 'grid' ? 'bg-slate-100' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-l-none ${viewMode === 'list' ? 'bg-slate-100' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
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
                  {[...Array(4)].map((_, i) => (
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
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Downloads</TabsTrigger>
              {groupedDownloads && Object.keys(groupedDownloads).map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category} 
                  <Badge className="ml-2 bg-slate-200 text-slate-700 hover:bg-slate-200">{groupedDownloads[category].length}</Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>All Available Downloads</CardTitle>
                  <CardDescription>
                    Software, documents, and resources for your projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredDownloads?.length > 0 ? (
                    viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDownloads.map((item: DownloadItem) => (
                          <div key={item.id} className="border border-slate-200 rounded-md hover:border-indigo-200 hover:shadow-sm transition-all">
                            <div className="p-4">
                              <div className="flex items-start mb-3">
                                <div className="bg-indigo-100 p-2 rounded mr-3 flex-shrink-0">
                                  {item.fileType.includes('pdf') ? (
                                    <FileText className="h-5 w-5 text-indigo-600" />
                                  ) : (
                                    <Package className="h-5 w-5 text-indigo-600" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium text-base">{item.title}</h4>
                                  <div className="flex items-center text-xs text-slate-500 mt-1">
                                    <Badge variant="outline" className="mr-2 bg-slate-50">
                                      {item.category}
                                    </Badge>
                                    <span className="flex items-center">
                                      <span className="mr-1">{getPlatformIcon(item.platform)}</span>
                                      <span>{item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 line-clamp-2 mb-3">{item.description}</p>
                              <div className="flex justify-between items-center text-xs text-slate-500">
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>{format(new Date(item.releaseDate), 'MMM d, yyyy')}</span>
                                </div>
                                <span>{formatFileSize(item.fileSize)}</span>
                              </div>
                              <div className="mt-4 pt-3 border-t border-slate-100">
                                <Button
                                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                  onClick={() => handleDownload(item)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredDownloads.map((item: DownloadItem) => (
                          <div key={item.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-md hover:border-indigo-200 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start flex-1 min-w-0">
                              <div className="bg-indigo-100 p-2 rounded mr-3 flex-shrink-0">
                                {item.fileType.includes('pdf') ? (
                                  <FileText className="h-5 w-5 text-indigo-600" />
                                ) : (
                                  <Package className="h-5 w-5 text-indigo-600" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-medium text-base">{item.title}</h4>
                                <p className="text-sm text-slate-600 line-clamp-1">{item.description}</p>
                                <div className="flex items-center text-xs text-slate-500 mt-1 flex-wrap gap-2">
                                  <Badge variant="outline" className="bg-slate-50">
                                    {item.category}
                                  </Badge>
                                  <span className="flex items-center">
                                    <span className="mr-1">{getPlatformIcon(item.platform)}</span>
                                    <span>{item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}</span>
                                  </span>
                                  <span className="flex items-center">
                                    <BarChart className="h-3 w-3 mr-1" />
                                    <span>v{item.version}</span>
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span>{format(new Date(item.releaseDate), 'MMM d, yyyy')}</span>
                                  </span>
                                  <span>{formatFileSize(item.fileSize)}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              className="bg-indigo-600 hover:bg-indigo-700 text-white ml-4 flex-shrink-0"
                              onClick={() => handleDownload(item)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12">
                      <File className="h-12 w-12 mx-auto text-slate-300" />
                      {searchQuery ? (
                        <>
                          <h3 className="text-xl font-semibold mt-4 mb-2">No Matching Downloads</h3>
                          <p className="text-slate-500 max-w-md mx-auto">
                            No downloads found matching "{searchQuery}". Try different keywords or browse all categories.
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-xl font-semibold mt-4 mb-2">No Downloads Available</h3>
                          <p className="text-slate-500 max-w-md mx-auto">
                            No downloads are currently available for your projects. Please check back later or contact your project manager.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {groupedDownloads && Object.keys(groupedDownloads).map((category) => (
              <TabsContent key={category} value={category}>
                <Card>
                  <CardHeader>
                    <CardTitle>{category} Downloads</CardTitle>
                    <CardDescription>
                      {category === 'Software' && 'Applications and utilities for your projects'}
                      {category === 'Documentation' && 'Guides, manuals, and reference materials'}
                      {category === 'Resources' && 'Additional resources and assets'}
                      {category !== 'Software' && category !== 'Documentation' && category !== 'Resources' && 
                        `${category}-related downloads for your projects`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groupedDownloads[category].map((item: DownloadItem) => (
                          <div key={item.id} className="border border-slate-200 rounded-md hover:border-indigo-200 hover:shadow-sm transition-all">
                            <div className="p-4">
                              <div className="flex items-start mb-3">
                                <div className="bg-indigo-100 p-2 rounded mr-3 flex-shrink-0">
                                  {item.fileType.includes('pdf') ? (
                                    <FileText className="h-5 w-5 text-indigo-600" />
                                  ) : (
                                    <Package className="h-5 w-5 text-indigo-600" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-medium text-base">{item.title}</h4>
                                  <div className="flex items-center text-xs text-slate-500 mt-1">
                                    <span className="flex items-center mr-2">
                                      <span className="mr-1">{getPlatformIcon(item.platform)}</span>
                                      <span>{item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}</span>
                                    </span>
                                    <span className="flex items-center">
                                      <BarChart className="h-3 w-3 mr-1" />
                                      <span>v{item.version}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-slate-600 line-clamp-2 mb-3">{item.description}</p>
                              <div className="flex justify-between items-center text-xs text-slate-500">
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>{format(new Date(item.releaseDate), 'MMM d, yyyy')}</span>
                                </div>
                                <span>{formatFileSize(item.fileSize)}</span>
                              </div>
                              <div className="mt-4 pt-3 border-t border-slate-100">
                                <Button
                                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                  onClick={() => handleDownload(item)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {groupedDownloads[category].map((item: DownloadItem) => (
                          <div key={item.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-md hover:border-indigo-200 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start flex-1 min-w-0">
                              <div className="bg-indigo-100 p-2 rounded mr-3 flex-shrink-0">
                                {item.fileType.includes('pdf') ? (
                                  <FileText className="h-5 w-5 text-indigo-600" />
                                ) : (
                                  <Package className="h-5 w-5 text-indigo-600" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-medium text-base">{item.title}</h4>
                                <p className="text-sm text-slate-600 line-clamp-1">{item.description}</p>
                                <div className="flex items-center text-xs text-slate-500 mt-1 flex-wrap gap-2">
                                  <span className="flex items-center">
                                    <span className="mr-1">{getPlatformIcon(item.platform)}</span>
                                    <span>{item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}</span>
                                  </span>
                                  <span className="flex items-center">
                                    <BarChart className="h-3 w-3 mr-1" />
                                    <span>v{item.version}</span>
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span>{format(new Date(item.releaseDate), 'MMM d, yyyy')}</span>
                                  </span>
                                  <span>{formatFileSize(item.fileSize)}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              className="bg-indigo-600 hover:bg-indigo-700 text-white ml-4 flex-shrink-0"
                              onClick={() => handleDownload(item)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </ClientLayout>
  );
};

export default ClientDownloads;