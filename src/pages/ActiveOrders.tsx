
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { orderService, Order } from '@/services/orderService';
import { menuService, MenuItem } from '@/services/menuService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Loader } from 'lucide-react';

interface EnrichedOrderItem extends Omit<Order['orderItemDtos'][0], 'productId'> {
  productName: string;
  productId: string;
}

interface EnrichedOrder extends Omit<Order, 'orderItemDtos'> {
  orderItemDtos: EnrichedOrderItem[];
}

const ActiveOrders: React.FC = () => {
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
          productId: String(item.productId), // Ensure productId is string for lookup
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
        <h1 className="text-3xl font-display font-bold text-restaurant-primary">Active Orders</h1>
        {tableNumbers.length === 0 ? (
          <p>No active orders at the moment.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tableNumbers.map(tableNumber => (
              <Card key={tableNumber} className="flex flex-col">
                <CardHeader>
                  <CardTitle>Table {tableNumber}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  {enrichedOrdersByTable[tableNumber].map((order, orderIndex) => (
                    <div key={order.id || `order-${orderIndex}`} className="border-t pt-2 mt-2 first:border-t-0 first:mt-0 first:pt-0">
                      <CardDescription className="font-semibold mb-1">
                        Order {orderIndex + 1} {order.status && `(${order.status})`}
                      </CardDescription>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {order.orderItemDtos.map((item, itemIndex) => (
                          <li key={`${item.productId}-${itemIndex}`}>
                            {item.productName}
                            {item.extra && <span className="text-xs text-gray-500"> (Extra: {item.extra})</span>}
                            {item.fara && <span className="text-xs text-gray-500"> (Without: {item.fara})</span>}
                            {item.specification && <span className="text-xs text-gray-500"> (Notes: {item.specification})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ActiveOrders;
