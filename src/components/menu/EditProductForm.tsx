
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MenuItem, MenuItemType } from "@/services/menuService";

interface EditProductFormProps {
  product: MenuItem;
  onSubmit: (product: MenuItem) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

const menuItemTypes: MenuItemType[] = ["DRINK", "STARTER", "MAIN", "DESSERT"];

const EditProductForm: React.FC<EditProductFormProps> = ({ product: initialProduct, onSubmit, isSubmitting, onCancel }) => {
  const [product, setProduct] = useState<MenuItem>(initialProduct);
  const [ingredientInput, setIngredientInput] = useState("");

  const handleChange = (field: keyof MenuItem, value: string | number | string[]) => {
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
          value={product.price}
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

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default EditProductForm;
