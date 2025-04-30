import React from 'react';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import Lottie from 'lottie-react';

// Import animation JSON files for Lottie
import buildMilestoneAnim from '../../assets/animations/build-milestone.json';
import customScalableAnim from '../../assets/animations/custom-scalable.json';
import trustedStartupsAnim from '../../assets/animations/trusted.json';

const FeatureSection = () => {
  // Animation variants for staggered animation
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  // Features data
  const features = [
    {
      icon: buildMilestoneAnim,
      title: "🎯 We're here to build your first milestone",
      description: "Our team is committed to helping you reach your critical business milestones with precision and expertise.",
    },
    {
      icon: customScalableAnim,
      title: "🛠️ 100% Custom — Scalable from Day 1",
      description: "We build tailor-made solutions designed to grow seamlessly with your business needs from the very beginning.",
    },
    {
      icon: trustedStartupsAnim,
      title: "❤️ Trusted by startups, growing with you",
      description: "We provide reliable partnership and support as your business evolves and scales to new heights.",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-indigo-900 to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Proven Track Record of Excellence
          </h2>
          <div className="w-24 h-1 bg-indigo-500 mx-auto rounded-full"></div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => (
            <Tilt
              key={index}
              className="h-full"
              tiltMaxAngleX={5}
              tiltMaxAngleY={5}
              glareEnable={true}
              glareMaxOpacity={0.1}
              glareColor="#ffffff"
              glarePosition="all"
              scale={1.02}
            >
              <motion.div
                className="relative h-full rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 p-8 flex flex-col items-center text-center transform transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                variants={featureVariants}
                whileHover={{ 
                  boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
                  borderColor: "rgba(99, 102, 241, 0.6)" 
                }}
              >
                {/* Animated pulse/glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 animate-pulse-slow pointer-events-none"></div>
                
                {/* Lottie animation */}
                <div className="w-24 h-24 mb-6">
                  <Lottie
                    animationData={feature.icon}
                    loop={true}
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-4 font-urbanist">
                  {feature.title}
                </h3>
                
                <p className="text-gray-300 font-inter leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            </Tilt>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;