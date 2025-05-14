
import { toast } from "sonner";
import { api } from "./api";
import { MenuItem } from "./menuService";

export interface OrderItem {
  productId: string;
  extra?: string;
  fara?: string;
  specification?: string;
}

export interface Order {
  tableNumber: string;
  orderItemDtos: OrderItem[];
}

export const orderService = {
  async createOrder(order: Order): Promise<boolean> {
    try {
      const response = await api.fetchWithTokenRefresh(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/order`, 
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
  }
};
