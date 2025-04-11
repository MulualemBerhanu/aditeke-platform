import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Define the form schema
const newsletterSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

const NewsletterSection = () => {
  const { toast } = useToast();
  
  // Initialize form with react-hook-form
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
    }
  });

  // Mutation for submitting the form
  const mutation = useMutation({
    mutationFn: async (data: NewsletterFormValues) => {
      const response = await apiRequest('POST', '/api/newsletter/subscribe', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Successful",
        description: "Thank you for subscribing to our newsletter!",
        variant: "default",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Subscription Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: NewsletterFormValues) => {
    mutation.mutate(data);
  };

  return (
    <section className="py-16 gradient-bg hero-pattern text-white">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="mb-8">Subscribe to our newsletter for the latest tech insights, industry news, and updates about our services.</p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input 
                        placeholder="Enter your email address" 
                        className="px-4 py-3 rounded-md focus:outline-none text-dark w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-left text-red-300" />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="px-6 py-3 bg-accent text-white font-medium rounded-md hover:bg-accent/90 transition-colors"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Subscribing...' : 'Subscribe Now'}
              </Button>
            </form>
          </Form>
          
          <p className="text-sm mt-4 text-white/70">We respect your privacy. Unsubscribe at any time.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
