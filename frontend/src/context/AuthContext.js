import React, { createContext, useState, useEffect } from 'react';
import { isAdmin, extractRoles, decodeJWT, isTokenExpired } from '../utils/jwtUtils';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user from sessionStorage on mount (cleared when browser/tab is closed)
    const storedToken = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        // Check if token is expired
        if (isTokenExpired(storedToken)) {
          // Token is expired, clear storage
          console.log('Token expired, clearing authentication');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }

        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser({
          ...userData,
          isAdmin: isAdmin(storedToken),
          roles: extractRoles(storedToken),
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
    } else {
      // No token found, ensure clean state
      setToken(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = (tokenData, userData) => {
    const userInfo = {
      ...userData,
      isAdmin: isAdmin(tokenData),
      roles: extractRoles(tokenData),
    };
    setToken(tokenData);
    setUser(userInfo);
    sessionStorage.setItem('token', tokenData);
    sessionStorage.setItem('user', JSON.stringify(userInfo));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
