import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Award, 
  Code, 
  Zap, 
  Heart, 
  Users, 
  Shield, 
  Handshake, 
  BarChart4, 
  Sparkles,
  Clock,
  Layout,
  ArrowRight,
  MessagesSquare
} from "lucide-react";

const AboutUsPage = () => {
  // Values data
  const values = [
    {
      title: "Client Satisfaction",
      description: "We prioritize understanding our clients' needs and exceeding their expectations at every step.",
      icon: <Heart className="h-6 w-6" />
    },
    {
      title: "Innovation",
      description: "We embrace creative thinking and innovative approaches to solve complex challenges.",
      icon: <Sparkles className="h-6 w-6" />
    },
    {
      title: "Integrity",
      description: "We maintain the highest ethical standards in all our business practices and relationships.",
      icon: <Shield className="h-6 w-6" />
    },
    {
      title: "Continuous Improvement",
      description: "We constantly seek ways to enhance our processes, skills, and deliverables.",
      icon: <BarChart4 className="h-6 w-6" />
    }
  ];

  // Features data
  const features = [
    {
      title: "Technical Excellence",
      description: "Our team stays up-to-date with the latest technologies and best practices to deliver high-quality solutions.",
      icon: <Code className="h-6 w-6" />
    },
    {
      title: "Scalable Solutions",
      description: "We build applications that can grow with your business, ensuring long-term sustainability and adaptability.",
      icon: <Layout className="h-6 w-6" />
    },
    {
      title: "On-Time Delivery",
      description: "We value your time and always strive to deliver projects on schedule without compromising quality.",
      icon: <Clock className="h-6 w-6" />
    }
  ];

  return (
    <>
      <Helmet>
        <title>About Us | AdiTeke Software Solutions</title>
        <meta
          name="description"
          content="Learn about AdiTeke Software Solutions and our mission to deliver exceptional software development services."
        />
      </Helmet>

      {/* Hero Section with animated elements */}
      <section className="relative py-28 overflow-hidden bg-gradient-to-b from-primary/5 via-white to-white">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_80%,rgba(59,130,246,0.08),transparent_20%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.08),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>
        
        {/* Floating circles */}
        <motion.div 
          className="absolute top-20 left-[15%] w-36 h-36 rounded-full bg-primary/5 opacity-60"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        
        <motion.div 
          className="absolute bottom-20 right-[10%] w-28 h-28 rounded-full bg-blue-400/5 opacity-50"
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        ></motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto"
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
            
            <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
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
      </section>

      {/* Team Section with modern cards */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary/5 to-transparent rounded-tr-full -z-10"></div>
        
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
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
              Our talented professionals are the heart of{" "}
              <span className="font-bold">
                Adi<span className="text-blue-600">Teke</span>
              </span>
              . We bring together expertise from diverse backgrounds to deliver exceptional results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* CTO Card */}
            <motion.div
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent z-10 opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                
                {/* Image */}
                <img
                  src="/assets/team/mulualem.jpeg"
                  alt="Mulualem Berhanu"
                  className="w-full aspect-[4/3] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="text-2xl font-bold text-white mb-1">Mulualem Berhanu</h3>
                  <p className="text-primary-foreground/80 mb-3 flex items-center text-lg">
                    <Code className="w-5 h-5 mr-2 text-primary-foreground/70" />
                    CTO & Founder
                  </p>
                  <p className="text-white/90 mb-4 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                    Mulualem has over 7 years of experience in software development and technical leadership.
                  </p>
                  
                  {/* Skills */}
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

            {/* CEO Card */}
            <motion.div
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent z-10 opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                
                {/* Image */}
                <img
                  src="/assets/team/samrawit-kassa.jpg"
                  alt="Samrawit Kassa"
                  className="w-full aspect-[4/3] object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="text-2xl font-bold text-white mb-1">Samrawit Kassa</h3>
                  <p className="text-primary-foreground/80 mb-3 flex items-center text-lg">
                    <Users className="w-5 h-5 mr-2 text-primary-foreground/70" />
                    CEO
                  </p>
                  <p className="text-white/90 mb-4 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                    Samrawit leads our business operations with expertise in strategic planning, client relations, and organizational growth.
                  </p>
                  
                  {/* Skills */}
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

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-primary/5 relative overflow-hidden">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Our Features
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We combine technical expertise with industry best practices to deliver exceptional results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Modern card with glass effect */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/80 h-full 
                  hover:shadow-xl hover:translate-y-[-5px] transition-all duration-300">
                  
                  {/* Icon container */}
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-blue-500 
                    flex items-center justify-center text-white mb-6 shadow-md group-hover:shadow-primary/20 transition-all">
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600">{feature.description}</p>
                  
                  {/* Animated indicator line */}
                  <div className="h-0.5 w-0 bg-primary/30 mt-5 group-hover:w-20 transition-all duration-500 ease-out"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white relative overflow-hidden">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Our Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do and help us deliver exceptional results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-b from-white to-primary/5 rounded-xl p-6 shadow-lg border border-gray-100 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
              >
                {/* Value icon with animation */}
                <div className="rounded-lg bg-white p-4 shadow-md w-16 h-16 flex items-center justify-center 
                  mb-6 text-primary/80 group-hover:text-primary group-hover:shadow-lg 
                  group-hover:scale-110 transition-all duration-300">
                  {value.icon}
                </div>
                
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary/90 transition-colors duration-300">
                  {value.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {value.description}
                </p>
                
                {/* Animated line */}
                <div className="h-0.5 w-10 bg-primary/30 group-hover:w-full transition-all duration-500"></div>
              </motion.div>
            ))}
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
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: `${15 + i * 20}%`,
              top: `${50 - (i % 3) * 20}%`,
              opacity: 0.1 + (i * 0.05),
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, i % 2 === 0 ? 10 : -10, 0],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: 0.2, 
                type: "spring",
                stiffness: 200
              }}
              className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mx-auto mb-8 
                flex items-center justify-center shadow-lg"
            >
              <MessagesSquare className="h-10 w-10 text-white" />
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Get Started?
            </h2>
            
            <p className="text-xl mb-10 text-white/90">
              Let's discuss how we can help bring your ideas to life.
            </p>
            
            <Link href="/contact">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  className="bg-white text-primary hover:bg-white/90 px-8 py-3 text-lg font-medium rounded-lg shadow-lg"
                >
                  Contact Us Today
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default AboutUsPage;