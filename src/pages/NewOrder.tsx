import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { menuService, MenuItem as ProductMenuItem } from "@/services/menuService";
import { orderService, OrderItem } from "@/services/orderService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, PlusCircle, Trash2, XCircle, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CartItem extends OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
    ingredients?: string[]; // Make ingredients optional as it might not always be used or fetched for cart display
  };
}

const NewOrder = () => {
  const [tableNumber, setTableNumber] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [specification, setSpecification] = useState("");
  const [extra, setExtra] = useState("");
  const [fara, setFara] = useState("");
  
  const [isTableNumberDialogOpen, setIsTableNumberDialogOpen] = useState(false);
  const [tempTableNumber, setTempTableNumber] = useState("");
  const navigate = useNavigate();

  // Fetch menu items
  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['menuItems'],
    queryFn: menuService.getMenuItems,
  });

  const handleOpenTableNumberDialog = () => {
    setTempTableNumber(tableNumber);
    setIsTableNumberDialogOpen(true);
  };

  const handleConfirmTableNumber = () => {
    if (!tempTableNumber.trim()) {
      toast.error("Please enter a valid table number.");
      return;
    }
    setTableNumber(tempTableNumber.trim());
    setIsTableNumberDialogOpen(false);
    toast.success(`Table number set to: ${tempTableNumber.trim()}`);
  };

  const handleAddToCart = (productId: string) => {
    if (!tableNumber.trim()) {
      toast.error("Please set a table number before adding items.");
      handleOpenTableNumberDialog();
      return;
    }
    const productToAdd = menuItems?.find(item => item.id === productId);
    if (!productToAdd) {
        toast.error("Product not found.");
        return;
    }
    setCurrentProductId(productId);
    setSpecification("");
    setExtra("");
    setFara("");
    setIsAddingProduct(true);
  };

  const confirmAddToCart = () => {
    if (!currentProductId) return;
    
    const selectedProduct = menuItems?.find(item => item.id === currentProductId);
    if (!selectedProduct) return;
    
    const newCartItem: CartItem = {
      productId: currentProductId,
      product: {
        id: currentProductId,
        name: selectedProduct.name,
        price: selectedProduct.price,
        ingredients: selectedProduct.ingredients // Store ingredients if needed for display, though not strictly necessary for order creation
      }
    };
    
    if (specification.trim()) newCartItem.specification = specification.trim();
    if (extra.trim()) newCartItem.extra = extra.trim();
    if (fara.trim()) newCartItem.fara = fara.trim();
    
    setCart([...cart, newCartItem]);
    setIsAddingProduct(false);
    toast.success(`${selectedProduct.name} added to order`);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.product.price, 0);
  };

  const placeOrder = async () => {
    if (!tableNumber.trim()) {
      toast.error("Please enter a table number");
      handleOpenTableNumberDialog();
      return;
    }

    if (cart.length === 0) {
      toast.error("Please add items to your order");
      return;
    }

    const orderData = {
      tableNumber: tableNumber.trim(),
      orderItemDtos: cart.map(item => ({
        productId: item.productId,
        extra: item.extra,
        fara: item.fara,
        specification: item.specification
      }))
    };

    const success = await orderService.createOrder(orderData);
    if (success) {
      setCart([]);
      // Keep tableNumber, user might want to place another order for the same table
      // setTableNumber(""); 
      // setTempTableNumber("");
    }
  };

  const handleCancelOrder = () => {
    setCart([]);
    // Keep tableNumber as per previous behaviour or reset if desired
    // setTableNumber("");
    // setTempTableNumber("");
    toast.info("Order cancelled.");
    navigate('/dashboard'); // Navigate to main menu (dashboard)
  };

  const currentProductDetails = menuItems?.find(item => item.id === currentProductId);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/dashboard')} variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Main Menu</span>
            </Button>
            <h1 className="text-2xl font-bold">New Order</h1>
          </div>
          {/* Removed the top-right table number button */}
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side - Product listing */}
          <Card className="flex-1">
            <CardContent className="pt-6">
              {!tableNumber.trim() && (
                <div className="text-center py-10 text-muted-foreground">
                  <p className="mb-4">Please select a table number to start adding products.</p>
                  <Button onClick={handleOpenTableNumberDialog}>
                    Select Table
                  </Button>
                </div>
              )}
              
              {isLoading && !menuItems && tableNumber.trim() && (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}

              {tableNumber.trim() && menuItems && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{item.price.toFixed(2)} RON</p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAddToCart(item.id)}
                            disabled={!tableNumber.trim()}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Right side - Cart */}
          <Card className="w-full md:w-1/3">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold">Order Summary</h2>
                 {tableNumber && (
                    <Button onClick={handleOpenTableNumberDialog} variant="link" className="text-sm p-0 h-auto">
                        Table: {tableNumber} (Change)
                    </Button>
                 )}
              </div>
              
              {!tableNumber && cart.length === 0 && (
                 <p className="text-muted-foreground text-center py-8">Select a table to start your order.</p>
              )}

              {tableNumber && cart.length === 0 && (
                <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
              )}
              
              {cart.length > 0 && (
                <div className="space-y-4 mb-6">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-start border-b pb-2">
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
                        onClick={() => removeFromCart(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
                  onClick={placeOrder}
                >
                  Place Order
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={handleCancelOrder}
                  disabled={cart.length === 0 && !tableNumber.trim()}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Specification Dialog */}
        <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add {currentProductDetails?.name || 'Item'} to Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="extra-ingredient" className="text-sm font-medium">Extra</Label>
                <Select value={extra} onValueChange={setExtra}>
                  <SelectTrigger id="extra-ingredient">
                    <SelectValue placeholder="Select extra ingredient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {currentProductDetails?.ingredients?.map((ingredient) => (
                      <SelectItem key={`extra-${ingredient}`} value={ingredient}>
                        {ingredient}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fara-ingredient" className="text-sm font-medium">Without</Label>
                <Select value={fara} onValueChange={setFara}>
                  <SelectTrigger id="fara-ingredient">
                    <SelectValue placeholder="Select ingredient to exclude" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {currentProductDetails?.ingredients?.map((ingredient) => (
                      <SelectItem key={`fara-${ingredient}`} value={ingredient}>
                        {ingredient}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specification" className="text-sm font-medium">Special Instructions</Label>
                <Textarea 
                  id="specification"
                  placeholder="Any specific instructions" 
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingProduct(false)}>
                Cancel
              </Button>
              <Button onClick={confirmAddToCart}>
                Add to Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Table Number Dialog */}
        <Dialog open={isTableNumberDialogOpen} onOpenChange={setIsTableNumberDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{tableNumber ? "Change Table Number" : "Set Table Number"}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                type="text"
                placeholder="Enter Table Number"
                value={tempTableNumber}
                onChange={(e) => setTempTableNumber(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTableNumberDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmTableNumber}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default NewOrder;
