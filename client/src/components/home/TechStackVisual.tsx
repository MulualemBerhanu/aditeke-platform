import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

const TechStackVisual = () => {
  const codeControls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  // Measure container size and update on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const sequence = async () => {
      await codeControls.start({ opacity: 1, y: 0 });
    };
    sequence();
  }, [codeControls]);

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      {/* Responsive container that scales with screen size */}
      <div className="w-full h-full mx-auto relative">
        {/* Outer terminal window container with proper aspect ratio */}
        <div className="relative w-full h-full" style={{ 
          maxWidth: '100%',
          margin: '0 auto',
        }}>
          {/* Background layers */}
          <motion.div 
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-900/90 via-blue-950 to-indigo-900/95 shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Tech stack label */}
            <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-full">
              <motion.h3
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white/80 text-center"
              >
                AdiTeke Tech Stack
              </motion.h3>
            </div>

            {/* Floating tech badges */}
            <div className="absolute bottom-0 left-0 w-full h-1/3 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center flex-wrap gap-2 sm:gap-3 md:gap-4 opacity-60">
                {[
                  'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Firebase',
                  'GraphQL', 'WebSockets', 'REST', 'TailwindCSS', 'Framer Motion'
                ].map((tech, index) => (
                  <motion.div
                    key={tech}
                    className="bg-white/10 backdrop-blur-sm px-2 py-1 rounded-md text-xs sm:text-sm text-white/80 whitespace-nowrap"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      x: [0, (index % 2 === 0 ? 5 : -5), 0]
                    }}
                    transition={{ 
                      delay: 0.1 * index,
                      duration: 0.5,
                      x: {
                        repeat: Infinity,
                        repeatType: "mirror",
                        duration: 3 + (index % 3),
                      }
                    }}
                  >
                    {tech}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-10">
                <path fill="#4F46E5" d="M43.5,-62.5C56.9,-55.1,68.7,-42.6,76.4,-27.2C84.1,-11.7,87.6,6.8,83.3,23.4C78.9,40,66.6,54.6,51.5,65.3C36.4,76,18.2,82.7,0.1,82.6C-18,82.5,-36,75.6,-47.6,63.5C-59.2,51.3,-64.4,33.9,-71.4,15.2C-78.4,-3.5,-87.1,-23.4,-83.1,-40.2C-79.1,-57,-62.3,-70.9,-44.8,-77C-27.3,-83,-13.7,-81.2,1.1,-82.9C15.9,-84.6,31.7,-89.7,43.5,-62.5Z" transform="translate(100 100)" />
              </svg>
            </div>
          </motion.div>

          {/* Code editor terminal window */}
          <motion.div 
            className="absolute inset-x-4 bottom-8 sm:inset-x-8 sm:bottom-12 md:inset-x-12 md:bottom-16 max-w-full rounded-xl overflow-hidden shadow-xl"
            style={{ 
              maxHeight: '60%',
              aspectRatio: '16/9',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={codeControls}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            {/* Terminal header */}
            <div className="bg-gray-900 px-4 py-2 flex items-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="ml-auto text-gray-400 text-xs">aditeke-27.tsx</div>
            </div>

            {/* Code content */}
            <div className="bg-gray-950 text-white p-4 font-mono text-sm md:text-base w-full h-full overflow-hidden">
              <div className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1 items-start">
                <div className="text-gray-500">1</div>
                <div>
                  <span className="text-blue-300">public</span> <span className="text-yellow-300">style=</span><span className="text-green-300">"color: #addb67;"</span><span className="text-blue-300">&gt;</span><span className="text-yellow-300">class</span> <span className="text-white">AdiTekeWelcome</span> {'{'}
                </div>
                
                <div className="text-gray-500">2</div>
                <div className="pl-4">
                  <span className="text-blue-300">public</span> <span className="text-blue-300">static</span> <span className="text-yellow-300">void</span> <span className="text-yellow-300">style=</span><span className="text-green-300">"color: #82aaff;"</span><span className="text-blue-300">&gt;</span><span className="text-yellow-300">main</span>(String[] args) {'{'}
                </div>
                
                <div className="text-gray-500">3</div>
                <div className="pl-8">
                  <span className="text-yellow-300">System</span>.<span className="text-blue-300">out</span>.<span className="text-yellow-300">style=</span><span className="text-green-300">"color: #82aaff;"</span><span className="text-blue-300">&gt;</span><span className="text-yellow-300">println</span>(<span className="text-yellow-300">style=</span><span className="text-green-300">"color: #addb67;"</span><span className="text-blue-300">&gt;</span><span className="text-green-400">"Welcome to AdiTeke Software Solutions!"</span>);
                </div>
                
                <div className="text-gray-500">4</div>
                <div className="pl-8">
                  <span className="text-yellow-300">System</span>.<span className="text-blue-300">out</span>.<span className="text-yellow-300">style=</span><span className="text-green-300">"color: #82aaff;"</span><span className="text-blue-300">&gt;</span><span className="text-yellow-300">println</span>(<span className="text-yellow-300">style=</span><span className="text-green-300">"color: #addb67;"</span><span className="text-blue-300">&gt;</span><span className="text-green-400">"Building innovative digital experiences!"</span>);
                </div>
                
                <div className="text-gray-500">5</div>
                <div className="pl-4">{'}'}</div>
                
                <div className="text-gray-500">6</div>
                <div>{'}'}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TechStackVisual;