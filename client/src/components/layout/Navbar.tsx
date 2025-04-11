import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/lib/constants";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={`sticky top-0 z-50 bg-white ${isScrolled ? 'shadow-sm' : ''} transition-shadow`}>
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex flex-col leading-none group">
            <div className="flex flex-col">
              <div className="text-2xl font-bold font-accent tracking-tight relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-600/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-blue-600/90 group-hover:scale-105 transition-transform duration-300 inline-block">Adi</span>
                <span className="relative bg-clip-text text-transparent bg-gradient-to-br from-blue-600 via-blue-500 to-primary/70 group-hover:scale-105 transition-transform duration-300 inline-block">Teke</span>
              </div>
              <div className="flex items-center mt-0.5 group-hover:translate-y-0.5 transition-transform duration-300">
                <div className="h-[1px] w-7 bg-gradient-to-r from-transparent via-primary/30 to-transparent group-hover:via-primary/50 transition-colors duration-300"></div>
                <span className="text-[9px] font-semibold tracking-wider uppercase mx-1.5 flex items-center px-1.5 py-0.5 bg-gradient-to-r from-primary/5 to-blue-600/5 rounded-full group-hover:from-primary/10 group-hover:to-blue-600/10 transition-colors duration-300">
                  <span className="text-primary/80 group-hover:text-primary transition-colors duration-300">Software</span>
                  <span className="mx-0.5 text-blue-500 group-hover:text-blue-400 transition-colors duration-300">•</span>
                  <span className="text-blue-600/80 group-hover:text-blue-600 transition-colors duration-300">Solutions</span>
                </span>
                <div className="h-[1px] w-7 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent group-hover:via-blue-500/50 transition-colors duration-300"></div>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
          {NAV_ITEMS.map((item, index) => (
            <Link 
              key={index} 
              href={item.href}
              className={`font-medium ${location === item.href ? 'text-primary' : 'text-dark hover:text-primary'} transition-colors text-sm lg:text-base`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        
        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
          <Link href="/login">
            <Button variant="ghost" className="text-primary hover:bg-primary/10 text-sm lg:text-base py-1 px-2 lg:px-4 lg:py-2">
              Log In
            </Button>
          </Link>
          <Link href="/contact">
            <Button className="bg-primary text-white hover:bg-primary/90 text-sm lg:text-base py-1 px-2 lg:px-4 lg:py-2">
              Get a Quote
            </Button>
          </Link>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-dark hover:text-primary focus:outline-none"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-3 space-y-1 bg-white shadow-md">
              <div className="flex flex-col mb-3 px-3">
                <div className="text-xl font-bold font-accent tracking-tight relative">
                  <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-blue-600/90">Adi</span>
                  <span className="relative bg-clip-text text-transparent bg-gradient-to-br from-blue-600 via-blue-500 to-primary/70">Teke</span>
                </div>
                <div className="flex items-center mt-0.5">
                  <div className="h-[1px] w-6 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                  <span className="text-[8px] font-semibold tracking-wider uppercase mx-1.5 flex items-center px-1.5 py-0.5 bg-gradient-to-r from-primary/5 to-blue-600/5 rounded-full">
                    <span className="text-primary/80">Software</span>
                    <span className="mx-0.5 text-blue-500">•</span>
                    <span className="text-blue-600/80">Solutions</span>
                  </span>
                  <div className="h-[1px] w-6 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
                </div>
              </div>
              {NAV_ITEMS.map((item, index) => (
                <Link 
                  key={index} 
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${location === item.href ? 'text-primary bg-primary/10' : 'text-dark hover:bg-primary/10 hover:text-primary'} transition-colors`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 flex flex-col space-y-2">
                <Link href="/login">
                  <Button variant="outline" className="w-full justify-center text-primary">
                    Log In
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button className="w-full justify-center bg-primary text-white hover:bg-primary/90">
                    Get a Quote
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
