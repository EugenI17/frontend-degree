import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { menuService } from "@/services/menuService";
import { orderService, OrderItem } from "@/services/orderService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, PlusCircle, Trash2, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface CartItem extends OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
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

  const handleAddToCart = (productId: string, productName: string, productPrice: number) => {
    if (!tableNumber.trim()) {
      toast.error("Please set a table number before adding items.");
      handleOpenTableNumberDialog(); // Prompt to set table number
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
        price: selectedProduct.price
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
      setTableNumber(""); 
      setTempTableNumber("");
    }
  };

  const handleCancelOrder = () => {
    setCart([]);
    setTableNumber("");
    setTempTableNumber("");
    toast.info("Order cancelled.");
    navigate('/dashboard');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">New Order</h1>
          <Button onClick={handleOpenTableNumberDialog} variant="outline">
            {tableNumber ? `Table: ${tableNumber} (Change)` : "Select Table"} 
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side - Product listing */}
          <Card className="flex-1">
            <CardContent className="pt-6">
              {!tableNumber.trim() && (
                <div className="text-center py-10 text-muted-foreground">
                  <p className="mb-2">Please select a table number to start adding products.</p>
                </div>
              )}
              
              {isLoading && !menuItems && (
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
                            onClick={() => handleAddToCart(item.id, item.name, item.price)}
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
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <p className="text-sm mb-4">Table: {tableNumber || "Not specified"}</p>
              
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
              ) : (
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
              <DialogTitle>Add Item to Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Extra</label>
                <Input 
                  placeholder="Extra ingredients or modifications" 
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Without</label>
                <Input 
                  placeholder="Items to exclude" 
                  value={fara}
                  onChange={(e) => setFara(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Special Instructions</label>
                <Textarea 
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
