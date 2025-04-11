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

      {/* Portfolio Filter & Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {/* Portfolio Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {PORTFOLIO_CATEGORIES.map((category, index) => (
              <motion.button
                key={index}
                className={`px-5 py-2 rounded-full font-medium ${
                  activeFilter === category.value
                    ? 'bg-primary text-white'
                    : 'bg-light text-dark hover:bg-primary/10'
                } transition-colors`}
                onClick={() => handleFilterChange(category.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.label}
              </motion.button>
            ))}
          </div>
          
          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Show skeleton loaders while loading
              Array(6).fill(null).map((_, index) => (
                <div key={index} className="rounded-xl shadow-md overflow-hidden animate-pulse">
                  <div className="bg-gray-300 h-64 w-full"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : error ? (
              // Show error message
              <div className="col-span-full text-center text-red-500">
                <p>Failed to load projects. Please try again later.</p>
              </div>
            ) : (
              // Show filtered projects
              <AnimatePresence>
                {filteredProjects?.map((project) => (
                  <motion.div 
                    key={project.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    layout
                  >
                    <div className="relative overflow-hidden">
                      <img 
                        src={project.thumbnail} 
                        alt={project.title} 
                        className="w-full h-64 object-cover transition-transform hover:scale-110 duration-500"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-primary/80 text-white text-xs rounded-full">
                          {project.status}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                      <p className="text-gray-600 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.category.split(' ').map((cat, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                      <a 
                        href={`/portfolio/${project.id}`} 
                        className="inline-flex items-center text-primary font-medium hover:text-accent transition-colors"
                      >
                        View Case Study
                        <i className="fas fa-arrow-right ml-2"></i>
                      </a>
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
