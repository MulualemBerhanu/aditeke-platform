import { Link } from "wouter";
import { 
  FOOTER_QUICK_LINKS, 
  FOOTER_SERVICE_LINKS, 
  SOCIAL_LINKS, 
  CONTACT_INFO,
  LEGAL_LINKS
} from "@/lib/constants";

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="text-2xl font-bold mb-6 font-accent">
              <span>Adi</span><span className="text-secondary">Teke</span>
            </div>
            <p className="text-gray-400 mb-6">
              Innovative software solutions designed to transform your business and enhance your digital presence.
            </p>
            <div className="flex space-x-4">
              {SOCIAL_LINKS.map((social, index) => (
                <a 
                  key={index}
                  href={social.url} 
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={`fab ${social.icon}`}></i>
                </a>
              ))}
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {FOOTER_QUICK_LINKS.map((link, index) => (
                <li key={index}>
                  <Link href={link.href}>
                    <a className="text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-6">Services</h3>
            <ul className="space-y-3">
              {FOOTER_SERVICE_LINKS.map((link, index) => (
                <li key={index}>
                  <Link href={link.href}>
                    <a className="text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3 text-gray-400"></i>
                <span className="text-gray-400">{CONTACT_INFO.address}</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-envelope mt-1 mr-3 text-gray-400"></i>
                <span className="text-gray-400">{CONTACT_INFO.email}</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-phone-alt mt-1 mr-3 text-gray-400"></i>
                <span className="text-gray-400">{CONTACT_INFO.phone}</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-clock mt-1 mr-3 text-gray-400"></i>
                <span className="text-gray-400">Mon-Fri: 9:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 mb-4 md:mb-0">© {new Date().getFullYear()} AdiTeke Software Solutions. All rights reserved.</p>
            <div className="flex space-x-6">
              {LEGAL_LINKS.map((link, index) => (
                <Link key={index} href={link.href}>
                  <a className="text-gray-500 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
