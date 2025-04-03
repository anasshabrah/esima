// src/context/AdminAuthContext.tsx

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin: any | null;
  login: (adminData: any, token: string) => void;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  admin: null,
  login: () => {},
  logout: () => {},
  checkAuthStatus: async () => false,
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<any | null>(null);

  const login = (adminData: any, token: string) => {
    localStorage.setItem('adminToken', token);
    setAdmin(adminData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    setIsAuthenticated(false);
    window.location.href = '/admin/signin';
  };

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setAdmin(null);
        setIsLoading(false);
        return false;
      }
      
      const response = await fetch('/api/admin/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        setIsAuthenticated(false);
        setAdmin(null);
        setIsLoading(false);
        return false;
      }
      
      const adminData = await response.json();
      
      setIsAuthenticated(true);
      setAdmin(adminData);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error checking admin authentication status:', error);
      setIsAuthenticated(false);
      setAdmin(null);
      setIsLoading(false);
      return false;
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AdminAuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isLoading, 
        admin, 
        login, 
        logout, 
        checkAuthStatus 
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
