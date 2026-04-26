// Auth Context for scalable authentication management
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Vendor' | 'Customer';
  status?: 'Active' | 'Pending' | 'Suspended';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: 'Customer' | 'Vendor' | 'Admin';
    adminCode?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status with backend on app load
    checkAuthStatus().catch(console.error);
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Get user profile to verify authentication status
      // Cookies are automatically sent with the request
      const profile = await api.getMyProfile();
      setUser(profile.data || profile); // Handle different response formats
    } catch (error) {
      // User is not authenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.login(email, password);

      if (response.success && response.data) {
        const { user: userData } = response.data;

        // Tokens are automatically set in httpOnly cookies by the backend
        // No need to store them in localStorage for security
        setUser(userData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'Customer' | 'Vendor' | 'Admin';
    adminCode?: string;
  }) => {
    try {
      setLoading(true);

      let response;
      if (userData.role === 'Customer') {
        response = await api.createCustomer({
          name: userData.name,
          email: userData.email,
          password: userData.password,
        });
      } else if (userData.role === 'Vendor') {
        response = await api.createVendor({
          name: userData.name,
          email: userData.email,
          password: userData.password,
        });
      } else if (userData.role === 'Admin') {
        response = await api.createAdmin({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          adminCode: 'DEMO123', // Demo admin code for development
        });
      } else {
        throw new Error('Invalid role selected');
      }

      if (response.success) {
        // Registration successful, but user needs to login
        return;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // User state is cleared, cookies are cleared by backend
      setUser(null);
    }
  };

  const refreshToken = async () => {
    try {
      // Refresh token is sent via cookies automatically
      const response = await api.refreshToken('');
      if (!response.success) {
        throw new Error('Token refresh failed');
      }
      // New access token is set in httpOnly cookie by backend
    } catch (error) {
      // Refresh failed, logout user
      await logout();
      throw error;
    }
  };

  const hasRole = (role: string) => {
    return user?.role === role;
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
    isAuthenticated: !!user,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};