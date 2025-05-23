import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * A dismissible banner that appears when the application is in token-based auth mode
 * This happens in deployed environments when JWT-based auth is used (especially cross-domain)
 */
const TokenAuthAlert = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if we're using JWT token-based auth
    const hasAccessToken = localStorage.getItem('accessToken');
    const hasDismissed = localStorage.getItem('tokenAlertDismissed');
    
    if (hasAccessToken && !hasDismissed) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    // Store this preference to prevent showing again in this session
    localStorage.setItem('tokenAlertDismissed', 'true');
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4 text-amber-800 animate-in slide-in-from-left-10 duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-sm mb-1">Cross-Domain Access Enabled</h4>
          <p className="text-xs">
            You're using the application in a cross-domain environment. All core features will work properly.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full hover:bg-amber-200/50 text-amber-800"
          onClick={dismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TokenAuthAlert;