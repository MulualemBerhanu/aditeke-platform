import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * ScrollToTop component that listens for route changes 
 * and scrolls the window to the top of the page
 */
export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Smooth scroll to top when location changes
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location]);

  // This component doesn't render anything
  return null;
}

export default ScrollToTop;