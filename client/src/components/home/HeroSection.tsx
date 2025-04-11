import { Link } from "wouter";
import { motion } from "framer-motion";
import { COMPANY_STATS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section id="home" className="relative overflow-hidden py-20 lg:py-32 text-white">
      {/* Background with gradient */}
      <div className="absolute inset-0 hero-pattern bg-gradient-to-r from-primary/80 to-secondary/80"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Hero Content */}
          <motion.div 
            className="lg:w-1/2 mb-10 lg:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Transform Your <span className="text-accent font-accent">Vision</span> Into Digital Reality
            </h1>
            <p className="text-white/90 text-lg md:text-xl mb-8 max-w-lg">
              Custom software solutions that drive innovation and deliver exceptional user experiences for your business needs.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/contact">
                <Button className="px-8 py-6 bg-accent text-white font-medium rounded-md hover:bg-accent/90 transition-colors text-center w-full sm:w-auto">
                  Get a Free Quote
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" className="px-8 py-6 bg-white text-primary font-medium rounded-md hover:bg-white/90 transition-colors text-center w-full sm:w-auto">
                  Explore Services
                </Button>
              </Link>
            </div>
          </motion.div>
          
          {/* Hero Image */}
          <motion.div 
            className="lg:w-1/2 flex justify-center lg:justify-end"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div 
              className="relative"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary/50 opacity-20 rounded-xl blur-lg transform scale-105"></div>
              <img 
                src="https://images.unsplash.com/photo-1580894732444-8ecded7900cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500&q=80" 
                alt="Digital transformation visualization" 
                className="relative rounded-xl shadow-2xl"
                width="600"
                height="500"
              />
            </motion.div>
          </motion.div>
        </div>
        
        {/* Stats Section */}
        <motion.div 
          className="mt-20 pt-10 border-t border-white/20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex flex-wrap justify-center lg:justify-between items-center gap-8 text-white">
            {COMPANY_STATS.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="font-bold text-3xl md:text-4xl">{stat.count}</div>
                <div className="text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
