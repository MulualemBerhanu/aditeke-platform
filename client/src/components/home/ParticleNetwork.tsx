import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  directionX: number;
  directionY: number;
}

interface ParticleNetworkProps {
  className?: string;
  particleCount?: number;
  connectionDistance?: number;
  particleColors?: string[];
  backgroundColor?: string;
  interactive?: boolean;
  width?: string;
  height?: string;
}

const ParticleNetwork = ({
  className = '',
  particleCount = 80,
  connectionDistance = 120,
  particleColors = ['#4e54c8', '#8f94fb', '#25aae1', '#40e495', '#30dd8a', '#2bb673', '#f8c200'],
  backgroundColor = 'transparent',
  interactive = true,
  width = '100%',
  height = '100%'
}: ParticleNetworkProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match parent
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };

    // Create the particles
    const createParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speed: Math.random() * 1 + 0.5,
          color: particleColors[Math.floor(Math.random() * particleColors.length)],
          directionX: Math.random() * 2 - 1,
          directionY: Math.random() * 2 - 1
        });
      }
    };

    // Update particle positions and draw
    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        
        // Update position
        p.x += p.directionX * p.speed;
        p.y += p.directionY * p.speed;
        
        // Boundary check
        if (p.x < 0 || p.x > canvas.width) {
          p.directionX *= -1;
        }
        if (p.y < 0 || p.y > canvas.height) {
          p.directionY *= -1;
        }
        
        // Draw the particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Check for connections to other particles
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p2 = particlesRef.current[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance) {
            // Draw a line between particles with opacity based on distance
            ctx.beginPath();
            ctx.strokeStyle = `rgba(150, 150, 255, ${1 - distance / connectionDistance})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
        
        // If mouse is active, check for connections to mouse
        if (interactive && mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < connectionDistance * 1.5) {
            // Draw a line to mouse with opacity based on distance
            ctx.beginPath();
            ctx.strokeStyle = `rgba(200, 200, 255, ${1 - distance / (connectionDistance * 1.5)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.stroke();
            
            // Gently move particle towards mouse
            p.x += dx * 0.01;
            p.y += dy * 0.01;
          }
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animateParticles);
    };

    // Handle mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };
    
    // Handle mouse leave
    const handleMouseLeave = () => {
      mouseRef.current = { x: null, y: null };
    };
    
    // Set up canvas and events
    window.addEventListener('resize', resizeCanvas);
    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }
    
    resizeCanvas();
    createParticles();
    animateParticles();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particleCount, connectionDistance, particleColors, interactive]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className={`particle-network-container ${className}`}
      style={{
        width,
        height,
        position: 'relative',
        backgroundColor,
        overflow: 'hidden'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
    </motion.div>
  );
};

export default ParticleNetwork;