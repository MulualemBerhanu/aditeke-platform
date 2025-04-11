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
          <Link href="/" className="flex flex-col leading-none">
            <div className="flex flex-col">
              <div className="text-2xl font-bold font-accent tracking-tight relative">
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/90">Adi</span>
                <span className="text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-500">Teke</span>
                <div className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
              </div>
              <div className="flex items-center">
                <div className="h-px w-5 bg-gradient-to-r from-transparent to-primary/30 mr-1"></div>
                <span className="text-[9px] text-gray-600 font-semibold tracking-wider uppercase -mt-1 flex items-center">
                  <span className="opacity-90">Software</span>
                  <span className="mx-0.5 opacity-80">•</span>
                  <span className="opacity-90">Solutions</span>
                </span>
                <div className="h-px w-5 bg-gradient-to-r from-primary/30 to-transparent ml-1"></div>
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
                  <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/90">Adi</span>
                  <span className="text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-500">Teke</span>
                  <div className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                </div>
                <div className="flex items-center">
                  <div className="h-px w-4 bg-gradient-to-r from-transparent to-primary/30 mr-1"></div>
                  <span className="text-[8px] text-gray-600 font-semibold tracking-wider uppercase -mt-0.5 flex items-center">
                    <span className="opacity-90">Software</span>
                    <span className="mx-0.5 opacity-80">•</span>
                    <span className="opacity-90">Solutions</span>
                  </span>
                  <div className="h-px w-4 bg-gradient-to-r from-primary/30 to-transparent ml-1"></div>
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
