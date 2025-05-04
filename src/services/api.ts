
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

const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to decode JWT token
function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

// Function to get user type from JWT roles
function getUserTypeFromToken(token: string): 'admin' | 'waiter' {
  const decoded = parseJwt(token);
  console.log('Decoded JWT:', decoded);
  
  if (decoded && decoded.roles) {
    if (decoded.roles.includes('ROLE_ADMIN')) {
      return 'admin';
    } else if (decoded.roles.includes('ROLE_EMPLOYEE')) {
      return 'waiter';
    }
  }
  
  // Default to waiter if we can't determine role
  return 'waiter';
}

export const api = {
  async checkInitialSetup(): Promise<SetupCheckResponse> {
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
      throw error;
    }
  },

  async createAdminAccount(adminData: AdminSetupData, logoFile: File | null): Promise<boolean> {
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
    try {
      console.log('Attempting login with credentials:', credentials);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        console.error('Login failed with status:', response.status);
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      console.log('Login response data:', data);
      
      // Get the token from the response
      const token = data.token;
      
      // Determine user type from JWT token
      const userType = getUserTypeFromToken(token);
      console.log('Extracted user type from token:', userType);
      
      // Create auth response
      const authData: AuthResponse = {
        token: token,
        userType: userType,
        username: data.username || credentials.username,
      };
      
      return authData;
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
