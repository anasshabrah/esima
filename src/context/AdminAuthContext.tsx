'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  user: any | null;
  checkAdminStatus: () => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  isLoading: true,
  user: null,
  checkAdminStatus: async () => false,
  logout: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  const checkAdminStatus = async () => {
    setIsLoading(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setIsAdmin(false);
        setUser(null);
        setIsLoading(false);
        return false;
      }
      
      // Call the /api/auth/me endpoint with the token
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        setIsAdmin(false);
        setUser(null);
        setIsLoading(false);
        return false;
      }
      
      const userData = await response.json();
      
      // Check if user has admin role
      if (userData.user && userData.user.isAdmin) {
        setIsAdmin(true);
        setUser(userData.user);
        setIsLoading(false);
        return true;
      } else {
        setIsAdmin(false);
        setUser(userData.user);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setUser(null);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAdmin(false);
    setUser(null);
    window.location.href = '/signin';
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading, user, checkAdminStatus, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
