import { toast } from "sonner";
import { api } from "./api";
import { MenuItem } from "./menuService";

export interface OrderItem {
  productId: string; // Changed from number to string to match API response example
  extra?: string | null;
  fara?: string | null; // Renamed from "without" to match common usage, adjust if API expects "without"
  specification?: string | null;
}

export interface Order {
  id?: string; // Assuming orders might have an ID from the backend
  tableNumber: string;
  orderItemDtos: OrderItem[];
  status?: string; // Example: PENDING, PREPARING, READY, DELIVERED
  createdAt?: string; // Timestamp
}

export const orderService = {
  async createOrder(order: Order): Promise<boolean> {
    try {
      const response = await api.fetchWithTokenRefresh(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/order`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(order),
        }
      );

      if (response.ok) {
        toast.success("Order placed successfully");
        return true;
      } else {
        const errorText = await response.text();
        console.error("Failed to create order:", response.status, errorText);
        toast.error(`Failed to place order (${response.status})`);
        return false;
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to place order");
      return false;
    }
  },

  async getActiveOrders(): Promise<Order[]> {
    try {
      const response = await api.fetchWithTokenRefresh(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/order`, 
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Ensure data is always an array
        return Array.isArray(data) ? data : [];
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch active orders:", response.status, errorText);
        toast.error(`Failed to fetch active orders (${response.status})`);
        return [];
      }
    } catch (error) {
      console.error("Error fetching active orders:", error);
      toast.error("Failed to fetch active orders");
      return [];
    }
  }
};
