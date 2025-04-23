import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { COMPANY_STATS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Calendar, Code, Lightbulb, Phone, Users } from "lucide-react";
import CustomCountUp from '@/components/common/CustomCountUp';
import CodeAnimation from './CodeAnimation';
import ParticleNetwork from './ParticleNetwork';
import TechSphere from './TechSphere';
import TechLayersDiagram from './TechLayersDiagram';

// Enhanced video background with animated particles
const VideoBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    // Ensure the video plays automatically and loops
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("Video autoplay failed:", error);
      });
      
      // Set listener for when video is loaded
      videoRef.current.addEventListener('loadeddata', () => {
        setIsVideoLoaded(true);
      });
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadeddata', () => {
          setIsVideoLoaded(true);
        });
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Video background with fade-in effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isVideoLoaded ? 1 : 0 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0"
      >
        <video 
          ref={videoRef}
          className="absolute w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/assets/background.mp4" type="video/mp4" />
        </video>
      </motion.div>
      
      {/* Enhanced overlay with animated gradient */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-[#040b29]/80 via-[#0a1a44]/70 to-[#071336]/75"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      ></motion.div>
      
      {/* Animated glass-like layer for depth */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      ></motion.div>
      
      {/* Enhanced animated particle system */}
      <motion.div 
        className="absolute inset-0 opacity-40" 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1.5, delay: 0.8 }}
        style={{ 
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)', 
          backgroundSize: '30px 30px' 
        }}
      ></motion.div>
      
      {/* Floating tech symbols */}
      <div className="absolute inset-0 overflow-hidden">
        {['</>','{}','[]','//','AI','UX','DB'].map((symbol, index) => (
          <motion.div
            key={index}
            className="absolute text-blue-300/20 text-xl font-mono font-bold"
            initial={{ 
              x: Math.random() * 100 - 50 + '%', 
              y: Math.random() * 100 + '%',
              opacity: 0 
            }}
            animate={{ 
              y: [null, '-20%'],
              opacity: [0, 0.2, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              delay: index * 2,
              ease: "easeInOut"
            }}
          >
            {symbol}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Tech-themed 3D shapes component
const TechShapes = () => {
  return (
    <div className="relative h-full w-full">
      {/* Floating 3D elements */}
      <motion.div
        className="absolute w-20 h-20 rounded bg-gradient-to-r from-blue-500 to-blue-600 opacity-80"
        style={{ filter: 'blur(2px)' }}
        animate={{
          x: [0, 20, 0],
          y: [0, -20, 0],
          rotate: [0, 45, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-70 top-20 right-10"
        style={{ filter: 'blur(3px)' }}
        animate={{
          x: [0, -15, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      <motion.div
        className="absolute w-24 h-24 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 opacity-60 bottom-20 left-10"
        style={{ filter: 'blur(2px)' }}
        animate={{
          x: [0, 25, 0],
          y: [0, -15, 0],
          rotate: [0, -30, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
    </div>
  );
};

// Virtual WhiteBoard Component
const VirtualWhiteboard = () => {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5"></div>
      
      {/* Technical Diagrams */}
      <div className="relative z-10 grid grid-cols-2 gap-3 md:gap-5">
        {/* Architecture Diagram */}
        <motion.div 
          className="aspect-square bg-blue-500/10 rounded-lg border border-blue-500/30 p-3 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="grid grid-cols-3 gap-2 w-full h-full">
            <div className="col-span-3 h-6 bg-blue-400/20 rounded flex items-center justify-center">
              <div className="w-3/4 h-2 bg-blue-400/40 rounded-full"></div>
            </div>
            <div className="h-full bg-blue-400/20 rounded flex flex-col items-center justify-center gap-1 p-1">
              <div className="w-full h-2 bg-blue-400/40 rounded-full"></div>
              <div className="w-full h-2 bg-blue-400/40 rounded-full"></div>
            </div>
            <div className="h-full bg-blue-400/20 rounded flex flex-col items-center justify-center gap-1 p-1">
              <div className="w-full h-2 bg-blue-400/40 rounded-full"></div>
              <div className="w-full h-2 bg-blue-400/40 rounded-full"></div>
              <div className="w-full h-2 bg-blue-400/40 rounded-full"></div>
            </div>
            <div className="h-full bg-blue-400/20 rounded flex flex-col items-center justify-center gap-1 p-1">
              <div className="w-full h-2 bg-blue-400/40 rounded-full"></div>
            </div>
          </div>
        </motion.div>
        
        {/* Code Snippet */}
        <motion.div 
          className="aspect-square bg-blue-500/10 rounded-lg border border-blue-500/30 p-3 flex flex-col gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="w-3/4 h-2 bg-blue-400/30 rounded-full"></div>
          <div className="w-full h-2 bg-blue-400/30 rounded-full"></div>
          <div className="w-5/6 h-2 bg-blue-400/30 rounded-full"></div>
          <div className="w-2/3 h-2 bg-cyan-400/40 rounded-full ml-4"></div>
          <div className="w-3/4 h-2 bg-cyan-400/40 rounded-full ml-4"></div>
          <div className="w-1/2 h-2 bg-cyan-400/40 rounded-full ml-4"></div>
          <div className="w-2/3 h-2 bg-blue-400/30 rounded-full"></div>
        </motion.div>
        
        {/* Data Flow Diagram */}
        <motion.div 
          className="aspect-square bg-blue-500/10 rounded-lg border border-blue-500/30 p-3 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="relative h-full w-full flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-blue-400/30 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-blue-400/50"></div>
            </div>
            <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-cyan-400/30"></div>
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-cyan-400/30"></div>
            <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full bg-cyan-400/30"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-cyan-400/30"></div>
            
            {/* Connection lines */}
            <div className="absolute inset-0">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <line x1="20" y1="20" x2="50" y2="50" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1" />
                <line x1="80" y1="20" x2="50" y2="50" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1" />
                <line x1="20" y1="80" x2="50" y2="50" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1" />
                <line x1="80" y1="80" x2="50" y2="50" stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </motion.div>
        
        {/* UI Wireframe */}
        <motion.div 
          className="aspect-square bg-blue-500/10 rounded-lg border border-blue-500/30 p-3 flex flex-col gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="h-2 bg-blue-400/30 rounded-full w-full"></div>
          <div className="flex-1 flex gap-2">
            <div className="w-1/3 bg-blue-400/20 rounded"></div>
            <div className="w-2/3 flex flex-col gap-2">
              <div className="h-2 bg-blue-400/30 rounded-full w-full"></div>
              <div className="h-2 bg-blue-400/30 rounded-full w-3/4"></div>
              <div className="h-2 bg-blue-400/30 rounded-full w-5/6"></div>
              <div className="h-2 bg-blue-400/30 rounded-full w-2/3"></div>
              <div className="mt-auto h-4 bg-cyan-400/30 rounded-full w-1/3"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const HeroSection = () => {
  return (
    <section id="home" className="relative overflow-hidden py-24 lg:py-32 text-white min-h-[90vh] flex items-center">
      {/* Video background */}
      <VideoBackground />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Hero Content */}
          <motion.div 
            className="lg:w-1/2 text-center lg:text-left"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-3 bg-gradient-to-r from-blue-600/20 to-blue-400/20 border border-blue-500/30 rounded-full px-4 py-1 backdrop-blur-sm">
              <span className="text-blue-400 font-medium">Innovative Software Solutions</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Transforming <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">Ideas</span> Into Powerful Digital Products
            </h1>
            
            <p className="text-white/80 text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0">
              We build custom software solutions that drive innovation and deliver exceptional experiences that help businesses thrive in the digital world.
            </p>
            
            {/* Enhanced Call-to-Action Buttons with Animation */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Link href="/contact">
                  <Button 
                    className="px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-lg font-medium rounded-md border border-blue-600/50 shadow-lg shadow-blue-700/20 transition-all hover:shadow-blue-600/30 hover:from-blue-500 hover:to-blue-400 w-full sm:w-auto group"
                  >
                    <div className="flex items-center">
                      <span>Get Started</span>
                      <motion.div 
                        className="ml-2"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          repeatType: "loop",
                          ease: "easeInOut" 
                        }}
                      >
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </motion.div>
                    </div>
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Link href="/services">
                  <Button 
                    variant="outline" 
                    className="px-8 py-6 bg-blue-600/10 backdrop-blur-sm border-blue-400/50 text-white text-lg font-medium rounded-md hover:bg-blue-500/20 transition-all w-full sm:w-auto group"
                  >
                    <span>Our Services</span>
                    <ArrowUpRight className="ml-2 h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </Button>
                </Link>
              </motion.div>
            </div>
            
            {/* Quick Action Icons */}
            <div className="hidden md:flex items-center justify-start gap-6 mb-8">
              <Link href="/contact#schedule">
                <motion.div 
                  className="flex items-center text-white/70 hover:text-white/90 transition-colors"
                  whileHover={{ y: -3 }}
                >
                  <div className="p-2 rounded-full bg-blue-500/10 border border-blue-500/30 mr-2">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="text-sm">Schedule Call</span>
                </motion.div>
              </Link>
              
              <Link href="/portfolio">
                <motion.div 
                  className="flex items-center text-white/70 hover:text-white/90 transition-colors"
                  whileHover={{ y: -3 }}
                >
                  <div className="p-2 rounded-full bg-blue-500/10 border border-blue-500/30 mr-2">
                    <Code className="h-4 w-4" />
                  </div>
                  <span className="text-sm">View Projects</span>
                </motion.div>
              </Link>
              
              <Link href="/contact#phone">
                <motion.div 
                  className="flex items-center text-white/70 hover:text-white/90 transition-colors"
                  whileHover={{ y: -3 }}
                >
                  <div className="p-2 rounded-full bg-blue-500/10 border border-blue-500/30 mr-2">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="text-sm">Contact Us</span>
                </motion.div>
              </Link>
            </div>
            
            <motion.div
              className="flex items-center justify-center lg:justify-start gap-2 text-sm text-white/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span>Trusted by innovative companies</span>
              <div className="flex gap-4 items-center ml-2">
                <div className="h-5 w-10 bg-white/20 rounded"></div>
                <div className="h-5 w-12 bg-white/20 rounded"></div>
                <div className="h-5 w-8 bg-white/20 rounded"></div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Advanced Interactive Tech Visualization */}
          <motion.div 
            className="lg:w-1/2 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Interactive 3D Tech Sphere */}
            <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
              <TechSphere glowColor="rgba(59, 130, 246, 0.6)" />
            </div>
            
            {/* Live Code Animation - Made larger */}
            <div className="absolute bottom-16 -right-12 w-64 h-56 md:w-80 md:h-64 lg:w-96 lg:h-72 rounded-lg overflow-hidden shadow-xl rotate-6 z-20">
              <CodeAnimation theme="dark" opacity={0.9} codeSpeed={3} />
            </div>
            
            {/* Main Visualization */}
            <motion.div
              className="relative z-10"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative">
                <VirtualWhiteboard />
                
                {/* Tech Layers Diagram - New component in the yellow arrow area */}
                <div className="absolute top-1/2 right-1/3 transform translate-x-1/2 -translate-y-1/2 w-64 h-72 rotate-3 z-30">
                  <TechLayersDiagram />
                </div>
                
                {/* Particle Network Overlay */}
                <div className="absolute inset-0 opacity-50">
                  <ParticleNetwork 
                    particleCount={40} 
                    connectionDistance={80} 
                    particleColors={['#4e54c8', '#8f94fb', '#25aae1']} 
                  />
                </div>
              </div>
            </motion.div>
            
            {/* Floating tech shapes in background */}
            <div className="absolute inset-0 -z-10">
              <TechShapes />
            </div>
          </motion.div>
        </div>
        
        {/* Enhanced Stats Section */}
        <motion.div 
          className="mt-20 pt-10 border-t border-blue-500/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-white mb-8 text-center">Proven Track Record of Excellence</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {COMPANY_STATS.map((stat, index) => (
              <motion.div 
                key={index} 
                className="relative bg-gradient-to-br from-blue-600/10 to-blue-400/5 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.8 }}
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)",
                  borderColor: "rgba(59, 130, 246, 0.4)"
                }}
              >
                {/* Animated background glow */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={{ 
                    opacity: [0, 0.2, 0],
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                />
                
                {/* Icon for each stat */}
                <div className="mb-2 text-blue-400 flex justify-center">
                  {index === 0 && <Code className="h-6 w-6" />}
                  {index === 1 && <Lightbulb className="h-6 w-6" />}
                  {index === 2 && <Calendar className="h-6 w-6" />}
                  {index === 3 && <Users className="h-6 w-6" />}
                </div>
                
                {/* Counter animation for numbers */}
                <motion.div 
                  className="font-bold text-3xl md:text-4xl text-white mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 1 }}
                >
                  <CustomCountUp
                    start={0}
                    end={parseInt(stat.count)}
                    decimals={0}
                    delay={0}
                    suffix={stat.count.includes('+') ? '+' : ''}
                  />
                </motion.div>
                
                <div className="text-blue-100 text-sm font-medium">{stat.label}</div>
                
                {/* Subtle accent line at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 group-hover:opacity-100 opacity-50 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
