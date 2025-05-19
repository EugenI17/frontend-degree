
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MenuItem } from "@/services/menuService";
import { Loader2 } from "lucide-react";
import { ProductItemCard } from "./ProductItemCard";

interface ProductListProps {
  menuItems?: MenuItem[];
  isLoading: boolean;
  isTableSet: boolean;
  onAddToCart: (productId: string, productName: string, productPrice: number) => void;
  onSetTableNumber: () => void;
}

export const ProductList = ({
  menuItems,
  isLoading,
  isTableSet,
  onAddToCart,
  onSetTableNumber,
}: ProductListProps) => {
  return (
    <Card className="flex-1">
      <CardContent className="pt-6">
        {!isTableSet && (
          <div className="text-center py-10 text-muted-foreground">
            <p className="mb-2">Please set a table number to start adding products.</p>
            <Button onClick={onSetTableNumber}>Set Table Number</Button>
          </div>
        )}
        
        {isLoading && !menuItems && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isTableSet && menuItems && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <ProductItemCard 
                key={item.id} 
                item={item} 
                onAddToCart={onAddToCart}
                isTableSet={isTableSet}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
