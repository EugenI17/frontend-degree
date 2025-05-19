import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { api, LoginCredentials } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  userType: 'admin' | 'employee' | null;
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
  const [userType, setUserType] = useState<'admin' | 'employee' | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUserType = localStorage.getItem('user_type') as 'admin' | 'employee' | null;
    const storedUsername = localStorage.getItem('username');
    
    if (token && storedUserType) {
      console.log('Restoring session from localStorage. User type:', storedUserType);
      setIsAuthenticated(true);
      setUserType(storedUserType);
      setUsername(storedUsername);
    }
    
    setIsLoading(false);

    // Adjust token refresh interval.
    // If access tokens expire quickly (e.g., user reports ~5 min),
    // refresh more frequently to keep the access token fresh.
    // Note: The ultimate session duration depends on the refresh token's validity,
    // which is controlled by the backend.
    const REFRESH_INTERVAL_MS = 4 * 60 * 1000; // Refresh every 4 minutes

    const refreshInterval = setInterval(() => {
      const currentToken = localStorage.getItem('auth_token');
      if (currentToken) {
        console.log(`Periodically refreshing auth token (every ${REFRESH_INTERVAL_MS / 60000} mins) to keep session alive`);
        api.refreshToken().catch(error => {
          console.error('Periodic token refresh failed:', error);
          // Note: If this periodic refresh fails, the user is not immediately logged out here.
          // Logout will typically occur when a subsequent API call fails its own refresh attempt.
        });
      }
    }, REFRESH_INTERVAL_MS);

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await api.login(credentials);
      
      if (response) {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('user_type', response.userType);
        localStorage.setItem('username', response.username);
        
        console.log('Login successful - setting user type:', response.userType);
        
        setIsAuthenticated(true);
        setUserType(response.userType);
        setUsername(response.username);
        
        toast.success(`Welcome back, ${response.username}! Logged in as ${response.userType}`);
        return true;
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
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
