// AdiTeke Role Redirect - Standalone Script

// Self-executing function to avoid global scope pollution
(function() {
  console.log("Production environment - role redirect script loaded");
  
  // Maps roles to dashboard URLs
  const roleMappings = {
    'admin': '/admin/dashboard',
    'manager': '/manager/dashboard',
    'client': '/client/dashboard'
  };
  
  // Check localStorage for authentication status
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const targetRedirect = localStorage.getItem('targetRedirect');
  const userDataStr = localStorage.getItem('currentUser');
  
  // If target redirect exists, use it
  if (isAuthenticated && targetRedirect) {
    console.log("Using stored target redirect:", targetRedirect);
    window.location.href = targetRedirect;
  }
  
  // Otherwise determine from user data
  else if (isAuthenticated && userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      let dashboardUrl = '/dashboard';
      
      // Get roleId as numeric
      const roleId = typeof userData.roleId === 'string' 
        ? parseInt(userData.roleId) 
        : (typeof userData.roleId === 'number' ? userData.roleId : null);
      
      // Map roleId to dashboard
      if (roleId === 1002) dashboardUrl = '/admin/dashboard';
      else if (roleId === 1000) dashboardUrl = '/manager/dashboard';
      else if (roleId === 1001) dashboardUrl = '/client/dashboard';
      
      // Username fallback
      else if (userData.username) {
        const username = userData.username.toLowerCase();
        if (username.includes('admin')) dashboardUrl = '/admin/dashboard';
        else if (username.includes('manager')) dashboardUrl = '/manager/dashboard';
        else if (username.includes('client')) dashboardUrl = '/client/dashboard';
      }
      
      console.log("Special pattern match:", dashboardUrl);
      window.location.href = dashboardUrl;
    } catch (e) {
      console.error("Role redirect error:", e);
    }
  }
  
  // Listen for custom event from login.tsx
  window.addEventListener('aditeke-login-success', function(e) {
    if (e.detail && e.detail.redirectUrl) {
      window.location.href = e.detail.redirectUrl;
    }
  });
})();