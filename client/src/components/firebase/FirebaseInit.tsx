import { useEffect, useState } from 'react';
import { initializeFirebaseDatabase } from '@/lib/firebaseAdmin';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const FirebaseInit = ({ children }: { children: React.ReactNode }) => {
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if Firebase environment variables are set
  const checkFirebaseConfig = () => {
    const requiredEnvVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_APP_ID'
    ];
    
    const missingVars = requiredEnvVars.filter(
      varName => !import.meta.env[varName]
    );
    
    if (missingVars.length > 0) {
      return `Missing Firebase configuration: ${missingVars.join(', ')}`;
    }
    
    return null;
  };

  useEffect(() => {
    const init = async () => {
      try {
        // Check environment variables
        const configError = checkFirebaseConfig();
        if (configError) {
          setError(configError);
          toast({
            title: 'Firebase Configuration Error',
            description: configError,
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        
        // Set a timeout to prevent initialization from hanging indefinitely
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Firebase initialization timed out after 10 seconds'));
          }, 10000); // 10 seconds timeout
        });
        
        // Create a promise that initializes Firebase
        const initPromise = initializeFirebaseDatabase();
        
        // Race the initialization against the timeout
        await Promise.race([initPromise, timeoutPromise]);
        
        // Check if Firebase Auth is initialized
        if (!auth) {
          throw new Error('Firebase Auth failed to initialize');
        }
        
        // Mark as initialized
        setInitialized(true);
        console.log('Firebase initialized successfully');
        
        // If we get here, mark as initialized and proceed with the app
        setIsLoading(false);
      } catch (err) {
        console.error('Firebase initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Firebase');
        
        toast({
          title: 'Firebase Initialization Error',
          description: 'There was a problem connecting to Firebase. Proceeding with local data...',
          variant: 'destructive',
        });
        
        // Even though there's an error, we'll let the app continue with local storage
        setInitialized(true);
        setIsLoading(false);
      }
    };
    
    init();
  }, [toast]);

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Initializing Firebase...</p>
          
          {/* Added bypass button so users don't get stuck */}
          <button 
            className="mt-6 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            onClick={() => {
              // Redirect to the same URL but with bypass parameter
              window.location.href = window.location.pathname + '?bypass=true';
            }}
          >
            Skip Firebase Initialization
          </button>
          <p className="mt-2 text-xs text-gray-500">
            If initialization takes too long, click above to continue with local storage only.
          </p>
        </div>
      </div>
    );
  }

  // Show error state if something went wrong
  if (error && !initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-destructive/10 rounded-lg border border-destructive/20">
          <h1 className="text-xl font-bold text-destructive mb-4">Firebase Initialization Error</h1>
          <p className="mb-4">{error}</p>
          <p className="mb-6">
            Please check your Firebase configuration and reload the page. If the problem persists, 
            contact the administrator or continue without Firebase.
          </p>
          
          <div className="flex flex-col gap-2">
            <button 
              className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={() => {
                // Redirect to the same URL but with bypass parameter
                window.location.href = window.location.pathname + '?bypass=true';
              }}
            >
              Continue without Firebase
            </button>
            
            <button 
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              onClick={() => {
                // Reload the page to try again
                window.location.reload();
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If initialized successfully, render children
  return <>{children}</>;
};

export default FirebaseInit;