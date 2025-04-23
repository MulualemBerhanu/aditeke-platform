import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { SERVICES } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Service } from '@shared/schema';

const ServicesPage = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  
  const { data: services, isLoading, error } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  // Update active tab based on hash in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Remove the # and set as active tab
      const tabId = hash.substring(1);
      setActiveTab(tabId);
    }
  }, []);

  // Use services from API if available, otherwise fall back to constants
  const displayServices = services && services.length > 0 ? services : SERVICES.map((service, index) => ({
    id: index + 1,
    title: service.title,
    description: service.description,
    shortDescription: service.description,
    icon: service.icon,
    isActive: true
  }));

  // Pricing plans
  const pricingPlans = [
    {
      name: "Starter",
      price: "$2,999",
      description: "Perfect for small projects and startups",
      features: [
        "Web development (up to 5 pages)",
        "Basic mobile responsive design",
        "Content management system",
        "Up to 3 rounds of revisions",
        "1 month of support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$5,999",
      description: "Ideal for growing businesses and complex projects",
      features: [
        "Custom web application development",
        "Advanced responsive design",
        "API integration",
        "Database design and development",
        "User authentication",
        "Up to 5 rounds of revisions",
        "3 months of support"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations with specific requirements",
      features: [
        "Full-scale enterprise solutions",
        "Custom software architecture",
        "Advanced security implementation",
        "Performance optimization",
        "Multiple platform support",
        "Unlimited revisions",
        "12 months of support and maintenance"
      ],
      popular: false
    }
  ];

  // Process steps
  const processSteps = [
    {
      title: "Discovery",
      description: "We start by understanding your business, goals, and requirements through in-depth consultation.",
      icon: "fa-search"
    },
    {
      title: "Planning",
      description: "Our team creates a detailed roadmap including project scope, timeline, and required resources.",
      icon: "fa-map"
    },
    {
      title: "Design",
      description: "We create wireframes and designs for your approval before development begins.",
      icon: "fa-paint-brush"
    },
    {
      title: "Development",
      description: "Our developers build your solution with clean, efficient code following best practices.",
      icon: "fa-code"
    },
    {
      title: "Testing",
      description: "Rigorous testing ensures your solution works flawlessly across all platforms.",
      icon: "fa-vial"
    },
    {
      title: "Deployment",
      description: "We launch your solution and provide training for your team.",
      icon: "fa-rocket"
    },
    {
      title: "Support",
      description: "Ongoing support and maintenance keep your solution running smoothly.",
      icon: "fa-headset"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Services | AdiTeke Software Solutions</title>
        <meta name="description" content="Explore our comprehensive software development services including web development, mobile apps, AI solutions, cybersecurity, and cloud solutions." />
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
            <p className="text-xl text-gray-700 mb-8">
              Comprehensive software solutions tailored to your business needs
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto mb-8 pb-4">
              <TabsList className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-4 min-w-max md:min-w-0 px-4 md:px-0">
                <TabsTrigger value="all" className="px-5 py-2 rounded-full font-medium whitespace-nowrap">
                  All Services
                </TabsTrigger>
                {displayServices.map((service) => (
                  <TabsTrigger 
                    key={service.id} 
                    value={service.title.toLowerCase().replace(/\s+/g, '-')}
                    className="px-5 py-2 rounded-full font-medium whitespace-nowrap"
                  >
                    {service.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                  // Show skeleton loaders while loading
                  Array(6).fill(null).map((_, index) => (
                    <div key={index} className="bg-light rounded-xl p-8 shadow-md animate-pulse">
                      <div className="w-14 h-14 rounded-lg bg-gray-200 mb-6"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/5"></div>
                    </div>
                  ))
                ) : error ? (
                  // Show error message
                  <div className="col-span-full text-center text-red-500">
                    <p>Failed to load services. Please try again later.</p>
                  </div>
                ) : (
                  // If we have data from API, use it
                  displayServices.map((service, index) => (
                    <motion.div 
                      key={service.id}
                      className="bg-light rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow group hover:border-primary border border-transparent"
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <i className={`fas ${service.icon} text-2xl`}></i>
                      </div>
                      <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                      <p className="text-gray-600 mb-4">{service.shortDescription}</p>
                      <button
                        onClick={() => {
                          setActiveTab(service.title.toLowerCase().replace(/\s+/g, '-'));
                          window.location.hash = service.title.toLowerCase().replace(/\s+/g, '-');
                        }}
                        className="text-primary font-medium inline-flex items-center group-hover:text-accent transition-colors cursor-pointer bg-transparent border-0 p-0"
                      >
                        Learn more 
                        <i className="fas fa-arrow-right ml-2 transition-transform group-hover:translate-x-1"></i>
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>
            
            {displayServices.map((service) => (
              <TabsContent 
                key={service.id} 
                value={service.title.toLowerCase().replace(/\s+/g, '-')}
                className="mt-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2">
                    <motion.div
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <h2 className="text-3xl font-bold mb-6">{service.title}</h2>
                      <div className="prose prose-lg max-w-none">
                        <p className="text-gray-700 mb-6">{service.description}</p>
                        
                        {/* Service specific content - this would come from the database in a real implementation */}
                        <h3 className="text-xl font-bold mb-4">Key Features</h3>
                        <ul className="space-y-2 mb-6">
                          <li className="flex items-start">
                            <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                            <span>Custom solutions tailored to your specific business needs</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                            <span>Modern and scalable architecture</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                            <span>Intuitive user experience and interface design</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                            <span>Robust security implementation</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-check-circle text-primary mt-1 mr-2"></i>
                            <span>Comprehensive testing and quality assurance</span>
                          </li>
                        </ul>
                        
                        <h3 className="text-xl font-bold mb-4">Technologies We Use</h3>
                        <div className="flex flex-wrap gap-3 mb-6">
                          {['React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'Java', 'AWS', 'Azure', 'Google Cloud'].map((tech, index) => (
                            <span key={index} className="px-3 py-1 bg-primary/10 rounded-full text-primary text-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-8 flex">
                        <Link href="/contact">
                          <Button className="bg-primary text-white">
                            Request a Consultation
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="lg:col-span-1"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <div className="bg-light rounded-xl p-6 shadow-md">
                      <h3 className="text-xl font-bold mb-4">Why Choose Us</h3>
                      <ul className="space-y-4">
                        <li className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 mt-1 flex-shrink-0">
                            <i className="fas fa-trophy"></i>
                          </div>
                          <div>
                            <h4 className="font-bold mb-1">Proven Expertise</h4>
                            <p className="text-gray-600">Over 200 successful projects delivered</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 mt-1 flex-shrink-0">
                            <i className="fas fa-users"></i>
                          </div>
                          <div>
                            <h4 className="font-bold mb-1">Dedicated Team</h4>
                            <p className="text-gray-600">Skilled professionals committed to your success</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 mt-1 flex-shrink-0">
                            <i className="fas fa-cogs"></i>
                          </div>
                          <div>
                            <h4 className="font-bold mb-1">Cutting-edge Technology</h4>
                            <p className="text-gray-600">Using the latest tools and frameworks</p>
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 mt-1 flex-shrink-0">
                            <i className="fas fa-comments"></i>
                          </div>
                          <div>
                            <h4 className="font-bold mb-1">Clear Communication</h4>
                            <p className="text-gray-600">Regular updates and transparent process</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Our Process Section */}
      <section className="py-20 bg-light">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Development Process</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We follow a proven methodology to ensure your project is delivered on time, within budget, and to the highest quality standards.
            </p>
          </motion.div>
          
          <div className="relative">
            {/* Horizontal timeline line */}
            <div className="absolute top-[45px] left-0 w-full h-1 bg-primary/20 hidden md:block"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-7 gap-8">
              {processSteps.map((step, index) => (
                <motion.div 
                  key={index}
                  className="relative flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Step number circle */}
                  <div className="w-[90px] h-[90px] rounded-full bg-white shadow-md flex flex-col items-center justify-center text-primary z-10 mb-6">
                    <i className={`fas ${step.icon} text-2xl mb-1`}></i>
                    <span className="font-bold">{index + 1}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pricing Plans</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Transparent and flexible pricing options designed to accommodate businesses of all sizes.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div 
                key={index}
                className={`bg-white rounded-xl shadow-md overflow-hidden border ${
                  plan.popular ? 'border-primary' : 'border-gray-200'
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {plan.popular && (
                  <div className="bg-primary text-white py-2 px-4 text-center text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-gray-600">/project</span>}
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <i className="fas fa-check text-green-500 mt-1 mr-2"></i>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/contact">
                    <Button 
                      variant={plan.popular ? "default" : "outline"} 
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="text-center mt-12 bg-light rounded-xl p-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-bold mb-4">Need a Custom Solution?</h3>
            <p className="text-gray-600 mb-6">
              We understand that every business has unique requirements. Contact us for a personalized quote tailored to your specific needs.
            </p>
            <Link href="/contact">
              <Button className="bg-primary text-white">
                Request a Custom Quote
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-bg hero-pattern text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Discuss Your Project?</h2>
            <p className="text-xl mb-8">
              Our team is ready to help you bring your vision to life with the perfect software solution.
            </p>
            <Link href="/contact">
              <Button className="px-8 py-3 bg-accent text-white font-medium rounded-md hover:bg-accent/90 transition-colors">
                Get in Touch Today
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default ServicesPage;
