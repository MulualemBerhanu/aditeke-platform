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
import { ArrowLeft, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
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
  const [token, setToken] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Initialize form
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Extract token from URL on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get('token');
    
    if (!tokenParam) {
      setIsVerifying(false);
      setIsTokenValid(false);
      return;
    }
    
    setToken(tokenParam);
    
    // Verify token validity
    const verifyToken = async () => {
      try {
        const response = await apiRequest('GET', `/api/auth/verify-reset-token?token=${tokenParam}`);
        
        if (response.ok) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyToken();
  }, []);

  // Watch password to calculate strength
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'password' || name === 'all') {
        const password = value.password as string || '';
        calculatePasswordStrength(password);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

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
        password: values.password,
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

  // Rendering logic for different states
  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Verifying your request</CardTitle>
            <CardDescription>
              Please wait while we verify your password reset link
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-center text-muted-foreground">This may take a moment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-red-600">Invalid or Expired Link</CardTitle>
            <CardDescription>
              The password reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
            <p className="text-center text-muted-foreground mb-6">
              For security reasons, password reset links are only valid for a limited time.
            </p>
            <Button onClick={() => setLocation('/forgot-password')}>
              Request a new link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <CardTitle className="text-2xl font-bold">{isSuccess ? 'Password Reset Complete' : 'Reset your password'}</CardTitle>
          <CardDescription>
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
              <h3 className="text-xl font-semibold">Password reset successful</h3>
              <p className="text-muted-foreground">
                Your password has been reset successfully. You can now use your new password to log in.
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
                          className="h-1 w-full"
                          indicatorClassName={getStrengthColor(passwordStrength)}
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
      </Card>
    </div>
  );
}