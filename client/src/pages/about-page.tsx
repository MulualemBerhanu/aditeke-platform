import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
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
  Users
} from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="bg-light min-h-screen">
      {/* Page Header - Modern Hero Section */}
      <div className="relative py-28 overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-white">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_80%,rgba(59,130,246,0.06),transparent_20%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.06),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>
        
        {/* Floating circles - subtle animation */}
        <motion.div 
          className="absolute top-20 left-[15%] w-36 h-36 rounded-full bg-primary/5 opacity-60"
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        
        <motion.div 
          className="absolute bottom-20 right-[10%] w-24 h-24 rounded-full bg-blue-400/5 opacity-50"
          animate={{ 
            y: [0, -12, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        ></motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Decorative accent line */}
            <motion.div 
              className="h-1 w-20 bg-gradient-to-r from-primary/60 to-blue-400/60 rounded-full mb-6"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 80, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            ></motion.div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900">
              About Us
            </h1>
            
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl">
              Learn about AdiTeke Software Solutions and our mission to deliver exceptional software development services.
            </p>
            
            {/* Subtle accent elements */}
            <div className="flex space-x-3 mb-10">
              {[...Array(3)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary/60"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + (i * 0.1), duration: 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Team Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary/5 to-transparent rounded-tr-full -z-10"></div>
        
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Section title with decorative elements */}
            <div className="inline-block">
              <div className="flex items-center justify-center mb-4">
                <div className="h-px w-8 bg-primary/40"></div>
                <Users className="h-5 w-5 mx-2 text-primary/70" />
                <div className="h-px w-8 bg-primary/40"></div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Meet Our Team
              </h2>
            </div>
            
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our talented professionals are the heart of <span className="font-bold">Adi<span className="text-blue-600">Teke</span></span>. We bring together expertise from diverse backgrounds to deliver exceptional results.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* CTO Card - Modern design with overlay */}
            <motion.div
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent z-10 opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                
                {/* Image with zoom effect */}
                <img
                  src="/assets/team/mulualem.jpeg"
                  alt="Mulualem Berhanu"
                  className="w-full aspect-[4/3] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="text-2xl font-bold text-white mb-1">Mulualem Berhanu</h3>
                  <p className="text-primary-foreground/80 mb-3 flex items-center text-lg">
                    <Code className="w-5 h-5 mr-2 text-primary-foreground/70" />
                    CTO & Founder
                  </p>
                  <p className="text-white/90 mb-4 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                    Mulualem has over 7 years of experience in software development and technical leadership.
                  </p>
                  
                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {["Software Architecture", "AI Development", "Technical Leadership"].map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CEO Card - Modern design with overlay */}
            <motion.div
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent z-10 opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                
                {/* Image with zoom effect */}
                <img
                  src="/assets/team/samrawit-kassa.jpg"
                  alt="Samrawit Kassa"
                  className="w-full aspect-[4/3] object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="text-2xl font-bold text-white mb-1">Samrawit Kassa</h3>
                  <p className="text-primary-foreground/80 mb-3 flex items-center text-lg">
                    <Users className="w-5 h-5 mr-2 text-primary-foreground/70" />
                    CEO
                  </p>
                  <p className="text-white/90 mb-4 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                    Samrawit leads our business operations with expertise in strategic planning, client relations, and organizational growth.
                  </p>
                  
                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {["Strategic Leadership", "Business Development", "Client Relations"].map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Join Team button */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Link href="/careers">
              <Button 
                variant="outline" 
                className="border-primary/30 text-primary hover:bg-primary/5 px-5 py-2.5 group"
              >
                <span>Join Our Team</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Feature Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We combine technical expertise with industry best practices to deliver exceptional results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Technical Excellence</h3>
              <p className="text-gray-600">
                Our team stays up-to-date with the latest technologies and best practices to deliver high-quality solutions.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Scalable Solutions</h3>
              <p className="text-gray-600">
                We build applications that can grow with your business, ensuring long-term success and adaptability.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">On-Time Delivery</h3>
              <p className="text-gray-600">
                We value your time and always strive to deliver projects on schedule without compromising quality.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do and help us deliver exceptional results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-6 border border-gray-200 rounded-xl">
              <h3 className="text-xl font-bold mb-2">Client Satisfaction</h3>
              <p className="text-gray-600">
                We prioritize understanding our clients' needs and exceeding their expectations at every step.
              </p>
            </div>
            
            <div className="p-6 border border-gray-200 rounded-xl">
              <h3 className="text-xl font-bold mb-2">Innovation</h3>
              <p className="text-gray-600">
                We embrace creative thinking and innovative approaches to solve complex challenges.
              </p>
            </div>
            
            <div className="p-6 border border-gray-200 rounded-xl">
              <h3 className="text-xl font-bold mb-2">Integrity</h3>
              <p className="text-gray-600">
                We maintain the highest ethical standards in all our business practices and relationships.
              </p>
            </div>
            
            <div className="p-6 border border-gray-200 rounded-xl">
              <h3 className="text-xl font-bold mb-2">Continuous Improvement</h3>
              <p className="text-gray-600">
                We constantly seek ways to enhance our processes, skills, and deliverables.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;