import { motion } from 'framer-motion';
import { 
  Award, 
  Code, 
  Globe, 
  HeartHandshake, 
  Lightbulb, 
  LineChart, 
  Users, 
  Rocket, 
  CheckCircle, 
  Shield,
  BarChart4
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const AboutSection = () => {
  // Enhanced features with advanced descriptions and icons
  const features = [
    { 
      title: "Expert Engineering Team", 
      description: "Seasoned engineers with deep expertise across multiple technology stacks and domains", 
      icon: <Users className="h-6 w-6" />,
      gradient: "from-blue-600 to-blue-400"
    },
    { 
      title: "Quality Assurance", 
      description: "Rigorous testing methodologies ensuring flawless code, design, and performance", 
      icon: <CheckCircle className="h-6 w-6" />,
      gradient: "from-green-600 to-emerald-400" 
    },
    { 
      title: "Innovative Solutions", 
      description: "Pioneering approaches using cutting-edge technologies and creative problem-solving", 
      icon: <Lightbulb className="h-6 w-6" />,
      gradient: "from-amber-500 to-yellow-400" 
    },
    { 
      title: "Strategic Partnerships", 
      description: "Collaborative relationships with clients from initial concept through continuous evolution", 
      icon: <HeartHandshake className="h-6 w-6" />,
      gradient: "from-rose-600 to-pink-400"
    },
    { 
      title: "Global Capabilities", 
      description: "International presence with solutions deployed across diverse industries and markets", 
      icon: <Globe className="h-6 w-6" />,
      gradient: "from-indigo-600 to-blue-400"
    },
    { 
      title: "Data-Driven Excellence", 
      description: "Analytics-powered decisions and metrics-based optimizations for maximum business impact", 
      icon: <BarChart4 className="h-6 w-6" />,
      gradient: "from-violet-600 to-purple-400"
    },
    { 
      title: "Rapid Delivery", 
      description: "Optimized development processes for fast time-to-market without compromising quality", 
      icon: <Rocket className="h-6 w-6" />,
      gradient: "from-red-600 to-orange-400"
    },
    { 
      title: "Security Focus", 
      description: "Best-in-class security practices integrated throughout the development lifecycle", 
      icon: <Shield className="h-6 w-6" />,
      gradient: "from-cyan-600 to-teal-400"
    }
  ];

  // Timeline data for company milestones with enhanced narrative
  const timeline = [
    { 
      title: "🧭 Vision & Purpose", 
      description: "Founded on the belief that thoughtfully designed technology can transform businesses of every size.", 
      year: "2018"
    },
    { 
      title: "👨‍💻 Innovation Begins", 
      description: "Started as a close-knit team of passionate engineers with a focus on quality and client satisfaction.", 
      year: "2019"
    },
    { 
      title: "🧠 Beyond Code", 
      description: "Evolved into a full-service solution provider—combining technical expertise with strategic consulting.", 
      year: "2020"
    },
    { 
      title: "🚀 Accelerated Growth", 
      description: "Expanded our capabilities from MVPs to enterprise platforms, built with precision, scale, and empathy.", 
      year: "2022"
    },
    { 
      title: "🌍 Global Impact", 
      description: "Today, we craft transformative, future-ready digital solutions that drive measurable business outcomes.", 
      year: "2023"
    }
  ];

  return (
    <section id="about" className="pt-32 pb-24 relative overflow-hidden">
      {/* Advanced background with curved transition */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#071336]/20 to-transparent -z-10"></div>
      
      {/* Main background with dynamic pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/90 via-blue-50/60 to-white/95 -z-20"></div>
      
      {/* Abstract wave divider - more prominent */}
      <div className="absolute inset-x-0 top-0 transform -translate-y-[99%] z-0 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-24 text-blue-50">
          <path 
            d="M0,0V7.23C0,65.52,268.63,112.77,600,112.77S1200,65.52,1200,7.23V0Z" 
            fill="currentColor"
          ></path>
        </svg>
      </div>
      
      {/* Enhanced background pattern with more dynamic animations */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {/* Radial gradients for depth */}
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_80%_60%,rgba(59,130,246,0.05)_0%,transparent_50%)]"></div>
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_40%_90%,rgba(59,130,246,0.08)_0%,transparent_40%)]"></div>
        
        {/* Animated floating elements with parallax effect */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-blue-500/10 to-blue-600/5"
            style={{
              width: `${20 + i * 8}px`,
              height: `${20 + i * 8}px`,
              left: `${3 + i * 8}%`,
              top: `${5 + (i % 6) * 15}%`,
              filter: "blur(1px)",
            }}
            animate={{
              y: [0, -15, 0],
              x: [0, i % 2 === 0 ? 10 : -10, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, i % 3 === 0 ? 1.1 : 0.9, 1]
            }}
            transition={{
              duration: 4 + (i % 4),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2
            }}
          />
        ))}
        
        {/* Hexagonal grid pattern for a more technical feel */}
        <div className="absolute inset-0 opacity-10" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='40' viewBox='0 0 24 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40c5.523 0 10-4.477 10-10V0C4.477 0 0 4.477 0 10v30zm22 0c-5.523 0-10-4.477-10-10V0c5.523 0 10 4.477 10 10v30z' fill='%233b82f6' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        ></div>
        
        {/* Futuristic grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Section header with decorative elements */}
        <motion.div 
          className="text-center mb-20 max-w-3xl mx-auto relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative elements */}
          <motion.div 
            className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-40 h-1.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          {/* Fancy title with advanced styling */}
          <div className="relative inline-block mb-6">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-primary/90">
              About AdiTeke Software Solutions
            </h2>
            
            {/* Accent dot */}
            <motion.span 
              className="absolute -right-4 top-0 text-primary"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >.</motion.span>
            
            {/* Subtle glow effect */}
            <div className="absolute -inset-3 bg-primary/5 rounded-lg blur-xl opacity-50 -z-10"></div>
          </div>
          
          {/* Enhanced description with backdrop and accent line */}
          <div className="relative">
            <p className="text-gray-700 leading-relaxed text-lg px-6 py-4 rounded-lg bg-white/50 backdrop-blur-sm border border-white/60 shadow-sm">
              We're more than just developers - we're your technology partners committed to transforming your business challenges into innovative digital solutions.
            </p>
            
            {/* Accent line animation */}
            <motion.div 
              className="absolute -bottom-2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
          
          {/* Small decorative dots */}
          <div className="flex justify-center space-x-2 mt-6">
            {[...Array(3)].map((_, i) => (
              <motion.div 
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary/60"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + (i * 0.1), duration: 0.4 }}
              />
            ))}
          </div>
        </motion.div>
      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Images with 3D effect */}
          <div className="order-2 lg:order-1">
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              {/* Main image */}
              <motion.div
                className="rounded-2xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Team of developers working together" 
                  className="w-full h-auto"
                  width="1000"
                  height="670"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60"></div>
              </motion.div>
              
              {/* Floating accent images */}
              <motion.div 
                className="absolute -bottom-10 -right-10 w-40 h-40 md:w-64 md:h-48 rounded-lg shadow-xl overflow-hidden border-4 border-white"
                initial={{ opacity: 0, x: 20, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80" 
                  alt="Team meeting" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
              
              <motion.div 
                className="absolute -top-10 -left-10 w-32 h-32 md:w-48 md:h-40 rounded-lg shadow-xl overflow-hidden border-4 border-white"
                initial={{ opacity: 0, x: -20, y: -20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80" 
                  alt="Software development" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </motion.div>
          </div>
          
          {/* Right side - About Content */}
          <div className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="px-1">
                <div className="inline-block px-4 py-1 mb-5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Our Story
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold mb-6">Transforming Businesses Through Technology</h3>
                
                <div className="space-y-4 text-gray-600 mb-8">
                  <p>
                    Every line of code we write has a purpose — to empower, innovate, and transform.
                  </p>
                  <p>
                    AdiTeke Software Solutions was born from a belief that meaningful technology should be accessible to every business — not just the giants. We started small, driven by bold ideas and a passion for impact. Today, we're a growing team of digital problem solvers, creating human-centered software that fuels real progress.
                  </p>
                  <p>
                    From helping startups launch their first MVP to scaling enterprise-grade solutions, our mission remains the same:
                    Build with clarity. Ship with excellence. Grow with our clients.
                  </p>
                </div>
                
                {/* Company timeline */}
                <div className="mb-10 border-l-2 border-primary/20 pl-4 space-y-6">
                  {timeline.map((item, index) => (
                    <motion.div 
                      key={index}
                      className="relative"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <div className="font-medium text-gray-800 text-lg flex items-center">
                        <span>{item.title}</span>
                        <span className="ml-2 text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {item.year}
                        </span>
                      </div>
                      <div className="text-gray-600 text-sm pl-5">{item.description}</div>
                    </motion.div>
                  ))}
                </div>
                
                <Link href="/about">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    <span>Learn More About Us</span>
                    <Code className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Features Grid - Advanced Design */}
        <div className="relative mt-32 mb-16">
          {/* Section Title */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="inline-block px-5 py-1.5 mb-4 rounded-full bg-blue-100/60 backdrop-blur-sm text-primary font-medium border border-blue-200/50"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              Why Choose Us
            </motion.div>
            
            <h3 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-700">
              Our Core Capabilities
            </h3>
            
            <motion.div 
              className="mx-auto w-20 h-1 mt-4 bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-full"
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
          </motion.div>
          
          {/* Modern Features Grid with glass cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="relative overflow-hidden rounded-2xl shadow-lg group h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
                whileHover={{ 
                  y: -6, 
                  boxShadow: "0 25px 35px -12px rgba(59, 130, 246, 0.25)",
                }}
              >
                {/* Glossy background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-white/80 backdrop-blur-sm opacity-90 group-hover:opacity-100 transition-all duration-300" />
                
                {/* Accent gradient border top */}
                <div className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r from-transparent via-blue-500/80 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
                
                {/* Decorative corner accent */}
                <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-gradient-to-bl from-transparent to-primary/10 opacity-0 group-hover:opacity-100 transform group-hover:scale-125 transition-all duration-700"></div>
                
                {/* Icon container with dynamic gradient */}
                <div className="relative p-6 flex flex-col h-full">
                  <div 
                    className={`mb-4 p-3 w-14 h-14 rounded-xl shadow-md flex items-center justify-center text-white z-10 group-hover:shadow-lg transition-all duration-300 bg-gradient-to-br ${feature.gradient}`}
                  >
                    {feature.icon}
                  </div>
                  
                  {/* Content with improved styling */}
                  <div className="z-10">
                    <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
                
                {/* Subtle corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Enhanced CTA Section */}
        <motion.div 
          className="mt-24 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Premium glass-morphic card with advanced background */}
          <div className="relative rounded-2xl overflow-hidden backdrop-blur-md">
            {/* Fancy background with animated gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-blue-400/5 -z-10" />
            
            {/* Animated dots pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.4)_0%,transparent_30%)]"></div>
              <div className="absolute w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.4)_0%,transparent_30%)]"></div>
            </div>
            
            {/* Floating orbs for visual interest */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-white/50"
                style={{
                  width: `${10 + i * 8}px`,
                  height: `${10 + i * 8}px`,
                  left: `${10 + i * 20}%`,
                  top: `${40 + (i % 3) * 20}%`,
                  filter: 'blur(2px)'
                }}
                animate={{
                  y: [0, -15, 0],
                  x: [0, i % 2 === 0 ? 10 : -10, 0],
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
            
            <div className="px-8 py-14 text-center relative z-10">
              {/* Section icon */}
              <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Code className="h-8 w-8 text-primary" />
              </div>
              
              {/* Heading with subtle animation */}
              <motion.h3 
                className="text-2xl md:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-primary relative inline-block"
                style={{
                  backgroundSize: '200% auto',
                }}
              >
                Ready to start your digital transformation?
              </motion.h3>
              
              <p className="text-gray-600 mb-10 max-w-2xl mx-auto text-lg backdrop-blur-sm bg-white/30 py-3 px-6 rounded-lg">
                Partner with AdiTeke Software Solutions and turn your vision into reality with our expert team and innovative approach.
              </p>
              
              {/* Enhanced buttons with animations */}
              <div className="flex flex-wrap justify-center gap-6">
                <Link href="/contact">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white px-8 py-6 shadow-lg shadow-primary/20">
                      Start a Project
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/services">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="backdrop-blur-sm bg-white/50 text-primary border-primary/30 hover:bg-primary/5 px-8 py-6 shadow-md">
                      Explore Our Services
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </div>
            
            {/* Decorative shapes */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-primary/5 rounded-br-3xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-primary/5 rounded-tl-3xl" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;