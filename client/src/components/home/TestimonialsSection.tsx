import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Testimonial } from '@shared/schema';
import { ChevronLeft, ChevronRight, Quote, Star, StarHalf } from 'lucide-react';

const TestimonialsSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  
  const { data: testimonials, isLoading, error } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
  });

  // Determine how many testimonials to show per slide based on screen width
  const getTestimonialsPerSlide = () => {
    if (screenWidth >= 1024) return 3; // Large screens
    if (screenWidth >= 768) return 2;  // Medium screens
    return 1; // Small screens
  };

  const testimonialsPerSlide = getTestimonialsPerSlide();
  const totalSlides = testimonials ? Math.ceil(testimonials.length / testimonialsPerSlide) : 0;
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (totalSlides <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [totalSlides]);

  const nextSlide = () => {
    if (totalSlides <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    if (totalSlides <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <section className="py-28 relative overflow-hidden">
      {/* Advanced gradient background with texture */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/90 via-white/80 to-blue-50/90 -z-20"></div>
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10 -z-10">
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.2)_0%,transparent_40%)]"></div>
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.2)_0%,transparent_40%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:34px_34px]"></div>
      </div>
      
      {/* Floating decorative orbs */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary-light/10"
          style={{
            width: `${40 + i * 20}px`,
            height: `${40 + i * 20}px`,
            left: `${8 + i * 15}%`,
            top: `${20 + (i % 4) * 15}%`,
            filter: 'blur(5px)',
            opacity: 0.5
          }}
          animate={{
            y: [0, -10, 0],
            x: [0, i % 2 === 0 ? 10 : -10, 0],
          }}
          transition={{
            duration: 5 + i,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      
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
            className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-40 h-1.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          {/* Enhanced title with gradient text */}
          <div className="relative inline-block mb-6">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-primary/90">
              What Our Clients Say
            </h2>
            
            {/* Accent dot with animation */}
            <motion.span 
              className="absolute -right-4 top-0 text-primary"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >.</motion.span>
            
            {/* Subtle glow effect */}
            <div className="absolute -inset-3 bg-primary/5 rounded-lg blur-xl opacity-50 -z-10"></div>
          </div>
          
          {/* Enhanced description with backdrop */}
          <div className="relative">
            <p className="text-gray-700 leading-relaxed text-lg px-6 py-4 rounded-lg bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our clients have to say about working with AdiTeke.
            </p>
            
            {/* Accent line animation */}
            <motion.div 
              className="absolute -bottom-2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          
          {/* Quote icon for visual reinforcement */}
          <motion.div 
            className="w-16 h-16 mx-auto mt-8 text-primary/20"
            initial={{ scale: 0, rotate: -45 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 10,
              delay: 0.6
            }}
          >
            <Quote size={64} strokeWidth={1.5} />
          </motion.div>
        </motion.div>
        
        <div className="relative testimonial-slider">
          {/* Testimonial slides container */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentSlide}
                className="flex"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{ 
                  transform: `translateX(-${currentSlide * 100}%)`,
                  transition: 'transform 0.5s ease'
                }}
              >
                {isLoading ? (
                  // Show skeleton loaders while loading
                  Array(testimonialsPerSlide).fill(null).map((_, index) => (
                    <div key={index} className={`w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-4`}>
                      <div className="bg-white p-8 rounded-xl shadow-md animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                        <div className="h-4 bg-gray-200 rounded mb-6 w-3/4"></div>
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : error ? (
                  // Show error message
                  <div className="w-full px-4 text-center text-red-500">
                    <p>Failed to load testimonials. Please try again later.</p>
                  </div>
                ) : (
                  // Show testimonials
                  testimonials?.slice(
                    currentSlide * testimonialsPerSlide,
                    (currentSlide + 1) * testimonialsPerSlide
                  ).map((testimonial) => (
                    <div key={testimonial.id} className={`w-full md:w-1/${testimonialsPerSlide === 2 ? '2' : '1'} lg:w-1/${testimonialsPerSlide} flex-shrink-0 px-4`}>
                      <TestimonialCard testimonial={testimonial} />
                    </div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Enhanced slider controls with glass effect */}
          {totalSlides > 1 && (
            <>
              <motion.button 
                className="absolute top-1/2 left-4 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-white/40 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all z-20"
                onClick={prevSlide}
                whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.9 }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
              
              <motion.button 
                className="absolute top-1/2 right-4 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-white/40 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all z-20"
                onClick={nextSlide}
                whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.9 }}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>
            </>
          )}
        </div>
        
        <div className="flex justify-center mt-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link 
              href="/testimonials"
              className="inline-flex items-center px-6 py-3 rounded-md backdrop-blur-sm bg-white/70 border border-primary/20 shadow-md text-primary font-medium hover:bg-primary/10 hover:border-primary/40 transition-all group"
            >
              <span className="mr-2">View all testimonials</span>
              <motion.div
                className="w-5 h-5 flex items-center justify-center"
                animate={{ x: [0, 3, 0] }}
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
              
              {/* Animated underline */}
              <motion.div 
                className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-primary/40 to-primary/80 scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300"
              />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  // Enhanced function to render stars with Lucide icons
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars with Lucide icons
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <motion.div 
          key={`full-${i}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
        >
          <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-0.5" />
        </motion.div>
      );
    }
    
    // Add half star if needed with Lucide icon
    if (hasHalfStar) {
      stars.push(
        <motion.div 
          key="half"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: fullStars * 0.1, duration: 0.3 }}
        >
          <StarHalf className="h-4 w-4 fill-amber-400 text-amber-400 mr-0.5" />
        </motion.div>
      );
    }
    
    return stars;
  };

  return (
    <motion.div 
      className="relative overflow-hidden backdrop-blur-sm bg-white/60 rounded-xl p-8 shadow-lg border border-white/40 h-full flex flex-col group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ 
        y: -8,
        boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)",
        borderColor: "rgba(59, 130, 246, 0.3)"
      }}
    >
      {/* Glossy background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/70 to-white/50 opacity-90 group-hover:opacity-100 transition-all duration-300" />
      
      {/* Quote mark in the background */}
      <div className="absolute top-4 right-4 text-gray-100 opacity-30 group-hover:opacity-50 transition-opacity">
        <Quote size={80} strokeWidth={1} />
      </div>
      
      {/* Rating stars */}
      <div className="flex items-center mb-6 relative z-10">
        <div className="flex">
          {renderStars(testimonial.rating)}
        </div>
        <div className="ml-2 text-gray-500 text-sm">{testimonial.rating.toFixed(1)}</div>
      </div>
      
      {/* Testimonial text with enhanced styling */}
      <p className="text-gray-600 mb-6 flex-grow relative z-10 italic">
        "{testimonial.testimonial}"
      </p>
      
      {/* Divider line */}
      <motion.div 
        className="h-px w-1/4 bg-gradient-to-r from-primary/30 to-transparent mb-4"
        initial={{ width: 0 }}
        whileInView={{ width: "25%" }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      
      {/* Client info with enhanced styling */}
      <div className="flex items-center relative z-10">
        {testimonial.profilePicture ? (
          <div className="relative mr-4">
            <img 
              src={testimonial.profilePicture} 
              alt={`${testimonial.clientName}'s portrait`} 
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              width="48"
              height="48"
            />
            <div className="absolute -inset-1 bg-primary/10 rounded-full blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300 -z-10"></div>
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4 border-2 border-white shadow-md">
            {testimonial.clientName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h4 className="font-bold text-gray-800">{testimonial.clientName}</h4>
          <p className="text-primary/80 text-sm">{testimonial.company}</p>
        </div>
      </div>
      
      {/* Subtle corner accent */}
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  );
};

export default TestimonialsSection;
