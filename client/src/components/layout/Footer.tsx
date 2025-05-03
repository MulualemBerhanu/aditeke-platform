import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  FOOTER_QUICK_LINKS, 
  FOOTER_SERVICE_LINKS, 
  SOCIAL_LINKS, 
  CONTACT_INFO,
  LEGAL_LINKS
} from "@/lib/constants";
import { ChevronRight, ExternalLink, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to a newsletter service
    alert(`Thank you for subscribing with ${email}!`);
    setEmail("");
  };
  
  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-black text-white pt-24 pb-8 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
        
        {/* Radial gradient for depth */}
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.15)_0%,transparent_50%)]"></div>
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.1)_0%,transparent_50%)]"></div>
        
        {/* Floating glowing orbs */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-400/10 blur-xl"
            style={{
              width: `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              left: `${5 + i * 20}%`,
              top: `${10 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, i % 2 === 0 ? 20 : -20, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Main footer content with custom animated wave divider at top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-0 transform rotate-180">
        <svg className="relative block w-full h-12 md:h-16" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill text-slate-100" fill="currentColor"></path>
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Enhanced Company Info */}
          <motion.div variants={itemVariants} className="lg:pr-6">
            <div className="mb-6">
              <Link href="/" className="inline-block group">
                <div className="flex items-center space-x-2 bg-gradient-to-br from-gray-800 to-gray-900 p-3 rounded-xl shadow-lg border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300">
                  <span className="text-3xl font-bold font-accent bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Adi</span>
                  <span className="text-3xl font-bold font-accent bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Teke</span>
                  <span className="hidden lg:inline-block text-xs text-gray-400 font-light px-2 py-1 rounded-full border border-gray-700/40 group-hover:border-blue-500/30 transition-colors duration-300">SOFTWARE SOLUTIONS</span>
                </div>
              </Link>
            </div>
            
            <p className="text-gray-300 mb-8 leading-relaxed">
              Innovative software solutions designed to transform your business and enhance your digital presence through cutting-edge technology and strategic implementation.
            </p>
            
            {/* Newsletter signup form */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
                Join Our Newsletter
              </h4>
              <form onSubmit={handleSubmit} className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-2 bg-gray-800/70 border border-gray-700 text-white rounded-l-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-r-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200"
                >
                  <Send size={16} className="mr-2" />
                  <span>Join</span>
                </button>
              </form>
            </div>
            
            {/* Enhanced social links */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
                Connect With Us
              </h4>
              <div className="flex flex-wrap gap-3">
                {SOCIAL_LINKS.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.url}
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800/80 text-gray-300 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-lg border border-gray-700/50 hover:border-blue-500"
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 5,
                      boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" 
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <i className={`fab ${social.icon}`}></i>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
          
          {/* Quick Links with enhanced styling */}
          <motion.div variants={itemVariants} className="md:ml-4">
            <h3 className="text-lg font-bold mb-6 pb-2 border-b border-gray-700/50 inline-block pr-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                Quick Links
              </span>
            </h3>
            <ul className="space-y-3.5">
              {FOOTER_QUICK_LINKS.map((link, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link 
                    href={link.href} 
                    className="group flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200"
                  >
                    <ChevronRight 
                      size={16} 
                      className="mr-2 text-blue-500/70 group-hover:text-blue-400" 
                    />
                    <span className="border-b border-transparent group-hover:border-blue-400/50 pb-px">
                      {link.label}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          {/* Services - Hidden on mobile, enhanced styling */}
          <motion.div variants={itemVariants} className="hidden md:block md:ml-4">
            <h3 className="text-lg font-bold mb-6 pb-2 border-b border-gray-700/50 inline-block pr-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                Services
              </span>
            </h3>
            <ul className="space-y-3.5">
              {FOOTER_SERVICE_LINKS.map((link, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Link 
                    href={link.href} 
                    className="group flex items-center text-gray-300 hover:text-blue-400 transition-colors duration-200"
                  >
                    <ChevronRight 
                      size={16} 
                      className="mr-2 text-blue-500/70 group-hover:text-blue-400" 
                    />
                    <span className="border-b border-transparent group-hover:border-blue-400/50 pb-px">
                      {link.label}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          {/* Enhanced Contact Info */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold mb-6 pb-2 border-b border-gray-700/50 inline-block pr-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                Contact Us
              </span>
            </h3>
            <ul className="space-y-4">
              <li>
                <a href={`https://maps.google.com/?q=${CONTACT_INFO.address}`} target="_blank" rel="noopener noreferrer" className="group flex items-start hover:bg-gray-800/50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-700/60">
                  <div className="mt-1 mr-4 w-8 h-8 flex items-center justify-center bg-blue-600/20 text-blue-400 rounded-lg group-hover:bg-blue-600/30 transition-colors duration-200">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <span className="text-gray-300 group-hover:text-white transition-colors duration-200">{CONTACT_INFO.address}</span>
                    <div className="text-xs text-blue-400/70 mt-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span>View on map</span>
                      <ExternalLink size={10} className="ml-1" />
                    </div>
                  </div>
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT_INFO.email}`} className="group flex items-start hover:bg-gray-800/50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-700/60">
                  <div className="mt-1 mr-4 w-8 h-8 flex items-center justify-center bg-blue-600/20 text-blue-400 rounded-lg group-hover:bg-blue-600/30 transition-colors duration-200">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <span className="text-gray-300 group-hover:text-white transition-colors duration-200">{CONTACT_INFO.email}</span>
                    <div className="text-xs text-blue-400/70 mt-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span>Send email</span>
                      <ExternalLink size={10} className="ml-1" />
                    </div>
                  </div>
                </a>
              </li>
              <li>
                <a href={`tel:${CONTACT_INFO.phone}`} className="group flex items-start hover:bg-gray-800/50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-700/60">
                  <div className="mt-1 mr-4 w-8 h-8 flex items-center justify-center bg-blue-600/20 text-blue-400 rounded-lg group-hover:bg-blue-600/30 transition-colors duration-200">
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <div>
                    <span className="text-gray-300 group-hover:text-white transition-colors duration-200">{CONTACT_INFO.phone}</span>
                    <div className="text-xs text-blue-400/70 mt-1 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span>Call now</span>
                      <ExternalLink size={10} className="ml-1" />
                    </div>
                  </div>
                </a>
              </li>
              <li>
                <div className="group flex items-start hover:bg-gray-800/50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-700/60">
                  <div className="mt-1 mr-4 w-8 h-8 flex items-center justify-center bg-blue-600/20 text-blue-400 rounded-lg group-hover:bg-blue-600/30 transition-colors duration-200">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div>
                    <span className="text-gray-300 group-hover:text-white transition-colors duration-200">Mon-Fri: 9:00 AM - 6:00 PM</span>
                    <div className="text-xs text-blue-400/70 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Eastern Time (ET)
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </motion.div>
        </motion.div>
        
        {/* Enhanced Call to Action */}
        <motion.div 
          className="mb-16 p-6 lg:p-8 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h3 className="text-xl md:text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                Ready to Start Your Next Project?
              </h3>
              <p className="text-gray-300 max-w-xl">
                Partner with AdiTeke Software Solutions and transform your vision into reality.
              </p>
            </div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Link href="/contact">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-600/20 px-6 py-6 rounded-xl font-semibold">
                  Get in Touch
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Enhanced Footer Bottom */}
        <div className="pt-8 border-t border-gray-800/80">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.p 
              className="text-gray-400 mb-6 md:mb-0 text-center md:text-left"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              © {new Date().getFullYear()} <span className="font-medium">Adi<span className="text-blue-400">Teke</span> Software Solutions</span>. All rights reserved.
            </motion.p>
            <motion.div 
              className="flex flex-wrap justify-center gap-x-8 gap-y-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {LEGAL_LINKS.map((link, index) => (
                <Link key={index} href={link.href} className="text-gray-400 hover:text-blue-400 transition-colors duration-200 text-sm">
                  {link.label}
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
