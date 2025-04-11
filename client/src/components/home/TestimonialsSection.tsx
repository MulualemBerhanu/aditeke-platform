import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Testimonial } from '@shared/schema';

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
    <section className="py-20 bg-light">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our clients have to say about working with AdiTeke.
          </p>
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
          
          {/* Slider controls - only show if we have more than one slide */}
          {totalSlides > 1 && (
            <>
              <motion.button 
                className="absolute top-1/2 left-4 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                onClick={prevSlide}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Previous testimonial"
              >
                <i className="fas fa-chevron-left"></i>
              </motion.button>
              <motion.button 
                className="absolute top-1/2 right-4 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                onClick={nextSlide}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Next testimonial"
              >
                <i className="fas fa-chevron-right"></i>
              </motion.button>
            </>
          )}
        </div>
        
        <div className="flex justify-center mt-10">
          <Link href="/testimonials">
            <a className="inline-flex items-center text-primary font-medium hover:text-accent transition-colors">
              View all testimonials
              <i className="fas fa-arrow-right ml-2"></i>
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="fas fa-star"></i>);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>);
    }
    
    return stars;
  };

  return (
    <motion.div 
      className="bg-white p-8 rounded-xl shadow-md h-full flex flex-col"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center mb-6">
        <div className="text-amber-400 flex">
          {renderStars(testimonial.rating)}
        </div>
        <div className="ml-2 text-gray-500">{testimonial.rating.toFixed(1)}</div>
      </div>
      <p className="text-gray-600 mb-6 flex-grow">{testimonial.testimonial}</p>
      <div className="flex items-center">
        {testimonial.profilePicture && (
          <img 
            src={testimonial.profilePicture} 
            alt={`${testimonial.clientName}'s portrait`} 
            className="w-12 h-12 rounded-full object-cover mr-4"
            width="48"
            height="48"
          />
        )}
        <div>
          <h4 className="font-bold">{testimonial.clientName}</h4>
          <p className="text-gray-500">{testimonial.company}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialsSection;
