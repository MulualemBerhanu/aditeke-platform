import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { fetchWithCsrf } from '@/lib/csrfToken';

/**
 * A component to test CSRF protection
 * This ensures our CSRF protection implementation works properly
 */
export function CsrfTest() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch the CSRF token on component mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf-test');
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
        setCsrfToken('Error fetching token');
      }
    };

    fetchCsrfToken();
  }, []);

  // Test the CSRF protection
  const testCsrfProtection = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      // Use our fetchWithCsrf utility which should automatically add the CSRF token
      const response = await fetchWithCsrf('/api/csrf-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: 'CSRF protection test' }),
      });
      
      const data = await response.json();
      
      setTestResult({
        success: true,
        message: `CSRF test successful! Server response: ${data.message}`,
      });
    } catch (error) {
      console.error('CSRF test failed:', error);
      setTestResult({
        success: false,
        message: `CSRF test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader>
        <CardTitle>CSRF Protection Test</CardTitle>
        <CardDescription>
          Test if Cross-Site Request Forgery protection is working
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <p><strong>Current CSRF Token:</strong></p>
          <code className="block bg-muted p-2 rounded text-xs overflow-auto">
            {csrfToken || 'Loading...'}
          </code>
        </div>
        
        <Button 
          onClick={testCsrfProtection} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Testing...' : 'Test CSRF Protection'}
        </Button>
        
        {testResult && (
          <Alert variant={testResult.success ? 'default' : 'destructive'}>
            <AlertTitle>{testResult.success ? 'Test Passed' : 'Test Failed'}</AlertTitle>
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}