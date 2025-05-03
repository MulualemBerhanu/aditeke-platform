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
                    rotate: [0, 10, 0]
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
                  { Icon: MessageSquare, position: "bottom-1/4 left-0", delay: 5 }
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
                
                {/* Mission Strength Card */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full max-w-[400px] h-auto min-h-[320px] border border-gray-100 rounded-2xl bg-white shadow-xl p-4 md:p-8 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-2xl"></div>
                    
                    {/* Card Header */}
                    <div className="mb-6 flex items-center gap-2">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Target className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800">Mission Strength</h3>
                        <div className="h-1 w-12 md:w-16 bg-primary/30 mt-1 md:mt-2"></div>
                      </div>
                    </div>
                    
                    {/* Progress Bars */}
                    <div className="space-y-3 md:space-y-4">
                      {[
                        { label: "Innovation", value: 95, color: "from-primary to-blue-500" },
                        { label: "Client Focus", value: 98, color: "from-blue-500 to-cyan-400" },
                        { label: "Excellence", value: 90, color: "from-cyan-400 to-teal-400" },
                        { label: "Integrity", value: 97, color: "from-teal-400 to-emerald-500" }
                      ].map((item, index) => (
                        <motion.div 
                          key={index} 
                          className="mb-2"
                          initial={{ opacity: 0 }}
                          animate={missionInView ? { opacity: 1 } : { opacity: 0 }}
                          transition={{ delay: 0.3 + (index * 0.1), duration: 0.5 }}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs md:text-sm font-medium text-gray-600">{item.label}</span>
                            <span className="text-xs md:text-sm font-semibold text-primary">{item.value}%</span>
                          </div>
                          <div className="h-1.5 md:h-2 w-full bg-gray-100 rounded-full overflow-hidden">
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
                        <p className="text-blue-500 font-medium">CEO & Co-Founder</p>
                      </div>
                      
                      <h3 className="text-2xl font-bold mt-3 mb-4 text-gray-900">Samrawit Kassa</h3>
                      
                      <p className="text-gray-600 mb-6">
                        With her background in business strategy and technology management, Samrawit leads our company 
                        vision and growth. Her expertise in strategic partnerships, 
                        client relations, and organizational leadership ensures our company delivers exceptional value while 
                        maintaining our core mission.
                      </p>
                    </div>
                    
                    <div className="flex space-x-4">
                      {['Strategy', 'Leadership', 'Marketing'].map((skill, i) => (
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
      
      {/* Our Values Section */}
      <section className="py-24 bg-gradient-to-b from-white to-primary/5 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-block mb-4">
              <Badge variant="outline" className="px-3 py-1 text-primary border-primary/30 font-medium">
                Our Core Values
              </Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">The Principles That Guide Us</h2>
            <p className="text-gray-600 text-lg">
              Our values define how we work, make decisions, and deliver value to our clients.
              They are the foundation of our company culture and guide everything we do.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6 xl:gap-10">
            {[
              { 
                icon: <Star className="h-6 w-6" />, 
                title: "Excellence", 
                color: "bg-blue-50 text-blue-600",
                description: "We are committed to delivering the highest quality in everything we do, from code to client service." 
              },
              { 
                icon: <Heart className="h-6 w-6" />, 
                title: "Client Focus", 
                color: "bg-pink-50 text-pink-600",
                description: "We place our clients at the center of our work, understanding their needs and exceeding their expectations." 
              },
              { 
                icon: <Zap className="h-6 w-6" />, 
                title: "Innovation", 
                color: "bg-yellow-50 text-yellow-600",
                description: "We continuously explore new technologies and approaches to deliver cutting-edge solutions." 
              },
              { 
                icon: <RefreshCw className="h-6 w-6" />, 
                title: "Adaptability", 
                color: "bg-green-50 text-green-600",
                description: "We embrace change and pivot quickly to respond to evolving technologies and market needs." 
              },
              { 
                icon: <Users className="h-6 w-6" />, 
                title: "Collaboration", 
                color: "bg-purple-50 text-purple-600",
                description: "We believe in the power of teamwork and partnership to create solutions greater than the sum of their parts." 
              },
              { 
                icon: <Shield className="h-6 w-6" />, 
                title: "Integrity", 
                color: "bg-primary/10 text-primary",
                description: "We operate with transparency, honesty, and ethical principles in all our business dealings." 
              },
            ].map((value, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className={`w-12 h-12 rounded-full ${value.color} flex items-center justify-center mb-4`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
          
          {/* Stat Counters */}
          <div className="mt-20 md:mt-32 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl"></div>
            
            <div className="relative z-10 py-10 md:py-16 px-6 md:px-10 rounded-2xl overflow-hidden">
              <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Success By The Numbers</h2>
                <div className="h-1 w-20 bg-primary/30 mx-auto"></div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: "Projects Delivered", value: "120+" },
                  { label: "Client Retention Rate", value: "95%" },
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
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Code className="w-5 h-5 text-primary" />
            </motion.div>
            
            <motion.div
              className="absolute w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"
              style={{ bottom: "30%", right: "10%" }}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              animate={{ 
                y: [0, -15, 0],
                scale: [1, 1.1, 1],
                rotate: [0, -10, 0] 
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <Database className="w-4 h-4 text-blue-500" />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Work Process Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto mb-16">
            <div className="md:max-w-xl mb-10 md:mb-0">
              <div className="flex items-center mb-4">
                <Badge className="bg-primary/10 text-primary border-none px-3 py-1 text-xs">Process</Badge>
                <div className="h-px w-12 bg-primary/30 ml-2"></div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">How We Transform Your Ideas Into Reality</h2>
              
              <p className="text-gray-600 text-lg leading-relaxed">
                Our proven development methodology brings structure and transparency to every project.
                From initial concept to deployment and beyond, we follow a well-defined process
                that ensures quality, communication, and successful delivery.
              </p>
            </div>
            
            <motion.div
              className="relative flex items-center justify-center w-full md:w-64 h-64"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                className="absolute inset-0 border-4 border-dashed border-primary/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Award className="w-14 h-14 text-primary" />
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Discovery & Planning",
                description: "We begin by understanding your business objectives, gathering requirements, and defining the project scope and timeline.",
                icon: <BookOpen className="h-6 w-6" />
              },
              {
                step: "02",
                title: "Design & Architecture",
                description: "Our team creates intuitive UI/UX designs and establishes a robust technical architecture tailored to your needs.",
                icon: <Layout className="h-6 w-6" />
              },
              {
                step: "03",
                title: "Development & Testing",
                description: "We build your solution using agile methodologies with continuous integration and comprehensive testing.",
                icon: <Code className="h-6 w-6" />
              },
              {
                step: "04",
                title: "Deployment & Support",
                description: "After successful launch, we provide ongoing maintenance, performance monitoring, and continuous improvements.",
                icon: <Settings className="h-6 w-6" />
              }
            ].map((process, index) => (
              <motion.div
                key={index}
                className="relative bg-white p-8 rounded-xl shadow-md border border-gray-100 z-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  {process.icon}
                </div>
                
                <span className="text-5xl font-bold text-gray-100 absolute top-4 right-4">{process.step}</span>
                
                <h3 className="text-xl font-bold mb-4 text-gray-900">{process.title}</h3>
                
                <p className="text-gray-600 mb-6">{process.description}</p>
                
                {index < 3 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <ChevronRight className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10"></div>
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="absolute left-0 right-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-10 md:p-12 bg-gradient-to-br from-primary/5 to-blue-500/5">
                <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Business?</h2>
                <p className="text-gray-600 mb-8">
                  Let's discuss how AdiTeke can help you achieve your digital transformation goals. 
                  Our team is ready to bring your vision to life with cutting-edge software solutions.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <Coffee className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Free Consultation</p>
                      <p className="text-sm text-gray-600">No obligation, just valuable insights</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <LineChart className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Custom Strategy</p>
                      <p className="text-sm text-gray-600">Tailored to your unique needs</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2 p-10 md:p-12 bg-gradient-to-br from-primary to-blue-600 text-white">
                <h3 className="text-xl font-bold mb-6">Get In Touch</h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <p>+1 (641) 481-8560</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <p>support@aditeke.com</p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <Link href="/contact">
                    <Button className="w-full bg-white text-primary hover:bg-white/90">
                      Contact Us
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;