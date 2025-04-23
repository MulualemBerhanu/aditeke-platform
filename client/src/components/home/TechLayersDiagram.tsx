import { motion } from 'framer-motion';
import React from 'react';

interface TechLayerProps {
  className?: string;
  width?: string;
  height?: string;
  layers?: {
    name: string;
    color: string;
    elements?: string[];
  }[];
}

const TechLayersDiagram: React.FC<TechLayerProps> = ({
  className = '',
  width = '100%',
  height = '100%',
  layers = [
    { 
      name: 'Frontend', 
      color: '#4C75E6', 
      elements: ['React', 'TypeScript', 'Framer Motion', 'TailwindCSS'] 
    },
    { 
      name: 'API', 
      color: '#4098D2', 
      elements: ['REST', 'GraphQL', 'WebSockets'] 
    },
    { 
      name: 'Backend', 
      color: '#37B9BE', 
      elements: ['Node.js', 'Express', 'Authentication', 'Storage'] 
    },
    { 
      name: 'Database', 
      color: '#31ACA3', 
      elements: ['PostgreSQL', 'Redis', 'MongoDB'] 
    },
    { 
      name: 'Infrastructure', 
      color: '#2A9D8F', 
      elements: ['Cloud', 'Docker', 'CI/CD', 'Monitoring'] 
    }
  ]
}) => {
  return (
    <div 
      className={`tech-layers-container ${className}`}
      style={{
        width,
        height,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '12px',
        borderRadius: '8px',
        background: 'rgba(13, 25, 65, 0.6)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden'
      }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-40 h-40 rounded-full bg-blue-500/10"
          animate={{
            x: [0, 20, 0],
            y: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            top: '-20px',
            right: '-20px',
            filter: 'blur(20px)'
          }}
        />
        <motion.div
          className="absolute w-32 h-32 rounded-full bg-cyan-500/10"
          animate={{
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }}
          style={{
            bottom: '-10px',
            left: '-10px',
            filter: 'blur(20px)'
          }}
        />
      </div>

      {/* Title */}
      <motion.div 
        className="text-center text-white text-lg font-semibold mb-2 relative z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        AdiTeke Tech Stack
      </motion.div>

      {/* Layers */}
      <div className="flex-1 flex flex-col gap-1 relative z-10">
        {layers.map((layer, index) => (
          <motion.div
            key={index}
            className="rounded-md overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div 
              className="h-full relative"
              style={{ backgroundColor: `${layer.color}40` }}
            >
              {/* Layer name */}
              <motion.div 
                className="text-white font-medium px-3 py-2 text-sm"
                whileHover={{ x: 5 }}
                style={{ backgroundColor: `${layer.color}70` }}
              >
                {layer.name}
              </motion.div>
              
              {/* Layer elements */}
              <div className="flex flex-wrap gap-1 p-2">
                {layer.elements?.map((el, elIndex) => (
                  <motion.div
                    key={elIndex}
                    className="text-xs px-2 py-1 rounded-full text-white backdrop-blur-sm"
                    style={{ backgroundColor: `${layer.color}50` }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + elIndex * 0.05 + 0.2 }}
                    whileHover={{ 
                      scale: 1.05, 
                      backgroundColor: `${layer.color}80` 
                    }}
                  >
                    {el}
                  </motion.div>
                ))}
              </div>
              
              {/* Animated pulse dots */}
              <motion.div
                className="absolute w-2 h-2 rounded-full bg-white"
                style={{ 
                  right: `${15 + Math.random() * 30}%`, 
                  bottom: `${20 + Math.random() * 50}%`,
                  opacity: 0.3
                }}
                animate={{
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.2
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Connection lines overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0">
          <motion.path
            d="M 20,30 C 50,50 70,60 80,90"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              ease: "easeInOut"
            }}
          />
          <motion.path
            d="M 80,30 C 60,40 50,70 20,90"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              delay: 0.5,
              ease: "easeInOut"
            }}
          />
        </svg>
      </div>
    </div>
  );
};

export default TechLayersDiagram;