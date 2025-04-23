import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { SERVICES } from '@/lib/constants';
import { Service } from '@shared/schema';
import { Code, Database, Globe, Layers, Lightbulb, Lock, MonitorSmartphone, ShieldCheck, Smartphone, Tablet, Terminal } from 'lucide-react';

const ServicesSection = () => {
  const { data: services, isLoading, error } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  return (
    <section id="services" className="relative py-20 overflow-hidden">
      {/* Advanced background with gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#071336]/95 to-white/95 pointer-events-none"></div>
      
      {/* Animated mesh background with floating orbs */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#4C75E6_0%,transparent_50%)]"></div>
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_80%_80%,#4098D2_0%,transparent_40%)]"></div>
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_20%_60%,#37B9BE_0%,transparent_30%)]"></div>
        
        {/* Floating orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              width: `${30 + i * 10}px`,
              height: `${30 + i * 10}px`,
              background: i % 2 === 0 ? 'radial-gradient(circle at center, #4C75E6, #4098D2)' : 'radial-gradient(circle at center, #37B9BE, #2A9D8F)',
              filter: 'blur(8px)'
            }}
            animate={{
              y: [0, -15, 0],
              x: [0, i % 2 === 0 ? 10 : -10, 0],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16 relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative elements */}
          <motion.div 
            className="absolute left-1/2 -top-10 w-40 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          {/* Enhanced title with gradient text */}
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3b82f6] to-[#38bdf8]">
              Our Software Solutions
            </span>
            {/* Subtle accent dot */}
            <motion.span 
              className="absolute -right-4 top-0 text-primary"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >.</motion.span>
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto relative backdrop-blur-sm bg-white/30 px-6 py-3 rounded-lg">
            We provide a wide range of software development services to help businesses of all sizes achieve their digital transformation goals.
            <motion.span 
              className="absolute -bottom-1 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </p>
        </motion.div>
        
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
            services?.map((service, index) => (
              <ServiceCard 
                key={service.id}
                title={service.title}
                description={service.shortDescription}
                icon={service.icon}
                href={`/services#${service.title.toLowerCase().replace(/\s+/g, '-')}`}
                index={index}
              />
            ))
          )}
          
          {/* If no data from API yet, fallback to the constants */}
          {!isLoading && !error && (!services || services.length === 0) && 
            SERVICES.map((service, index) => (
              <ServiceCard 
                key={index}
                title={service.title}
                description={service.description}
                icon={service.icon}
                href={service.href}
                index={index}
              />
            ))
          }
        </div>
      </div>
    </section>
  );
};

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  index: number;
}

// Function to get the appropriate icon based on service type
const getServiceIcon = (iconName: string) => {
  // Map font-awesome icon names to Lucide icons
  switch(iconName) {
    case 'fa-laptop-code':
      return <Code className="h-6 w-6" />;
    case 'fa-mobile-alt':
      return <Smartphone className="h-6 w-6" />;
    case 'fa-globe':
      return <Globe className="h-6 w-6" />;
    case 'fa-database':
      return <Database className="h-6 w-6" />;
    case 'fa-shield-alt':
      return <ShieldCheck className="h-6 w-6" />;
    case 'fa-layer-group':
      return <Layers className="h-6 w-6" />;
    case 'fa-lightbulb':
      return <Lightbulb className="h-6 w-6" />;
    case 'fa-tablet-alt':
      return <Tablet className="h-6 w-6" />;
    case 'fa-lock':
      return <Lock className="h-6 w-6" />;
    case 'fa-terminal':
      return <Terminal className="h-6 w-6" />;
    case 'fa-desktop':
    case 'fa-tv':
      return <MonitorSmartphone className="h-6 w-6" />;
    default:
      return <Code className="h-6 w-6" />;
  }
};

const ServiceCard = ({ title, description, icon, href, index }: ServiceCardProps) => {
  return (
    <motion.div 
      className="relative overflow-hidden backdrop-blur-sm bg-white/60 rounded-xl p-8 shadow-lg border border-white/40 group"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        y: -8,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
      }}
    >
      {/* Glossy background with gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40 opacity-80 group-hover:opacity-95 transition-all duration-300" />
      
      {/* Color accent */}
      <div className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r from-primary/80 via-primary to-primary/50 group-hover:h-1.5 transition-all duration-300"></div>
      
      {/* Service Icon with enhanced animation */}
      <motion.div 
        className="relative z-10 w-16 h-16 rounded-lg flex items-center justify-center mb-6 text-white shadow-md bg-gradient-to-br from-primary to-primary/80 group-hover:shadow-primary/30 transition-all duration-300 border border-primary/20"
        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {getServiceIcon(icon)}
        
        {/* Glowing pulse animation */}
        <motion.div 
          className="absolute inset-0 rounded-lg bg-primary/10 opacity-0 group-hover:opacity-100"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            times: [0, 0.5, 1]
          }}
        />
        
        {/* Subtle shadow enhancement */}
        <div className="absolute -inset-1 bg-primary/20 rounded-lg blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300 -z-10"></div>
      </motion.div>
      
      {/* Service title with enhanced effect */}
      <motion.h3 
        className="relative z-10 text-xl font-bold mb-3 text-gray-800 group-hover:text-primary transition-colors duration-300"
        initial={{ x: 0 }}
        whileHover={{ x: 5 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
      >
        {title}
      </motion.h3>
      
      {/* Description with enhanced styling */}
      <p className="relative z-10 text-gray-600 mb-5 leading-relaxed">
        {description}
      </p>
      
      {/* Enhanced learn more link with improved animation */}
      <div className="relative z-10 inline-block">
        <a 
          href={href} 
          className="text-primary font-medium inline-flex items-center group-hover:text-primary-dark transition-colors cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = href;
          }}
        >
          <span className="mr-2">Learn more</span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
              times: [0, 0.6, 1]
            }}
            className="group-hover:font-bold"
          >
            →
          </motion.div>
        </a>
        
        {/* Advanced animated underline */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/80 to-primary/50 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300"
        />
      </div>
      
      {/* Subtle corner accent */}
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  );
};

export default ServicesSection;
