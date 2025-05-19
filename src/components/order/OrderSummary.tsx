
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { CartItemDisplay } from "./CartItemDisplay";
import { CartItem } from "@/types/order"; // Updated import

interface OrderSummaryProps {
  cart: CartItem[];
  tableNumber: string;
  onRemoveFromCart: (index: number) => void;
  calculateTotal: () => number;
  onPlaceOrder: () => void;
  onCancelOrder: () => void;
}

export const OrderSummary = ({
  cart,
  tableNumber,
  onRemoveFromCart,
  calculateTotal,
  onPlaceOrder,
  onCancelOrder,
}: OrderSummaryProps) => {
  return (
    <Card className="w-full md:w-1/3">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <p className="text-sm mb-4">Table: {tableNumber || "Not specified"}</p>
        
        {cart.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
        ) : (
          <div className="space-y-4 mb-6">
            {cart.map((item, index) => (
              <CartItemDisplay 
                key={index}
                item={item}
                index={index}
                onRemoveFromCart={onRemoveFromCart}
              />
            ))}
          </div>
        )}
        
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>{calculateTotal().toFixed(2)} RON</span>
          </div>
          <Button 
            className="w-full" 
            disabled={cart.length === 0 || !tableNumber.trim()}
            onClick={onPlaceOrder}
          >
            Place Order
          </Button>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={onCancelOrder}
            disabled={cart.length === 0 && !tableNumber.trim()}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
