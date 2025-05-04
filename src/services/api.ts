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
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    console.log('Raw JWT payload:', jsonPayload);
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

// Function to get user type from JWT roles
function getUserTypeFromToken(token: string): 'admin' | 'waiter' {
  try {
    const decoded = parseJwt(token);
    console.log('Decoded JWT roles:', decoded?.roles);
    
    // Ensure we're working with valid data
    if (!decoded || !decoded.roles) {
      console.warn('No roles found in token');
      return 'waiter'; // Default fallback
    }

    // Log the actual content for debugging
    const rolesArray = Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles];
    console.log('Roles array (after normalization):', rolesArray);
    
    // Direct string comparison for absolute certainty
    for (const role of rolesArray) {
      if (role === 'ROLE_ADMIN') {
        console.log('Found exact ROLE_ADMIN match in token');
        return 'admin';
      }
    }
    
    if (rolesArray.some(role => role === 'ROLE_EMPLOYEE')) {
      console.log('Found exact ROLE_EMPLOYEE match in token');
      return 'waiter';
    }
    
    console.warn('No recognized roles found in token, defaulting to waiter');
    return 'waiter';
  } catch (error) {
    console.error('Error determining user type from token:', error);
    return 'waiter';
  }
}

export const api = {
  async checkInitialSetup(): Promise<SetupCheckResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/setup/check`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        }
      });
      
      // Check if the response is HTML (which would indicate we're not getting JSON)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        console.warn("Received HTML response instead of expected JSON. API may be unavailable.");
        // Return a mock response since we know the API isn't ready yet
        return { initialSetupNeeded: true };
      }
      
      if (!response.ok) {
        throw new Error('Failed to check initial setup');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking initial setup:', error);
      toast.error('Failed to connect to server');
      // Return a sensible default in case of error
      return { initialSetupNeeded: true };
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

      // Check if the response is HTML (which would indicate we're not getting JSON)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        console.warn("Received HTML response instead of expected JSON. Using mock data for development.");
        
        // For development purposes, create a mock successful response
        // This allows frontend development to continue even if the backend is not fully ready
        const mockToken = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX0FETUlOIl0sInN1YiI6InRlc3QiLCJpYXQiOjE3NDYzNzAwODIsImV4cCI6MTc0NjM3MDk4Mn0.j48QX0raarD0SgHFbPgKJDwb7TDAH8kucGRmY7B4Iks";
        
        console.log('Using mock token for development');
        const userType = getUserTypeFromToken(mockToken);
        
        return {
          token: mockToken,
          userType: userType,
          username: credentials.username,
        };
      }
      
      // Parse the actual JSON response
      const data = await response.json();
      console.log('Login response data:', data);
      
      // Get the token from the response
      const token = data.token;
      
      // Test with the example token provided by user
      console.log('-------------- TOKEN DEBUGGING --------------');
      const exampleToken = "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJST0xFX0FETUlOIl0sInN1YiI6InRlc3QiLCJpYXQiOjE3NDYzNzAwODIsImV4cCI6MTc0NjM3MDk4Mn0.j48QX0raarD0SgHFbPgKJDwb7TDAH8kucGRmY7B4Iks";
      console.log('Example token decode result:');
      const exampleUserType = getUserTypeFromToken(exampleToken);
      console.log('Example token user type:', exampleUserType);
      
      // Now process the actual token
      console.log('Actual token (first 20 chars):', token.substring(0, 20) + '...');
      const userType = getUserTypeFromToken(token);
      console.log('Extracted user type from actual token:', userType);
      console.log('-------------- END TOKEN DEBUGGING --------------');
      
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
