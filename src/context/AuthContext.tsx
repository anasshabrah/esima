// src/context/AuthContext.tsx

'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ReferralUser } from '../types/types';

interface AuthContextProps {
  user: ReferralUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userData: ReferralUser, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<ReferralUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: ReferralUser = await response.json();
        setUser(data);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
      }
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: ReferralUser, token: string) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem('token', token);
    router.refresh();
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return React.useContext(AuthContext);
};
