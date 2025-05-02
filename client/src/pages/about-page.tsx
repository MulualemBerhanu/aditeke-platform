import React from 'react';
import { motion } from 'framer-motion';
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
  Users
} from 'lucide-react';
import SamrawitImage from '@/assets/team/samrawit-kassa.jpg';
import MulualemImage from '@/assets/team/mulualem.jpeg';

const AboutPage = () => {
  return (
    <div className="bg-light min-h-screen">
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
      
      {/* Team Section - Clean Modern Style */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            {/* User icon decoration */}
            <div className="flex justify-center mb-6">
              <div className="relative w-12 h-12">
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gray-100 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Users className="w-6 h-6 text-gray-600" />
                </motion.div>
                <motion.div 
                  className="absolute inset-0 border-2 border-gray-200 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1.15, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                />
              </div>
            </div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 text-gray-900"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Meet Our Team
            </motion.h2>
            
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Our talented professionals are the heart of <span className="text-blue-600 font-medium">AdiTeke</span>. We bring together expertise from diverse backgrounds to deliver exceptional results.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* CTO Card - Clean Modern Style */}
            <motion.div
              className="overflow-hidden bg-white rounded-xl shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5, boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="w-full h-96">
                <img
                  src={MulualemImage}
                  alt="Mulualem Berhanu"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-1 text-gray-900">Mulualem Berhanu</h3>
                <p className="text-blue-600 mb-3 flex items-center text-sm">
                  <Code className="w-4 h-4 mr-1" />
                  CTO & Founder
                </p>
                <p className="text-gray-600 text-sm">
                  Mulualem has over 7 years of experience in software development and technical leadership.
                </p>
              </div>
            </motion.div>
            
            {/* CEO Card - Clean Modern Style */}
            <motion.div
              className="overflow-hidden bg-white rounded-xl shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="w-full h-96">
                <img
                  src={SamrawitImage}
                  alt="Samrawit Kassa"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-1 text-gray-900">Samrawit Kassa</h3>
                <p className="text-blue-600 mb-3 flex items-center text-sm">
                  <Users className="w-4 h-4 mr-1" />
                  CEO
                </p>
                <p className="text-gray-600 text-sm">
                  Samrawit leads our business operations with expertise in strategic planning, client relations, and organizational growth.
                </p>
              </div>
            </motion.div>
          </div>
          
          {/* Join Team button */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 10 }}
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
      <section className="py-24 bg-gradient-to-b from-white to-primary/5 relative overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.03),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.03),transparent_25%)]"></div>
        
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
                <Zap className="h-5 w-5 mx-2 text-primary/70" />
                <div className="h-px w-8 bg-primary/40"></div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Features
              </h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We combine technical expertise with industry best practices to deliver exceptional results.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {/* Technical Excellence */}
            <motion.div 
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/80 h-full 
                hover:shadow-xl transition-all duration-300">
                
                {/* Icon container */}
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-blue-500 
                  flex items-center justify-center text-white mb-6 shadow-md group-hover:shadow-primary/20 transition-all">
                  <Code className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                  Technical Excellence
                </h3>
                
                <p className="text-gray-600">
                  Our team stays up-to-date with the latest technologies and best practices to deliver high-quality solutions.
                </p>
                
                {/* Animated indicator line */}
                <div className="h-0.5 w-0 bg-primary/30 mt-5 group-hover:w-20 transition-all duration-500 ease-out"></div>
              </div>
            </motion.div>
            
            {/* Scalable Solutions */}
            <motion.div 
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/80 h-full 
                hover:shadow-xl transition-all duration-300">
                
                {/* Icon container */}
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-blue-500 
                  flex items-center justify-center text-white mb-6 shadow-md group-hover:shadow-primary/20 transition-all">
                  <Layout className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                  Scalable Solutions
                </h3>
                
                <p className="text-gray-600">
                  We build applications that can grow with your business, ensuring long-term success and adaptability.
                </p>
                
                {/* Animated indicator line */}
                <div className="h-0.5 w-0 bg-primary/30 mt-5 group-hover:w-20 transition-all duration-500 ease-out"></div>
              </div>
            </motion.div>
            
            {/* On-Time Delivery */}
            <motion.div 
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/80 h-full 
                hover:shadow-xl transition-all duration-300">
                
                {/* Icon container */}
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-blue-500 
                  flex items-center justify-center text-white mb-6 shadow-md group-hover:shadow-primary/20 transition-all">
                  <Clock className="w-6 h-6" />
                </div>
                
                <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                  On-Time Delivery
                </h3>
                
                <p className="text-gray-600">
                  We value your time and always strive to deliver projects on schedule without compromising quality.
                </p>
                
                {/* Animated indicator line */}
                <div className="h-0.5 w-0 bg-primary/30 mt-5 group-hover:w-20 transition-all duration-500 ease-out"></div>
              </div>
            </motion.div>
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
              <Link href="/contact">
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
              
              <Link href="/services">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-medium w-full sm:w-auto"
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