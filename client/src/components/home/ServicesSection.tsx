import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { SERVICES } from '@/lib/constants';
import { Service } from '@shared/schema';
import { 
  Code, Database, Globe, Layers, Lightbulb, Lock, MonitorSmartphone, 
  ShieldCheck, Smartphone, Tablet, Terminal, Cloud, BrainCircuit, 
  BarChart3, Zap, TrendingUp, CircleDollarSign
} from 'lucide-react';
import Lottie from 'lottie-react';
import webDevAnimation from '@/assets/animations/web-development.json';
import mobileDevAnimation from '@/assets/animations/mobile-development.json';
import aiDevAnimation from '@/assets/animations/ai-development.json';
import dataAnimation from '@/assets/animations/data-analytics.json';
import securityAnimation from '@/assets/animations/security.json';
import cloudAnimation from '@/assets/animations/cloud.json';

// Feature highlights with animations
const FEATURE_HIGHLIGHTS = [
  { value: "Speed & Performance", icon: <Zap className="h-5 w-5" /> },
  { value: "Scalable Architecture", icon: <TrendingUp className="h-5 w-5" /> },
  { value: "AI Integration", icon: <BrainCircuit className="h-5 w-5" /> },
  { value: "Cost Effective", icon: <CircleDollarSign className="h-5 w-5" /> }
];

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const serviceCardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

// Interactive 3D Hexagon Grid Background Component
const HexagonGrid = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden opacity-50 pointer-events-none">
      <div className="absolute w-full h-full">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-24 h-24 opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              background: `rgba(${30 + Math.random() * 100}, ${100 + Math.random() * 155}, ${200 + Math.random() * 55}, 0.${5 + Math.floor(Math.random() * 5)})`
            }}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, Math.random() * 20 - 10, 0]
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Glowing Particles
const GlowingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-70 pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 10 + 3}px`,
            height: `${Math.random() * 10 + 3}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: `rgba(${100 + Math.random() * 155}, ${150 + Math.random() * 105}, ${240}, 0.${Math.floor(Math.random() * 9) + 1})`,
            filter: `blur(${Math.random() * 2 + 1}px)`
          }}
          animate={{
            y: [0, Math.random() * -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0.1, 0.8, 0.1]
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Enhanced Tabs
const ServiceTabs = ({ services, activeTab, setActiveTab }: { 
  services: any[], 
  activeTab: number, 
  setActiveTab: (index: number) => void 
}) => {
  return (
    <div className="mb-12 flex flex-wrap justify-center gap-3">
      {services.map((service, index) => (
        <motion.button
          key={index}
          className={`relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 
            ${activeTab === index 
              ? "text-white shadow-lg shadow-blue-500/20" 
              : "text-gray-600 hover:text-blue-600 bg-white/80 hover:bg-white shadow"
            }
          `}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => setActiveTab(index)}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.97 }}
        >
          {activeTab === index && (
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full -z-10"
              layoutId="activeTab"
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30
              }}
            />
          )}
          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline-block">{getServiceIcon(service.icon)}</span>
            <span>{service.title}</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

// Function to get the animation based on service type
const getServiceAnimation = (iconName: string) => {
  switch(iconName) {
    case 'fa-laptop-code':
      return webDevAnimation;
    case 'fa-mobile-alt':
      return mobileDevAnimation;
    case 'fa-brain':
      return aiDevAnimation;
    case 'fa-shield-alt':
      return securityAnimation;
    case 'fa-chart-line':
      return dataAnimation;
    case 'fa-cloud':
      return cloudAnimation;
    default:
      return webDevAnimation;
  }
};

const ServicesSection = () => {
  const { data: services, isLoading, error } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });
  
  const [activeTab, setActiveTab] = useState(0);
  const servicesData = services || SERVICES;
  const activeService = servicesData[activeTab];

  return (
    <section id="services" className="relative py-24 overflow-hidden">
      {/* Advanced background with gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#040B24] via-[#071336]/95 to-[#0A1B48]/90 pointer-events-none"></div>
      
      {/* Animated decorative elements */}
      <HexagonGrid />
      <GlowingParticles />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-12 relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Decorative elements */}
          <motion.div 
            className="relative mx-auto mb-2 w-24 h-1 bg-gradient-to-r from-blue-300/30 via-blue-400 to-blue-300/30"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          {/* Enhanced title with special effect */}
          <h2 className="relative text-4xl md:text-5xl font-extrabold mb-5 inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-200">
              Our Software Solutions
            </span>
            <motion.span 
              className="absolute -right-5 bottom-2 text-blue-400 text-5xl font-light"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            >.</motion.span>
            <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
          </h2>
          
          <p className="text-gray-300 max-w-3xl mx-auto text-lg relative px-6 py-2">
            Transforming business challenges into competitive advantages with cutting-edge software solutions 
            tailored to your unique requirements.
          </p>
          
          {/* Floating badges */}
          <motion.div
            className="flex flex-wrap justify-center gap-3 mt-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {FEATURE_HIGHLIGHTS.map((feature, index) => (
              <motion.div
                key={index}
                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-900/40 to-blue-700/40 backdrop-blur-md border border-blue-500/20 text-blue-200 shadow-xl shadow-blue-900/10"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="mr-2">{feature.icon}</span>
                <span className="font-medium">{feature.value}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        
        {/* Enhanced Interactive Tab System */}
        {isLoading ? (
          // Show skeleton loaders while loading
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array(3).fill(null).map((_, index) => (
              <div key={index} className="bg-blue-900/20 backdrop-blur-sm rounded-xl p-8 shadow-md animate-pulse border border-blue-500/10">
                <div className="w-14 h-14 rounded-lg bg-blue-800/50 mb-6"></div>
                <div className="h-6 bg-blue-800/50 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-blue-800/30 rounded mb-2"></div>
                <div className="h-4 bg-blue-800/30 rounded mb-4"></div>
                <div className="h-4 bg-blue-800/20 rounded w-2/5"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Show error message
          <div className="text-center text-red-400 bg-red-900/20 backdrop-blur-sm rounded-lg p-8 max-w-md mx-auto border border-red-500/20">
            <p>Failed to load services. Please try again later.</p>
          </div>
        ) : (
          <>
            <ServiceTabs
              services={servicesData}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            
            {/* Featured Service Showcase */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl border border-blue-500/20"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Animation/Visual Side */}
                  <div className="relative p-8 lg:p-12 flex items-center justify-center overflow-hidden group">
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-700/20 to-blue-500/5"></div>
                    
                    {/* Animated circles */}
                    <div className="absolute inset-0 overflow-hidden opacity-50">
                      <motion.div 
                        className="absolute w-[300px] h-[300px] rounded-full border border-blue-400/10"
                        style={{ top: '50%', left: '50%', x: '-50%', y: '-50%' }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.div 
                        className="absolute w-[400px] h-[400px] rounded-full border border-blue-400/20"
                        style={{ top: '50%', left: '50%', x: '-50%', y: '-50%' }}
                        animate={{ rotate: -360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.div 
                        className="absolute w-[500px] h-[500px] rounded-full border border-blue-400/10"
                        style={{ top: '50%', left: '50%', x: '-50%', y: '-50%' }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                    
                    {/* Service Illustration/Animation */}
                    <motion.div 
                      className="relative z-10 w-64 h-64 md:w-80 md:h-80"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <Lottie 
                        animationData={getServiceAnimation(activeService?.icon)} 
                        loop={true} 
                        className="w-full h-full"
                      />
                    </motion.div>
                    
                    {/* Glowing effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  </div>
                  
                  {/* Content Side */}
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      {/* Service Icon with enhanced animation */}
                      <motion.div 
                        className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-blue-500/20 bg-gradient-to-br from-blue-600 to-blue-400 border border-blue-300/20"
                        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        {getServiceIcon(activeService?.icon)}
                        
                        {/* Glowing pulse animation */}
                        <motion.div 
                          className="absolute inset-0 rounded-2xl bg-blue-400/20"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                      
                      {/* Title with gradient effect */}
                      <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white">
                        {activeService?.title}
                      </h3>
                      
                      {/* Description with enhanced styling */}
                      <p className="text-blue-100 mb-8 text-lg leading-relaxed">
                        {activeService?.description}
                      </p>
                      
                      {/* Feature list */}
                      <ul className="space-y-3 mb-8">
                        {['Tailored Solutions', 'Agile Development', 'Dedicated Support'].map((feature, idx) => (
                          <motion.li 
                            key={idx}
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + (idx * 0.1) }}
                          >
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center mt-0.5">
                              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            </div>
                            <span className="text-blue-100">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                      
                      {/* Enhanced CTA Button */}
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <a 
                          href={activeService?.href} 
                          className="relative inline-flex items-center px-8 py-3 overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg shadow-blue-500/30 group"
                        >
                          <span className="relative z-10 flex items-center">
                            Explore {activeService?.title}
                            <motion.span 
                              className="ml-2"
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              →
                            </motion.span>
                          </span>
                          <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        </a>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Service Grid - bottom part */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {servicesData.map((service, index) => (
                <ServiceCard 
                  key={index}
                  title={service.title}
                  description={service.description}
                  icon={service.icon}
                  href={service.href}
                  index={index}
                />
              ))}
            </motion.div>
          </>
        )}
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
    case 'fa-cloud':
      return <Cloud className="h-6 w-6" />;
    case 'fa-brain':
      return <BrainCircuit className="h-6 w-6" />;
    case 'fa-chart-line':
      return <BarChart3 className="h-6 w-6" />;
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
      className="relative overflow-hidden rounded-2xl shadow-xl group"
      variants={serviceCardVariants}
      whileHover={{ 
        y: -8,
        transition: { type: "spring", stiffness: 300, damping: 15 }
      }}
    >
      {/* Card background with glass morphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-blue-800/20 backdrop-blur-md border border-blue-500/20"></div>
      
      {/* Light effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-400/0 opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
      
      {/* Content wrapper */}
      <div className="relative z-10 p-8">
        {/* Service Icon with enhanced animation */}
        <motion.div 
          className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-blue-500/20 bg-gradient-to-br from-blue-600 to-blue-400 border border-blue-300/10"
          whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {getServiceIcon(icon)}
          
          {/* Glowing effect on hover */}
          <motion.div 
            className="absolute inset-0 rounded-2xl bg-blue-400/20 opacity-0 group-hover:opacity-100"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        
        {/* Service title with hover effect */}
        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-200 transition-colors duration-300">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-blue-100/80 mb-5 leading-relaxed line-clamp-3">
          {description}
        </p>
        
        {/* Enhanced 'Learn more' link with animation */}
        <div className="inline-block">
          <a 
            href={href} 
            className="text-blue-300 font-medium inline-flex items-center group-hover:text-blue-200 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = href;
            }}
          >
            <span className="mr-2">Explore service</span>
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              →
            </motion.span>
          </a>
          
          {/* Animated underline on hover */}
          <motion.div 
            className="h-0.5 bg-gradient-to-r from-blue-400 to-blue-300/50 mt-1 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
          />
        </div>
      </div>
      
      {/* Corner accent */}
      <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-tl from-blue-500/30 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </motion.div>
  );
};

export default ServicesSection;
