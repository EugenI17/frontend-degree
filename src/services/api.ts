
import { toast } from "sonner";

export interface SetupCheckResponse {
  initialSetupNeeded: boolean;
}

export interface AdminSetupData {
  username: string;
  password: string;
  restaurantName: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userType: 'admin' | 'waiter';
  username: string;
}

// Use environment variable or default to development mode
const IS_DEV = import.meta.env.DEV || true;
const API_BASE_URL = 'http://localhost:8080/api';

// Mock data for development purposes
const MOCK_DATA = {
  setupCheck: { initialSetupNeeded: false },
  auth: {
    admin: {
      token: 'mock-admin-jwt-token',
      userType: 'admin' as const,
      username: 'admin'
    },
    waiter: {
      token: 'mock-waiter-jwt-token',
      userType: 'waiter' as const,
      username: 'waiter'
    }
  }
};

export const api = {
  async checkInitialSetup(): Promise<SetupCheckResponse> {
    if (IS_DEV) {
      console.log('DEV MODE: Using mock setup check');
      // Return mock data for development
      return MOCK_DATA.setupCheck;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/setup/check`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        }
      });
      if (!response.ok) {
        throw new Error('Failed to check initial setup');
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking initial setup:', error);
      toast.error('Failed to connect to server');
      return MOCK_DATA.setupCheck;
    }
  },

  async createAdminAccount(adminData: AdminSetupData, logoFile: File | null): Promise<boolean> {
    if (IS_DEV) {
      console.log('DEV MODE: Mock creating admin account', adminData);
      // Set up mock data
      MOCK_DATA.setupCheck.initialSetupNeeded = false;
      localStorage.setItem('auth_token', MOCK_DATA.auth.admin.token);
      localStorage.setItem('user_type', MOCK_DATA.auth.admin.userType);
      localStorage.setItem('username', adminData.username);
      toast.success('Restaurant account created successfully!');
      return true;
    }

    try {
      const formData = new FormData();
      formData.append('adminData', JSON.stringify(adminData));
      
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const response = await fetch(`${API_BASE_URL}/setup`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create admin account');
      }

      toast.success('Restaurant account created successfully!');
      return true;
    } catch (error) {
      console.error('Error creating admin account:', error);
      toast.error('Failed to create restaurant account');
      return false;
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse | null> {
    if (IS_DEV) {
      console.log('DEV MODE: Mock login', credentials);
      // Simple mock authentication for development
      if (credentials.username === 'admin' && credentials.password === 'admin') {
        return MOCK_DATA.auth.admin;
      } else if (credentials.username === 'waiter' && credentials.password === 'waiter') {
        return MOCK_DATA.auth.waiter;
      } else {
        toast.error('Invalid credentials. Try admin/admin or waiter/waiter');
        return null;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('Login failed. Please check your credentials.');
      return null;
    }
  },
  
  // Add an authorization header utility method
  getAuthHeader() {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};
