import { CsrfTest } from '@/components/security/CsrfTest';

export default function SecurityTestPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Security Testing Suite</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">CSRF Protection</h2>
          <p className="mb-4 text-muted-foreground">
            Cross-Site Request Forgery protection prevents attackers from tricking users into
            performing actions they didn't intend to perform. This test validates that our CSRF
            protection is working correctly.
          </p>
          <CsrfTest />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Security Features</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>JWT-based authentication with secure token storage</li>
            <li>Cross-Site Request Forgery (CSRF) protection</li>
            <li>Automatic token refresh mechanism</li>
            <li>Device fingerprinting for enhanced security</li>
            <li>HTTP-only cookies for sensitive data</li>
            <li>Role-based access control</li>
          </ul>
        </div>
      </div>
    </div>
  );
}