
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
    console.log('Parsing JWT token:', token);
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const decoded = JSON.parse(jsonPayload);
    console.log('Decoded JWT payload:', decoded);
    return decoded;
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

// Function to get user type from JWT roles
function getUserTypeFromToken(token: string): 'admin' | 'waiter' {
  try {
    const decoded = parseJwt(token);
    
    if (!decoded) {
      console.error('Failed to decode token');
      return 'waiter';
    }
    
    console.log('Looking for roles in token:', decoded);
    
    if (decoded.roles) {
      // Handle roles whether it's an array or a string
      const roles = Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles];
      console.log('Extracted roles:', roles);
      
      // Improved role detection logic - check for exact role matches
      const isAdmin = roles.some(role => 
        role === 'ROLE_ADMIN' || 
        role === 'ADMIN'
      );
      
      if (isAdmin) {
        console.log('Found admin role in token');
        return 'admin';
      }
      
      // If not admin, check for employee/waiter roles
      const isEmployee = roles.some(role => 
        role === 'ROLE_EMPLOYEE' || 
        role === 'EMPLOYEE' ||
        role === 'WAITER' ||
        role === 'ROLE_WAITER'
      );
      
      if (isEmployee) {
        console.log('Found employee/waiter role in token');
        return 'waiter';
      }
    }
    
    // More specific default role assignment based on username
    if (decoded.sub) {
      if (decoded.sub.toLowerCase().includes('admin')) {
        return 'admin';
      } else if (decoded.sub.toLowerCase().includes('emp') || 
                 decoded.sub.toLowerCase().includes('waiter')) {
        return 'waiter';
      }
    }
    
    console.warn('No recognized roles found in token, defaulting to waiter');
    return 'waiter';
  } catch (error) {
    console.error('Error determining user type from token:', error);
    return 'waiter';
  }
}

// For development and testing
function mockResponse(isDevelopment: boolean): boolean {
  return isDevelopment && (import.meta.env.DEV || process.env.NODE_ENV === 'development');
}

export const api = {
  async checkInitialSetup(): Promise<SetupCheckResponse> {
    try {
      // For development, return mock data if API is unreachable
      if (mockResponse(true)) {
        console.log('Using mock data for setup check');
        return { initialSetupNeeded: false };
      }
      
      const response = await fetch(`${API_BASE_URL}/setup/check`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check initial setup');
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Received non-JSON response from API');
        return { initialSetupNeeded: false };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking initial setup:', error);
      toast.error('Failed to connect to server');
      return { initialSetupNeeded: false };
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
      
      // For development mode, return a mock successful response
      if (mockResponse(true)) {
        console.log('DEV MODE: Using mock login response');
        
        // Use different mock tokens based on username to simulate different roles
        let mockToken;
        let userType: 'admin' | 'waiter';
        
        if (credentials.username.toLowerCase().includes('admin')) {
          // Admin token
          mockToken = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX0FETUlOIl0sInN1YiI6ImFkbWluIiwiaWF0IjoxNzQ2MzcwMDgyLCJleHAiOjE3NDYzNzA5ODJ9.j48QX0raarD0SgHFbPgKJDwb7TDAH8kucGRmY7B4Iks";
          userType = 'admin';
        } else {
          // Employee/waiter token
          mockToken = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX0VNUExPWUVFIl0sInN1YiI6IndhaXRlciIsImlhdCI6MTc0NjM3MDA4MiwiZXhwIjoxNzQ2MzcwOTgyfQ.vF9CY9XpPhVnm9ni8OyYjJSDnN4JJ8RvUYIbyYZ9eX4";
          userType = 'waiter';
        }
        
        console.log('Mock login - determined user type:', userType);
        
        return {
          token: mockToken,
          userType: userType,
          username: credentials.username
        };
      }
      
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

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('Received non-JSON response from API');
        throw new Error('Unexpected response from server');
      }

      const data = await response.json();
      console.log('Login response data:', data);
      
      // Get the token from the response
      const token = data.token;
      
      // Determine user type from JWT token
      const userType = getUserTypeFromToken(token);
      console.log('Login - determined user type from token:', userType);
      
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
