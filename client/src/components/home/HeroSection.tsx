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
    const perspectiveDepth = 5;
    const lineWidth = 1;
    const lineColor = 'rgba(13, 110, 253, 0.3)';
    const highlightColor = 'rgba(77, 171, 247, 0.8)';
    const movementSpeed = 0.5;
    
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
      
      // Create horizontal lines that move towards the center creating perspective
      const centerY = canvas.height / 2;
      const centerX = canvas.width / 2;
      
      // Create grid lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        perspectiveLines.push({
          x1: 0,
          y1: y,
          x2: canvas.width,
          y2: y,
          highlight: Math.random() < 0.15, // Randomly highlight some lines
          highlightProgress: Math.random()
        });
      }
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        perspectiveLines.push({
          x1: x,
          y1: 0,
          x2: x,
          y2: canvas.height,
          highlight: Math.random() < 0.15, // Randomly highlight some lines
          highlightProgress: Math.random()
        });
      }
      
      // Add diagonal perspective lines
      const diagonalCount = 10;
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
          highlight: Math.random() < 0.3, // Higher chance to highlight these
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
            line.highlight = Math.random() < 0.1; // Chance to continue highlight
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
    
    // Create light pulse effect at intervals
    let pulseTime = 0;
    let pulsing = false;
    let pulseRadius = 0;
    const maxPulseRadius = Math.max(canvas.width, canvas.height);
    
    const drawPulse = () => {
      pulseTime++;
      
      if (pulseTime > 120 && !pulsing) { // Every 120 frames, start a new pulse
        pulsing = true;
        pulseRadius = 0;
        pulseTime = 0;
      }
      
      if (pulsing) {
        // Draw expanding circular pulse
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, 
          canvas.height / 2, 
          0, 
          canvas.width / 2, 
          canvas.height / 2, 
          pulseRadius
        );
        
        gradient.addColorStop(0, 'rgba(30, 144, 255, 0)');
        gradient.addColorStop(0.7, 'rgba(30, 144, 255, 0.05)');
        gradient.addColorStop(0.9, 'rgba(30, 144, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(30, 144, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, pulseRadius, 0, Math.PI * 2);
        ctx.fill();
        
        pulseRadius += 10;
        
        if (pulseRadius > maxPulseRadius) {
          pulsing = false;
        }
      }
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Add dark background
      ctx.fillStyle = 'rgba(0, 0, 15, 0.97)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw tech grid elements
      drawPerspectiveGrid();
      drawPulse();
      
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

const HeroSection = () => {
  return (
    <section id="home" className="relative overflow-hidden py-20 lg:py-32 text-white">
      {/* Tech background with animation */}
      <TechGridBackground />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Hero Content */}
          <motion.div 
            className="lg:w-1/2 mb-10 lg:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Transform Your <span className="text-blue-400 font-accent">Vision</span> Into Digital Reality
            </h1>
            <p className="text-white/90 text-lg md:text-xl mb-8 max-w-lg">
              Custom software solutions that drive innovation and deliver exceptional user experiences for your business needs.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/contact">
                <Button className="px-8 py-6 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-500 transition-colors text-center w-full sm:w-auto">
                  Get a Free Quote
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" className="px-8 py-6 bg-transparent border-white text-white font-medium rounded-md hover:bg-white/10 transition-colors text-center w-full sm:w-auto">
                  Explore Services
                </Button>
              </Link>
            </div>
          </motion.div>
          
          {/* Hero Image */}
          <motion.div 
            className="lg:w-1/2 flex justify-center lg:justify-end"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div 
              className="relative"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 to-blue-400/20 opacity-20 rounded-xl blur-lg transform scale-105"></div>
              <img 
                src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500&q=80" 
                alt="Digital transformation visualization" 
                className="relative rounded-xl shadow-2xl"
                width="600"
                height="500"
              />
            </motion.div>
          </motion.div>
        </div>
        
        {/* Stats Section */}
        <motion.div 
          className="mt-20 pt-10 border-t border-blue-500/20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex flex-wrap justify-center lg:justify-between items-center gap-8 text-white">
            {COMPANY_STATS.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="font-bold text-3xl md:text-4xl">{stat.count}</div>
                <div className="text-blue-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
