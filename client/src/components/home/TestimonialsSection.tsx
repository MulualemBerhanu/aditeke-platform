import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion, AnimatePresence, useInView, useAnimation } from 'framer-motion';
import { Testimonial } from '@shared/schema';
import { ChevronLeft, ChevronRight, Quote, Star, StarHalf, MessageCircle, Users, Award, Heart, ArrowRight } from 'lucide-react';

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.2 });
  const controls = useAnimation();
  
  const { data: testimonials, isLoading, error } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
  });

  // Set up animations when section comes into view
  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  // Auto-advance testimonials every 6 seconds if autoplay is enabled
  useEffect(() => {
    if (!testimonials || !autoplayEnabled) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [testimonials, autoplayEnabled]);

  // Pause autoplay when user interacts with controls
  const handleNavigation = (index: number) => {
    setAutoplayEnabled(false); // Pause autoplay
    setActiveIndex(index);
    
    // Resume autoplay after 10 seconds of inactivity
    const timeout = setTimeout(() => {
      setAutoplayEnabled(true);
    }, 10000);
    
    return () => clearTimeout(timeout);
  };

  // Animated variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };
  
  // Stats to display
  const stats = [
    { icon: <Users className="h-5 w-5" />, value: "50+", label: "Happy Clients" },
    { icon: <Award className="h-5 w-5" />, value: "100%", label: "Satisfaction" },
    { icon: <MessageCircle className="h-5 w-5" />, value: "24/7", label: "Support" },
    { icon: <Heart className="h-5 w-5" />, value: "98%", label: "Client Retention" },
  ];

  return (
    <section 
      ref={containerRef}
      className="py-24 md:py-32 relative overflow-hidden bg-gradient-to-b from-[#04102d] via-[#071336] to-[#04102d]"
    >
      {/* Animated 3D grid background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(120,119,198,0.3)_1.6px,transparent_1.6px),linear-gradient(to_right,rgba(120,119,198,0.3)_1.6px,transparent_1.6px)] bg-[size:30px_30px] [perspective:1000px] [transform:rotateX(50deg)]"></div>
        
        {/* Radial gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(99,102,241,0.2)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(192,132,252,0.2)_0%,transparent_50%)]"></div>
      </div>
      
      {/* Floating decorative elements */}
      <motion.div 
        className="absolute top-20 left-10 w-80 h-80 rounded-full bg-blue-500/10 blur-[80px] opacity-70"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px] opacity-70"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.7, 0.5, 0.7]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section with Animated Elements */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="text-center mb-16 mx-auto max-w-4xl"
        >
          {/* Animated accent line */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-3 mb-3"
          >
            <span className="h-px w-6 bg-blue-400/70"></span>
            <span className="text-blue-300 uppercase tracking-wider text-sm font-medium">Testimonials</span>
            <span className="h-px w-6 bg-blue-400/70"></span>
          </motion.div>
          
          {/* Main title with dual-colored gradient */}
          <motion.h2 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold mb-6 text-white"
          >
            What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Clients Say</span>
          </motion.h2>
          
          {/* Subtitle with glass effect */}
          <motion.p 
            variants={itemVariants}
            className="text-blue-100/80 text-lg leading-relaxed max-w-2xl mx-auto backdrop-blur-sm rounded-lg p-4 bg-white/5 border border-white/10 shadow-xl"
          >
            Don't just take our word for it. Here's what our clients have to say about working with AdiTeke.
          </motion.p>
          
          {/* Stats Section */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 mx-auto max-w-4xl"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center group hover:bg-white/10 transition-all duration-300"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="p-2 mb-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-blue-300 group-hover:text-blue-200 transition-colors">
                  {stat.icon}
                </div>
                <motion.span 
                  className="text-2xl font-bold text-white"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                >
                  {stat.value}
                </motion.span>
                <span className="text-sm text-blue-200/70">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
        
        {/* Featured Testimonial Card */}
        <div className="relative max-w-6xl mx-auto">
          {/* Large Quote Icon */}
          <motion.div 
            className="absolute -top-12 left-8 text-blue-500/10 z-0"
            initial={{ opacity: 0, scale: 0, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Quote size={120} strokeWidth={1} />
          </motion.div>
          
          {/* Testimonials Container */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl backdrop-blur-sm bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3)_0%,transparent_50%)] opacity-60"></div>
            
            {/* Testimonial Cards */}
            <div className="relative py-12 px-6 md:px-12">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  // Skeleton loader
                  <motion.div 
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <div className="h-52 bg-white/5 animate-pulse rounded-lg"></div>
                    <div>
                      <div className="h-6 bg-white/5 animate-pulse rounded-full w-2/3 mb-4"></div>
                      <div className="h-4 bg-white/5 animate-pulse rounded-full w-full mb-3"></div>
                      <div className="h-4 bg-white/5 animate-pulse rounded-full w-full mb-3"></div>
                      <div className="h-4 bg-white/5 animate-pulse rounded-full w-2/3 mb-6"></div>
                      <div className="flex items-center mt-8">
                        <div className="w-12 h-12 rounded-full bg-white/5 animate-pulse mr-4"></div>
                        <div>
                          <div className="h-4 bg-white/5 animate-pulse rounded-full w-32 mb-2"></div>
                          <div className="h-3 bg-white/5 animate-pulse rounded-full w-24"></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : error ? (
                  // Error state
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-20"
                  >
                    <div className="bg-red-500/10 text-red-200 p-6 rounded-lg inline-flex flex-col items-center mx-auto backdrop-blur-sm border border-red-500/20">
                      <MessageCircle className="h-12 w-12 mb-4 text-red-300/50" />
                      <p className="text-lg mb-4">Failed to load testimonials. Please try again later.</p>
                      <button 
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 rounded-lg transition-colors"
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </button>
                    </div>
                  </motion.div>
                ) : testimonials && testimonials.length > 0 ? (
                  // Featured testimonial in 2-column layout on larger screens
                  <motion.div
                    key={`testimonial-${activeIndex}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                  >
                    {/* Left Column: Person Image & Info */}
                    <div className="relative flex flex-col items-center md:items-end">
                      {/* Stylized testimonial image */}
                      <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 w-64 h-64 shadow-2xl mb-6">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/20 to-purple-600/30 z-10"></div>
                        {testimonials[activeIndex].profilePicture ? (
                          <img 
                            src={testimonials[activeIndex].profilePicture} 
                            alt={`${testimonials[activeIndex].clientName}'s portrait`}
                            className="object-cover w-full h-full"
                            width="256"
                            height="256"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-600/40 to-purple-600/40 flex items-center justify-center text-white text-6xl font-bold">
                            {testimonials[activeIndex].clientName.charAt(0)}
                          </div>
                        )}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-b from-blue-500/30 to-purple-500/30 scale-110 blur-md -z-10"
                          animate={{ 
                            opacity: [0.4, 0.6, 0.4],
                            scale: [1.05, 1.1, 1.05]
                          }}
                          transition={{ 
                            duration: 5, 
                            repeat: Infinity,
                            ease: "easeInOut" 
                          }}
                        />
                      </div>
                      
                      {/* Rating stars with glow effect */}
                      <div className="bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full border border-white/20 flex items-center shadow-lg">
                        <RenderStars rating={testimonials[activeIndex].rating} />
                        <span className="ml-2 text-blue-200">{testimonials[activeIndex].rating.toFixed(1)}</span>
                      </div>
                    </div>
                    
                    {/* Right Column: Testimonial Text & Info */}
                    <div className="flex flex-col justify-center">
                      <p className="text-blue-100 text-lg md:text-xl leading-relaxed mb-8 italic">
                        "{testimonials[activeIndex].testimonial}"
                      </p>
                      
                      {/* Animated divider */}
                      <motion.div 
                        className="h-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50 mb-6 w-16"
                        initial={{ width: 0 }}
                        animate={{ width: 64 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                      
                      {/* Client info */}
                      <div>
                        <h4 className="text-white text-xl font-bold">{testimonials[activeIndex].clientName}</h4>
                        <p className="text-blue-300 mb-4">{testimonials[activeIndex].company}</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  // Empty state
                  <div className="py-12 text-center text-blue-200">
                    <p>No testimonials available.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Testimonial navigation dots & controls */}
          {testimonials && testimonials.length > 1 && (
            <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
              <div className="backdrop-blur-md bg-white/10 rounded-full px-4 py-2 flex items-center gap-2 border border-white/10 shadow-lg">
                <motion.button
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  onClick={() => handleNavigation((activeIndex - 1 + testimonials.length) % testimonials.length)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>
                
                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      activeIndex === index 
                        ? 'bg-blue-400 scale-125 shadow-glow' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                    onClick={() => handleNavigation(index)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      boxShadow: activeIndex === index 
                        ? '0 0 10px rgba(96, 165, 250, 0.7)' 
                        : 'none'
                    }}
                  />
                ))}
                
                <motion.button
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  onClick={() => handleNavigation((activeIndex + 1) % testimonials.length)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>
          )}
        </div>
        
        {/* "View All Testimonials" link with hover effect */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link href="/testimonials">
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white font-medium shadow-lg shadow-blue-900/30 group overflow-hidden relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated shine effect */}
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
              
              <span>View all testimonials</span>
              <motion.div
                className="relative"
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut"
                }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// Helper component to render stars with animation
const RenderStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  
  return (
    <div className="flex">
      {[...Array(fullStars)].map((_, i) => (
        <motion.div 
          key={`star-${i}`}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          className="relative"
        >
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-0.5" />
          <motion.div 
            className="absolute inset-0 bg-yellow-400 blur-sm opacity-50 scale-150 rounded-full -z-10"
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1.3, 1.5, 1.3] 
            }}
            transition={{ 
              duration: 2 + i,
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          />
        </motion.div>
      ))}
      
      {hasHalfStar && (
        <motion.div 
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: fullStars * 0.1, duration: 0.3 }}
          className="relative"
        >
          <StarHalf className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-0.5" />
          <motion.div 
            className="absolute inset-0 bg-yellow-400 blur-sm opacity-50 scale-150 rounded-full -z-10"
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1.3, 1.5, 1.3] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          />
        </motion.div>
      )}
    </div>
  );
};

export default TestimonialsSection;
