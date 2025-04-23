import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TechIcon {
  icon: string;
  size: number;
  distance: number;
  speed: number;
  startAngle: number;
  color: string;
  orbit: 'x' | 'y' | 'z';
}

interface TechSphereProps {
  className?: string;
  icons?: TechIcon[];
  size?: number;
  backgroundColor?: string;
  glowColor?: string;
  interactive?: boolean;
  rotationSpeed?: number;
  width?: string;
  height?: string;
}

// Default tech icons that will orbit
const DEFAULT_ICONS: TechIcon[] = [
  { icon: '</>', size: 24, distance: 90, speed: 10, startAngle: 0, color: '#61DAFB', orbit: 'x' },
  { icon: '{JS}', size: 30, distance: 80, speed: 15, startAngle: 40, color: '#F7DF1E', orbit: 'y' },
  { icon: '(TS)', size: 26, distance: 85, speed: 12, startAngle: 80, color: '#3178C6', orbit: 'z' },
  { icon: '<React/>', size: 32, distance: 95, speed: 8, startAngle: 120, color: '#61DAFB', orbit: 'x' },
  { icon: '[API]', size: 28, distance: 75, speed: 14, startAngle: 160, color: '#4CAF50', orbit: 'y' },
  { icon: '<SQL>', size: 27, distance: 85, speed: 11, startAngle: 200, color: '#F29111', orbit: 'z' },
  { icon: 'Node', size: 29, distance: 90, speed: 13, startAngle: 240, color: '#68A063', orbit: 'x' },
  { icon: 'Cloud', size: 28, distance: 80, speed: 9, startAngle: 280, color: '#FF9900', orbit: 'y' },
  { icon: 'AI', size: 26, distance: 95, speed: 16, startAngle: 320, color: '#FF4081', orbit: 'z' },
];

const TechSphere = ({
  className = '',
  icons = DEFAULT_ICONS,
  size = 80,
  backgroundColor = 'rgba(30, 41, 99, 0.7)',
  glowColor = 'rgba(78, 84, 200, 0.6)',
  interactive = true,
  rotationSpeed = 1,
  width = '100%',
  height = '100%'
}: TechSphereProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Get mouse position for interactive rotation
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      mouseRef.current = {
        x: (e.clientX - centerX) / (rect.width / 2),
        y: (e.clientY - centerY) / (rect.height / 2)
      };
    };

    // Reset mouse position when mouse leaves
    const handleMouseLeave = () => {
      mouseRef.current = { x: 0, y: 0 };
    };

    // Set up event listeners
    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // Clean up
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [interactive]);

  return (
    <motion.div
      ref={containerRef}
      className={`tech-sphere-container ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      style={{
        width,
        height,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        perspective: '1000px'
      }}
    >
      {/* Core Sphere */}
      <motion.div
        className="sphere-core"
        animate={{
          rotateX: [0, 360],
          rotateY: [0, 360]
        }}
        transition={{
          duration: 20 / rotationSpeed,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor,
          boxShadow: `0 0 ${size/3}px ${size/6}px ${glowColor}`,
          position: 'relative',
          transformStyle: 'preserve-3d'
        }}
      />

      {/* Orbiting Icons */}
      {icons.map((icon, index) => (
        <motion.div
          key={index}
          className="orbiting-icon"
          initial={{
            opacity: 0,
            scale: 0
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotateX: icon.orbit === 'x' ? [0, 360] : 0,
            rotateY: icon.orbit === 'y' ? [0, 360] : 0,
            rotateZ: icon.orbit === 'z' ? [0, 360] : 0,
          }}
          transition={{
            opacity: { duration: 0.5, delay: index * 0.1 },
            scale: { duration: 0.5, delay: index * 0.1 },
            rotateX: { duration: 30 / (icon.speed * rotationSpeed), repeat: Infinity, ease: "linear" },
            rotateY: { duration: 30 / (icon.speed * rotationSpeed), repeat: Infinity, ease: "linear" },
            rotateZ: { duration: 30 / (icon.speed * rotationSpeed), repeat: Infinity, ease: "linear" }
          }}
          style={{
            position: 'absolute',
            width: icon.size,
            height: icon.size,
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: icon.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: icon.size * 0.4,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            transformStyle: 'preserve-3d',
            transformOrigin: 'center center',
            transform: `rotateZ(${icon.startAngle}deg) translateX(${icon.distance}px)`,
            boxShadow: `0 0 10px 1px ${icon.color}80`,
            textShadow: `0 0 5px ${icon.color}`
          }}
        >
          {icon.icon}
        </motion.div>
      ))}

      {/* Subtle Glow for Overall Effect */}
      <div
        className="glow-effect"
        style={{
          position: 'absolute',
          width: size * 2,
          height: size * 2,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${glowColor} 0%, rgba(0,0,0,0) 70%)`,
          opacity: 0.5,
          pointerEvents: 'none'
        }}
      />
    </motion.div>
  );
};

export default TechSphere;