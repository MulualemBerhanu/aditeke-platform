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
    { year: "2018", title: "Company Founded", description: "Started with a team of 4 software engineers" },
    { year: "2020", title: "Expanded Services", description: "Added mobile and cloud development offerings" },
    { year: "2022", title: "Global Expansion", description: "Opened international offices and partnerships" },
    { year: "2023", title: "AI Integration", description: "Incorporated advanced AI solutions in our services" }
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
    <section id="about" className="py-24 bg-gradient-to-b from-light to-white relative overflow-hidden">
      <BackgroundPattern />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div 
          className="text-center mb-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            About AdiTeke Software Solutions
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            We're more than just developers - we're your technology partners committed to transforming your business challenges into innovative digital solutions.
          </p>
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
                    Founded in 2018, AdiTeke Software Solutions has grown from a small team of passionate developers to a global technology partner for businesses across industries.
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
                      <div className="font-bold text-primary">{item.year}</div>
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
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 flex"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="mr-5 mt-1">
                <div className="w-12 h-12 bg-primary-light/10 rounded-lg flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* CTA Section */}
        <motion.div 
          className="mt-20 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-10 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold mb-4">Ready to start your digital transformation?</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Partner with AdiTeke Software Solutions and turn your vision into reality with our expert team and innovative approach.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6">
                Start a Project
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="outline" className="text-primary border-primary/30 hover:bg-primary/5 px-8 py-6">
                Explore Our Services
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
