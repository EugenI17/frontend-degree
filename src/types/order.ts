
import { OrderItem } from "@/services/orderService";

export interface CartItem extends OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
  };
}
