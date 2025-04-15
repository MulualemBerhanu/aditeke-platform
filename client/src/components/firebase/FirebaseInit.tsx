import { useEffect, useState } from 'react';
import { initializeFirebaseDatabase } from '@/lib/firebaseAdmin';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import AppLoading from '@/components/loading/AppLoading';

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

  // Show loading or error screen
  if (isLoading || (error && !initialized)) {
    return (
      <AppLoading 
        isInitialized={initialized && !error} 
      />
    );
  }

  // If initialized successfully, render children
  return <>{children}</>;
};

export default FirebaseInit;