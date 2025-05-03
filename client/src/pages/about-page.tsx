import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useMotionTemplate } from 'framer-motion';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { 
  Award, 
  Code, 
  Clock, 
  Layout, 
  Heart, 
  Zap, 
  Shield, 
  ArrowRight,
  RefreshCw,
  Users,
  Star,
  Database,
  Layers,
  Monitor,
  Globe,
  MessageSquare,
  Briefcase,
  LineChart,
  Settings,
  BookOpen,
  Coffee,
  Sparkles,
  Target,
  Eye,
  Smartphone,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import SamrawitImage from '@/assets/team/samrawit-kassa.jpg';
import MulualemImage from '@/assets/team/mulualem.jpeg';
import CustomCountUp from '@/components/common/CustomCountUp';

const AboutPage = () => {
  // Use refs to track scroll position for parallax effects
  const containerRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const missionInView = useInView(missionRef, { once: false, amount: 0.3 });
  
  // Scroll-based animation for statistics
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const scaleProgress = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacityProgress = useTransform(scrollYProgress, [0, 0.3], [0.6, 1]);
  
  return (
    <div className="min-h-screen" ref={containerRef}>
      <Helmet>
        <title>About Us | AdiTeke Software Solutions</title>
        <meta
          name="description"
          content="Learn about AdiTeke Software Solutions, our company values, expert team, and mission to deliver exceptional software development services."
        />
        <meta 
          name="keywords" 
          content="AdiTeke, software development, tech company, software solutions, IT services, development team"
        />
      </Helmet>
      
      {/* Modern Animated Hero Section with 3D depth - With Mobile Responsiveness */}
      <div className="relative min-h-[60vh] py-20 md:py-40 overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-white">
        {/* Enhanced decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_80%,rgba(59,130,246,0.08),transparent_30%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.08),transparent_35%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
        
        {/* Advanced floating elements with parallax effect - Only visible on larger screens */}
        <motion.div 
          className="absolute hidden md:block top-40 left-[10%] w-48 h-48 rounded-full bg-gradient-to-br from-primary/10 to-blue-400/5 blur-3xl opacity-70"
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{
            translateX: useMotionTemplate`calc(-${scrollYProgress}% * 5)`,
            translateY: useMotionTemplate`calc(${scrollYProgress}% * 10)`
          }}
        ></motion.div>
        
        <motion.div 
          className="absolute hidden md:block bottom-40 right-[15%] w-36 h-36 rounded-full bg-blue-500/5 blur-2xl opacity-60"
          animate={{ 
            y: [0, -15, 0],
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{
            translateX: useMotionTemplate`calc(${scrollYProgress}% * 8)`,
            translateY: useMotionTemplate`calc(-${scrollYProgress}% * 5)`
          }}
        ></motion.div>
        
        <motion.div 
          className="absolute hidden md:block top-1/2 right-[40%] w-24 h-24 rounded-full bg-primary/10 blur-xl opacity-40"
          animate={{ 
            y: [0, -10, 0],
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        ></motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-12">
            {/* Left content - Title and description */}
            <motion.div
              className="lg:max-w-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              {/* Enhanced decorative elements */}
              <div className="flex items-center mb-6 space-x-3">
                <Badge className="px-3 py-1 bg-primary/10 text-primary border-none text-xs font-medium">
                  Our Story
                </Badge>
                <motion.div 
                  className="h-[2px] w-20 bg-gradient-to-r from-primary/60 to-blue-400/60 rounded-full"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 80, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
              
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold mb-6 leading-tight">
                <span className="block mb-2">Empowering Your</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-blue-600">
                  Digital Transformation
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed lg:pr-12">
                AdiTeke Software Solutions was founded with a vision to transform businesses through innovative software solutions. We combine technical expertise with deep industry knowledge to deliver exceptional results that empower our clients to thrive in the digital era.
              </p>
              
              {/* Enhanced stat counters */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 mt-10">
                {/* Years Experience */}
                <motion.div 
                  className="flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-primary mr-1">
                      <CustomCountUp end={7} duration={3} />
                    </span>
                    <span className="text-xl text-primary/80">+</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Years Experience</p>
                </motion.div>
                
                {/* On-Time Delivery */}
                <motion.div 
                  className="flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-primary mr-1">
                      <CustomCountUp end={98} duration={3} />
                    </span>
                    <span className="text-xl text-primary/80">%</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">On-Time Delivery</p>
                </motion.div>
                
                {/* Client Satisfaction */}
                <motion.div 
                  className="flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-primary mr-1">
                      <CustomCountUp end={98} duration={3} />
                    </span>
                    <span className="text-xl text-primary/80">%</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Client Satisfaction</p>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Right content - Animated shapes/visuals */}
            <motion.div 
              className="relative hidden lg:flex items-center justify-center lg:w-1/3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {/* Abstract 3D-like visual representation of digital transformation */}
              <div className="relative w-[380px] h-[380px]">
                {/* Center circle */}
                <motion.div 
                  className="absolute inset-1/4 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 backdrop-blur-md border border-white/30"
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 10, 0], 
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Revolving outer ring */}
                <motion.div 
                  className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Tech icons positioned around */}
                {[
                  { Icon: Code, position: "top-0 left-1/2 -translate-x-1/2", delay: 0 },
                  { Icon: Database, position: "top-1/4 right-0", delay: 1 },
                  { Icon: Globe, position: "bottom-0 left-1/2 -translate-x-1/2", delay: 2 },
                  { Icon: Layers, position: "top-1/4 left-0", delay: 3 },
                  { Icon: Monitor, position: "bottom-1/4 right-0", delay: 4 },
                  { Icon: MessageSquare, position: "bottom-1/4 left-0", delay: 5 },
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className={`absolute ${item.position} w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-primary`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      delay: 0.5 + (item.delay * 0.1), 
                      duration: 0.5,
                      type: "spring"
                    }}
                    whileHover={{ 
                      scale: 1.2, 
                      boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
                      transition: { duration: 0.2 }
                    }}
                  >
                    <item.Icon className="w-5 h-5" />
                  </motion.div>
                ))}
                
                {/* Floating particles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-primary/40"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.2, 0.8, 0.2],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 3,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Mission & Vision Section */}
      <section ref={missionRef} className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left Side - Animated Visual (hidden on mobile) */}
            <motion.div 
              className="hidden md:block lg:w-1/2 relative"
              initial={{ opacity: 0, x: -30 }}
              animate={missionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.7 }}
            >
              <div className="relative h-[400px] w-full max-w-[500px] mx-auto">
                {/* Decorative elements */}
                <motion.div
                  className="absolute -top-16 -left-16 w-32 h-32 bg-primary/5 rounded-full blur-2xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.7, 0.5]
                  }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                
                <motion.div
                  className="absolute -bottom-16 -right-16 w-40 h-40 bg-blue-400/5 rounded-full blur-2xl"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.6, 0.4]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
                
                {/* 3D-like chart visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full max-w-[400px] h-[300px] border border-gray-100 rounded-2xl bg-white shadow-xl p-8">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-2xl" />
                    
                    {/* Title with Mission icon */}
                    <div className="mb-8 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">Mission Strength</h3>
                        <div className="h-1 w-16 bg-primary/30 mt-2"></div>
                      </div>
                    </div>
                    
                    {/* Animated Bar Chart */}
                    {[
                      { label: "Innovation", value: 95, color: "from-primary to-blue-500" },
                      { label: "Client Focus", value: 98, color: "from-blue-500 to-cyan-400" },
                      { label: "Excellence", value: 90, color: "from-cyan-400 to-teal-400" },
                      { label: "Integrity", value: 97, color: "from-teal-400 to-emerald-500" }
                    ].map((item, index) => (
                      <motion.div 
                        key={index} 
                        className="mb-4"
                        initial={{ opacity: 0 }}
                        animate={missionInView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ delay: 0.3 + (index * 0.1), duration: 0.5 }}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-600">{item.label}</span>
                          <span className="text-sm font-semibold text-primary">{item.value}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                            initial={{ width: 0 }}
                            animate={missionInView ? { width: `${item.value}%` } : { width: 0 }}
                            transition={{ 
                              delay: 0.5 + (index * 0.15), 
                              duration: 1,
                              ease: "easeOut" 
                            }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Right Side - Text Content (full width on mobile) */}
            <motion.div 
              className="w-full lg:w-1/2 mx-auto max-w-2xl md:max-w-none"
              initial={{ opacity: 0, x: 30 }}
              animate={missionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.7 }}
            >
              <div className="space-y-12">
                {/* Mission */}
                <div>
                  <div className="flex items-center mb-4">
                    <motion.div 
                      className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"
                      initial={{ scale: 0 }}
                      animate={missionInView ? { scale: 1 } : { scale: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Target className="w-5 h-5" />
                    </motion.div>
                    <motion.div 
                      className="h-[1px] flex-grow ml-4 bg-gradient-to-r from-primary/50 to-transparent"
                      initial={{ width: 0 }}
                      animate={missionInView ? { width: "100%" } : { width: 0 }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Our Mission</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To empower businesses through innovative technology solutions that drive growth, efficiency, 
                    and competitive advantage. We are committed to delivering exceptional software that transforms ideas 
                    into powerful digital realities while maintaining the highest standards of quality and client satisfaction.
                  </p>
                </div>
                
                {/* Vision */}
                <div>
                  <div className="flex items-center mb-4">
                    <motion.div 
                      className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"
                      initial={{ scale: 0 }}
                      animate={missionInView ? { scale: 1 } : { scale: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <Eye className="w-5 h-5" />
                    </motion.div>
                    <motion.div 
                      className="h-[1px] flex-grow ml-4 bg-gradient-to-r from-blue-500/50 to-transparent"
                      initial={{ width: 0 }}
                      animate={missionInView ? { width: "100%" } : { width: 0 }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">Our Vision</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To be a globally recognized leader in software development, known for our technical excellence, 
                    innovative solutions, and client-focused approach. We envision a future where our technology 
                    empowers organizations across diverse industries to achieve their full potential in the digital landscape.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Team Section - Modern Elevated Style */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-primary/5 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.03),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.03),transparent_25%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div className="max-w-xl">
              <div className="flex items-center space-x-2 mb-4">
                <Badge className="bg-primary/10 text-primary border-none px-3 py-1 text-xs">Leadership</Badge>
                <div className="h-px w-12 bg-primary/30"></div>
              </div>
              
              <motion.h2 
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Meet The Team Behind <span className="text-primary">AdiTeke</span>
              </motion.h2>
              
              <motion.p 
                className="text-gray-600 text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Our talented professionals bring together expertise from diverse backgrounds to deliver exceptional solutions that drive your business forward.
              </motion.p>
            </div>
            
            <motion.div 
              className="mt-8 md:mt-0"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href="/careers">
                <Button 
                  variant="outline" 
                  className="border-primary/30 text-primary hover:bg-primary/5 px-5 py-6 group"
                >
                  <Briefcase className="mr-2 h-5 w-5" />
                  <span>Join Our Team</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:gap-12">
            {/* CTO Card - Enhanced Modern Style */}
            <motion.div
              className="relative group rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              whileHover={{ y: -8 }}
            >
              {/* Background glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative flex flex-col md:flex-row overflow-hidden bg-white rounded-2xl shadow-xl">
                <div className="md:w-2/5 h-[300px] md:h-auto overflow-hidden">
                  <img
                    src={MulualemImage}
                    alt="Mulualem Berhanu"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                
                <div className="md:w-3/5 p-8">
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 mr-3">
                          <Code className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-primary font-medium">CTO & Founder</p>
                      </div>
                      
                      <h3 className="text-2xl font-bold mt-3 mb-4 text-gray-900">Mulualem Berhanu</h3>
                      
                      <p className="text-gray-600 mb-6">
                        Mulualem brings over 7 years of expertise in software architecture, technical leadership, and innovation. 
                        He oversees the technical direction of AdiTeke, ensuring all solutions are built with scalability, 
                        security, and performance in mind.
                      </p>
                    </div>
                    
                    <div className="flex space-x-4">
                      {['React', 'Node.js', 'PostgreSQL'].map((skill, i) => (
                        <Badge key={i} className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* CEO Card - Enhanced Modern Style */}
            <motion.div
              className="relative group rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              whileHover={{ y: -8 }}
            >
              {/* Background glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative flex flex-col md:flex-row overflow-hidden bg-white rounded-2xl shadow-xl">
                <div className="md:w-2/5 h-[300px] md:h-auto overflow-hidden">
                  <img
                    src={SamrawitImage}
                    alt="Samrawit Kassa"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                
                <div className="md:w-3/5 p-8">
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 mr-3">
                          <Users className="h-4 w-4 text-blue-500" />
                        </div>
                        <p className="text-blue-500 font-medium">CEO</p>
                      </div>
                      
                      <h3 className="text-2xl font-bold mt-3 mb-4 text-gray-900">Samrawit Kassa</h3>
                      
                      <p className="text-gray-600 mb-6">
                        Samrawit leads AdiTeke with a vision for growth and excellence. Her expertise in business strategy, 
                        client relations, and organizational leadership ensures our company delivers exceptional value while 
                        maintaining strong partnerships with clients.
                      </p>
                    </div>
                    
                    <div className="flex space-x-4">
                      {['Business Strategy', 'Leadership', 'Client Relations'].map((skill, i) => (
                        <Badge key={i} className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Core Values Section - Modern Interactive Cards */}
      <section className="py-24 bg-gradient-to-b from-white to-primary/5 relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.03),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.03),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:16px_16px] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block">
              <div className="flex items-center justify-center mb-4 gap-3">
                <Badge className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border-none text-xs font-medium">
                  Core Values
                </Badge>
                <Sparkles className="h-5 w-5 text-blue-500/70" />
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-700">
                What Drives Us
              </h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our core values guide every aspect of our work, from how we engage with clients to how we develop our solutions.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Innovation Card */}
            <motion.div 
              className="relative group overflow-hidden rounded-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              {/* Glow effect on hover */}
              <motion.div 
                className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-xl opacity-0 blur group-hover:opacity-70 transition duration-700"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.7 }}
                transition={{ duration: 0.4 }}
              />
              
              <div className="relative h-full bg-white rounded-xl p-8 shadow-lg transition-all duration-300">
                {/* Top badge */}
                <div className="absolute -right-2 -top-2">
                  <div className="relative flex h-6 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-blue-500 pl-2 pr-2.5 text-xs font-medium text-white">
                    <span className="absolute -left-2 aspect-square w-2 rounded-full bg-white/25" />
                    <span>01</span>
                  </div>
                </div>
                
                {/* Icon container with animation */}
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10 
                  flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-all duration-500">
                  <Zap className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-primary transition-colors duration-300">
                  Innovation
                </h3>
                
                <p className="text-gray-600 text-sm">
                  We embrace creative thinking and innovative approaches to solve complex challenges and deliver cutting-edge solutions.
                </p>
                
                {/* Animated indicator line */}
                <div className="h-0.5 w-8 bg-primary/20 mt-5 rounded-full group-hover:w-full group-hover:bg-primary/40 transition-all duration-700 ease-out"></div>
              </div>
            </motion.div>
            
            {/* Client-Focused Card */}
            <motion.div 
              className="relative group overflow-hidden rounded-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              {/* Glow effect on hover */}
              <motion.div 
                className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-0 blur group-hover:opacity-70 transition duration-700"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.7 }}
                transition={{ duration: 0.4 }}
              />
              
              <div className="relative h-full bg-white rounded-xl p-8 shadow-lg transition-all duration-300">
                {/* Top badge */}
                <div className="absolute -right-2 -top-2">
                  <div className="relative flex h-6 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 pl-2 pr-2.5 text-xs font-medium text-white">
                    <span className="absolute -left-2 aspect-square w-2 rounded-full bg-white/25" />
                    <span>02</span>
                  </div>
                </div>
                
                {/* Icon container with animation */}
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10
                  flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-all duration-500">
                  <Heart className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-blue-500 transition-colors duration-300">
                  Client-Focused
                </h3>
                
                <p className="text-gray-600 text-sm">
                  We prioritize understanding our clients' needs and exceeding their expectations through attentive service and personalized solutions.
                </p>
                
                {/* Animated indicator line */}
                <div className="h-0.5 w-8 bg-blue-500/20 mt-5 rounded-full group-hover:w-full group-hover:bg-blue-500/40 transition-all duration-700 ease-out"></div>
              </div>
            </motion.div>
            
            {/* Quality Card */}
            <motion.div 
              className="relative group overflow-hidden rounded-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              {/* Glow effect on hover */}
              <motion.div 
                className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl opacity-0 blur group-hover:opacity-70 transition duration-700"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.7 }}
                transition={{ duration: 0.4 }}
              />
              
              <div className="relative h-full bg-white rounded-xl p-8 shadow-lg transition-all duration-300">
                {/* Top badge */}
                <div className="absolute -right-2 -top-2">
                  <div className="relative flex h-6 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 pl-2 pr-2.5 text-xs font-medium text-white">
                    <span className="absolute -left-2 aspect-square w-2 rounded-full bg-white/25" />
                    <span>03</span>
                  </div>
                </div>
                
                {/* Icon container with animation */}
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-500/10 to-teal-500/10
                  flex items-center justify-center mb-6 text-cyan-600 group-hover:scale-110 transition-all duration-500">
                  <Star className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-cyan-600 transition-colors duration-300">
                  Quality
                </h3>
                
                <p className="text-gray-600 text-sm">
                  We are committed to delivering high-quality, reliable solutions that adhere to industry best practices and exceed quality standards.
                </p>
                
                {/* Animated indicator line */}
                <div className="h-0.5 w-8 bg-cyan-500/20 mt-5 rounded-full group-hover:w-full group-hover:bg-cyan-500/40 transition-all duration-700 ease-out"></div>
              </div>
            </motion.div>
            
            {/* Integrity Card */}
            <motion.div 
              className="relative group overflow-hidden rounded-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              {/* Glow effect on hover */}
              <motion.div 
                className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl opacity-0 blur group-hover:opacity-70 transition duration-700"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.7 }}
                transition={{ duration: 0.4 }}
              />
              
              <div className="relative h-full bg-white rounded-xl p-8 shadow-lg transition-all duration-300">
                {/* Top badge */}
                <div className="absolute -right-2 -top-2">
                  <div className="relative flex h-6 items-center justify-center rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 pl-2 pr-2.5 text-xs font-medium text-white">
                    <span className="absolute -left-2 aspect-square w-2 rounded-full bg-white/25" />
                    <span>04</span>
                  </div>
                </div>
                
                {/* Icon container with animation */}
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-teal-500/10 to-emerald-500/10
                  flex items-center justify-center mb-6 text-teal-600 group-hover:scale-110 transition-all duration-500">
                  <Shield className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-teal-600 transition-colors duration-300">
                  Integrity
                </h3>
                
                <p className="text-gray-600 text-sm">
                  We maintain the highest ethical standards in all our business practices and relationships, building trust through transparency.
                </p>
                
                {/* Animated indicator line */}
                <div className="h-0.5 w-8 bg-teal-500/20 mt-5 rounded-full group-hover:w-full group-hover:bg-teal-500/40 transition-all duration-700 ease-out"></div>
              </div>
            </motion.div>
          </div>
          
          {/* Core Expertise Section */}
          <div className="mt-24 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Text content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <Badge className="bg-primary/10 text-primary border-none px-3 py-1 text-xs font-medium">
                    Our Expertise
                  </Badge>
                  <div className="h-px w-12 bg-primary/30"></div>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Technical Excellence that Drives Results</h3>
                
                <p className="text-gray-600 mb-8">
                  We combine deep technical expertise with industry knowledge to deliver solutions that drive tangible business results. Our team stays at the forefront of technology trends to ensure you receive the most innovative and effective solutions.
                </p>
                
                <div className="space-y-6">
                  {[
                    { title: "Custom Software Development", icon: Code },
                    { title: "Mobile Application Development", icon: Monitor },
                    { title: "Web Application Development", icon: Globe },
                    { title: "AI & Machine Learning Solutions", icon: Sparkles }
                  ].map((item, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-start gap-4"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.2 + (index * 0.1) }}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center">
                          <item.icon className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-1">{item.title}</h4>
                        <div className="h-0.5 w-12 bg-primary/20 rounded-full mb-2"></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              {/* Right side - Image or visual */}
              <motion.div
                className="relative h-[400px] rounded-xl overflow-hidden"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                {/* Modern gradient background with code-like pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-500/5 to-primary/10"></div>
                
                {/* Decorative code-like elements */}
                <div className="absolute inset-x-0 top-8 px-8">
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <motion.div 
                        key={index}
                        className="h-3 bg-primary/10 rounded-full"
                        style={{ width: `${Math.random() * 40 + 60}%` }}
                        initial={{ width: 0, opacity: 0 }}
                        whileInView={{ width: `${Math.random() * 40 + 60}%`, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 + (index * 0.1) }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Statistics */}
                <div className="absolute bottom-0 inset-x-0 px-8 py-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Projects Completed", value: "85+" },
                      { label: "Client Retention", value: "95%" },
                      { label: "On-Time Delivery", value: "98%" },
                      { label: "Team Experts", value: "18+" }
                    ].map((stat, index) => (
                      <motion.div 
                        key={index}
                        className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      >
                        <div className="text-2xl font-bold text-primary">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Tech floating elements */}
                <motion.div
                  className="absolute w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center"
                  style={{ top: "20%", left: "15%" }}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  animate={{ 
                    y: [0, -10, 0],
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0] 
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Database className="text-gray-700 opacity-60 w-6 h-6" />
                </motion.div>
                
                <motion.div
                  className="absolute w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"
                  style={{ top: "65%", left: "75%" }}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  animate={{ 
                    y: [0, -10, 0],
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0] 
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  <Code className="text-gray-700 opacity-60 w-6 h-6" />
                </motion.div>
                
                <motion.div
                  className="absolute w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center"
                  style={{ top: "30%", left: "80%" }}
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  animate={{ 
                    y: [0, -10, 0],
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0] 
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <Layers className="text-gray-700 opacity-60 w-6 h-6" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute top-0 inset-x-0 h-32 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
        <div className="absolute bottom-0 inset-x-0 h-32 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block">
              <div className="flex items-center justify-center mb-4">
                <div className="h-px w-8 bg-primary/40"></div>
                <Award className="h-5 w-5 mx-2 text-primary/70" />
                <div className="h-px w-8 bg-primary/40"></div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Values
              </h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do and help us deliver exceptional results.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Client Satisfaction */}
            <motion.div
              className="bg-gradient-to-b from-white to-primary/5 rounded-xl p-6 shadow-lg border border-gray-100 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              {/* Value icon with animation */}
              <div className="rounded-lg bg-white p-4 shadow-md w-16 h-16 flex items-center justify-center 
                mb-6 text-primary/80 group-hover:text-primary group-hover:shadow-lg 
                group-hover:scale-110 transition-all duration-300">
                <Heart className="h-6 w-6" />
              </div>
              
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary/90 transition-colors duration-300">
                Client Satisfaction
              </h3>
              
              <p className="text-gray-600 mb-4">
                We prioritize understanding our clients' needs and exceeding their expectations at every step.
              </p>
              
              {/* Animated line */}
              <div className="h-0.5 w-10 bg-primary/30 group-hover:w-full transition-all duration-500"></div>
            </motion.div>
            
            {/* Innovation */}
            <motion.div
              className="bg-gradient-to-b from-white to-primary/5 rounded-xl p-6 shadow-lg border border-gray-100 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              {/* Value icon with animation */}
              <div className="rounded-lg bg-white p-4 shadow-md w-16 h-16 flex items-center justify-center 
                mb-6 text-primary/80 group-hover:text-primary group-hover:shadow-lg 
                group-hover:scale-110 transition-all duration-300">
                <Zap className="h-6 w-6" />
              </div>
              
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary/90 transition-colors duration-300">
                Innovation
              </h3>
              
              <p className="text-gray-600 mb-4">
                We embrace creative thinking and innovative approaches to solve complex challenges.
              </p>
              
              {/* Animated line */}
              <div className="h-0.5 w-10 bg-primary/30 group-hover:w-full transition-all duration-500"></div>
            </motion.div>
            
            {/* Integrity */}
            <motion.div
              className="bg-gradient-to-b from-white to-primary/5 rounded-xl p-6 shadow-lg border border-gray-100 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              {/* Value icon with animation */}
              <div className="rounded-lg bg-white p-4 shadow-md w-16 h-16 flex items-center justify-center 
                mb-6 text-primary/80 group-hover:text-primary group-hover:shadow-lg 
                group-hover:scale-110 transition-all duration-300">
                <Shield className="h-6 w-6" />
              </div>
              
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary/90 transition-colors duration-300">
                Integrity
              </h3>
              
              <p className="text-gray-600 mb-4">
                We maintain the highest ethical standards in all our business practices and relationships.
              </p>
              
              {/* Animated line */}
              <div className="h-0.5 w-10 bg-primary/30 group-hover:w-full transition-all duration-500"></div>
            </motion.div>
            
            {/* Continuous Improvement */}
            <motion.div
              className="bg-gradient-to-b from-white to-primary/5 rounded-xl p-6 shadow-lg border border-gray-100 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              {/* Value icon with animation */}
              <div className="rounded-lg bg-white p-4 shadow-md w-16 h-16 flex items-center justify-center 
                mb-6 text-primary/80 group-hover:text-primary group-hover:shadow-lg 
                group-hover:scale-110 transition-all duration-300">
                <RefreshCw className="h-6 w-6" />
              </div>
              
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary/90 transition-colors duration-300">
                Continuous Improvement
              </h3>
              
              <p className="text-gray-600 mb-4">
                We constantly seek ways to enhance our processes, skills, and deliverables.
              </p>
              
              {/* Animated line */}
              <div className="h-0.5 w-10 bg-primary/30 group-hover:w-full transition-all duration-500"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600"></div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diagonalHatchCTA" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="40" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonalHatchCTA)" />
          </svg>
        </div>
        
        {/* Animated circles */}
        <motion.div
          className="absolute rounded-full bg-white/10 w-32 h-32 left-[20%] top-[30%]"
          animate={{
            y: [0, -20, 0],
            x: [0, 15, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute rounded-full bg-white/10 w-40 h-40 right-[25%] bottom-[20%]"
          animate={{
            y: [0, -15, 0],
            x: [0, -10, 0],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Transform Your Ideas Into Reality?
            </h2>
            
            <p className="text-xl mb-10 text-white/90">
              Let's discuss how we can help with your next project.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg font-medium w-full sm:w-auto"
                  >
                    Contact Us Today
                  </Button>
                </motion.div>
              </Link>
              
              <Link to="/services">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    className="bg-white/15 text-white hover:bg-white/30 border border-white/50 px-8 py-6 text-lg font-medium w-full sm:w-auto"
                  >
                    Explore Our Services
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;