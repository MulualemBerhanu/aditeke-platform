// Production login redirection script
// This is a standalone script placed in public/ so it will work 
// regardless of any React/framework issues

(function() {
  // Only run in production (not localhost)
  if (window.location.hostname === 'localhost') {
    console.log("Development environment detected, skipping role redirect");
    return;
  }
  
  console.log("Production environment - role redirect script loaded");
  
  // Handle URL-based redirection for logins
  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  
  // Check if current URL has successful login indicator
  const hasLoginSuccess = searchParams.has('login_success') && searchParams.get('login_success') === 'true';
  
  // Maps paths/roles to dashboard URLs
  const roleMappings = {
    'admin': '/admin/dashboard',
    'manager': '/manager/dashboard',
    'client': '/client/dashboard',
    '/login/node-admin': '/admin/dashboard',
    '/login/node-manager': '/manager/dashboard',
    '/login/node-client': '/client/dashboard'
  };
  
  // Check if we're on any potential login page
  if (pathname.includes('/login') || hasLoginSuccess) {
    console.log("Login-related page detected in production");
    
    // Check localStorage for login status
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const targetRedirect = localStorage.getItem('targetRedirect');
    const userDataStr = localStorage.getItem('currentUser');
    
    if (isAuthenticated && userDataStr) {
      console.log("User is authenticated, redirecting to appropriate dashboard");
      
      // First try the stored target redirect
      if (targetRedirect) {
        console.log("Using stored target redirect:", targetRedirect);
        window.location.href = targetRedirect;
        return;
      }
      
      // Otherwise determine the dashboard based on user data
      try {
        const userData = JSON.parse(userDataStr);
        let dashboardUrl = '/dashboard';
        
        // Check roleId in numeric form
        const roleId = typeof userData.roleId === 'string' 
          ? parseInt(userData.roleId) 
          : (typeof userData.roleId === 'number' ? userData.roleId : null);
          
        if (roleId === 1002) {
          dashboardUrl = '/admin/dashboard';
        } else if (roleId === 1000) {
          dashboardUrl = '/manager/dashboard';
        } else if (roleId === 1001) {
          dashboardUrl = '/client/dashboard';
        } else if (userData.username) {
          // Fallback to username check
          const username = userData.username.toLowerCase();
          if (username.includes('admin')) {
            dashboardUrl = '/admin/dashboard';
          } else if (username.includes('manager')) {
            dashboardUrl = '/manager/dashboard';
          } else if (username.includes('client')) {
            dashboardUrl = '/client/dashboard';
          }
        }
        
        console.log("Redirecting to dashboard:", dashboardUrl);
        window.location.href = dashboardUrl;
      } catch (e) {
        console.error("Error determining redirect target:", e);
        // If all else fails, go to the default dashboard
        window.location.href = '/dashboard';
      }
    }
  }
  
  // Special role-based URL pattern match
  for (const [pattern, redirectUrl] of Object.entries(roleMappings)) {
    if (pathname.includes(pattern)) {
      console.log(`Special pattern match: ${pattern} -> ${redirectUrl}`);
      
      // Check if the user has successfully logged in
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      if (isAuthenticated) {
        console.log("User authenticated, redirecting to role dashboard");
        window.location.href = redirectUrl;
        return;
      }
    }
  }
})();