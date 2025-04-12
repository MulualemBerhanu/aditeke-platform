import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/components/auth/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BlogPost } from '@shared/schema';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  ChevronLeft,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  Loader2
} from 'lucide-react';

// Form schema for creating/editing blog posts
const blogPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  thumbnail: z.string().min(1, "Thumbnail URL is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.string().nullable().optional(),
  isPublished: z.boolean().default(true),
  authorId: z.number().positive()
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

export default function BlogManagement() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for managing dialogs
  const [showAddPost, setShowAddPost] = React.useState(false);
  const [postToEdit, setPostToEdit] = React.useState<BlogPost | null>(null);
  const [postToDelete, setPostToDelete] = React.useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = React.useState<string | 'all'>('all');
  
  // Form for creating a new blog post
  const newPostForm = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: '',
      content: '',
      thumbnail: '',
      category: '',
      tags: '',
      isPublished: true,
      authorId: user?.id || 1
    }
  });
  
  // Form for editing a blog post
  const editPostForm = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: '',
      content: '',
      thumbnail: '',
      category: '',
      tags: '',
      isPublished: true,
      authorId: user?.id || 1
    }
  });
  
  // Redirect if not logged in or not an admin
  React.useEffect(() => {
    if (!user) {
      setLocation('/login');
    } else if (user.roleId !== 1) { // Assuming 1 is Admin role ID
      // Redirect to appropriate dashboard based on role
      if (user.roleId === 2) setLocation('/manager/dashboard');
      else if (user.roleId === 3) setLocation('/client/dashboard');
      else setLocation('/');
    }
  }, [user, setLocation]);
  
  // Reset form when the dialog opens/closes
  React.useEffect(() => {
    if (showAddPost && user) {
      newPostForm.reset({
        title: '',
        content: '',
        thumbnail: '',
        category: '',
        tags: '',
        isPublished: true,
        authorId: user.id
      });
    }
  }, [showAddPost, newPostForm, user]);
  
  // Set initial values for edit form when a post is selected
  React.useEffect(() => {
    if (postToEdit) {
      editPostForm.reset({
        title: postToEdit.title,
        content: postToEdit.content,
        thumbnail: postToEdit.thumbnail,
        category: postToEdit.category,
        tags: postToEdit.tags,
        isPublished: postToEdit.isPublished,
        authorId: postToEdit.authorId
      });
    }
  }, [postToEdit, editPostForm]);
  
  // Fetch blog posts
  const { data: blogPosts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog', categoryFilter],
    queryFn: async () => {
      try {
        const url = categoryFilter !== 'all' 
          ? `/api/blog?category=${encodeURIComponent(categoryFilter)}`
          : '/api/blog';
        const response = await apiRequest('GET', url);
        return await response.json();
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        return [];
      }
    },
    enabled: !!user && user.roleId === 1,
  });
  
  // Extract unique categories from blog posts
  const categories = React.useMemo(() => {
    const uniqueCategories = new Set(blogPosts.map(post => post.category));
    return Array.from(uniqueCategories);
  }, [blogPosts]);
  
  // Create blog post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: BlogPostFormValues) => {
      const response = await apiRequest('POST', '/api/blog', postData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Blog Post Created',
        description: 'New blog post has been created successfully',
      });
      setShowAddPost(false);
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create blog post',
        variant: 'destructive',
      });
    },
  });
  
  // Update blog post mutation
  const updatePostMutation = useMutation({
    mutationFn: async ({ postId, postData }: { postId: number; postData: BlogPostFormValues }) => {
      const response = await apiRequest('PATCH', `/api/blog/${postId}`, postData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Blog Post Updated',
        description: 'Blog post has been updated successfully',
      });
      setPostToEdit(null);
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update blog post',
        variant: 'destructive',
      });
    },
  });
  
  // Delete blog post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest('DELETE', `/api/blog/${postId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Blog Post Deleted',
        description: 'Blog post has been deleted successfully',
      });
      setPostToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete blog post',
        variant: 'destructive',
      });
    },
  });
  
  // Toggle blog post published status
  const togglePublishedStatusMutation = useMutation({
    mutationFn: async ({ postId, isPublished }: { postId: number; isPublished: boolean }) => {
      const response = await apiRequest('PATCH', `/api/blog/${postId}`, { isPublished });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Status Updated',
        description: 'Blog post status has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update blog post status',
        variant: 'destructive',
      });
    },
  });
  
  // Format date to readable string
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (!user || user.roleId !== 1) {
    return <div className="flex justify-center items-center min-h-screen">Redirecting...</div>;
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          className="mr-2" 
          onClick={() => setLocation('/admin/content-management')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Content Management
        </Button>
        <h1 className="text-3xl font-bold">Blog Management</h1>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <Card className="w-full md:w-64">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div 
              className={`px-4 py-2 rounded-md cursor-pointer ${
                categoryFilter === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
              onClick={() => setCategoryFilter('all')}
            >
              All Posts
            </div>
            {categories.map((category, index) => (
              <div 
                key={index}
                className={`px-4 py-2 rounded-md cursor-pointer ${
                  categoryFilter === category ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                onClick={() => setCategoryFilter(category)}
              >
                {category}
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setShowAddPost(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Post
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Blog Posts</CardTitle>
              <CardDescription>
                {categoryFilter === 'all' 
                  ? 'All blog posts' 
                  : `Posts in category: ${categoryFilter}`}
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddPost(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Post
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogPosts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                          No blog posts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      blogPosts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">{post.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{post.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                              {formatDate(post.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Switch 
                                checked={post.isPublished}
                                onCheckedChange={(checked) => 
                                  togglePublishedStatusMutation.mutate({ 
                                    postId: post.id, 
                                    isPublished: checked 
                                  })
                                }
                                className="mr-2"
                              />
                              {post.isPublished ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                  Published
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                                  Draft
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => window.open(`/blog/${post.id}`, '_blank')}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setPostToEdit(post)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500"
                                onClick={() => setPostToDelete(post.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add Blog Post Dialog */}
      <Dialog open={showAddPost} onOpenChange={setShowAddPost}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add New Blog Post</DialogTitle>
            <DialogDescription>
              Create a new blog post that will be published on the website.
            </DialogDescription>
          </DialogHeader>
          <Form {...newPostForm}>
            <form onSubmit={newPostForm.handleSubmit((data) => createPostMutation.mutate(data))} className="space-y-6">
              <FormField
                control={newPostForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Title</FormLabel>
                    <FormControl>
                      <Input placeholder="How to Implement AI in Your Business" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={newPostForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.length > 0 ? (
                            categories.map((category, index) => (
                              <SelectItem key={index} value={category}>
                                {category}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="Technology">Technology</SelectItem>
                          )}
                          <SelectItem value="AI">AI</SelectItem>
                          <SelectItem value="Development">Development</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="News">News</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select a category or type to create a new one
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={newPostForm.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="AI, Business, Technology" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated tags for SEO and categorization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={newPostForm.control}
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the URL for the blog post thumbnail image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newPostForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write your blog post content here..." 
                        className="min-h-[200px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      This will be displayed as the main content of your blog post
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newPostForm.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Publication Status</FormLabel>
                      <FormDescription>
                        Publish this post immediately or save as draft
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={createPostMutation.isPending}>
                  {createPostMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : 'Create Post'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Blog Post Dialog */}
      <Dialog open={!!postToEdit} onOpenChange={(open) => !open && setPostToEdit(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Update blog post information and content
            </DialogDescription>
          </DialogHeader>
          {postToEdit && (
            <Form {...editPostForm}>
              <form 
                onSubmit={editPostForm.handleSubmit((data) => {
                  if (postToEdit) {
                    updatePostMutation.mutate({
                      postId: postToEdit.id,
                      postData: data
                    });
                  }
                })} 
                className="space-y-6"
              >
                <FormField
                  control={editPostForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={editPostForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category, index) => (
                              <SelectItem key={index} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                            <SelectItem value="AI">AI</SelectItem>
                            <SelectItem value="Development">Development</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editPostForm.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormDescription>
                          Comma-separated tags for SEO and categorization
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={editPostForm.control}
                  name="thumbnail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the URL for the blog post thumbnail image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editPostForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="min-h-[200px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editPostForm.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Publication Status</FormLabel>
                        <FormDescription>
                          Publish this post immediately or save as draft
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={updatePostMutation.isPending}>
                    {updatePostMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : 'Update Post'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive"
              disabled={deletePostMutation.isPending}
              onClick={() => {
                if (postToDelete) {
                  deletePostMutation.mutate(postToDelete);
                }
              }}
            >
              {deletePostMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : 'Delete Post'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}