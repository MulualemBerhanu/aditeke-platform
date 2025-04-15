import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { SERVICES } from '@/lib/constants';
import { Service } from '@shared/schema';

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

const ServiceCard = ({ title, description, icon, href, index }: ServiceCardProps) => {
  return (
    <motion.div 
      className="bg-light rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow group hover:border-primary border border-transparent"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
        <i className={`fas ${icon} text-2xl`}></i>
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link href={href} className="text-primary font-medium inline-flex items-center group-hover:text-accent transition-colors">
        Learn more 
        <i className="fas fa-arrow-right ml-2 transition-transform group-hover:translate-x-1"></i>
      </Link>
    </motion.div>
  );
};

export default ServicesSection;
