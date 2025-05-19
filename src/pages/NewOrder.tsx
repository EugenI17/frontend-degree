import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { menuService, MenuItem, MenuItemType } from "@/services/menuService";
import { orderService, OrderItem, UpdateOrderPayload, Order } from "@/services/orderService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, PlusCircle, Trash2, XCircle, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MultiSelectPopover } from "@/components/ui/MultiSelectPopover";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface CartItem extends OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
  };
}

const NewOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [tableNumber, setTableNumber] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [specification, setSpecification] = useState("");
  const [extra, setExtra] = useState<string[]>([]);
  const [fara, setFara] = useState<string[]>([]);
  
  const [selectedProductIngredients, setSelectedProductIngredients] = useState<string[]>([]);

  const [isTableNumberDialogOpen, setIsTableNumberDialogOpen] = useState(false);
  const [tempTableNumber, setTempTableNumber] = useState("");

  const [isUpdateMode, setIsUpdateMode] = useState(false);

  // Fetch menu items
  const { data: menuItems, isLoading: isLoadingMenu } = useQuery({ // Renamed isLoading to avoid conflict
    queryKey: ['menuItems'],
    queryFn: menuService.getMenuItems,
  });

  // Fetch active orders to check against when setting a table for a new order
  const { 
    data: activeOrders, 
    isLoading: isLoadingActiveOrders, 
    error: activeOrdersError 
  } = useQuery<Order[]>({
    queryKey: ['activeOrders'], // Using a common key, might be reused
    queryFn: orderService.getActiveOrders,
    enabled: !isUpdateMode, // Only fetch if not in update mode (i.e., for new orders)
  });

  useEffect(() => {
    if (activeOrdersError) {
      // Inform user about the error but don't necessarily block them
      toast.error("Could not verify table status. Please proceed with caution or try again later.");
      console.error("Error fetching active orders for check:", activeOrdersError);
    }
  }, [activeOrdersError]);

  useEffect(() => {
    if (location.state?.tableNumber) {
      const passedTableNumber = String(location.state.tableNumber);
      setTableNumber(passedTableNumber);
      setTempTableNumber(passedTableNumber); 
      setIsUpdateMode(true);
      setIsTableNumberDialogOpen(false); 
    } else {
      // If not in update mode and no table number is set, prompt for it.
      // This ensures the dialog opens on initial load for a new order.
      if (!tableNumber && !isUpdateMode) {
        setIsTableNumberDialogOpen(true);
      }
    }
  }, [location.state, isUpdateMode]); // Added isUpdateMode to dependencies

  // Update selected product ingredients when dialog opens or product changes
  useEffect(() => {
    if (isAddingProduct && currentProductId && menuItems) {
      const product = menuItems.find(item => item.id === currentProductId);
      if (product && Array.isArray(product.ingredients)) {
        setSelectedProductIngredients(product.ingredients);
      } else {
        setSelectedProductIngredients([]);
      }
    } else if (!isAddingProduct) {
      setSelectedProductIngredients([]); // Clear when dialog is closed
    }
  }, [isAddingProduct, currentProductId, menuItems]);

  const handleOpenTableNumberDialog = () => {
    if (isUpdateMode) {
        toast.info("Table number is fixed when adding to an existing order.");
        return;
    }
    setTempTableNumber(tableNumber); // Pre-fill with current table number if any
    setIsTableNumberDialogOpen(true);
  };

  const handleConfirmTableNumber = () => {
    if (!tempTableNumber.trim()) {
      toast.error("Please enter a valid table number.");
      return;
    }

    // Check for active orders on this table ONLY IF it's a new order
    if (!isUpdateMode && activeOrders) {
      const existingActiveOrder = activeOrders.find(
        (order) => order.tableNumber === tempTableNumber.trim() && order.status !== 'COMPLETED'
      );
      if (existingActiveOrder) {
        toast.error(`Table ${tempTableNumber.trim()} already has an active order. Please use a different table or add to the existing order from the Active Orders page.`);
        return; // Do not set table number, keep dialog open
      }
    }
    
    // If isLoadingActiveOrders and not in update mode, the button should be disabled (handled in JSX)
    // If activeOrdersError, a toast is shown, and this check might be skipped if activeOrders is null.

    setTableNumber(tempTableNumber.trim());
    setIsTableNumberDialogOpen(false);
    toast.success(`Table number set to: ${tempTableNumber.trim()}`);
  };

  const handleAddToCart = (productId: string, productName: string, productPrice: number) => {
    if (!tableNumber.trim() && !isUpdateMode) { 
      toast.error("Please set a table number before adding items.");
      handleOpenTableNumberDialog(); 
      return;
    }

    const selectedProduct = menuItems?.find(item => item.id === productId);

    if (selectedProduct && selectedProduct.type === "DRINK") {
      const newCartItem: CartItem = {
        productId: productId,
        product: {
          id: productId,
          name: productName,
          price: productPrice
        }
        // No specification, extra, or fara for drinks by default
      };
      setCart(prevCart => [...prevCart, newCartItem]);
      toast.success(`${productName} added to order`);
      return; // Skip opening the dialog for drinks
    }
    
    // For non-drinks or if product info isn't fully loaded yet (though less likely with button guards)
    setCurrentProductId(productId);
    setSpecification("");
    setExtra([]);  
    setFara([]);  
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
    if (extra.length > 0) newCartItem.extra = extra.join(', '); 
    if (fara.length > 0) newCartItem.fara = fara.join(', ');   
    
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

  const handleSubmitOrder = async () => {
    if (!tableNumber.trim()) {
      toast.error("Please ensure a table number is set.");
      if(!isUpdateMode) handleOpenTableNumberDialog();
      return;
    }

    if (cart.length === 0) {
      toast.error("Please add items to your order");
      return;
    }

    const orderItemDtos = cart.map(item => ({
        productId: item.productId,
        extra: item.extra,
        fara: item.fara,
        specification: item.specification
      }));

    let success = false;
    if (isUpdateMode) {
      const updatePayload: UpdateOrderPayload = {
        tableNumber: tableNumber.trim(),
        orderItemDtos: orderItemDtos
      };
      success = await orderService.updateOrder(updatePayload);
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['activeOrders'] });
        navigate('/active-orders');
      }
    } else {
      // Double-check for active order on the table before placing a new order,
      // in case the user managed to bypass the dialog check or data changed.
      if (activeOrders) {
        const existingActiveOrder = activeOrders.find(
          (order) => order.tableNumber === tableNumber.trim() && order.status !== 'COMPLETED'
        );
        if (existingActiveOrder) {
          toast.error(`Table ${tableNumber.trim()} already has an active order. Cannot place a new order.`);
          handleOpenTableNumberDialog(); // Re-open dialog to select different table.
          return;
        }
      }

      const orderData = {
        tableNumber: tableNumber.trim(),
        orderItemDtos: orderItemDtos,
      };
      success = await orderService.createOrder(orderData);
      if (success) {
        setCart([]);
        queryClient.invalidateQueries({ queryKey: ['activeOrders'] }); 
        // Keep table number for potential next order on same table, or clear if desired:
        // setTableNumber(""); 
        // setTempTableNumber("");
        // Optionally navigate away, e.g., to active orders or dashboard
        // navigate('/active-orders'); 
      }
    }
  };

  const handleCancelOrder = () => {
    setCart([]);
    if (!isUpdateMode) { 
        // Only reset table if it was a truly new order attempt.
        // If a table number was set and an attempt to add items was made,
        // then cancelling should probably keep the table number for a retry,
        // or navigate back to dashboard where table can be re-chosen.
        // For now, let's keep it, as user might want to try different items for the same table.
        // If they want to change table, they can click "(Change)" or back out.
        // setTableNumber("");
        // setTempTableNumber("");
    }
    toast.info(isUpdateMode ? "Changes discarded." : "Order cancelled.");
    navigate(isUpdateMode ? '/active-orders' : '/dashboard');
  };

  const orderedCategories: MenuItemType[] = useMemo(() => ["STARTER", "MAIN", "DESSERT", "DRINK"], []);

  const productsByCategory = useMemo(() => {
    if (!menuItems) return {};
    const grouped: Record<string, MenuItem[]> = {};
    orderedCategories.forEach(category => grouped[category] = []);

    menuItems.forEach(item => {
      if (orderedCategories.includes(item.type)) {
        grouped[item.type].push(item);
      }
    });
    return grouped;
  }, [menuItems, orderedCategories]);

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate(isUpdateMode ? '/active-orders' : '/dashboard')} 
              variant="outline" 
              size="icon"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <h1 className="text-2xl font-bold">{isUpdateMode ? `Add to Table ${tableNumber}` : 'New Order'}</h1>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <Card className="flex-1">
            <CardContent className="pt-6">
              {/* Table number selection UI shown only if not in update mode and no table number set
                  AND dialog is not open (to avoid redundant display) */}
              {!isUpdateMode && !tableNumber.trim() && !isTableNumberDialogOpen && (
                <div className="text-center py-10 text-muted-foreground">
                  <p className="mb-4">Please select a table number to start adding products.</p>
                  <Button onClick={handleOpenTableNumberDialog}>
                    Select Table
                  </Button>
                </div>
              )}
              
              {/* Loading state for menu items */}
              {isLoadingMenu && !menuItems && (tableNumber.trim() || isUpdateMode) && (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2">Loading menu...</p>
                </div>
              )}

              {/* Display products if table set (or update mode) and menu loaded */}
              {(tableNumber.trim() || isUpdateMode) && menuItems && productsByCategory && (
                <div className="space-y-8">
                  {orderedCategories.map(category => (
                    productsByCategory[category] && productsByCategory[category].length > 0 && (
                      <div key={category}>
                        <h2 className="text-xl font-semibold mb-3 capitalize border-b pb-2">{category.toLowerCase()}s</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {productsByCategory[category].map((item) => (
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
                                    // Disable if table not set (and not update mode)
                                    // OR if menu is still loading
                                    disabled={(!tableNumber.trim() && !isUpdateMode) || isLoadingMenu}
                                  >
                                    <PlusCircle className="h-4 w-4 mr-1" />
                                    Add
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="w-full md:w-1/3">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold">{isUpdateMode ? "Items to Add" : "Order Summary"}</h2>
                 {tableNumber && (
                    <Button 
                        onClick={handleOpenTableNumberDialog} 
                        variant="link" 
                        className="text-sm p-0 h-auto"
                        disabled={isUpdateMode || isLoadingActiveOrders} 
                    >
                        Table: {tableNumber} {isUpdateMode ? "" : (!isLoadingActiveOrders && "(Change)")}
                        {(!isUpdateMode && isLoadingActiveOrders) && <Loader2 className="ml-1 h-3 w-3 animate-spin" />}
                    </Button>
                 )}
              </div>
              
              {/* Empty cart/order display logic */}
              {(!isUpdateMode && !tableNumber && cart.length === 0 && !isTableNumberDialogOpen) && (
                 <p className="text-muted-foreground text-center py-8">Select a table to start your order.</p>
              )}

              {(tableNumber || isUpdateMode) && cart.length === 0 && (
                <p className="text-muted-foreground text-center py-8">Your cart is empty</p>
              )}
              
              {/* ... keep existing code (cart items display, total, and action buttons) */}
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
                  <span>Total for these items:</span>
                  <span>{calculateTotal().toFixed(2)} RON</span>
                </div>
                <Button 
                  className="w-full" 
                  disabled={cart.length === 0 || (!tableNumber.trim() && !isUpdateMode) || (!isUpdateMode && isLoadingActiveOrders)}
                  onClick={handleSubmitOrder}
                >
                  {isUpdateMode ? "Update Order" : "Place Order"}
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={handleCancelOrder}
                  disabled={cart.length === 0 && ((!isUpdateMode && !tableNumber.trim()))}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                   {isUpdateMode ? "Cancel Changes" : "Cancel Order"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Item Dialog */}
        <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Item to Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="extra-multiselect" className="text-sm font-medium">Extra</label>
                <MultiSelectPopover
                  options={selectedProductIngredients}
                  selectedValues={extra}
                  onValueChange={setExtra}
                  triggerPlaceholder="Select extra ingredients"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="fara-multiselect" className="text-sm font-medium">Without</label>
                 <MultiSelectPopover
                  options={selectedProductIngredients}
                  selectedValues={fara}
                  onValueChange={setFara}
                  triggerPlaceholder="Select ingredients to exclude"
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

        {/* Table Number Dialog (only shown if not updateMode) */}
        {!isUpdateMode && (
            <Dialog open={isTableNumberDialogOpen} onOpenChange={setIsTableNumberDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{tableNumber && !isTableNumberDialogOpen ? "Change Table Number" : "Set Table Number"}</DialogTitle>
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
                    <Button 
                      onClick={handleConfirmTableNumber} 
                      disabled={isLoadingActiveOrders}
                    >
                      {isLoadingActiveOrders ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NewOrder;
