import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/lib/constants";
import { 
  Menu, 
  X, 
  ChevronDown, 
  UserCog, 
  Building2, 
  Users, 
  Lock, 
  ChevronRight,
  ExternalLink,
  Globe,
  Search,
  Phone
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [location] = useLocation();
  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();
  
  // Handle navbar visibility based on scroll direction
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest < 150) {
      setIsHidden(false);
      return;
    }
    
    if (latest > lastScrollY.current && !isHidden) {
      setIsHidden(true);
    } else if (latest < lastScrollY.current && isHidden) {
      setIsHidden(false);
    }
    
    lastScrollY.current = latest;
  });

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
  
  // Track active section for menu highlight
  useEffect(() => {
    const handleActiveSection = () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY + 100;
      
      let current = '';
      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          current = section.getAttribute('id') || '';
        }
      });
      
      setActiveSection(current);
    };
    
    window.addEventListener('scroll', handleActiveSection);
    return () => {
      window.removeEventListener('scroll', handleActiveSection);
    };
  }, []);

  // Navigation item with hover effect
  const NavItem = ({ href, isActive, children }: { href: string; isActive: boolean; children: React.ReactNode }) => {
    const itemRef = useRef<HTMLAnchorElement>(null);
    
    return (
      <Link 
        ref={itemRef}
        href={href}
        className="relative group"
      >
        <div className={`px-2.5 py-1.5 font-medium text-sm lg:text-base transition-colors duration-300 rounded-lg
          ${isActive ? 'text-primary' : 'text-gray-700 group-hover:text-primary'}
        `}>
          {children}
        </div>
        
        {/* Animated underline indicator */}
        <div 
          className={`absolute bottom-0 left-0 w-full h-0.5 rounded-full transform origin-left transition-transform duration-300 ease-out bg-gradient-to-r from-primary via-blue-500 to-primary/70
            ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
          `}
        />
      </Link>
    );
  };
  
  return (
    <motion.header
      className={`fixed w-full top-0 z-50 ${isScrolled ? 'backdrop-blur-md bg-white/90' : 'bg-white'} transition-all duration-300`}
      animate={{ 
        y: isHidden ? -100 : 0,
        boxShadow: isScrolled ? "0 4px 20px rgba(0, 0, 0, 0.05)" : "none"
      }}
      transition={{ duration: 0.4 }}
    >
      {/* Top mini-bar with contact info - Desktop only */}
      <div className="hidden lg:block bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-1 flex justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <a href="mailto:berhanumulualemadisu@gmail.com" className="flex items-center hover:text-primary transition-colors">
              <Globe size={12} className="mr-1.5" />
              <span>English / USD</span>
            </a>
            <a href="tel:+1 (641) 481-8560" className="flex items-center hover:text-primary transition-colors">
              <Phone size={12} className="mr-1.5" />
              <span>+1 (641) 481-8560</span>
            </a>
          </div>
          <a href="https://aditeke.com" target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-primary transition-colors">
            <Globe size={12} className="mr-1.5" />
            <span>www.aditeke.com</span>
          </a>
        </div>
      </div>
      
      {/* Main navbar */}
      <nav className="container mx-auto px-4 py-3 lg:py-4 flex items-center justify-between relative">
        {/* Logo with enhanced effects */}
        <div className="flex items-center lg:min-w-[220px]">
          <Link href="/" className="group">
            <div className="flex flex-col">
              {/* Logo text */}
              <div className="relative">
                {/* Glow effect on hover */}
                <div className="absolute -inset-2 rounded-xl bg-gradient-to-r from-primary/5 via-blue-400/5 to-blue-600/5 opacity-0 group-hover:opacity-100 blur-lg transition-all duration-700 group-hover:duration-200"></div>
                
                <div className="relative text-2xl md:text-3xl font-bold font-accent tracking-tight flex items-baseline">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-blue-600/90 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-blue-600 transition-all duration-300">
                    Adi
                  </span>
                  <div className="absolute -top-2.5 -right-1.5 w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-blue-600 via-blue-500 to-primary/70 group-hover:from-blue-700 group-hover:to-blue-400 transition-all duration-300">
                    Teke
                  </span>
                </div>
              </div>
              
              {/* Tagline with animated lines */}
              <div className="flex items-center mt-0.5 group-hover:translate-y-0.5 transition-transform duration-300">
                <div className="h-[1px] w-7 bg-gradient-to-r from-transparent via-primary/30 to-transparent group-hover:via-primary/70 transition-colors duration-300"></div>
                <span className="text-[9px] font-semibold tracking-wider uppercase mx-1.5 flex items-center px-1.5 py-0.5 bg-gradient-to-r from-primary/5 to-blue-600/5 rounded-full group-hover:from-primary/10 group-hover:to-blue-600/10 transition-colors duration-300">
                  <span className="text-primary/80 group-hover:text-primary transition-colors duration-300">Software</span>
                  <span className="mx-0.5 text-blue-500 group-hover:text-blue-400 transition-colors duration-300">•</span>
                  <span className="text-blue-600/80 group-hover:text-blue-600 transition-colors duration-300">Solutions</span>
                </span>
                <div className="h-[1px] w-7 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent group-hover:via-blue-500/70 transition-colors duration-300"></div>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Desktop Menu with enhanced animations */}
        <div className="hidden md:flex items-center justify-center space-x-1 lg:space-x-2">
          {NAV_ITEMS.map((item, index) => (
            <NavItem 
              key={index} 
              href={item.href}
              isActive={location === item.href || (location === "/" && item.href === "/" ? true : activeSection === item.href.replace("/", ""))}
            >
              {item.label}
            </NavItem>
          ))}
        </div>
        
        {/* Right Side Actions - Desktop */}
        <div className="hidden md:flex items-center space-x-2 lg:space-x-4 lg:min-w-[220px] justify-end">
          {/* Quick search button */}
          <button
            className="group p-2 text-gray-600 hover:text-primary transition-colors rounded-full hover:bg-gray-100 flex items-center justify-center"
            aria-label="Search"
          >
            <Search size={18} className="transition-transform group-hover:scale-110 duration-200" />
          </button>
          
          {/* Enhanced Login Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-primary border-gray-200 hover:border-primary/50 hover:bg-primary/5 text-sm lg:text-base space-x-1 rounded-lg shadow-sm group">
                <Lock className="w-4 h-4 mr-1.5 transition-transform group-hover:rotate-12 duration-300" />
                <span>Log In</span>
                <ChevronDown className="ml-1 h-4 w-4 opacity-70 transition-transform group-hover:translate-y-0.5 duration-200" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60 p-2 rounded-xl shadow-xl border border-gray-200/80 bg-white/90 backdrop-blur-sm">
              <div className="px-3 py-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-500">Select account type</h3>
                <div className="mt-1 h-0.5 w-8 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-full"></div>
              </div>
              
              <DropdownMenuItem asChild className="rounded-lg hover:bg-gray-50 focus:bg-gray-50">
                <Link href="/login?role=admin" className="flex items-center px-3 py-2.5 group">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                    <UserCog className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Admin Login</span>
                    <span className="text-xs text-gray-500">System management & oversight</span>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild className="rounded-lg hover:bg-gray-50 focus:bg-gray-50">
                <Link href="/login?role=manager" className="flex items-center px-3 py-2.5 group">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Manager Login</span>
                    <span className="text-xs text-gray-500">Project & team management</span>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild className="rounded-lg hover:bg-gray-50 focus:bg-gray-50">
                <Link href="/login?role=client" className="flex items-center px-3 py-2.5 group">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                    <Users className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">Client Login</span>
                    <span className="text-xs text-gray-500">Access your project dashboard</span>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="my-1.5 bg-gray-100" />
              
              <div className="p-3 text-xs text-center text-gray-500">
                Don't have an account? <Link href="/contact" className="text-primary hover:underline font-medium">Contact us</Link> to get started.
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Enhanced Get Quote Button */}
          <Link href="/contact">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button className="bg-gradient-to-br from-primary to-blue-600 hover:from-primary/95 hover:to-blue-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200">
                <span>Get a Quote</span>
                <ChevronRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </motion.div>
          </Link>
        </div>
        
        {/* Enhanced Mobile Menu Button */}
        <motion.button 
          className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 focus:outline-none transition-colors"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          whileTap={{ scale: 0.9 }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </motion.button>
      </nav>
      
      {/* Enhanced Mobile Menu with animations */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden fixed inset-0 z-50 pt-[72px] bg-white dark:bg-gray-900"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="h-full overflow-y-auto">
              <div className="container mx-auto px-4 py-6 space-y-6">
                {/* Menu Links with animations */}
                <div className="space-y-1.5">
                  {NAV_ITEMS.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <Link 
                        href={item.href}
                        className={`flex items-center px-4 py-3 rounded-xl text-base font-medium group transition-all
                          ${location === item.href ? 'text-primary bg-primary/5 border-l-2 border-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'}
                        `}
                      >
                        <span>{item.label}</span>
                        <ChevronRight className={`ml-auto h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 ${location === item.href ? 'text-primary' : ''}`} />
                      </Link>
                    </motion.div>
                  ))}
                </div>
                
                {/* Quick contact info */}
                <motion.div 
                  className="mt-6 px-4 py-4 bg-gray-50 rounded-xl space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-sm font-medium text-gray-500 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-primary/70" />
                    Quick Contacts
                  </h3>
                  <a href="tel:+1 (641) 481-8560" className="flex items-center text-sm text-gray-600 hover:text-primary py-1.5 transition-colors">
                    <span>+1 (641) 481-8560</span>
                  </a>
                  <a href="mailto:berhanumulualemadisu@gmail.com" className="flex items-center text-sm text-gray-600 hover:text-primary py-1.5 transition-colors">
                    <span>berhanumulualemadisu@gmail.com</span>
                  </a>
                </motion.div>
                
                {/* Login Options */}
                <motion.div 
                  className="mt-6 space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-sm font-medium text-gray-500 px-4 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-primary/70" />
                    Login Options
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-2.5 px-1 mt-2">
                    <Link href="/login?role=admin">
                      <Button variant="outline" className="w-full justify-start text-gray-700 hover:text-primary hover:border-primary/30 rounded-xl py-6">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center mr-3">
                          <UserCog className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Admin Login</span>
                          <span className="text-xs text-gray-500">System management</span>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="/login?role=manager">
                      <Button variant="outline" className="w-full justify-start text-gray-700 hover:text-primary hover:border-primary/30 rounded-xl py-6">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mr-3">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Manager Login</span>
                          <span className="text-xs text-gray-500">Project management</span>
                        </div>
                      </Button>
                    </Link>
                    
                    <Link href="/login?role=client">
                      <Button variant="outline" className="w-full justify-start text-gray-700 hover:text-primary hover:border-primary/30 rounded-xl py-6">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center mr-3">
                          <Users className="h-4 w-4 text-teal-600" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">Client Login</span>
                          <span className="text-xs text-gray-500">Access your dashboard</span>
                        </div>
                      </Button>
                    </Link>
                  </div>
                </motion.div>
                
                {/* CTA Button */}
                <motion.div 
                  className="pt-6 pb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link href="/contact">
                    <Button className="w-full justify-center bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl py-6 shadow-md shadow-primary/10">
                      <span className="flex items-center text-base">
                        Get a Free Quote
                        <ChevronRight className="ml-1.5 h-4 w-4" />
                      </span>
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
