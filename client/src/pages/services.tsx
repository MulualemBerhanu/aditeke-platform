import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { SERVICES } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Service } from '@shared/schema';

const ServicesPage = () => {
  const [activeTab, setActiveTab] = useState<string>('custom-software-development');
  
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
      <section className="relative py-32 overflow-hidden bg-gradient-to-b from-primary/5 to-background">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:80px_80px] opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="lg:pr-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center mb-4 text-sm px-3 py-1 bg-primary/10 text-primary rounded-full">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Innovative Solutions
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Business</span> With Our Solutions
              </h1>
              
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                We deliver comprehensive software solutions crafted specifically for your unique business challenges and opportunities.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#services-list">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="bg-primary hover:bg-primary/90 text-white py-6 px-8 rounded-lg font-medium text-lg w-full sm:w-auto">
                      Explore Services
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/contact">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/5 py-6 px-8 rounded-lg font-medium text-lg w-full sm:w-auto">
                      Schedule Consultation
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="relative bg-white rounded-2xl shadow-xl p-8 overflow-hidden border border-gray-100">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs text-gray-500">custom-solution.ts</div>
                  </div>
                  
                  <div className="space-y-4 font-mono text-sm">
                    <div className="flex">
                      <span className="text-gray-500 mr-4">1</span>
                      <span className="text-blue-600">class</span>
                      <span className="text-primary mx-2">AdiTekeSolution</span>
                      <span className="text-blue-600">{`{`}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 mr-4">2</span>
                      <span className="ml-8 text-purple-600">constructor</span>
                      <span>(</span>
                      <span className="text-orange-600">client</span>
                      <span>)</span>
                      <span className="text-blue-600">{` {`}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 mr-4">3</span>
                      <span className="ml-12">this.client = client;</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 mr-4">4</span>
                      <span className="ml-12">this.solutions = [];</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 mr-4">5</span>
                      <span className="ml-8 text-blue-600">{`}`}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 mr-4">6</span>
                      <span></span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 mr-4">7</span>
                      <span className="ml-8 text-purple-600">addService</span>
                      <span>(</span>
                      <span className="text-orange-600">service</span>
                      <span>)</span>
                      <span className="text-blue-600">{` {`}</span>
                    </div>
                    <motion.div 
                      className="flex"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.7 }}
                    >
                      <span className="text-gray-500 mr-4">8</span>
                      <span className="ml-12">this.solutions.push(service);</span>
                    </motion.div>
                    <motion.div 
                      className="flex"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.9 }}
                    >
                      <span className="text-gray-500 mr-4">9</span>
                      <span className="ml-12 text-green-600">// Optimizing business value</span>
                    </motion.div>
                    <div className="flex">
                      <span className="text-gray-500 mr-4">10</span>
                      <span className="ml-8 text-blue-600">{`}`}</span>
                    </div>
                    <div className="flex">
                      <span className="text-gray-500 mr-4">11</span>
                      <span className="text-blue-600">{`}`}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements around the code box */}
              <motion.div 
                className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-100 rounded-lg shadow-lg rotate-12 flex items-center justify-center text-3xl text-blue-600"
                animate={{ 
                  rotate: [12, 8, 12],
                  y: [0, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <span>💻</span>
              </motion.div>
              
              <motion.div 
                className="absolute -left-8 top-16 w-16 h-16 bg-green-100 rounded-full shadow-lg flex items-center justify-center text-2xl"
                animate={{ 
                  rotate: [0, 10, 0],
                  x: [0, 5, 0]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <span>🚀</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services-list" className="py-24 bg-gradient-to-b from-blue-950 to-blue-900 relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.03),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.03),transparent_25%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block">
              <div className="flex items-center justify-center mb-4">
                <div className="h-px w-8 bg-blue-300/50"></div>
                <div className="mx-2 text-blue-300 text-lg">⚙️</div>
                <div className="h-px w-8 bg-blue-300/50"></div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Our Comprehensive Services
              </h2>
            </div>
            <p className="text-gray-300 max-w-2xl mx-auto">
              We deliver end-to-end software solutions that drive innovation and business growth
            </p>
          </motion.div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto mb-12">
              <TabsList className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-4 min-w-max md:min-w-0 px-4 md:px-0 mx-auto bg-transparent h-auto p-0">
                <div className="flex flex-nowrap md:flex-wrap gap-3 mb-0 justify-center">
                  {displayServices.map((service, index) => (
                    <TabsTrigger 
                      key={service.id} 
                      value={service.title.toLowerCase().replace(/\s+/g, '-')}
                      className="px-6 py-3 rounded-full font-medium whitespace-nowrap border border-transparent hover:border-primary/20 data-[state=active]:shadow-md data-[state=active]:bg-white transition-all duration-300"
                    >
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        {service.title}
                      </motion.span>
                    </TabsTrigger>
                  ))}
                </div>
              </TabsList>
            </div>

            {displayServices.map((service) => (
              <TabsContent 
                key={service.id} 
                value={service.title.toLowerCase().replace(/\s+/g, '-')}
                className="mt-8 outline-none focus:ring-0"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                  <div className="lg:col-span-8">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-xl mr-4 shadow-md">
                          <span>{service.icon || "🚀"}</span>
                        </div>
                        <h2 className="text-3xl font-bold">{service.title}</h2>
                      </div>
                      
                      <div className="prose prose-lg max-w-none">
                        <p className="text-gray-700 mb-8 leading-relaxed">{service.description}</p>
                        
                        {/* Service specific content - would come from database in real implementation */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <h3 className="text-xl font-bold mb-4 flex items-center">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mr-3">
                                <span>✨</span>
                              </div>
                              Key Features
                            </h3>
                            <ul className="space-y-3">
                              <motion.li 
                                className="flex items-start"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                              >
                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3 mt-1 flex-shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <span>Custom solutions tailored to your specific business needs</span>
                              </motion.li>
                              <motion.li 
                                className="flex items-start"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                              >
                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3 mt-1 flex-shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <span>Modern and scalable architecture</span>
                              </motion.li>
                              <motion.li 
                                className="flex items-start"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                              >
                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3 mt-1 flex-shrink-0">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <span>Intuitive user experience and interface design</span>
                              </motion.li>
                            </ul>
                          </div>
                          
                          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                            <h3 className="text-xl font-bold mb-4 flex items-center">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mr-3">
                                <span>🔧</span>
                              </div>
                              Technologies
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {['React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'Java', 'AWS', 'Azure', 'Google Cloud'].map((tech, index) => (
                                <motion.span 
                                  key={index} 
                                  className="px-3 py-1.5 bg-white rounded-full text-primary text-sm border border-primary/10 hover:border-primary/30 transition-colors duration-300"
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3, delay: index * 0.05 }}
                                  whileHover={{ y: -2 }}
                                >
                                  {tech}
                                </motion.span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-8 bg-primary/5 p-6 rounded-xl border border-primary/10">
                          <h3 className="text-xl font-bold mb-4">Our Approach</h3>
                          <p className="text-gray-700">
                            We follow a collaborative approach to understand your specific requirements before proposing a tailored solution. Our team works closely with you throughout the development process, ensuring transparency and alignment with your business goals.
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <Link href="/contact">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button className="bg-primary text-white px-6 py-3 w-full sm:w-auto">
                              Request a Consultation
                            </Button>
                          </motion.div>
                        </Link>
                        <Link href="/case-studies">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/5 px-6 py-3 w-full sm:w-auto">
                              View Case Studies
                            </Button>
                          </motion.div>
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    className="lg:col-span-4"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 sticky top-24">
                      <h3 className="text-xl font-bold mb-6 flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/80 to-blue-500/80 flex items-center justify-center text-white mr-3">
                          <span>💼</span>
                        </div>
                        Why Choose AdiTeke
                      </h3>
                      
                      <div className="grid grid-cols-1 gap-5">
                        <motion.div 
                          className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.03] hover:border-primary/20 transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          whileHover={{ 
                            boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)"
                          }}
                        >
                          <div className="text-2xl mb-3">🧠</div>
                          <h4 className="font-bold text-gray-900 mb-2">Smart Innovation</h4>
                          <p className="text-gray-600 text-sm">
                            By combining our team's experience and deep knowledge with powerful tools like AI and cloud technologies, we deliver smart, scalable, and future-ready solutions.
                          </p>
                        </motion.div>
                        
                        <motion.div 
                          className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.03] hover:border-primary/20 transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                          whileHover={{ 
                            boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)"
                          }}
                        >
                          <div className="text-2xl mb-3">👥</div>
                          <h4 className="font-bold text-gray-900 mb-2">Client-First Culture</h4>
                          <p className="text-gray-600 text-sm">
                            You're not just a client—you're a partner. We co-create and adapt continuously to meet your evolving goals.
                          </p>
                        </motion.div>
                        
                        <motion.div 
                          className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.03] hover:border-primary/20 transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                          whileHover={{ 
                            boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)"
                          }}
                        >
                          <div className="text-2xl mb-3">⚙️</div>
                          <h4 className="font-bold text-gray-900 mb-2">Modern Engineering</h4>
                          <p className="text-gray-600 text-sm">
                            CI/CD pipelines, clean architecture, and DevOps practices—built-in from Day 1.
                          </p>
                        </motion.div>
                        
                        <motion.div 
                          className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.03] hover:border-primary/20 transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                          whileHover={{ 
                            boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)"
                          }}
                        >
                          <div className="text-2xl mb-3">📈</div>
                          <h4 className="font-bold text-gray-900 mb-2">Results Over Promises</h4>
                          <p className="text-gray-600 text-sm">
                            We track KPIs, iterate fast, and ship value—not just code.
                          </p>
                        </motion.div>
                      </div>
                      
                      {/* Client Satisfaction Section */}
                      <motion.div 
                        className="mt-8 p-5 bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-xl border border-primary/10"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                      >
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                          <span className="text-lg mr-2">📊</span>
                          Client Satisfaction
                        </h4>
                        
                        {/* On-Time Delivery Metric */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-700">On-Time Delivery</span>
                            <span className="text-sm font-bold text-gray-900">98%</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: "98%" }}
                              transition={{ 
                                duration: 1.5,
                                delay: 0.3,
                                ease: "easeOut"
                              }}
                            ></motion.div>
                          </div>
                        </div>
                        
                        {/* Client Retention Rate Metric */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-700">Client Retention Rate</span>
                            <span className="text-sm font-bold text-gray-900">95%</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: "95%" }}
                              transition={{ 
                                duration: 1.5, 
                                delay: 0.5,
                                ease: "easeOut"
                              }}
                            ></motion.div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Our Process Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 opacity-70"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-3">
              <div className="flex items-center justify-center mb-4">
                <div className="h-px w-8 bg-primary/40"></div>
                <div className="mx-2 text-primary/70 text-lg">🔄</div>
                <div className="h-px w-8 bg-primary/40"></div>
              </div>
            </div>
          
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Development Process</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We follow a proven, systematic approach to ensure your project is delivered on time, within budget, and exceeds your expectations.
            </p>
          </motion.div>
          
          <div className="relative max-w-5xl mx-auto">
            {/* Process timeline for desktop */}
            <div className="hidden md:block">
              {/* Timeline connecting line */}
              <div className="absolute top-36 left-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10"></div>
              
              <div className="grid grid-cols-7 gap-6">
                {processSteps.map((step, index) => (
                  <motion.div 
                    key={index}
                    className="relative flex flex-col items-center text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {/* Steps that are odd numbers go above the line, even numbers go below */}
                    <div 
                      className={`flex flex-col items-center ${
                        index % 2 === 0 ? 'order-1' : 'order-3'
                      }`}
                    >
                      <div className={`bg-white rounded-xl shadow-md p-5 border border-gray-100 
                        ${index % 2 === 0 ? 'mb-16' : 'mt-16'}`}
                      >
                        <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                      </div>
                    </div>

                    {/* Step marker */}
                    <div className="order-2 relative">
                      <motion.div 
                        className="w-[72px] h-[72px] rounded-full bg-white shadow-lg border border-primary/10 flex flex-col items-center justify-center z-10 text-primary"
                        whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      >
                        <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-1">
                          <span className="text-xl">{
                            index === 0 ? "🔍" :
                            index === 1 ? "📝" :
                            index === 2 ? "🎨" :
                            index === 3 ? "💻" :
                            index === 4 ? "🧪" :
                            index === 5 ? "🚀" :
                            "🛠️"
                          }</span>
                        </div>
                        <span className="text-xs font-bold">{index + 1}</span>
                      </motion.div>
                      
                      {/* Connector line to timeline */}
                      <motion.div
                        className={`absolute left-1/2 w-1 bg-primary/20 ${
                          index % 2 === 0 ? 'bottom-[36px] h-[66px]' : 'top-[36px] h-[66px]'
                        }`}
                        initial={{ height: 0 }}
                        whileInView={{ height: index % 2 === 0 ? '66px' : '66px' }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                      ></motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Process cards for mobile */}
            <div className="md:hidden space-y-6">
              {processSteps.map((step, index) => (
                <motion.div 
                  key={index}
                  className="relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="p-5">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                        <span className="text-lg">{
                          index === 0 ? "🔍" :
                          index === 1 ? "📝" :
                          index === 2 ? "🎨" :
                          index === 3 ? "💻" :
                          index === 4 ? "🧪" :
                          index === 5 ? "🚀" :
                          "🛠️"
                        }</span>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-primary/70">Step {index + 1}</span>
                        <h3 className="text-lg font-bold">{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Benefits of our process */}
            <motion.div
              className="mt-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-3">Benefits of Our Process</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Our systematic approach ensures efficient delivery while maintaining quality and transparency
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                  <div className="text-primary text-2xl mb-4">⏱️</div>
                  <h4 className="text-lg font-bold mb-2">Time Efficiency</h4>
                  <p className="text-gray-600 text-sm">
                    Our streamlined process reduces wasted time and keeps your project on schedule.
                  </p>
                </div>
                
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                  <div className="text-primary text-2xl mb-4">💰</div>
                  <h4 className="text-lg font-bold mb-2">Cost Effectiveness</h4>
                  <p className="text-gray-600 text-sm">
                    Clear planning and milestones help prevent budget overruns and unexpected expenses.
                  </p>
                </div>
                
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                  <div className="text-primary text-2xl mb-4">🔄</div>
                  <h4 className="text-lg font-bold mb-2">Iterative Improvement</h4>
                  <p className="text-gray-600 text-sm">
                    Regular feedback cycles ensure the final product meets your expectations.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-b from-blue-950 to-blue-900 relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-900/50 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.03),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.03),transparent_25%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-3">
              <div className="flex items-center justify-center mb-4">
                <div className="h-px w-8 bg-blue-300/50"></div>
                <div className="mx-2 text-blue-300 text-lg">💰</div>
                <div className="h-px w-8 bg-blue-300/50"></div>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Transparent Pricing Plans</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Flexible options designed to accommodate businesses of all sizes with no hidden fees
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div 
                key={index}
                className={`group bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
                  plan.popular 
                    ? 'shadow-lg border-2 border-primary relative z-10 scale-105 md:scale-110 my-4 md:my-0' 
                    : 'shadow-md hover:shadow-lg border border-gray-100 hover:border-gray-200'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={!plan.popular ? { y: -5 } : {}}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-2 px-4 text-center text-sm font-medium">
                    <span className="flex items-center justify-center">
                      <span className="mr-1">⭐</span> Most Popular
                    </span>
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-gray-600 ml-1">/project</span>}
                  </div>
                  <p className="text-gray-600 mb-8 min-h-[60px]">{plan.description}</p>
                  
                  <div className="mb-8 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">What's included</h4>
                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={featureIndex} 
                          className="flex items-start"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: 0.2 + featureIndex * 0.1 }}
                        >
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 mt-0.5 mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-gray-700">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  
                  <Link href="/contact" className="block">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        className={`w-full py-6 text-base ${
                          plan.popular 
                            ? "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-md" 
                            : "bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200"
                        }`}
                      >
                        {plan.price === "Custom" ? "Request a Quote" : "Get Started"}
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="mt-20 bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-white/20 shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-white">Need a Custom Solution?</h3>
                <p className="text-gray-300 mb-6">
                  We understand that every business has unique requirements. Our team can create a tailored solution that perfectly fits your specific needs and budget constraints.
                </p>
                <Link href="/contact">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="bg-white border border-primary/20 text-primary hover:bg-primary/5 shadow-sm">
                      Request a Custom Quote
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-b from-blue-950 to-blue-900 relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_90%,rgba(255,255,255,0.03),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.03),transparent_25%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-3">
              <div className="flex items-center justify-center mb-4">
                <div className="h-px w-8 bg-blue-300/50"></div>
                <div className="mx-2 text-blue-300 text-lg">❓</div>
                <div className="h-px w-8 bg-blue-300/50"></div>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Find answers to common questions about our services and development process
            </p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <AccordionItem value="item-1" className="border border-blue-300/20 bg-white/95 rounded-lg overflow-hidden shadow-md">
                  <AccordionTrigger className="px-6 py-4 hover:bg-blue-50 transition-colors">
                    <div className="text-left font-medium text-lg">How long does the development process typically take?</div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2 text-gray-600">
                    <p>Project timelines vary depending on complexity and scope. A simple website might take 2-4 weeks, while a complex web application could take 3-6 months. During our initial consultation, we'll provide a detailed timeline based on your specific requirements.</p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <AccordionItem value="item-2" className="border border-blue-300/20 bg-white/95 rounded-lg overflow-hidden shadow-md">
                  <AccordionTrigger className="px-6 py-4 hover:bg-blue-50 transition-colors">
                    <div className="text-left font-medium text-lg">What is your approach to project management?</div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2 text-gray-600">
                    <p>We follow an Agile methodology with regular sprints and client check-ins. This ensures transparency, flexibility, and allows for adjustments throughout the development process. You'll have a dedicated project manager who serves as your main point of contact.</p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <AccordionItem value="item-3" className="border border-blue-300/20 bg-white/95 rounded-lg overflow-hidden shadow-md">
                  <AccordionTrigger className="px-6 py-4 hover:bg-blue-50 transition-colors">
                    <div className="text-left font-medium text-lg">Do you provide maintenance and support after launch?</div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2 text-gray-600">
                    <p>Yes, we offer ongoing maintenance and support packages tailored to your needs. Our standard plans include regular updates, security patches, bug fixes, and technical support. We also offer training for your team to ensure a smooth transition.</p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <AccordionItem value="item-4" className="border border-blue-300/20 bg-white/95 rounded-lg overflow-hidden shadow-md">
                  <AccordionTrigger className="px-6 py-4 hover:bg-blue-50 transition-colors">
                    <div className="text-left font-medium text-lg">How do you handle data security and privacy?</div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2 text-gray-600">
                    <p>We prioritize security at every stage of development. This includes implementing industry-standard encryption, secure authentication systems, regular security audits, and compliance with relevant regulations like GDPR. We also provide documentation on our security practices.</p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <AccordionItem value="item-5" className="border border-blue-300/20 bg-white/95 rounded-lg overflow-hidden shadow-md">
                  <AccordionTrigger className="px-6 py-4 hover:bg-blue-50 transition-colors">
                    <div className="text-left font-medium text-lg">Can you work with our existing systems and technologies?</div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2 text-gray-600">
                    <p>Absolutely. We have experience integrating with a wide range of existing systems and technologies. Whether you need to connect with legacy systems, third-party APIs, or specific frameworks, our team can develop seamless integrations while ensuring data integrity and performance.</p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                <AccordionItem value="item-6" className="border border-blue-300/20 bg-white/95 rounded-lg overflow-hidden shadow-md">
                  <AccordionTrigger className="px-6 py-4 hover:bg-blue-50 transition-colors">
                    <div className="text-left font-medium text-lg">What payment terms do you offer?</div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2 text-gray-600">
                    <p>We typically work with a milestone-based payment structure. This includes an initial deposit, followed by payments at predetermined project milestones. For ongoing services, we offer monthly or quarterly billing options. We accept various payment methods including credit cards and bank transfers.</p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            </Accordion>
            
            <motion.div 
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <p className="text-gray-300 mb-6">Still have questions? We're here to help.</p>
              <Link href="/contact">
                <Button className="bg-white text-primary hover:bg-white/90 shadow-md">
                  Contact Our Team
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary to-blue-600 text-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 -translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-20"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Ready to Bring Your Vision to Life?
              </h2>
              <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto">
                Our team of experts is ready to turn your ideas into reality with the perfect software solution
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link href="/contact">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button className="bg-white text-primary hover:bg-white/90 font-medium px-8 py-6 text-lg w-full sm:w-auto shadow-lg">
                      Schedule a Consultation
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/portfolio">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button className="bg-transparent text-white border-2 border-white/30 hover:bg-white/10 font-medium px-8 py-6 text-lg w-full sm:w-auto">
                      View Our Portfolio
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="mt-16 py-6 px-8 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl mt-1">💬</div>
                <div>
                  <p className="italic text-white/90 mb-4">
                    "AdiTeke's team transformed our business with their custom software solution. Their expertise and attention to detail exceeded our expectations."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 mr-3"></div>
                    <div>
                      <p className="font-semibold">Sarah Johnson</p>
                      <p className="text-sm text-white/70">CEO, Innovate Solutions</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesPage;
