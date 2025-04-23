import { motion } from 'framer-motion';
import { Award, Code, Globe, HeartHandshake, Lightbulb, LineChart, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const AboutSection = () => {
  const features = [
    { 
      title: "Expert Team", 
      description: "Industry veterans with diverse technical expertise", 
      icon: <Users className="h-5 w-5" /> 
    },
    { 
      title: "Quality Driven", 
      description: "Excellence in code, design, and performance", 
      icon: <Award className="h-5 w-5" /> 
    },
    { 
      title: "Innovative Approach", 
      description: "Cutting-edge solutions using latest technologies", 
      icon: <Lightbulb className="h-5 w-5" /> 
    },
    { 
      title: "Client Partnership", 
      description: "Dedicated support from concept to deployment", 
      icon: <HeartHandshake className="h-5 w-5" /> 
    },
    { 
      title: "Global Reach", 
      description: "Serving clients across multiple industries worldwide", 
      icon: <Globe className="h-5 w-5" /> 
    },
    { 
      title: "Data-Driven", 
      description: "Analytics-backed decisions for optimal results", 
      icon: <LineChart className="h-5 w-5" /> 
    }
  ];

  // Timeline data for company milestones
  const timeline = [
    { title: "Company Founded", description: "Started with a team of passionate software engineers" },
    { title: "Expanded Services", description: "Added mobile and cloud development offerings" },
    { title: "Global Expansion", description: "Opened international offices and partnerships" },
    { title: "AI Integration", description: "Incorporated advanced AI solutions in our services" }
  ];

  // Animated background pattern for visual interest
  const BackgroundPattern = () => (
    <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10"></div>
      <div className="absolute top-40 -left-20 w-60 h-60 rounded-full bg-primary/5"></div>
      <div className="absolute bottom-40 right-20 w-40 h-40 rounded-full bg-primary/5"></div>
      
      <svg className="absolute bottom-0 left-0 w-full h-32 text-primary/5" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
        <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
        <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" opacity=".25"></path>
      </svg>
    </div>
  );

  return (
    <section id="about" className="pt-32 pb-24 relative overflow-hidden">
      {/* Advanced background with curved transition */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#071336]/20 to-transparent -z-10"></div>
      
      {/* Main background with dynamic pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/90 to-white/95 -z-20"></div>
      
      {/* Abstract wave divider */}
      <div className="absolute inset-x-0 top-0 transform -translate-y-[99%] z-0 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-24 text-blue-50">
          <path 
            d="M0,0V7.23C0,65.52,268.63,112.77,600,112.77S1200,65.52,1200,7.23V0Z" 
            fill="currentColor"
          ></path>
        </svg>
      </div>
      
      {/* Enhanced background pattern with animations */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_80%_60%,rgba(59,130,246,0.05)_0%,transparent_50%)]"></div>
        
        {/* Animated floating elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500/5"
            style={{
              width: `${20 + i * 10}px`,
              height: `${20 + i * 10}px`,
              left: `${5 + i * 12}%`,
              top: `${10 + (i % 5) * 15}%`,
            }}
            animate={{
              y: [0, -15, 0],
              x: [0, i % 2 === 0 ? 8 : -8, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Grid pattern */}
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
                    AdiTeke Software Solutions has grown from a small team of passionate developers to a global technology partner for businesses across industries.
                  </p>
                  <p>
                    We combine technical expertise with industry knowledge to deliver custom software solutions that drive innovation, efficiency, and growth for our clients.
                  </p>
                </div>
                
                {/* Company timeline */}
                <div className="mb-10 border-l-2 border-primary/20 pl-6 space-y-6">
                  {timeline.map((item, index) => (
                    <motion.div 
                      key={index}
                      className="relative"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <div className="absolute -left-[2.2rem] w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                      <div className="font-medium text-gray-800">{item.title}</div>
                      <div className="text-gray-600 text-sm">{item.description}</div>
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
        
        {/* Features Grid */}
        <motion.div 
          className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="relative overflow-hidden backdrop-blur-sm bg-white/80 rounded-xl p-6 shadow-lg border border-white/60 flex group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 20px 30px -10px rgba(59, 130, 246, 0.15)",
                borderColor: "rgba(59, 130, 246, 0.3)"
              }}
            >
              {/* Glossy background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/70 to-white/50 opacity-90 group-hover:opacity-100 transition-all duration-300" />
              
              {/* Accent line */}
              <div className="absolute h-1 bottom-0 left-0 right-0 bg-gradient-to-r from-primary/80 via-primary to-primary/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              
              {/* Icon with enhanced animation */}
              <div className="mr-5 mt-1 z-10">
                <motion.div 
                  className="relative w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-md bg-gradient-to-br from-primary to-primary/80 group-hover:shadow-primary/20 transition-all duration-300"
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {feature.icon}
                  
                  {/* Glow effect on hover */}
                  <div className="absolute -inset-0.5 bg-primary/20 rounded-lg blur-sm opacity-0 group-hover:opacity-70 transition-opacity duration-300 -z-10"></div>
                </motion.div>
              </div>
              
              {/* Content with improved styling */}
              <div className="z-10">
                <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
              
              {/* Subtle corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>
          ))}
        </motion.div>
        
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
            
            {/* Animated gradient overlay */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-primary/10 to-blue-500/5 -z-10"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
            />
            
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
                whileInView={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
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
