
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { api, LoginCredentials } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  userType: 'admin' | 'waiter' | null;
  username: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
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
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userType, setUserType] = useState<'admin' | 'waiter' | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for existing auth token on mount
    const token = localStorage.getItem('auth_token');
    const storedUserType = localStorage.getItem('user_type') as 'admin' | 'waiter' | null;
    const storedUsername = localStorage.getItem('username');
    
    if (token && storedUserType) {
      console.log('Restoring session from localStorage. User type:', storedUserType);
      
      // Double-check user type from token to ensure consistency
      if (storedUserType === 'admin') {
        console.log('Admin user detected from localStorage');
      }
      
      setIsAuthenticated(true);
      setUserType(storedUserType);
      setUsername(storedUsername);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await api.login(credentials);
      
      if (response) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_type', response.userType);
        localStorage.setItem('username', response.username);
        
        console.log('Login successful. Setting user type:', response.userType);
        
        setIsAuthenticated(true);
        setUserType(response.userType);
        setUsername(response.username);
        
        toast.success(`Welcome back, ${response.username}! Logged in as ${response.userType}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('username');
    
    setIsAuthenticated(false);
    setUserType(null);
    setUsername(null);
    
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userType,
        username,
        login,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
