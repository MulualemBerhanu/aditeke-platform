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
            <div className="flex items-center">
              <div className="mr-1.5 w-7 h-7 rounded-md bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(255,255,255,0.3), transparent 70%)' }}></div>
                <span className="relative z-10">AT</span>
              </div>
              <div className="text-2xl font-bold font-accent tracking-tight">
                <span className="text-primary">Adi</span>
                <span className="text-blue-600">Teke</span>
              </div>
            </div>
            <div className="flex items-center -mt-1 ml-9">
              <span className="text-[9px] text-gray-600 font-semibold tracking-wider uppercase">Software Solutions</span>
              <div className="ml-1 w-1 h-1 rounded-full bg-primary"></div>
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
                <div className="flex items-center">
                  <div className="mr-1.5 w-6 h-6 rounded-md bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(255,255,255,0.3), transparent 70%)' }}></div>
                    <span className="relative z-10">AT</span>
                  </div>
                  <div className="text-xl font-bold font-accent tracking-tight">
                    <span className="text-primary">Adi</span>
                    <span className="text-blue-600">Teke</span>
                  </div>
                </div>
                <div className="flex items-center -mt-0.5 ml-8">
                  <span className="text-[8px] text-gray-600 font-semibold tracking-wider uppercase">Software Solutions</span>
                  <div className="ml-1 w-1 h-1 rounded-full bg-primary"></div>
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
