
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreateMenuItemDto, MenuItemType } from "@/services/menuService";

interface ProductFormProps {
  onSubmit: (product: CreateMenuItemDto) => void;
  isSubmitting: boolean;
}

const menuItemTypes: MenuItemType[] = ["DRINK", "STARTER", "MAIN", "DESSERT"];

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, isSubmitting }) => {
  const [product, setProduct] = useState<CreateMenuItemDto>({
    name: "",
    price: 0,
    ingredients: [],
    type: "MAIN" as MenuItemType,
  });

  const [ingredientInput, setIngredientInput] = useState("");

  const handleChange = (field: keyof CreateMenuItemDto, value: string | number | string[]) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      handleChange("ingredients", [...product.ingredients, ingredientInput.trim()]);
      setIngredientInput("");
    }
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = [...product.ingredients];
    updatedIngredients.splice(index, 1);
    handleChange("ingredients", updatedIngredients);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(product);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg bg-card">
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          value={product.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="price">Price (Lei)</Label>
        <Input
          id="price"
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter price"
          value={product.price === 0 ? "" : product.price}
          onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
          required
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <Select
          value={product.type}
          onValueChange={(value) => handleChange("type", value as MenuItemType)}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {menuItemTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ingredients">Ingredients</Label>
        <div className="flex gap-2">
          <Input
            id="ingredients"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            placeholder="Add ingredient"
          />
          <Button type="button" onClick={addIngredient} variant="outline">Add</Button>
        </div>
        
        {product.ingredients.length > 0 && (
          <div className="mt-2">
            <ul className="bg-muted p-2 rounded-md">
              {product.ingredients.map((ingredient, index) => (
                <li key={index} className="flex justify-between items-center py-1">
                  <span>{ingredient}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeIngredient(index)}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Adding Product..." : "Add Product"}
      </Button>
    </form>
  );
};

export default ProductForm;
