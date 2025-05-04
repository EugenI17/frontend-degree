import { toast } from "sonner";
import { api } from "./api";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  ingredients: string[];
  type: MenuItemType;
}

export type MenuItemType = "DRINK" | "STARTER" | "MAIN" | "DESSERT";

export interface CreateMenuItemDto {
  name: string;
  price: number;
  ingredients: string[];
  type: MenuItemType;
}

export const menuService = {
  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const response = await api.fetchWithTokenRefresh(`${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/menu`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch menu items: ${response.status}`);
      }

      const data = await response.json();
      
      // Ensure we always return an array
      if (Array.isArray(data)) {
        return data;
      } else {
        console.error("API did not return an array for menu items", data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error("Failed to load menu items");
      return [];
    }
  },

  async createMenuItem(menuItem: CreateMenuItemDto): Promise<MenuItem | null> {
    try {
      const response = await api.fetchWithTokenRefresh(`${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/menu/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menuItem),
      });

      // Only show success message if the response is ok (status in 200-299 range)
      if (response.ok) {
        toast.success("Product added successfully");
        return null;
      } else {
        const errorText = await response.text();
        console.error("Failed to create menu item:", response.status, errorText);
        toast.error(`Failed to add product (${response.status})`);
        return null;
      }
    } catch (error) {
      console.error("Error creating menu item:", error);
      toast.error("Failed to add product");
      return null;
    }
  },

  async deleteMenuItem(id: string): Promise<boolean> {
    try {
      const response = await api.fetchWithTokenRefresh(`${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/menu/product/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success("Product deleted successfully");
        return true;
      } else {
        const errorText = await response.text();
        console.error("Failed to delete menu item:", response.status, errorText);
        toast.error(`Failed to delete product (${response.status})`);
        return false;
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error("Failed to delete product");
      return false;
    }
  }
};
