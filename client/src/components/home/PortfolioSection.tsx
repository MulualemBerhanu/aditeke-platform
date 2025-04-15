import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { PORTFOLIO_CATEGORIES } from '@/lib/constants';
import { Project } from '@shared/schema';
import { Button } from '@/components/ui/button';

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
    <section id="portfolio" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Portfolio</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our successful projects that have helped businesses transform their digital presence and operations.
          </p>
        </motion.div>
        
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
              {filteredProjects?.map((project, index) => (
                <ProjectCard 
                  key={project.id}
                  title={project.title}
                  description={project.description}
                  image={project.thumbnail}
                  index={index}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/portfolio">
            <Button className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors">
              View All Projects
              <i className="fas fa-arrow-right ml-2"></i>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  index: number;
}

const ProjectCard = ({ title, description, image, index }: ProjectCardProps) => {
  return (
    <motion.div 
      className="group"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="relative overflow-hidden rounded-xl shadow-md">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-64 object-cover transform transition-transform group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-white/80 mb-4">{description}</p>
            <Link href={`/portfolio/${title.toLowerCase().replace(/\s+/g, '-')}`} className="inline-flex items-center text-white hover:text-accent transition-colors">
              View Case Study
              <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PortfolioSection;
