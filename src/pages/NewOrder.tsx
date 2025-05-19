
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { menuService } from "@/services/menuService";
import { orderService } from "@/services/orderService";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { TableNumberDialog } from "@/components/order/TableNumberDialog";
import { ProductSpecificationDialog } from "@/components/order/ProductSpecificationDialog";
import { ProductList } from "@/components/order/ProductList";
import { OrderSummary } from "@/components/order/OrderSummary";
import { CartItem } from "@/types/order";

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

  const handleAddToCart = (productId: string) => { // productName and productPrice removed as they are fetched from menuItems
    if (!tableNumber.trim()) {
      toast.error("Please set a table number before adding items.");
      handleOpenTableNumberDialog();
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
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">New Order</h1>
          <Button onClick={handleOpenTableNumberDialog} variant="outline">
            {tableNumber ? `Table: ${tableNumber} (Change)` : "Set Table Number"}
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <ProductList
            menuItems={menuItems}
            isLoading={isLoading}
            isTableSet={!!tableNumber.trim()}
            onAddToCart={(productId) => handleAddToCart(productId)} // Simplified call
            onSetTableNumber={handleOpenTableNumberDialog}
          />
          <OrderSummary
            cart={cart}
            tableNumber={tableNumber}
            onRemoveFromCart={removeFromCart}
            calculateTotal={calculateTotal}
            onPlaceOrder={placeOrder}
            onCancelOrder={handleCancelOrder}
          />
        </div>

        <ProductSpecificationDialog
          isOpen={isAddingProduct}
          onOpenChange={setIsAddingProduct}
          extra={extra}
          onExtraChange={setExtra}
          fara={fara}
          onFaraChange={setFara}
          specification={specification}
          onSpecificationChange={setSpecification}
          onConfirm={confirmAddToCart}
        />

        <TableNumberDialog
          isOpen={isTableNumberDialogOpen}
          onOpenChange={setIsTableNumberDialogOpen}
          currentTableNumber={tableNumber}
          tempTableNumber={tempTableNumber}
          onTempTableNumberChange={setTempTableNumber}
          onConfirm={handleConfirmTableNumber}
        />
      </div>
    </DashboardLayout>
  );
};

export default NewOrder;
