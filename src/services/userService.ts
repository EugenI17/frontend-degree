
import { api } from './api';

export interface User {
  id: number;
  username: string;
  password?: string;
  roles: string[];
}

export interface CreateUserDto {
  username: string;
  password: string;
}

export const userService = {
  async getUsers(): Promise<User[]> {
    try {
      const response = await api.fetchWithTokenRefresh('http://localhost:8081/api/user');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      const response = await api.fetchWithTokenRefresh('http://localhost:8081/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  async deleteUser(userId: number): Promise<void> {
    try {
      const response = await api.fetchWithTokenRefresh(`http://localhost:8081/api/user/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};
