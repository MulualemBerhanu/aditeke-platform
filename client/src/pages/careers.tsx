import { useState } from 'react';
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
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { toast } = useToast();
  
  const { data: jobs, isLoading, error } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

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
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-primary/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Team</h1>
            <p className="text-xl text-gray-700 mb-8">
              Build your career with us and work on exciting projects that make a difference
            </p>
            <a 
              href="#open-positions" 
              className="px-8 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors inline-block"
            >
              View Open Positions
            </a>
          </motion.div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Culture</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              At AdiTeke, we believe in creating an environment where talented individuals can thrive, innovate, and grow together.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cultureValues.map((value, index) => (
              <motion.div 
                key={index}
                className="bg-light p-8 rounded-xl shadow-md text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl mx-auto mb-6">
                  <i className={`fas ${value.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-light">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Benefits & Perks</h2>
              <p className="text-gray-700 mb-8">
                We value our team members and offer a range of benefits to ensure their well-being and professional growth.
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
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
                      <i className={`fas ${benefit.icon}`}></i>
                    </div>
                    <span className="font-medium">{benefit.title}</span>
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
              <img 
                src="https://images.unsplash.com/photo-1522071901873-411886a10004?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80" 
                alt="Team collaboration" 
                className="rounded-lg shadow-lg w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section id="open-positions" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Open Positions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our current job openings and find the perfect role for your skills and career goals.
            </p>
          </motion.div>
          
          {isLoading ? (
            // Show skeleton loaders while loading
            <div className="space-y-4">
              {Array(3).fill(null).map((_, index) => (
                <div key={index} className="bg-light rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-full"></div>
                  <div className="flex gap-4 mb-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Show error message
            <div className="text-center text-red-500">
              <p>Failed to load job listings. Please try again later.</p>
            </div>
          ) : jobs && jobs.length > 0 ? (
            // Show job listings
            <Accordion type="single" collapsible className="space-y-4">
              {jobs.map((job) => (
                <AccordionItem 
                  key={job.id} 
                  value={job.id.toString()}
                  className="bg-light rounded-xl overflow-hidden shadow-sm border-none"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex flex-col md:flex-row md:items-center justify-between w-full text-left">
                      <div>
                        <h3 className="text-xl font-bold">{job.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-sm text-gray-600">
                            <i className="fas fa-map-marker-alt mr-1"></i> {job.location}
                          </span>
                          <span className="text-sm text-gray-600">
                            <i className="fas fa-briefcase mr-1"></i> {job.employmentType}
                          </span>
                          <span className="text-sm text-gray-600">
                            <i className="fas fa-users mr-1"></i> {job.department}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="prose max-w-none">
                      <p className="text-gray-700 mb-4">{job.description}</p>
                      
                      <h4 className="text-lg font-bold mt-4 mb-2">Requirements:</h4>
                      <div className="text-gray-700">{job.requirements}</div>
                      
                      <div className="mt-6">
                        <Button 
                          className="bg-primary text-white"
                          onClick={() => setSelectedJob(job)}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            // Show no jobs message
            <div className="text-center bg-light p-8 rounded-xl">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl mx-auto mb-4">
                <i className="fas fa-briefcase"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">No Open Positions</h3>
              <p className="text-gray-600 mb-4">
                We don't have any open positions at the moment, but we're always looking for talent!
              </p>
              <p className="text-gray-600">
                Send your resume to <a href="mailto:careers@aditeke.com" className="text-primary">careers@aditeke.com</a> and we'll keep you in mind for future opportunities.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Application Form Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Apply for {selectedJob.title}</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setSelectedJob(null)}
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
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
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" type="email" {...field} />
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
                          <FormLabel>Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
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
                        <FormLabel>Resume/CV Link *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://drive.google.com/your-resume" 
                            type="url" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
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
                        <FormLabel>Cover Letter *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us why you're interested in this position and why you'd be a good fit..." 
                            rows={6}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedJob(null)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-primary text-white">
                      Submit Application
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Testimonial Section */}
      <section className="py-16 gradient-bg hero-pattern text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-10">What Our Team Says</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <div className="text-amber-400 flex mb-4">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p className="mb-4">
                  "Working at AdiTeke has been incredible for my career growth. The team is supportive, the projects are challenging, and there's always an opportunity to learn something new."
                </p>
                <div className="flex items-center">
                  <img 
                    src="https://randomuser.me/api/portraits/women/32.jpg" 
                    alt="Employee portrait" 
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <div className="font-bold">Sophia Chen</div>
                    <div className="text-white/80 text-sm">Senior Developer, 3 years</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <div className="text-amber-400 flex mb-4">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p className="mb-4">
                  "The culture at AdiTeke is what sets it apart. The work-life balance is excellent, and management truly cares about your professional development and personal well-being."
                </p>
                <div className="flex items-center">
                  <img 
                    src="https://randomuser.me/api/portraits/men/54.jpg" 
                    alt="Employee portrait" 
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <div className="font-bold">Marcus Johnson</div>
                    <div className="text-white/80 text-sm">Project Manager, 2 years</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default CareersPage;
