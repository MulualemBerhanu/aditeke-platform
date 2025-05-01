import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Progress } from '@/components/ui/progress';

// Form validation schema with password complexity requirements
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .refine(val => /[A-Z]/.test(val), 'Password must contain at least one uppercase letter')
    .refine(val => /[a-z]/.test(val), 'Password must contain at least one lowercase letter')
    .refine(val => /[0-9]/.test(val), 'Password must contain at least one number')
    .refine(val => /[^A-Za-z0-9]/.test(val), 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  
  // Get token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    
    if (!urlToken) {
      toast({
        title: 'Invalid Request',
        description: 'No reset token was provided. Please request a new password reset link.',
        variant: 'destructive',
      });
      setLocation('/forgot-password');
      return;
    }
    
    setToken(urlToken);
  }, [setLocation]);

  // Initialize form
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Watch password to calculate strength
  useEffect(() => {
    const subscription = form.watch((value) => {
      const password = value.password as string || '';
      calculatePasswordStrength(password);
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Calculate password strength
  const calculatePasswordStrength = (password: string): void => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 20;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength += 20; // Uppercase
    if (/[a-z]/.test(password)) strength += 20; // Lowercase
    if (/[0-9]/.test(password)) strength += 20; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) strength += 20; // Special characters
    
    setPasswordStrength(strength);
  };

  // Get strength color
  const getStrengthColor = (strength: number): string => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Submit form
  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/api/auth/reset-password', {
        token,
        password: values.password
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reset password');
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

  if (!token && !isSuccess) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {isSuccess ? 'Password Reset Complete' : 'Reset Your Password'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSuccess 
              ? 'Your password has been successfully reset'
              : 'Create a new strong password for your account'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isSuccess ? (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto bg-green-100 text-green-800 rounded-full p-3 w-fit">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Password Updated</h3>
              <p className="text-muted-foreground">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => setLocation('/login')}
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your new password" 
                          {...field} 
                          type="password"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      
                      {/* Password strength meter */}
                      <div className="space-y-1 mt-1">
                        <Progress
                          value={passwordStrength}
                          className={`h-1 w-full ${getStrengthColor(passwordStrength)}`}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Weak</span>
                          <span>Strong</span>
                        </div>
                      </div>
                      
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Confirm your new password" 
                          {...field} 
                          type="password"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-1 text-sm text-muted-foreground mt-2">
                  <p>Your password must include:</p>
                  <ul className="list-disc list-inside space-y-1 pl-2">
                    <li>At least 8 characters</li>
                    <li>Uppercase and lowercase letters</li>
                    <li>At least one number</li>
                    <li>At least one special character</li>
                  </ul>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        
        {!isSuccess && (
          <CardFooter className="flex justify-center">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/forgot-password')}
              className="flex items-center text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forgot Password
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}