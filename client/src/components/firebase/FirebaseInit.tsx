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
        
        // Initialize Firebase database (roles collection)
        await initializeFirebaseDatabase();
        
        // Check if Firebase Auth is initialized
        if (!auth) {
          throw new Error('Firebase Auth failed to initialize');
        }
        
        // Mark as initialized
        setInitialized(true);
        console.log('Firebase initialized successfully');
      } catch (err) {
        console.error('Firebase initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Firebase');
        
        toast({
          title: 'Firebase Initialization Error',
          description: err instanceof Error ? err.message : 'Failed to initialize Firebase',
          variant: 'destructive',
        });
      } finally {
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
          <p>
            Please check your Firebase configuration and reload the page. If the problem persists, 
            contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  // If initialized successfully, render children
  return <>{children}</>;
};

export default FirebaseInit;