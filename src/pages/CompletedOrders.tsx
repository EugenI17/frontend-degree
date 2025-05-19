
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { orderService, Order } from '@/services/orderService';
import { menuService, MenuItem } from '@/services/menuService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { Loader, ArrowLeft } from 'lucide-react';

interface EnrichedOrderItem extends Omit<Order['orderItemDtos'][0], 'productId'> {
  productName: string;
  productId: string;
}

interface EnrichedOrder extends Omit<Order, 'orderItemDtos'> {
  orderItemDtos: EnrichedOrderItem[];
  status?: string;
  createdAt?: string; 
}

const CompletedOrders: React.FC = () => {
  const navigate = useNavigate();

  const { data: menuItems, isLoading: isLoadingMenu, error: menuError } = useQuery({
    queryKey: ['menuItems'], // Reuse menu items query
    queryFn: menuService.getMenuItems,
  });

  // Fetch all orders, filtering will happen client-side
  const { data: allOrders, isLoading: isLoadingOrders, error: ordersError } = useQuery({
    queryKey: ['completedOrdersData'], // Unique queryKey for this page's data
    queryFn: orderService.getActiveOrders, // Reusing the same fetch function
  });

  const [enrichedCompletedOrdersByTable, setEnrichedCompletedOrdersByTable] = useState<Record<string, EnrichedOrder[]>>({});

  useEffect(() => {
    if (allOrders && menuItems) {
      const productMap = new Map(menuItems.map(item => [String(item.id), item.name]));
      
      // Filter for COMPLETED orders
      const completedOrders = allOrders.filter(order => order.status === 'COMPLETED');
      
      const ordersWithProductNames = completedOrders.map(order => ({
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
        // To display orders somewhat chronologically within a table, sort by createdAt if available
        groupedByTable[order.tableNumber].push(order);
        groupedByTable[order.tableNumber].sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Most recent first
            }
            return 0;
        });
      });
      setEnrichedCompletedOrdersByTable(groupedByTable);
    }
  }, [allOrders, menuItems]);

  const getAllItemsForTable = (tableNumber: string): EnrichedOrderItem[] => {
    if (!enrichedCompletedOrdersByTable[tableNumber]) return [];
    return enrichedCompletedOrdersByTable[tableNumber].flatMap(order => order.orderItemDtos);
  };
  
  const getOrderDate = (tableNumber: string): string | null => {
    if (!enrichedCompletedOrdersByTable[tableNumber] || enrichedCompletedOrdersByTable[tableNumber].length === 0) return null;
    // Assuming all orders for a table in this view are completed around the same time, 
    // or we take the latest completed order's date for that table grouping.
    // For simplicity, taking the first one after sorting (which should be the latest if sorted by createdAt descending).
    const order = enrichedCompletedOrdersByTable[tableNumber][0];
    return order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Date N/A";
  }


  if (isLoadingMenu || isLoadingOrders) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <Loader className="animate-spin h-8 w-8 text-restaurant-primary" />
          <p className="ml-2">Loading completed orders...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (menuError || ordersError) {
    return (
      <DashboardLayout>
        <div className="text-red-500 p-4">
          Error loading data: 
          {menuError && ` Menu Error: ${menuError instanceof Error ? menuError.message : String(menuError)}`}
          {ordersError && ` Orders Error: ${ordersError instanceof Error ? ordersError.message : String(ordersError)}`}
        </div>
      </DashboardLayout>
    );
  }
  
  const tableNumbers = Object.keys(enrichedCompletedOrdersByTable).sort((a, b) => {
    // Sort tables by the latest order date within them, if possible
    const dateA = enrichedCompletedOrdersByTable[a][0]?.createdAt;
    const dateB = enrichedCompletedOrdersByTable[b][0]?.createdAt;
    if (dateA && dateB) {
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    }
    return 0;
  });


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-display font-bold text-restaurant-primary">Completed Orders</h1>
        </div>
        
        {tableNumbers.length === 0 && !isLoadingOrders ? (
          <p>No completed orders found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tableNumbers.map(tableNumber => {
              const allItemsForThisTable = getAllItemsForTable(tableNumber);
              const orderDate = getOrderDate(tableNumber);
              return (
                <Card key={tableNumber} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>Table {tableNumber}</CardTitle>
                    {orderDate && <CardDescription>Date: {orderDate}</CardDescription>}
                    <CardDescription>Status: COMPLETED</CardDescription>
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
                        <p className="text-sm text-muted-foreground">No items found for this completed order.</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                  {/* No action buttons for completed orders */}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompletedOrders;

