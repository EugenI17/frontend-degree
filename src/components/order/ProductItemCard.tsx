
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MenuItem } from "@/services/menuService";
import { PlusCircle } from "lucide-react";

interface ProductItemCardProps {
  item: MenuItem;
  onAddToCart: (productId: string) => void; // Changed signature
  isTableSet: boolean;
}

export const ProductItemCard = ({ item, onAddToCart, isTableSet }: ProductItemCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{item.price.toFixed(2)} RON</p>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onAddToCart(item.id)} // Simplified call
            disabled={!isTableSet}
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
