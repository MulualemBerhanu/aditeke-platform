import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

type AppLoadingProps = {
  isInitialized: boolean;
};

const LoadingStep = ({ 
  label, 
  status, 
  delay = 0 
}: { 
  label: string; 
  status: 'loading' | 'complete'; 
  delay?: number;
}) => {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) return null;
  
  return (
    <motion.div 
      className="flex items-center space-x-3 my-3 relative"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        duration: 0.4 
      }}
    >
      <motion.div
        className="flex-shrink-0 relative"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30,
          delay: 0.1
        }}
      >
        {status === 'loading' && (
          <motion.div
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Loader2 className="h-5 w-5 text-primary" />
          </motion.div>
        )}
        
        {status === 'complete' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [1.4, 1] }}
            transition={{ 
              duration: 0.4,
              type: "spring", 
              stiffness: 300, 
              damping: 20 
            }}
          >
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </motion.div>
        )}
      </motion.div>
      
      <motion.span 
        className={status === 'complete' ? 'text-muted-foreground' : 'font-medium'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {label}
      </motion.span>
      
      {/* Progress bar for loading state */}
      {status === 'loading' && (
        <motion.div
          className="absolute -bottom-1 left-0 h-0.5 bg-primary/30 w-full rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default function AppLoading({ isInitialized }: AppLoadingProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <motion.div 
        className="w-full max-w-md p-8 bg-card shadow-xl rounded-xl border"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24">
              {/* Outer spinning ring */}
              <motion.div 
                className="absolute inset-0 rounded-full border-4 border-primary/20"
                animate={{ 
                  rotate: 360,
                  borderColor: isInitialized ? 'rgba(var(--primary), 0.2)' : ['rgba(var(--primary), 0.1)', 'rgba(var(--primary), 0.3)']
                }}
                transition={{
                  rotate: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  },
                  borderColor: {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }
                }}
              />
              
              {/* Middle spinning ring with dots */}
              <motion.div
                className="absolute inset-2 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-primary/80"
                    style={{ 
                      top: '50%', 
                      left: '50%',
                      transform: `rotate(${i * 60}deg) translateX(37px) translateY(-50%)` 
                    }}
                    animate={{ 
                      scale: isInitialized ? 1 : [1, 1.5, 1],
                      opacity: isInitialized ? 1 : [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: isInitialized ? 0 : Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
              
              {/* Inner pulsing circle */}
              <motion.div 
                className="absolute inset-5 rounded-full bg-primary/10"
                animate={{ 
                  scale: isInitialized ? 1 : [1, 1.1, 1],
                  opacity: isInitialized ? 0.8 : [0.5, 0.8, 0.5],
                  backgroundColor: isInitialized ? 'rgba(var(--primary), 0.15)' : ['rgba(var(--primary), 0.1)', 'rgba(var(--primary), 0.2)']
                }}
                transition={{
                  duration: 2,
                  repeat: isInitialized ? 0 : Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              />
              
              {/* Progress spinner */}
              <motion.div 
                className="absolute inset-0 rounded-full border-t-4 border-r-4 border-primary"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
          </div>
          <motion.h2 
            className="text-2xl font-bold mb-1"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Initializing Application
          </motion.h2>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Setting up secure connection to our cloud services
          </motion.p>
        </div>
        
        <div className="mb-8 max-w-sm mx-auto">
          <LoadingStep 
            label="Establishing secure connection" 
            status={isInitialized ? 'complete' : 'loading'} 
          />
          <LoadingStep 
            label="Authenticating services" 
            status={isInitialized ? 'complete' : 'loading'} 
            delay={800}
          />
          <LoadingStep 
            label="Loading application data" 
            status={isInitialized ? 'complete' : 'loading'} 
            delay={1600}
          />
          <LoadingStep 
            label="Finalizing initialization" 
            status={isInitialized ? 'complete' : 'loading'} 
            delay={2400}
          />
        </div>
      </motion.div>
    </div>
  );
}