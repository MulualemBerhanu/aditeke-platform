/**
 * Utility functions for handling user roles and redirections
 */

// Role ID mapping - numeric IDs for roles
export const ROLE_IDS = {
  MANAGER: 1000,
  CLIENT: 1001,
  ADMIN: 1002
};

// Dashboard paths for each role
export const DASHBOARD_PATHS = {
  [ROLE_IDS.ADMIN]: '/admin/dashboard',
  [ROLE_IDS.MANAGER]: '/manager/dashboard',
  [ROLE_IDS.CLIENT]: '/client/dashboard',
  // Firebase string IDs (for compatibility)
  'YcKKrgriG70R2O9Qg4io': '/admin/dashboard', // Admin
  'S9g5SmjPkiUH5cwwQiSK': '/manager/dashboard', // Manager
  'tkIVVYpWobVjoawaozmp': '/client/dashboard', // Client
  // Default
  'default': '/dashboard'
};

/**
 * Get numeric role ID from user data
 * Handles various formats of roleId (string, number, Firebase ID)
 */
export function getNormalizedRoleId(userData: any): number | null {
  if (!userData) return null;
  
  const { roleId } = userData;
  
  // If it's already a number, return it
  if (typeof roleId === 'number') {
    return roleId;
  }
  
  // If it's a string, try to parse it as a number
  if (typeof roleId === 'string') {
    const parsedId = parseInt(roleId);
    if (!isNaN(parsedId)) {
      return parsedId;
    }
    
    // Check for known Firebase string IDs
    if (roleId === 'YcKKrgriG70R2O9Qg4io') return ROLE_IDS.ADMIN;
    if (roleId === 'S9g5SmjPkiUH5cwwQiSK') return ROLE_IDS.MANAGER;
    if (roleId === 'tkIVVYpWobVjoawaozmp') return ROLE_IDS.CLIENT;
  }
  
  // Fall back to checking username
  if (userData.username) {
    const username = userData.username.toLowerCase();
    if (username.includes('admin')) return ROLE_IDS.ADMIN;
    if (username.includes('manager')) return ROLE_IDS.MANAGER;
    if (username.includes('client')) return ROLE_IDS.CLIENT;
  }
  
  return null;
}

/**
 * Get the appropriate dashboard path for a user based on their role
 */
export function getDashboardPath(userData: any): string {
  const roleId = getNormalizedRoleId(userData);
  
  if (roleId !== null && roleId in DASHBOARD_PATHS) {
    return DASHBOARD_PATHS[roleId];
  }
  
  // If we have a string roleId that matches a Firebase ID
  if (userData?.roleId && typeof userData.roleId === 'string' && 
      userData.roleId in DASHBOARD_PATHS) {
    return DASHBOARD_PATHS[userData.roleId];
  }
  
  return DASHBOARD_PATHS.default;
}

/**
 * Perform a reliable redirection to the given URL
 * Works in both development and production environments
 */
export function performRedirect(url: string, isDeployedEnv = false): void {
  console.log("🚀 Redirecting to:", url);
  
  try {
    // Store the URL in case we need it later
    sessionStorage.setItem('pendingRedirect', url);
    
    if (isDeployedEnv) {
      console.log("💫 Using advanced redirect for deployed environment");
      
      // Use both techniques for maximum reliability
      try {
        // First try direct navigation
        window.location.href = url;
        
        // As a fallback, also try location replace (avoids history entry)
        setTimeout(() => {
          window.location.replace(url);
        }, 100);
      } catch (e) {
        console.error("Redirect failed:", e);
        // Final emergency fallback
        document.location.href = url;
      }
    } else {
      // For local development, use the simpler approach
      window.location.href = url;
    }
  } catch (error) {
    console.error("Redirection error:", error);
    // Ultimate fallback - set both session storage and local storage
    sessionStorage.setItem('failedRedirect', url);
    localStorage.setItem('fallbackRedirect', url);
    
    // Force reload the page
    window.location.reload();
  }
}