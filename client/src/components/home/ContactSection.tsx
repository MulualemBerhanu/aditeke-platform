import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CONTACT_INFO, CONTACT_SUBJECTS, SOCIAL_LINKS } from '@/lib/constants';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Mail, Phone, Clock, Send, ArrowRight, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';

// Extend the schema from shared/schema.ts for the form
const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  subject: z.string().min(1, { message: 'Please select a subject' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters' }),
  agreement: z.boolean().refine(val => val === true, { message: 'You must agree to the terms' })
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

// Custom hook for animations with InView
const useAnimateOnScroll = (threshold = 0.2) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, amount: threshold });
  const controls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);
  
  return { ref, controls, isInView };
};

const ContactSection = () => {
  const { toast } = useToast();
  const { ref: containerRef, controls, isInView } = useAnimateOnScroll(0.2);
  const [activeTab, setActiveTab] = useState<'form' | 'info'>('form');
  
  // Initialize form with react-hook-form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      agreement: false
    }
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Mutation for submitting the form
  const mutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      // Remove agreement field as it's not part of the API model
      const { agreement, ...contactData } = data;
      const response = await apiRequest('POST', '/api/contact', contactData);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully",
        description: "We'll get back to you as soon as possible.",
        variant: "default",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error Sending Message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ContactFormValues) => {
    mutation.mutate(data);
  };

  // Contact info items
  const contactItems = [
    {
      icon: <MapPin className="h-6 w-6" strokeWidth={1.5} />,
      title: "Our Location",
      details: [CONTACT_INFO.address],
      color: "blue"
    },
    {
      icon: <Mail className="h-6 w-6" strokeWidth={1.5} />,
      title: "Email Us",
      details: [CONTACT_INFO.email, CONTACT_INFO.supportEmail],
      color: "purple"
    },
    {
      icon: <Phone className="h-6 w-6" strokeWidth={1.5} />,
      title: "Call Us",
      details: [CONTACT_INFO.phone, CONTACT_INFO.alternativePhone].filter(Boolean),
      color: "emerald"
    },
    {
      icon: <Clock className="h-6 w-6" strokeWidth={1.5} />,
      title: "Working Hours",
      details: [CONTACT_INFO.workingHours, CONTACT_INFO.workingHoursSaturday],
      color: "amber"
    }
  ];

  // Function to get gradient class by color name
  const getGradientClass = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-indigo-600';
      case 'purple': return 'from-purple-500 to-pink-600';
      case 'emerald': return 'from-emerald-500 to-teal-600';
      case 'amber': return 'from-amber-500 to-orange-600';
      default: return 'from-primary to-primary-dark';
    }
  };
  
  // Function to get glow/shadow color
  const getGlowClass = (color: string) => {
    switch (color) {
      case 'blue': return 'shadow-blue-500/20';
      case 'purple': return 'shadow-purple-500/20';
      case 'emerald': return 'shadow-emerald-500/20';
      case 'amber': return 'shadow-amber-500/20';
      default: return 'shadow-primary/20';
    }
  };

  return (
    <section 
      id="contact" 
      ref={containerRef}
      className="relative py-24 overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(99,102,241,0.2)_1px,transparent_1px),linear-gradient(to_right,rgba(99,102,241,0.2)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Gradient orbs */}
        <motion.div 
          className="absolute top-0 left-0 w-96 h-96 rounded-full bg-blue-500/10 blur-[100px] opacity-40"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
            x: [0, 20, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-purple-500/10 blur-[120px] opacity-40"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
            x: [0, -20, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          {/* Decorative elements */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-3 mb-3"
          >
            <div className="h-px w-6 bg-indigo-400/70"></div>
            <div className="text-indigo-300 uppercase tracking-wider text-sm font-medium">Contact Us</div>
            <div className="h-px w-6 bg-indigo-400/70"></div>
          </motion.div>
          
          <motion.h2 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold mb-6 text-white"
          >
            Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Touch With Us</span>
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Have a project in mind or questions about our services? We're here to help.
            Contact us using the form or through any of our channels below.
          </motion.p>
          
          {/* Tab toggle for mobile */}
          <motion.div 
            variants={itemVariants}
            className="mt-10 flex bg-slate-800/50 p-1 rounded-full w-full max-w-xs mx-auto border border-slate-700/50 md:hidden"
          >
            <button
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                activeTab === 'form' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:text-white'
              }`}
              onClick={() => setActiveTab('form')}
            >
              Contact Form
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
                activeTab === 'info' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:text-white'
              }`}
              onClick={() => setActiveTab('info')}
            >
              Info & Details
            </button>
          </motion.div>
        </motion.div>
        
        {/* Main Content Grid */}
        <div className="flex flex-col md:flex-row gap-10 max-w-7xl mx-auto">
          {/* Contact Information Cards */}
          <motion.div 
            className={`md:w-2/5 space-y-6 ${activeTab === 'info' ? 'block' : 'hidden md:block'}`}
            variants={containerVariants}
            initial="hidden"
            animate={controls}
          >
            {/* Contact cards */}
            {contactItems.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-full bg-gradient-to-br ${getGradientClass(item.color)} text-white shadow-lg ${getGlowClass(item.color)}`}>
                      {item.icon}
                    </div>
                    <h3 className="ml-4 text-xl font-bold text-white">{item.title}</h3>
                  </div>
                  <div className="pl-16">
                    {item.details.map((detail, i) => (
                      <p key={i} className="text-slate-300 mb-1">{detail}</p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Social Media Links */}
            <motion.div
              variants={itemVariants}
              className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-5">Follow Us</h3>
              <div className="flex flex-wrap gap-3">
                {SOCIAL_LINKS.map((social, index) => (
                  <motion.a 
                    key={index}
                    href={social.url} 
                    className="group relative w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600/80 to-purple-600/80 flex items-center justify-center text-white shadow-lg hover:shadow-indigo-500/30 transition-all overflow-hidden"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {/* Animated shine effect */}
                    <span className="absolute w-full h-full top-0 left-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
                    
                    <i className={`fab ${social.icon} text-lg`}></i>
                    
                    {/* Hover tooltip */}
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 group-hover:-bottom-6 transition-all pointer-events-none">
                      {social.name}
                    </span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>
          
          {/* Contact Form Card */}
          <motion.div 
            className={`md:w-3/5 ${activeTab === 'form' ? 'block' : 'hidden md:block'}`}
            variants={containerVariants}
            initial="hidden"
            animate={controls}
          >
            <motion.div
              variants={itemVariants}
              className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 mr-4">
                    <MessageSquare className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Send Us a Message</h3>
                </div>
                
                <AnimatePresence mode="wait">
                  {mutation.isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center text-center py-10"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-green-500/20">
                        <CheckCircle2 className="h-10 w-10" />
                      </div>
                      <h4 className="text-xl font-bold text-white mb-2">Message Sent Successfully!</h4>
                      <p className="text-slate-300 mb-6">Thank you for reaching out. We'll get back to you as soon as possible.</p>
                      <Button
                        onClick={() => form.reset()}
                        variant="outline"
                        className="border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 hover:text-white"
                      >
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-300">Your Name *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="John Doe" 
                                      {...field} 
                                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-300">Email Address *</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="john@example.com" 
                                      {...field} 
                                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-300">Phone Number</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="+1 (555) 123-4567" 
                                      {...field} 
                                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="subject"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-300">Subject *</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white focus:border-indigo-500/50 focus:ring-indigo-500/20">
                                        <SelectValue placeholder="Select a subject" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                      {CONTACT_SUBJECTS.map((subject, index) => (
                                        <SelectItem 
                                          key={index} 
                                          value={subject.value}
                                          disabled={subject.disabled}
                                          className="focus:bg-indigo-500/20 data-[highlighted]:bg-indigo-900/30"
                                        >
                                          {subject.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-300">Message *</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Tell us about your project or inquiry..." 
                                    rows={5}
                                    {...field} 
                                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-indigo-500/20 resize-none"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="agreement"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange}
                                    className="border-slate-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-slate-300">
                                    I agree to the <a href="/terms" className="text-indigo-400 hover:underline">Terms & Conditions</a> and <a href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</a>.
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="overflow-hidden relative rounded-lg"
                          >
                            <Button 
                              type="submit" 
                              className="w-full py-6 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/30 group"
                              disabled={mutation.isPending}
                            >
                              {mutation.isPending ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                  Sending...
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                  Send Message
                                </span>
                              )}
                              
                              {/* Button shine effect */}
                              <span className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                            </Button>
                          </motion.div>
                        </form>
                      </Form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
