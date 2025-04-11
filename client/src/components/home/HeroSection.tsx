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
    let particles: { x: number; y: number; vx: number; vy: number; size: number; }[] = [];
    const particleCount = 50;
    const gridSize = 30;
    const particleSpeed = 0.3;
    const lineMaxDistance = 200;
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Initialize particles
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * particleSpeed,
          vy: (Math.random() - 0.5) * particleSpeed,
          size: Math.random() * 2 + 1
        });
      }
    };
    
    // Draw grid lines
    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(0, 120, 255, 0.15)';
      ctx.lineWidth = 1;
      
      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };
    
    // Draw particles and connections
    const drawParticles = () => {
      particles.forEach(particle => {
        // Draw particle
        ctx.fillStyle = 'rgba(0, 170, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw connections between particles
        particles.forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < lineMaxDistance) {
            ctx.strokeStyle = `rgba(0, 150, 255, ${(1 - distance / lineMaxDistance) * 0.3})`;
            ctx.lineWidth = (1 - distance / lineMaxDistance) * 2;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });
    };
    
    // Update particle positions
    const updateParticles = () => {
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
      });
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Add a dark background
      ctx.fillStyle = 'rgba(0, 0, 20, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      drawGrid();
      drawParticles();
      updateParticles();
      
      animationId = requestAnimationFrame(animate);
    };
    
    // Handle window resize
    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });
    
    resizeCanvas();
    initParticles();
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
