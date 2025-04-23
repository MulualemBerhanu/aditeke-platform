import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TechStackVisual from './TechStackVisual';

const TechStackShowcase = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Adjust to screen size
  useEffect(() => {
    const handleResize = () => {
      const isLarge = window.innerWidth >= 1440;
      setIsFullScreen(isLarge);
    };
    
    // Call once immediately
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Powered by Modern Technology
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We utilize a comprehensive stack of cutting-edge technologies to build robust, scalable, and innovative solutions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className={`relative ${isFullScreen ? 'w-full' : 'max-w-4xl mx-auto'}`}
          style={{ 
            height: isFullScreen ? '70vh' : '500px',
            transition: 'height 0.3s ease, width 0.3s ease'
          }}
        >
          <TechStackVisual />
        </motion.div>
      </div>
    </section>
  );
};

export default TechStackShowcase;