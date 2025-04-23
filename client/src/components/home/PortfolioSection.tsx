import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { PORTFOLIO_CATEGORIES } from '@/lib/constants';
import { Project } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowRightCircle, ExternalLink, Eye, Code, Database, Server, Layout } from 'lucide-react';

const PortfolioSection = () => {
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
    <section id="portfolio" className="py-28 relative overflow-hidden">
      {/* High-end gradient background */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/90 via-white to-primary/5"></div>
      </div>
      
      {/* Decorative patterns and elements */}
      <div className="absolute inset-0 -z-10">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#8b8b8b_1px,transparent_1px),linear-gradient(to_bottom,#8b8b8b_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        {/* Circle decorations */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-blue-400/5 blur-3xl"></div>
        
        {/* Tech-themed floating elements */}
        {['database', 'code', 'server', 'layout'].map((item, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${15 + i * 20}%`,
              left: `${80 - i * 15}%`,
              opacity: 0.07,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, i % 2 === 0 ? 5 : -5, 0]
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {item === 'database' && <Database size={48} />}
            {item === 'code' && <Code size={48} />}
            {item === 'server' && <Server size={48} />}
            {item === 'layout' && <Layout size={48} />}
          </motion.div>
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Modern heading with accent decorations */}
          <motion.div
            className="inline-block"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50"></div>
              <div className="uppercase tracking-wide text-sm font-medium text-primary/80">Featured Work</div>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50"></div>
            </div>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-primary">
            Our Portfolio
          </h2>
          
          <div className="relative">
            <p className="text-gray-600 text-lg leading-relaxed mx-auto mb-8 max-w-2xl">
              Explore our successful projects that have helped businesses transform their digital presence and operations.
            </p>
            
            {/* Subtle decorative glow */}
            <div className="absolute left-1/4 right-1/4 -bottom-4 h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          </div>
        </motion.div>
        
        {/* Enhanced Portfolio Filter with glass-morphic styling */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-white/30 backdrop-blur-md p-2 rounded-full border border-white/40 shadow-lg flex flex-wrap justify-center">
            {PORTFOLIO_CATEGORIES.map((category, index) => {
              // Determine which icon to use based on category
              const getIconForCategory = (value: string) => {
                switch(value) {
                  case 'web': return <Layout className="mr-2 h-4 w-4" />;
                  case 'mobile': return <Server className="mr-2 h-4 w-4" />;
                  case 'ai': return <Code className="mr-2 h-4 w-4" />;
                  case 'ecommerce': return <Database className="mr-2 h-4 w-4" />;
                  default: return null;
                }
              };
              
              return (
                <motion.button
                  key={index}
                  className={`
                    relative px-6 py-2.5 rounded-full font-medium text-sm flex items-center
                    ${index > 0 ? 'ml-1' : ''}
                    ${activeFilter === category.value
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-transparent text-gray-700 hover:bg-white/80'}
                    transition-all duration-300 overflow-hidden
                  `}
                  onClick={() => handleFilterChange(category.value)}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: activeFilter !== category.value ? "0 4px 12px rgba(0, 0, 0, 0.05)" : "none"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Background glow effect when active */}
                  {activeFilter === category.value && (
                    <motion.div 
                      className="absolute inset-0 bg-primary opacity-20 blur-sm -z-10"
                      layoutId="filterGlow"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  {/* Content with optional icon */}
                  <span className="flex items-center">
                    {category.value !== 'all' && getIconForCategory(category.value)}
                    {category.label}
                  </span>
                  
                  {/* Subtle hover effect */}
                  <span className="absolute inset-0 rounded-full bg-white/0 hover:bg-white/5 transition-colors duration-300"></span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
        
        {/* Portfolio Grid */}
        {/* Enhanced Portfolio Grid with staggered animation */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {isLoading ? (
            // Enhanced skeleton loaders with glass-morphic styling
            Array(6).fill(null).map((_, index) => (
              <div key={index} className="rounded-xl overflow-hidden shadow-lg animate-pulse bg-white/40 backdrop-blur-sm border border-white/40">
                <div className="bg-gray-200/80 h-64 w-full"></div>
                <div className="p-6">
                  <div className="h-5 w-2/3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : error ? (
            // Enhanced error message with retry button
            <div className="col-span-full text-center py-16">
              <div className="bg-red-50 text-red-600 p-6 rounded-lg inline-flex flex-col items-center max-w-md mx-auto">
                <div className="text-red-500 mb-4">
                  <ExternalLink size={32} />
                </div>
                <p className="mb-4">Failed to load projects. Please try again later.</p>
                <Button 
                  variant="outline" 
                  className="bg-white border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            // Show filtered projects with enhanced animation
            <AnimatePresence>
              {filteredProjects?.map((project, index) => (
                <ProjectCard 
                  key={project.id}
                  title={project.title}
                  description={project.description}
                  image={project.thumbnail}
                  index={index}
                  category={project.category}
                />
              ))}
            </AnimatePresence>
          )}
        </motion.div>
        
        {/* Enhanced "View All Projects" button */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/portfolio">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Button className="group relative overflow-hidden inline-flex items-center px-8 py-6 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20">
                {/* Button shine effect */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                
                <span className="mr-3 text-base">View All Projects</span>
                <motion.div
                  className="relative"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                    times: [0, 0.6, 1] 
                  }}
                >
                  <ArrowRightCircle className="h-5 w-5" />
                </motion.div>
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  index: number;
  category: string[];
}

const ProjectCard = ({ title, description, image, index, category }: ProjectCardProps) => {
  // Define the technology icon based on category
  const getTechIcon = () => {
    if (category.includes('ai')) return <Code className="h-5 w-5 mr-1" />;
    if (category.includes('mobile')) return <Server className="h-5 w-5 mr-1" />;
    if (category.includes('web')) return <Layout className="h-5 w-5 mr-1" />;
    if (category.includes('ecommerce')) return <Database className="h-5 w-5 mr-1" />;
    return <Layout className="h-5 w-5 mr-1" />;
  };
  
  return (
    <motion.div 
      className="group"
      variants={{
        hidden: { opacity: 0, y: 50 },
        show: { opacity: 1, y: 0 }
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative overflow-hidden rounded-xl shadow-xl h-full bg-white/70 backdrop-blur-sm border border-white/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
        {/* Image container with enhanced hover effects */}
        <div className="relative h-64 overflow-hidden">
          {/* Category badge */}
          <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-primary shadow-sm border border-white/80 flex items-center">
            {getTechIcon()}
            {category[0].charAt(0).toUpperCase() + category[0].slice(1)}
          </div>
          
          {/* Image with hover effects */}
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110 group-hover:brightness-[0.85]"
            loading="lazy"
          />
          
          {/* Gradient overlay that reveals on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* View button that reveals on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
            <Link 
              href={`/portfolio/${title.toLowerCase().replace(/\s+/g, '-')}`} 
              className="bg-white/90 backdrop-blur-sm text-primary px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-white transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>View Details</span>
            </Link>
          </div>
        </div>
        
        {/* Content area with glass effect */}
        <div className="p-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/70 backdrop-blur-sm -z-10"></div>
          
          {/* Title with gradient on hover */}
          <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text group-hover:text-transparent transition-all duration-500">
            {title}
          </h3>
          
          {/* Description with enhanced styling */}
          <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
            {description}
          </p>
          
          {/* "View Case Study" link with animation */}
          <Link 
            href={`/portfolio/${title.toLowerCase().replace(/\s+/g, '-')}`} 
            className="inline-flex items-center text-primary font-medium hover:text-primary-dark transition-colors group/link text-sm"
          >
            View Case Study
            <ArrowRight className="ml-2 h-4 w-4 transform group-hover/link:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PortfolioSection;
