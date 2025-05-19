
import { toast } from "sonner";
import { api } from "./api";
import { MenuItem } from "./menuService";

export interface OrderItem {
  productId: string; 
  extra?: string | null;
  fara?: string | null; 
  specification?: string | null;
}

export interface Order {
  id?: string; 
  tableNumber: string;
  orderItemDtos: OrderItem[];
  status?: string; 
  createdAt?: string; 
}

// New payload type for updating an order
export interface UpdateOrderPayload {
  tableNumber: string;
  orderItemDtos: OrderItem[];
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
  },

  // New function to update an order
  async updateOrder(payload: UpdateOrderPayload): Promise<boolean> {
    try {
      const response = await api.fetchWithTokenRefresh(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api/order/update`, 
        {
          method: 'POST', // As per user instruction, though typically updates are PUT/PATCH
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        toast.success("Order updated successfully");
        return true;
      } else {
        const errorText = await response.text();
        console.error("Failed to update order:", response.status, errorText);
        toast.error(`Failed to update order (${response.status})`);
        return false;
      }
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
      return false;
    }
  }
};
