import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

/**
 * ScrollToTop - A component that handles automatic scrolling to top on page navigation
 * Features:
 * - Scrolls to top of page on route changes
 * - Handles back/forward browser navigation
 * - Uses smooth scrolling for better user experience
 * - Disables browser's default scroll restoration behavior
 */
export function ScrollToTop() {
  const [location] = useLocation();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Disable browser's default scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Function to handle the scroll behavior
    const handleScroll = () => {
      // Only scroll if this isn't the initial page load
      if (prevPathRef.current !== null && prevPathRef.current !== location) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
      
      // Update previous path
      prevPathRef.current = location;
    };

    // Call scroll handler
    handleScroll();

    // Clean up
    return () => {
      // Re-enable browser's default scroll restoration when component unmounts
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, [location]);

  // This component doesn't render anything
  return null;
}

export default ScrollToTop;