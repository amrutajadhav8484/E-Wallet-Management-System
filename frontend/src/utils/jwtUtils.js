// Simple JWT decoder to extract roles from token
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const extractRoles = (token) => {
  const decoded = decodeJWT(token);
  if (decoded && decoded.roles) {
    return decoded.roles;
  }
  return [];
};

export const isAdmin = (token) => {
  const roles = extractRoles(token);
  return roles.includes('ROLE_ADMIN') || roles.includes('ADMIN');
};

// Check if JWT token is expired
export const isTokenExpired = (token) => {
  try {
    if (!token) return true;
    const decoded = decodeJWT(token);
    if (!decoded) return true;
    
    // Check if token has expiration claim (exp)
    if (decoded.exp) {
      // exp is in seconds, Date.now() is in milliseconds
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    }
    
    // If no exp claim, consider it expired for security
    return true;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't decode, consider it expired
  }
};
