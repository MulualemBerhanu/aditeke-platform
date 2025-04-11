import { Link } from "wouter";
import { motion } from "framer-motion";
import { COMPANY_STATS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

const TechGridBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    
    // Configuration
    const gridSize = 40;
    const lineWidth = 1;
    const lineColor = 'rgba(13, 110, 253, 0.3)';
    const highlightColor = 'rgba(77, 171, 247, 0.8)';
    
    // Perspective lines
    const perspectiveLines: { x1: number; y1: number; x2: number; y2: number; highlight: boolean; highlightProgress: number; }[] = [];
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initPerspectiveLines();
    };
    
    // Initialize perspective grid lines
    const initPerspectiveLines = () => {
      perspectiveLines.length = 0;
      
      // Create grid lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        perspectiveLines.push({
          x1: 0,
          y1: y,
          x2: canvas.width,
          y2: y,
          highlight: Math.random() < 0.15,
          highlightProgress: Math.random()
        });
      }
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        perspectiveLines.push({
          x1: x,
          y1: 0,
          x2: x,
          y2: canvas.height,
          highlight: Math.random() < 0.15,
          highlightProgress: Math.random()
        });
      }
      
      // Add diagonal perspective lines
      const diagonalCount = 15;
      for (let i = 0; i < diagonalCount; i++) {
        const startX = canvas.width * Math.random();
        const startY = canvas.height * Math.random();
        const angle = Math.random() * Math.PI * 2;
        const length = Math.max(canvas.width, canvas.height);
        
        perspectiveLines.push({
          x1: startX,
          y1: startY,
          x2: startX + Math.cos(angle) * length,
          y2: startY + Math.sin(angle) * length,
          highlight: Math.random() < 0.3,
          highlightProgress: Math.random()
        });
      }
    };
    
    // Draw glowing effect
    const drawGlow = (x1: number, y1: number, x2: number, y2: number, color: string, width: number) => {
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowBlur = 0;
    };
    
    // Draw perspective grid
    const drawPerspectiveGrid = () => {
      perspectiveLines.forEach(line => {
        if (line.highlight) {
          // Draw glowing effect for highlighted lines
          drawGlow(line.x1, line.y1, line.x2, line.y2, highlightColor, 2);
          
          // Update highlight progress
          line.highlightProgress += 0.01;
          if (line.highlightProgress > 1) {
            line.highlightProgress = 0;
            line.highlight = Math.random() < 0.1;
          }
        } else {
          // Draw regular grid line
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          ctx.moveTo(line.x1, line.y1);
          ctx.lineTo(line.x2, line.y2);
          ctx.stroke();
          
          // Small chance to start highlight
          if (Math.random() < 0.001) {
            line.highlight = true;
            line.highlightProgress = 0;
          }
        }
      });
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Add dark background
      ctx.fillStyle = 'rgba(0, 2, 18, 0.97)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw tech grid elements
      drawPerspectiveGrid();
      
      animationId = requestAnimationFrame(animate);
    };
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    
    resizeCanvas();
    animate();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-0"
    />
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
      {/* Tech background with animation */}
      <TechGridBackground />
      
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
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              <Link href="/contact">
                <Button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-md hover:from-blue-500 hover:to-blue-400 border border-blue-600/50 transition-colors text-center w-full sm:w-auto">
                  Start Your Project
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" className="px-8 py-3 bg-transparent border-blue-400/50 text-white font-medium rounded-md hover:bg-blue-500/10 transition-colors text-center w-full sm:w-auto">
                  Explore Services
                </Button>
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
          
          {/* Interactive Tech Visualization */}
          <motion.div 
            className="lg:w-1/2 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="relative z-10"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <VirtualWhiteboard />
            </motion.div>
            
            {/* Floating tech shapes in background */}
            <div className="absolute inset-0 -z-10">
              <TechShapes />
            </div>
          </motion.div>
        </div>
        
        {/* Stats Section */}
        <motion.div 
          className="mt-20 pt-8 border-t border-blue-500/20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {COMPANY_STATS.map((stat, index) => (
              <motion.div 
                key={index} 
                className="bg-blue-500/5 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4"
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="font-bold text-3xl md:text-4xl text-white mb-1">{stat.count}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
