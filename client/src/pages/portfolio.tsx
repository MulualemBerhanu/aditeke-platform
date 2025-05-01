import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PORTFOLIO_CATEGORIES } from '@/lib/constants';
import { Project } from '@shared/schema';

const PortfolioPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const { data: projects, isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const handleFilterChange = (category: string) => {
    setActiveFilter(category);
  };

  // Filter projects based on active filter
  const filteredProjects = projects?.filter(project => {
    if (activeFilter === 'all') return true;
    return project.category.includes(activeFilter);
  });

  return (
    <>
      <Helmet>
        <title>Portfolio | AdiTeke Software Solutions</title>
        <meta name="description" content="Explore our portfolio of successful software development projects including web applications, mobile apps, AI solutions, and e-commerce platforms." />
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Portfolio</h1>
            <p className="text-xl text-gray-700 mb-8">
              Discover how we've helped businesses transform their digital presence through innovative software solutions
            </p>
          </motion.div>
        </div>
      </section>

      {/* Portfolio Filter & Grid - Updated with dark background for glass-morphism */}
      <section className="py-20 bg-gradient-to-b from-[#04102D] to-[#071336] relative overflow-hidden">
        {/* Animated backdrop elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b8b8b_1px,transparent_1px),linear-gradient(to_bottom,#8b8b8b_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          
          {/* Decorative circles/blobs */}
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-500/30 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Portfolio Filter - Updated with glass-morphism styling */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="p-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-xl flex flex-wrap justify-center">
              {PORTFOLIO_CATEGORIES.map((category, index) => (
                <motion.button
                  key={index}
                  className={`px-5 py-2 rounded-full font-medium ${
                    activeFilter === category.value
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  } transition-all mx-1`}
                  onClick={() => handleFilterChange(category.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.label}
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Enhanced skeleton loaders with glass-morphic styling
              Array(6).fill(null).map((_, index) => (
                <div key={index} className="relative overflow-hidden rounded-xl backdrop-blur-sm shadow-xl h-full bg-white/10 border border-white/20 animate-pulse">
                  <div className="bg-white/5 h-64 w-full"></div>
                  <div className="p-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/30 backdrop-blur-sm -z-10"></div>
                    <div className="h-6 bg-white/10 rounded-md w-3/4 mb-4"></div>
                    <div className="h-4 bg-white/10 rounded-md mb-3 w-full"></div>
                    <div className="h-4 bg-white/10 rounded-md w-2/3 mb-4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 w-16 bg-white/10 rounded-full"></div>
                      <div className="h-6 w-16 bg-white/10 rounded-full"></div>
                    </div>
                    <div className="h-4 w-32 bg-white/10 rounded-md"></div>
                  </div>
                </div>
              ))
            ) : error ? (
              // Enhanced error message with glass-morphic styling
              <div className="col-span-full text-center py-16">
                <div className="bg-red-900/20 backdrop-blur-sm text-red-300 p-8 rounded-lg inline-flex flex-col items-center max-w-md mx-auto border border-red-500/20">
                  <div className="text-red-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                  </div>
                  <p className="mb-4 text-lg">Failed to load projects. Please try again later.</p>
                  <button 
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md border border-white/10 transition-colors"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              // Show filtered projects
              <AnimatePresence>
                {filteredProjects?.map((project) => (
                  <motion.div 
                    key={project.id}
                    className="group relative"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    layout
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="relative overflow-hidden rounded-xl backdrop-blur-sm shadow-xl h-full bg-white/10 border border-white/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                      {/* Image container with enhanced hover effects */}
                      <div className="relative h-64 overflow-hidden">
                        {/* Status badge with glass effect */}
                        <div className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-sm border border-white/10 flex items-center">
                          {project.status}
                        </div>

                        {/* Project image */}
                        <div className="relative w-full h-full">
                          <img 
                            src={project.thumbnail} 
                            alt={project.title} 
                            className="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110 group-hover:brightness-[0.85]"
                            loading="lazy"
                            onError={(e) => {
                              // If image fails to load, display a colored background with project initials
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentNode as HTMLElement;
                              if (parent) {
                                const fallback = document.createElement('div');
                                fallback.className = 'absolute inset-0 flex items-center justify-center bg-primary/80';
                                const initials = document.createElement('span');
                                initials.className = 'text-white text-[120px] font-bold leading-none';
                                initials.textContent = project.title.split(' ').map(word => word[0]).join('');
                                fallback.appendChild(initials);
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        </div>
                        
                        {/* Gradient overlay that reveals on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* View button that reveals on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                          <a 
                            href={`/portfolio/${project.id}`}
                            className="bg-white/90 backdrop-blur-sm text-primary px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-white transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span>View Details</span>
                          </a>
                        </div>
                      </div>
                      
                      {/* Content area with glass effect */}
                      <div className="p-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/40 backdrop-blur-sm -z-10"></div>
                        
                        {/* Title with gradient on hover */}
                        <h3 className="text-xl font-bold mb-3 text-white group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-300 transition-all duration-500">
                          {project.title}
                        </h3>
                        
                        {/* Description with enhanced styling */}
                        <p className="text-gray-300 mb-4 line-clamp-2 text-sm">
                          {project.description}
                        </p>
                        
                        {/* Category tags with glass effect */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {typeof project.category === 'string' ? (
                            project.category.split(' ').map((cat: string, index: number) => (
                              <span 
                                key={index}
                                className="px-3 py-1 bg-white/10 backdrop-blur-sm text-gray-200 text-xs rounded-full border border-white/10"
                              >
                                {cat}
                              </span>
                            ))
                          ) : (
                            Array.isArray(project.category) && project.category.map((cat: string, index: number) => (
                              <span 
                                key={index}
                                className="px-3 py-1 bg-white/10 backdrop-blur-sm text-gray-200 text-xs rounded-full border border-white/10"
                              >
                                {cat}
                              </span>
                            ))
                          )}
                        </div>
                        
                        {/* Link with animation */}
                        <a 
                          href={`/portfolio/${project.id}`} 
                          className="inline-flex items-center text-blue-400 font-medium hover:text-blue-300 transition-colors group/link text-sm"
                        >
                          View Case Study
                          <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4 transform group-hover/link:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </section>

      {/* Case Study Preview Section */}
      <section className="py-20 bg-light">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Case Study</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore how we helped a leading company transform their business with our custom software solution.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="order-2 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white p-8 rounded-xl shadow-md">
                <span className="px-4 py-1 bg-primary/10 text-primary text-sm rounded-full mb-4 inline-block">E-commerce</span>
                <h3 className="text-2xl font-bold mb-4">FashionRetail Inc. E-commerce Platform</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-bold text-gray-800">The Challenge:</h4>
                    <p className="text-gray-600">
                      FashionRetail needed a modern e-commerce platform that could handle their extensive product catalog and provide a seamless shopping experience for their customers.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-800">Our Solution:</h4>
                    <p className="text-gray-600">
                      We developed a custom e-commerce platform with advanced search functionality, personalized recommendations, and a streamlined checkout process.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-800">The Results:</h4>
                    <ul className="list-disc pl-5 text-gray-600">
                      <li>75% increase in online sales within three months</li>
                      <li>50% reduction in cart abandonment rate</li>
                      <li>35% improvement in customer engagement metrics</li>
                    </ul>
                  </div>
                </div>
                
                <a 
                  href="/case-studies/fashionretail" 
                  className="inline-flex items-center text-primary font-medium hover:text-accent transition-colors"
                >
                  Read Full Case Study
                  <i className="fas fa-arrow-right ml-2"></i>
                </a>
              </div>
            </motion.div>
            
            <motion.div 
              className="order-1 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary/50 opacity-20 rounded-xl blur-lg transform scale-105"></div>
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80" 
                  alt="E-commerce platform case study" 
                  className="relative rounded-xl shadow-lg w-full"
                />
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="text-3xl font-bold text-primary">75%</div>
                  <div className="text-gray-600">Increase in Sales</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow">
                  <div className="text-3xl font-bold text-primary">50%</div>
                  <div className="text-gray-600">Reduced Abandonment</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 gradient-bg hero-pattern text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-4xl mb-6">❝</div>
            <blockquote className="text-xl md:text-2xl mb-6">
              <span className="font-bold">Adi<span className="text-blue-400">Teke</span></span> transformed our business with their custom e-commerce platform. The solution increased our online sales by 75% within the first three months. Their team was professional, responsive, and delivered exactly what we needed.
            </blockquote>
            <div className="flex items-center justify-center">
              <img 
                src="https://randomuser.me/api/portraits/women/12.jpg" 
                alt="Sarah Johnson" 
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div className="text-left">
                <div className="font-bold">Sarah Johnson</div>
                <div className="text-white/80">CEO, FashionRetail Inc.</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Project?</h2>
            <p className="text-xl text-gray-700 mb-8">
              Let's work together to create a software solution that transforms your business.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="/contact" 
                className="px-8 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors text-center"
              >
                Get a Free Consultation
              </a>
              <a 
                href="/services" 
                className="px-8 py-3 bg-light text-primary font-medium rounded-md hover:bg-light/90 transition-colors text-center"
              >
                Explore Our Services
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default PortfolioPage;
