import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { orderService, Order } from '@/services/orderService';
import { menuService } from '@/services/menuService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader, ArrowLeft, PlusCircle, CheckCircle } from 'lucide-react';

interface EnrichedOrderItem extends Omit<Order['orderItemDtos'][0], 'productId'> {
  productName: string;
  productId: string;
}

interface EnrichedOrder extends Omit<Order, 'orderItemDtos'> {
  orderItemDtos: EnrichedOrderItem[];
}

const ActiveOrders: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [completingOrderTable, setCompletingOrderTable] = useState<string | null>(null);

  const { data: menuItems, isLoading: isLoadingMenu, error: menuError } = useQuery({
    queryKey: ['menuItems'],
    queryFn: menuService.getMenuItems,
  });

  const { data: activeOrders, isLoading: isLoadingOrders, error: ordersError } = useQuery({
    queryKey: ['activeOrders'],
    queryFn: orderService.getActiveOrders,
  });

  const [enrichedOrdersByTable, setEnrichedOrdersByTable] = useState<Record<string, EnrichedOrder[]>>({});

  useEffect(() => {
    if (activeOrders && menuItems) {
      const productMap = new Map(menuItems.map(item => [String(item.id), item.name]));
      
      const ordersWithProductNames = activeOrders.map(order => ({
        ...order,
        orderItemDtos: order.orderItemDtos.map(item => ({
          ...item,
          productId: String(item.productId),
          productName: productMap.get(String(item.productId)) || `Unknown Product (ID: ${item.productId})`,
        })),
      }));

      const groupedByTable: Record<string, EnrichedOrder[]> = {};
      ordersWithProductNames.forEach(order => {
        if (!groupedByTable[order.tableNumber]) {
          groupedByTable[order.tableNumber] = [];
        }
        groupedByTable[order.tableNumber].push(order);
      });
      setEnrichedOrdersByTable(groupedByTable);
    }
  }, [activeOrders, menuItems]);

  const handleAddProducts = (tableNumber: string) => {
    navigate('/new-order', { state: { tableNumber, existingOrderItems: getAllItemsForTable(tableNumber) } });
  };

  const handleCompleteOrder = async (tableNumber: string) => {
    setCompletingOrderTable(tableNumber);
    const success = await orderService.finishOrder(tableNumber);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['activeOrders'] });
    }
    setCompletingOrderTable(null);
  };

  const getAllItemsForTable = (tableNumber: string): EnrichedOrderItem[] => {
    if (!enrichedOrdersByTable[tableNumber]) return [];
    return enrichedOrdersByTable[tableNumber].flatMap(order => order.orderItemDtos);
  };

  if (isLoadingMenu || isLoadingOrders) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <Loader className="animate-spin h-8 w-8 text-restaurant-primary" />
          <p className="ml-2">Loading active orders...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (menuError || ordersError) {
    return (
      <DashboardLayout>
        <div className="text-red-500 p-4">
          Error loading data: 
          {menuError && ` Menu Error: ${menuError.message}`}
          {ordersError && ` Orders Error: ${ordersError.message}`}
        </div>
      </DashboardLayout>
    );
  }
  
  const tableNumbers = Object.keys(enrichedOrdersByTable);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold text-restaurant-primary">Active Orders</h1>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Main Menu
          </Button>
        </div>
        
        {tableNumbers.length === 0 && !isLoadingOrders ? (
          <p>No active orders at the moment.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tableNumbers.map(tableNumber => {
              const allItemsForThisTable = getAllItemsForTable(tableNumber);
              const isCompletingThisOrder = completingOrderTable === tableNumber;
              return (
                <Card key={tableNumber} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>Table {tableNumber}</CardTitle>
                    {enrichedOrdersByTable[tableNumber][0]?.status && (
                        <CardDescription>Status: {enrichedOrdersByTable[tableNumber][0].status}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2 h-48">
                    <ScrollArea className="h-full w-full pr-3">
                      {allItemsForThisTable.length > 0 ? (
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {allItemsForThisTable.map((item, itemIndex) => (
                            <li key={`${item.productId}-${itemIndex}-${tableNumber}`}>
                              {item.productName}
                              {item.extra && <span className="text-xs text-gray-500"> (Extra: {item.extra})</span>}
                              {item.fara && <span className="text-xs text-gray-500"> (Without: {item.fara})</span>}
                              {item.specification && <span className="text-xs text-gray-500"> (Notes: {item.specification})</span>}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No items for this table yet.</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                  <div className="p-4 border-t flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleAddProducts(tableNumber)}
                      disabled={isCompletingThisOrder}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Products
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleCompleteOrder(tableNumber)}
                      disabled={isCompletingThisOrder}
                    >
                      {isCompletingThisOrder ? (
                        <Loader className="animate-spin mr-2 h-4 w-4" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      {isCompletingThisOrder ? 'Completing...' : 'Complete Order'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ActiveOrders;
