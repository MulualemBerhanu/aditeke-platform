import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize form
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/request-password-reset', {
        email: values.email,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process your request');
      }
      
      // Show success message
      setIsSuccess(true);
      form.reset();
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Button 
            variant="ghost" 
            className="flex items-center mb-2 -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => setLocation('/login')}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Login
          </Button>
          <CardTitle className="text-2xl font-bold">Recover your password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isSuccess ? (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto bg-green-100 text-green-800 rounded-full p-3 w-fit">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Check your email</h3>
              <p className="text-muted-foreground">
                If an account exists with this email, we've sent password reset instructions to <strong>{form.getValues().email}</strong>
              </p>
              <p className="text-sm text-muted-foreground mt-6">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your email address" 
                          {...field} 
                          type="email"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col items-center justify-center pt-0">
          <p className="text-sm text-muted-foreground">
            Remember your password? <a onClick={() => setLocation('/login')} className="text-primary hover:underline cursor-pointer">Sign in</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}