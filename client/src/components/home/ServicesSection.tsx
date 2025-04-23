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
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Software Solutions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We provide a wide range of software development services to help businesses of all sizes achieve their digital transformation goals.
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
      className="relative overflow-hidden bg-white rounded-xl p-8 shadow-md border border-gray-100 group"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        y: -8,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)"
      }}
    >
      {/* Enhanced background effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Service Icon with pulsing animation on hover */}
      <motion.div 
        className="relative w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 border border-primary/20 group-hover:border-primary/50"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {getServiceIcon(icon)}
        
        {/* Subtle pulse animation on hover */}
        <motion.div 
          className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            times: [0, 0.5, 1]
          }}
        />
      </motion.div>
      
      {/* Service title with subtle effect */}
      <motion.h3 
        className="text-xl font-bold mb-3 text-gray-800 group-hover:text-primary transition-colors duration-300"
        initial={{ x: 0 }}
        whileHover={{ x: 5 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
      >
        {title}
      </motion.h3>
      
      {/* Description with better color for readability */}
      <p className="text-gray-600 mb-5 leading-relaxed">
        {description}
      </p>
      
      {/* Enhanced learn more link with sliding underline and arrow animation */}
      <div className="relative inline-block">
        <Link href={href} className="text-primary font-medium inline-flex items-center group-hover:text-primary-dark transition-colors">
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
          >
            →
          </motion.div>
        </Link>
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300"
        />
      </div>
    </motion.div>
  );
};

export default ServicesSection;
