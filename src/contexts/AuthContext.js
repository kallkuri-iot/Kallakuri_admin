import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';
import { TOKEN_KEY, USER_KEY } from '../services/config';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isSubAdmin, setIsSubAdmin] = useState(false);

  // Session refresh interval - refresh every 15 minutes
  const SESSION_REFRESH_INTERVAL = 15 * 60 * 1000;
  
  const refreshSession = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        const result = await authService.getProfile();
        
        if (result && result.success && result.user) {
          setUser(result.user);
          setIsAuthenticated(true);
          setIsSubAdmin(result.user.isSubAdmin || false);
          setPermissions(result.user.permissions || []);
          localStorage.setItem(USER_KEY, JSON.stringify(result.user));
          
          // Check if token is about to expire using response headers
          const expiresInHeader = result.headers?.['x-token-expires-in'];
          if (expiresInHeader && parseInt(expiresInHeader, 10) < 30 * 60) { // Less than 30 minutes
            // Trigger token refresh
            try {
              const refreshResult = await authService.refreshToken();
              if (refreshResult.success && refreshResult.token) {
                localStorage.setItem(TOKEN_KEY, refreshResult.token);
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }
          
          return true;
        } else {
          // Check specific error codes
          const errorCode = result?.code;
          if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_EXPIRING' || errorCode === 'INVALID_TOKEN') {
            handleSessionExpiration();
          }
          return false;
        }
      } catch (err) {
        console.error('Session refresh error:', err);
        // Handle specific HTTP status codes
        if (err.response?.status === 401) {
          handleSessionExpiration();
        }
        return false;
      }
    }
    return false;
  };

  const handleSessionExpiration = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setPermissions([]);
    setIsSubAdmin(false);
    setError('Your session has expired. Please log in again.');
  };

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
          setIsSubAdmin(userData.isSubAdmin || false);
          setPermissions(userData.permissions || []);
        } catch (e) {
          console.error('Error parsing stored user data:', e);
        }
      }
      
      await refreshSession();
      setLoading(false);
    };

    checkAuth();
    
    // Refresh token every 15 minutes
    const refreshInterval = setInterval(refreshSession, SESSION_REFRESH_INTERVAL);
    
    // Add visibility change listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshSession();
      }
    };
    
    // Add network status listener
    const handleOnline = () => {
      refreshSession();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.login(email, password);
      
      if (result.success) {
        const { token, user } = result;
        
        // Save token and user data
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        setIsSubAdmin(user.isSubAdmin || false);
        setPermissions(user.permissions || []);
        
        return { success: true, user };
      } else {
        setError(result.error || 'Login failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Even if logout API fails, clear local storage and state
      setUser(null);
      setIsAuthenticated(false);
      setPermissions([]);
      setIsSubAdmin(false);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  // Check if user has a specific permission
  const hasPermission = (permission) => {
    // Regular admin has all permissions
    if (user && user.role === 'Admin') return true;
    
    // For sub-admins, check their permission list
    if (isSubAdmin && permissions) {
      return permissions.includes(permission);
    }
    
    // Default for non-admin, non-subadmin users or when permissions are undefined
    return false;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    refreshSession,
    role: user?.role,
    isSubAdmin,
    permissions,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;