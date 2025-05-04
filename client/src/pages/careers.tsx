import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Job } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

// Job application form schema
const applicationSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(7, { message: 'Please enter a valid phone number' }),
  resumeLink: z.string().url({ message: 'Please enter a valid URL to your resume' }),
  coverLetter: z.string().min(50, { message: 'Cover letter must be at least 50 characters' }),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

const CareersPage = () => {
  // Sample job data
  const sampleJobs: Job[] = [
    {
      id: 1001,
      title: "Senior Frontend Developer",
      location: "Portland, OR",
      employmentType: "Full-time",
      department: "Engineering",
      description: "We're looking for an experienced frontend developer with React expertise to join our team. You'll be responsible for building responsive, accessible, and performant user interfaces for our enterprise clients. You'll work closely with our UI/UX designers, backend developers, and product managers to deliver exceptional digital experiences.",
      requirements: "• 5+ years of experience with modern JavaScript frameworks (React.js, Vue.js)\n• Strong TypeScript skills\n• Experience with CSS preprocessors and modern CSS frameworks\n• Excellent understanding of responsive design principles\n• Experience with state management solutions like Redux or Context API\n• Knowledge of web performance optimization techniques\n• Good understanding of accessibility standards (WCAG)\n• Experience with version control systems (Git)",
      postedDate: new Date(),
      isActive: true
    },
    {
      id: 1002,
      title: "Backend Engineer",
      location: "Remote",
      employmentType: "Full-time",
      department: "Engineering",
      description: "Join our backend engineering team and help build robust, scalable, and secure APIs and services. You'll be working on designing and implementing RESTful APIs, database schemas, and server-side logic that powers our client solutions. This role requires strong problem-solving skills and the ability to optimize systems for performance and reliability.",
      requirements: "• 3+ years of experience with Node.js or similar backend technologies\n• Experience with SQL and NoSQL databases\n• Understanding of RESTful API design principles\n• Knowledge of authentication and authorization mechanisms\n• Experience with cloud services (AWS, Azure, or GCP)\n• Understanding of microservices architecture\n• Familiarity with CI/CD pipelines\n• Good communication skills",
      postedDate: new Date(),
      isActive: true
    },
    {
      id: 1003,
      title: "DevOps Engineer",
      location: "Portland, OR / Remote",
      employmentType: "Full-time",
      department: "Operations",
      description: "We're looking for a DevOps Engineer to help us build and maintain our cloud infrastructure, automate deployment processes, and ensure the reliability and security of our systems. You'll work closely with development teams to implement CI/CD pipelines, monitor system performance, and troubleshoot infrastructure issues.",
      requirements: "• 3+ years of experience in a DevOps or SRE role\n• Strong knowledge of AWS, Azure, or GCP services\n• Experience with containerization technologies (Docker, Kubernetes)\n• Proficiency in infrastructure as code (Terraform, CloudFormation)\n• Experience with CI/CD tools (Jenkins, GitHub Actions, CircleCI)\n• Knowledge of monitoring and observability tools\n• Scripting skills (Bash, Python)\n• Understanding of network security principles",
      postedDate: new Date(),
      isActive: true
    }
  ];

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { toast } = useToast();
  
  // Mock the API loading state
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate API loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Initialize form with react-hook-form
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      resumeLink: '',
      coverLetter: '',
    }
  });

  const onSubmit = (data: ApplicationFormValues) => {
    // In a real app, this would send data to an API
    console.log(data);
    console.log('Applying for job:', selectedJob?.title);
    
    toast({
      title: 'Application Submitted',
      description: 'Thank you for your application! We will contact you soon.',
    });
    
    form.reset();
    setSelectedJob(null);
  };

  // Culture values
  const cultureValues = [
    {
      title: "Innovation",
      description: "We constantly push the boundaries of what's possible and encourage creative problem-solving.",
      icon: "fa-lightbulb"
    },
    {
      title: "Collaboration",
      description: "We believe in the power of teamwork and creating solutions together.",
      icon: "fa-users"
    },
    {
      title: "Growth",
      description: "We invest in continuous learning and professional development for all team members.",
      icon: "fa-chart-line"
    },
    {
      title: "Balance",
      description: "We promote a healthy work-life balance and flexible working arrangements.",
      icon: "fa-balance-scale"
    }
  ];

  // Benefits
  const benefits = [
    { title: "Competitive Salary", icon: "fa-money-bill-wave" },
    { title: "Health Insurance", icon: "fa-heartbeat" },
    { title: "Flexible Working Hours", icon: "fa-clock" },
    { title: "Remote Work Options", icon: "fa-laptop-house" },
    { title: "Professional Development", icon: "fa-graduation-cap" },
    { title: "Team Building Events", icon: "fa-users" },
    { title: "Paid Time Off", icon: "fa-umbrella-beach" },
    { title: "Performance Bonuses", icon: "fa-award" }
  ];

  return (
    <>
      <Helmet>
        <title>Careers | AdiTeke Software Solutions</title>
        <meta name="description" content="Join our team of talented professionals at AdiTeke Software Solutions. Explore current job openings and our company culture." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-28 overflow-hidden bg-gradient-to-b from-primary to-blue-800 text-white">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.05),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="h-px w-8 bg-blue-300/50"></div>
                <div className="mx-2 text-blue-300 text-lg">🚀</div>
                <div className="h-px w-8 bg-blue-300/50"></div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">Join Our Team</h1>
            <p className="text-xl md:text-2xl text-blue-100/90 mb-10 max-w-2xl mx-auto">
              Build your career with us and work on exciting projects that make a difference
            </p>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <a 
                href="#open-positions" 
                className="px-8 py-4 bg-white text-primary font-medium rounded-md hover:bg-white/90 transition-colors inline-block shadow-lg"
              >
                View Open Positions
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-full h-20 bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>
        
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4">
              <div className="flex items-center justify-center mb-2">
                <div className="h-px w-6 bg-primary/30"></div>
                <div className="mx-2 text-primary text-lg">✨</div>
                <div className="h-px w-6 bg-primary/30"></div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700">Our Culture</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              At AdiTeke, we believe in creating an environment where talented individuals can thrive, innovate, and grow together.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cultureValues.map((value, index) => (
              <motion.div 
                key={index}
                className="bg-white border border-primary/10 p-8 rounded-xl shadow-md text-center hover:shadow-lg transition-all"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, borderColor: "rgba(59, 130, 246, 0.3)" }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-blue-400/10 flex items-center justify-center text-primary text-2xl mx-auto mb-6 shadow-inner">
                  <i className={`fas ${value.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-blue-950 to-blue-900 text-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_70%,rgba(255,255,255,0.03),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.03),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block mb-4">
                <div className="flex items-center mb-2">
                  <div className="h-px w-8 bg-blue-300/50"></div>
                  <div className="mx-2 text-blue-300 text-lg">🎁</div>
                  <div className="h-px w-8 bg-blue-300/50"></div>
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Benefits & Perks</h2>
              <p className="text-blue-100/80 mb-8 text-lg">
                We value our team members and offer a comprehensive range of benefits to ensure their well-being and professional growth.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-blue-200 mr-4 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                      <i className={`fas ${benefit.icon}`}></i>
                    </div>
                    <span className="font-medium text-white">{benefit.title}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="rounded-xl overflow-hidden shadow-xl border border-white/10 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent mix-blend-overlay"></div>
                <img 
                  src="https://images.unsplash.com/photo-1522071901873-411886a10004?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80" 
                  alt="Team collaboration" 
                  className="w-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section id="open-positions" className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-primary/5 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4">
              <div className="flex items-center justify-center mb-2">
                <div className="h-px w-6 bg-primary/30"></div>
                <div className="mx-2 text-primary text-lg">💼</div>
                <div className="h-px w-6 bg-primary/30"></div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700">Open Positions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-8">
              Explore our current job openings and find the perfect role for your skills and career goals.
            </p>
          </motion.div>
          
          {isLoading ? (
            // Show skeleton loaders while loading
            <div className="space-y-6 max-w-4xl mx-auto">
              {Array(3).fill(null).map((_, index) => (
                <div key={index} className="bg-white border border-gray-200/60 rounded-xl p-6 animate-pulse shadow-sm">
                  <div className="h-7 bg-gray-200 rounded-md w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-100 rounded-md mb-4 w-full"></div>
                  <div className="flex gap-4 mb-4">
                    <div className="h-4 bg-gray-100 rounded-md w-24"></div>
                    <div className="h-4 bg-gray-100 rounded-md w-24"></div>
                  </div>
                  <div className="h-10 bg-primary/20 rounded-md w-32"></div>
                </div>
              ))}
            </div>
          ) : sampleJobs && sampleJobs.length > 0 ? (
            // Show job listings
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-6">
                {sampleJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <AccordionItem 
                      value={job.id.toString()}
                      className="border border-primary/10 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-primary/5 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center justify-between w-full text-left gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                            <div className="flex flex-wrap gap-3 mt-2">
                              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                <i className="fas fa-map-marker-alt mr-1"></i> {job.location}
                              </span>
                              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                <i className="fas fa-briefcase mr-1"></i> {job.employmentType}
                              </span>
                              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                <i className="fas fa-users mr-1"></i> {job.department}
                              </span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 py-6 border-t border-gray-100">
                        <div className="prose max-w-none">
                          <p className="text-gray-700 mb-6 text-lg">{job.description}</p>
                          
                          <h4 className="text-xl font-bold mt-6 mb-3 text-gray-800">Requirements:</h4>
                          <div className="text-gray-700 mb-8 whitespace-pre-line">{job.requirements}</div>
                          
                          <div className="mt-8">
                            <motion.div
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <Button 
                                className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-5 text-lg shadow-md"
                                onClick={() => setSelectedJob(job)}
                              >
                                Apply for this Position
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          ) : (
            // Show no jobs message
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center bg-white border border-primary/10 p-10 rounded-xl shadow-md max-w-2xl mx-auto"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-blue-400/10 flex items-center justify-center text-primary text-3xl mx-auto mb-6 shadow-inner">
                <i className="fas fa-briefcase"></i>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">No Open Positions</h3>
              <p className="text-gray-600 mb-6 text-lg">
                We don't have any open positions at the moment, but we're always looking for talented individuals to join our team!
              </p>
              <div className="p-6 bg-primary/5 rounded-lg border border-primary/10 inline-block">
                <p className="text-gray-700 font-medium mb-2">
                  Send your resume to:
                </p>
                <a 
                  href="mailto:careers@aditeke.com" 
                  className="text-primary hover:text-primary/80 text-lg font-semibold transition-colors"
                >
                  careers@aditeke.com
                </a>
                <p className="text-gray-600 mt-2 text-sm">
                  We'll keep you in mind for future opportunities
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Application Form Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div 
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-primary to-blue-600 p-6 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-white">Apply for {selectedJob?.title}</h3>
                  <button 
                    className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full h-8 w-8 flex items-center justify-center transition-colors"
                    onClick={() => setSelectedJob(null)}
                    aria-label="Close"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </div>
                <p className="text-blue-100 mt-2">
                  Fill out the form below to apply for this position
                </p>
              </div>
              
              <div className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Full Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              className="border-gray-300 focus:border-primary/50 focus:ring focus:ring-primary/20" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Email *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="john@example.com" 
                                type="email" 
                                className="border-gray-300 focus:border-primary/50 focus:ring focus:ring-primary/20" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700">Phone *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="+1 (555) 123-4567" 
                                className="border-gray-300 focus:border-primary/50 focus:ring focus:ring-primary/20" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="resumeLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Resume/CV Link *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://drive.google.com/your-resume" 
                              type="url"
                              className="border-gray-300 focus:border-primary/50 focus:ring focus:ring-primary/20"  
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500 text-sm">
                            Please provide a link to your resume (Google Drive, Dropbox, etc.)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="coverLetter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Cover Letter *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us why you're interested in this position and what skills and experience you bring to the table..." 
                              className="min-h-[150px] border-gray-300 focus:border-primary/50 focus:ring focus:ring-primary/20 resize-y"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-gray-100">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => setSelectedJob(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary/90 text-white transition-colors"
                      >
                        Submit Application
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </motion.div>
        </div>
      )}


    </>
  );
};

export default CareersPage;
