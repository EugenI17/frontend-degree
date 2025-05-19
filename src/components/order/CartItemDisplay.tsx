
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { CartItem } from "@/types/order"; // Updated import

interface CartItemDisplayProps {
  item: CartItem;
  index: number;
  onRemoveFromCart: (index: number) => void;
}

export const CartItemDisplay = ({ item, index, onRemoveFromCart }: CartItemDisplayProps) => {
  return (
    <div className="flex justify-between items-start border-b pb-2">
      <div>
        <h3 className="font-medium">{item.product.name}</h3>
        <p className="text-sm text-muted-foreground">{item.product.price.toFixed(2)} RON</p>
        {item.specification && (
          <p className="text-xs">Specification: {item.specification}</p>
        )}
        {item.extra && (
          <p className="text-xs">Extra: {item.extra}</p>
        )}
        {item.fara && (
          <p className="text-xs">Without: {item.fara}</p>
        )}
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onRemoveFromCart(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
