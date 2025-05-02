import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PORTFOLIO_CATEGORIES } from '@/lib/constants';
import { Project } from '@shared/schema';
import { Button } from '@/components/ui/button';

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

      {/* Hero Section - Completely Redesigned */}
      <section className="relative py-32 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:80px_80px] opacity-20"></div>
        <div className="absolute top-0 right-0 w-full h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-full h-96 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 opacity-70"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:pr-12"
            >
              <div className="inline-flex items-center mb-6 text-sm px-3 py-1 bg-primary/10 text-primary rounded-full">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Success Stories
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Portfolio</span> of Exceptional Work
              </h1>
              
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Discover how we've partnered with businesses to transform their digital presence and drive tangible results through innovative software solutions.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-8">
                <a href="#portfolio-grid" className="inline-flex">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button className="bg-primary hover:bg-primary/90 text-white py-6 px-8 rounded-lg font-medium text-lg">
                      Explore Our Work
                    </Button>
                  </motion.div>
                </a>
                <a href="/contact" className="inline-flex">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/5 py-6 px-8 rounded-lg font-medium text-lg">
                      Discuss Your Project
                    </Button>
                  </motion.div>
                </a>
              </div>
              
              {/* Client Stats */}
              <div className="mt-12 grid grid-cols-2 gap-6">
                <motion.div 
                  className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-gray-900">24/7</p>
                      <p className="text-gray-600">Customer Support</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl mr-4">
                      💯
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-gray-900">98%</p>
                      <p className="text-gray-600">Client Satisfaction</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              {/* Project Showcase - Stacked Cards Effect */}
              <div className="relative h-[500px]">
                {/* Background decorative element */}
                <div className="absolute right-0 top-0 w-72 h-72 bg-gradient-to-br from-primary/30 to-blue-400/30 rounded-full blur-3xl -z-10 opacity-50"></div>
                
                {/* Card 1 */}
                <motion.div 
                  className="absolute top-0 right-0 w-[85%] h-[280px] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform rotate-3 z-10"
                  animate={{ 
                    rotate: [3, 2, 3],
                    y: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                  <div className="h-1/2 bg-gray-200 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-90"></div>
                  </div>
                  <div className="p-4">
                    <div className="w-2/3 h-4 bg-gray-300 rounded-full mb-2"></div>
                    <div className="w-1/2 h-3 bg-gray-200 rounded-full"></div>
                  </div>
                </motion.div>
                
                {/* Card 2 */}
                <motion.div 
                  className="absolute top-[100px] right-[40px] w-[85%] h-[280px] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform -rotate-2 z-20"
                  animate={{ 
                    rotate: [-2, -3, -2],
                    y: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
                  <div className="h-1/2 bg-gray-200 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-green-500 to-teal-600 opacity-90"></div>
                  </div>
                  <div className="p-4">
                    <div className="w-2/3 h-4 bg-gray-300 rounded-full mb-2"></div>
                    <div className="w-1/2 h-3 bg-gray-200 rounded-full"></div>
                  </div>
                </motion.div>
                
                {/* Card 3 - Main Featured Project */}
                <motion.div 
                  className="absolute top-[200px] right-[80px] w-[85%] h-[280px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30"
                  animate={{ 
                    y: [0, -8, 0]
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="h-3/5 bg-gray-200 overflow-hidden relative">
                    <div className="w-full h-full bg-gradient-to-br from-primary to-blue-600 opacity-90 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">AdiTeke</span>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white border border-white/20">
                      Featured
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="font-medium mb-1">Enterprise Solution</div>
                    <div className="text-sm text-gray-500 mb-3">Full-stack web application with advanced analytics</div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">React</span>
                      <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">Node.js</span>
                      <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">PostgreSQL</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-16" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 48H48C96 48 192 48 288 42.7C384 37 480 27 576 32C672 37 768 59 864 64C960 69 1056 59 1152 53.3C1248 48 1344 48 1392 48H1440V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0V48Z" fill="#04102D" fillOpacity="0.03"/>
          </svg>
        </div>
      </section>

      {/* Portfolio Grid Section - Completely Enhanced */}
      <section id="portfolio-grid" className="py-24 bg-gradient-to-b from-[#04102D] to-[#071336] relative overflow-hidden">
        {/* Animated backdrop elements */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b8b8b_1px,transparent_1px),linear-gradient(to_bottom,#8b8b8b_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          
          {/* Decorative circles/blobs */}
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-500/30 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-400/20 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4">
              <div className="flex items-center justify-center">
                <div className="h-px w-8 bg-blue-400/50"></div>
                <div className="mx-3 text-blue-300 text-lg">✨</div>
                <div className="h-px w-8 bg-blue-400/50"></div>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Project Portfolio</span>
            </h2>
            <p className="text-blue-100/80 max-w-2xl mx-auto">
              Browse through our successful projects and discover how we've delivered innovative solutions across various industries
            </p>
          </motion.div>
          
          {/* Enhanced Portfolio Filter */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-xl flex flex-wrap justify-center">
              {PORTFOLIO_CATEGORIES.map((category, index) => (
                <motion.button
                  key={index}
                  className={`px-6 py-2.5 rounded-full font-medium ${
                    activeFilter === category.value
                      ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/20'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  } transition-all mx-1`}
                  onClick={() => handleFilterChange(category.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    {category.label}
                  </motion.span>
                </motion.button>
              ))}
            </div>
          </motion.div>
          
          {/* Enhanced Portfolio Grid with Masonry Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-16">
            {isLoading ? (
              // Enhanced skeleton loaders with modern design
              Array(6).fill(null).map((_, index) => (
                <motion.div 
                  key={index} 
                  className="relative overflow-hidden rounded-xl backdrop-blur-sm shadow-xl h-full bg-white/5 border border-white/10 animate-pulse"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="bg-white/5 h-72 w-full relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-blue-500/5 to-transparent"></div>
                  </div>
                  <div className="p-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/20 backdrop-blur-sm -z-10"></div>
                    <div className="h-6 bg-white/10 rounded-md w-3/4 mb-4"></div>
                    <div className="h-4 bg-white/10 rounded-md mb-3 w-full"></div>
                    <div className="h-4 bg-white/10 rounded-md w-2/3 mb-6"></div>
                    <div className="flex gap-2 mb-6">
                      <div className="h-6 w-16 bg-white/10 rounded-full"></div>
                      <div className="h-6 w-16 bg-white/10 rounded-full"></div>
                    </div>
                    <div className="h-4 w-32 bg-white/10 rounded-md"></div>
                  </div>
                </motion.div>
              ))
            ) : error ? (
              // Enhanced error message with better UX
              <div className="col-span-full text-center py-20">
                <motion.div 
                  className="bg-red-900/20 backdrop-blur-sm text-red-200 p-10 rounded-2xl inline-flex flex-col items-center max-w-xl mx-auto border border-red-500/20 shadow-xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-red-300 mb-6 relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full -z-10"></div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-red-100">Unable to Load Projects</h3>
                  <p className="mb-6 text-lg max-w-md">We're currently experiencing some technical difficulties loading the portfolio. Please try again in a moment.</p>
                  <button 
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 transition-colors shadow-lg flex items-center gap-2"
                    onClick={() => window.location.reload()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                      <path d="M3 3v5h5"></path>
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                      <path d="M16 21h5v-5"></path>
                    </svg>
                    <span>Retry Loading</span>
                  </button>
                </motion.div>
              </div>
            ) : (
              // Show filtered projects with enhanced cards
              <AnimatePresence mode="sync">
                {filteredProjects?.map((project, index) => (
                  <motion.div 
                    key={project.id}
                    className="group relative"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    layout
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <div className="relative overflow-hidden rounded-xl backdrop-blur-sm shadow-xl h-full bg-white/5 border border-white/10 hover:shadow-2xl hover:shadow-primary/10 hover:border-white/20 transition-all duration-500">
                      {/* Image container with enhanced hover effects */}
                      <div className="relative h-[280px] overflow-hidden">
                        {/* Status badge with glass effect */}
                        <div className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-sm border border-white/10 flex items-center">
                          <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
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
                                fallback.className = 'absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/80 to-blue-600/80';
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
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* View button that reveals on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                          <a 
                            href={`/portfolio/${project.id}`}
                            className="bg-white text-primary px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 hover:bg-white/90 transition-colors border border-white/20"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span>View Project</span>
                          </a>
                        </div>
                      </div>
                      
                      {/* Content area with enhanced glass effect */}
                      <div className="p-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/20 backdrop-blur-sm -z-10"></div>
                        
                        {/* Title with enhanced styling */}
                        <h3 className="text-xl font-bold mb-3 text-white group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-300 transition-all duration-500">
                          {project.title}
                        </h3>
                        
                        {/* Description with enhanced styling */}
                        <p className="text-gray-300 mb-5 line-clamp-2 text-sm leading-relaxed">
                          {project.description}
                        </p>
                        
                        {/* Category tags with enhanced styling */}
                        <div className="flex flex-wrap gap-2 mb-5">
                          {typeof project.category === 'string' ? (
                            project.category.split(' ').map((cat: string, index: number) => (
                              <span 
                                key={index}
                                className="px-3 py-1 bg-white/10 backdrop-blur-sm text-blue-100 text-xs rounded-full border border-white/10 hover:bg-white/15 transition-colors"
                              >
                                {cat}
                              </span>
                            ))
                          ) : (
                            Array.isArray(project.category) && project.category.map((cat: string, index: number) => (
                              <span 
                                key={index}
                                className="px-3 py-1 bg-white/10 backdrop-blur-sm text-blue-100 text-xs rounded-full border border-white/10 hover:bg-white/15 transition-colors"
                              >
                                {cat}
                              </span>
                            ))
                          )}
                        </div>
                        
                        {/* Link with enhanced animation */}
                        <div className="flex justify-between items-center">
                          <a 
                            href={`/portfolio/${project.id}`} 
                            className="inline-flex items-center text-blue-300 font-medium hover:text-blue-200 transition-colors group/link text-sm"
                          >
                            View Case Study
                            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4 transform group-hover/link:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                              <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                          </a>
                          
                          {/* Project date badge */}
                          {project.startDate && (
                            <div className="text-xs text-gray-400">
                              {new Date(project.startDate).getFullYear()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
          
          {/* CTA Button */}
          {filteredProjects && filteredProjects.length > 0 && (
            <motion.div 
              className="flex justify-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <a href="/contact" className="inline-flex">
                <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white px-8 py-6 rounded-lg text-lg shadow-lg shadow-primary/20">
                  Start Your Project
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Button>
              </a>
            </motion.div>
          )}
        </div>
      </section>

      {/* Enhanced Case Study Preview Section */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30"></div>
        <div className="absolute left-0 top-0 w-full h-72 bg-gradient-to-b from-white via-transparent to-transparent"></div>
        <div className="absolute -left-32 bottom-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute -right-32 top-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl opacity-70"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4">
              <div className="flex items-center justify-center">
                <div className="h-px w-8 bg-primary/30"></div>
                <div className="mx-3 text-primary text-lg">📊</div>
                <div className="h-px w-8 bg-primary/30"></div>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Case Study</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Discover how we helped a leading company transform their digital presence and business operations with our innovative software solution.
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
              <div className="bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full inline-block">
                    E-commerce Solution
                  </span>
                  <span className="text-sm text-gray-500">December 2023</span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">FashionRetail Inc. E-commerce Platform</h3>
                
                <div className="space-y-5 mb-8">
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-800 text-lg">The Challenge</h4>
                    </div>
                    <p className="text-gray-600 pl-11 leading-relaxed">
                      FashionRetail needed a modern e-commerce platform that could handle their extensive product catalog and provide a seamless shopping experience for their customers across all devices.
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                          <path d="M2 17l10 5 10-5"></path>
                          <path d="M2 12l10 5 10-5"></path>
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-800 text-lg">Our Solution</h4>
                    </div>
                    <p className="text-gray-600 pl-11 leading-relaxed">
                      We developed a custom e-commerce platform with advanced search functionality, personalized recommendations, and a streamlined checkout process. The solution included a robust admin dashboard for inventory management and real-time sales analytics.
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                      <h4 className="font-bold text-gray-800 text-lg">The Results</h4>
                    </div>
                    <ul className="text-gray-600 pl-11 space-y-2">
                      <li className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        75% increase in online sales within three months
                      </li>
                      <li className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        50% reduction in cart abandonment rate
                      </li>
                      <li className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        35% improvement in customer engagement metrics
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 mb-8">
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">React.js</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Node.js</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">PostgreSQL</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Stripe</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">AWS</span>
                </div>
                
                <a 
                  href="/case-studies/fashionretail"
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-md"
                >
                  Read Full Case Study
                  <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
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
                {/* Main Case Study Image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80" 
                    alt="E-commerce Case Study" 
                    className="w-full h-[500px] object-cover"
                    onError={(e) => {
                      // If image fails to load, display a gradient background
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentNode as HTMLElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'absolute inset-0 bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center';
                        const text = document.createElement('div');
                        text.className = 'text-white text-3xl font-bold';
                        text.textContent = 'FashionRetail Inc. Case Study';
                        fallback.appendChild(text);
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                  
                  {/* Overlay with KPIs */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-end">
                    <div className="p-8 w-full">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                          </svg>
                        </div>
                        <div>
                          <div className="text-white font-bold text-lg">Client Success Story</div>
                          <div className="text-gray-300">Completed in 4 months</div>
                        </div>
                      </div>
                      
                      {/* Result Metrics */}
                      <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                          <div className="text-white text-3xl font-bold">75%</div>
                          <div className="text-gray-300 text-sm">Increase in Sales</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                          <div className="text-white text-3xl font-bold">50%</div>
                          <div className="text-gray-300 text-sm">Reduced Cart Abandonment</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                          <div className="text-white text-3xl font-bold">4.8</div>
                          <div className="text-gray-300 text-sm">Customer Rating</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating UI Preview Cards */}
                <motion.div 
                  className="absolute -right-5 -top-10 w-36 h-36 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 z-10"
                  animate={{ 
                    y: [0, -8, 0],
                    rotate: [0, 2, 0]
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <div className="h-1/2 mb-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg"></div>
                  <div className="h-2 bg-gray-200 rounded-full mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded-full w-2/3"></div>
                </motion.div>
                
                <motion.div 
                  className="absolute -left-8 -bottom-8 w-48 h-48 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-10"
                  animate={{ 
                    y: [0, 8, 0],
                    rotate: [0, -1, 0]
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full mr-2"></div>
                    <div>
                      <div className="h-2 bg-gray-200 rounded-full w-16 mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded-full w-10"></div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded-full mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded-full w-3/4 mb-4"></div>
                  <div className="h-8 bg-primary/20 rounded-lg"></div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials section removed for future implementation */}

      {/* Enhanced CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-primary to-blue-700">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_2px,transparent_2px),linear-gradient(to_right,rgba(255,255,255,0.03)_2px,transparent_2px)] bg-[size:40px_40px]"></div>
          <div className="absolute top-0 left-0 w-full h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-full h-96 bg-blue-900/10 rounded-full blur-3xl translate-y-1/2 opacity-50"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left content */}
            <motion.div 
              className="lg:col-span-7"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-white max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Ready to Transform Your Digital Presence?
                </h2>
                <p className="text-xl md:text-2xl text-white/80 leading-relaxed mb-10">
                  Let's collaborate to create innovative software solutions that drive real business growth and delight your customers.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="text-white/90">Tailored solutions built for your specific business needs</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="text-white/90">Expert team with proven track record of success</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p className="text-white/90">Ongoing support and maintenance to ensure long-term success</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-5 mt-10">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <a 
                      href="/contact" 
                      className="inline-flex items-center px-8 py-4 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-lg text-lg"
                    >
                      Get a Free Consultation
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </a>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <a 
                      href="/services" 
                      className="inline-flex items-center px-8 py-4 bg-transparent text-white border border-white/30 font-medium rounded-lg hover:bg-white/10 transition-colors text-lg"
                    >
                      Explore Our Services
                    </a>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            
            {/* Right form/contact card */}
            <motion.div 
              className="lg:col-span-5"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 transform lg:-rotate-2 hover:rotate-0 transition-transform duration-500">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">Request Information</h3>
                
                <div className="space-y-5">
                  <div className="flex items-center p-4 bg-primary/5 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Call Us</div>
                      <a href="tel:+16414818560" className="text-primary hover:underline">+1 (641) 481-8560</a>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-primary/5 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Email Us</div>
                      <a href="mailto:support@aditeke.com" className="text-primary hover:underline">support@aditeke.com</a>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-primary/5 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Visit Us</div>
                      <p className="text-gray-600">Portland, OR 97222</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <a 
                    href="/contact" 
                    className="inline-block w-full py-4 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-md"
                  >
                    Schedule a Meeting
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PortfolioPage;
