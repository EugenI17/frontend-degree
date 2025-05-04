
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Table, TableBody, TableCaption, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProductForm from '@/components/menu/ProductForm';
import { menuService, CreateMenuItemDto, MenuItemType, MenuItem } from '@/services/menuService';
import { Plus } from 'lucide-react';

const MenuManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MenuItemType | "ALL">("ALL");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch menu items
  const { data: menuItems = [], isLoading, error } = useQuery({
    queryKey: ['menuItems'], 
    queryFn: menuService.getMenuItems
  });

  // Create menu item mutation
  const { mutate: createMenuItem, isPending } = useMutation({
    mutationFn: menuService.createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setIsDialogOpen(false);
    },
  });

  // Filter menu items by type
  const filteredMenuItems = activeTab === "ALL" 
    ? menuItems 
    : menuItems.filter(item => item.type === activeTab);

  // Handle form submission
  const handleAddProduct = (product: CreateMenuItemDto) => {
    createMenuItem(product);
  };

  // Get badge color based on product type
  const getTypeColor = (type: MenuItemType) => {
    switch(type) {
      case "DRINK": return "bg-blue-500";
      case "STARTER": return "bg-yellow-500";
      case "MAIN": return "bg-red-500";
      case "DESSERT": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-display font-bold text-restaurant-primary">
            Menu Management
          </h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <ProductForm 
                onSubmit={handleAddProduct} 
                isSubmitting={isPending} 
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Menu Items</CardTitle>
            <CardDescription>
              Manage your restaurant's menu items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="ALL" 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as MenuItemType | "ALL")}
              className="w-full"
            >
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="ALL">All</TabsTrigger>
                <TabsTrigger value="DRINK">Drinks</TabsTrigger>
                <TabsTrigger value="STARTER">Starters</TabsTrigger>
                <TabsTrigger value="MAIN">Main</TabsTrigger>
                <TabsTrigger value="DESSERT">Desserts</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="text-center py-8">Loading menu items...</div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    Error loading menu items. Please try again.
                  </div>
                ) : filteredMenuItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No {activeTab !== "ALL" ? activeTab.toLowerCase() : ""} items found.
                  </div>
                ) : (
                  <Table>
                    <TableCaption>
                      {activeTab === "ALL" ? "All menu items" : `${activeTab} items`}
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Ingredients</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMenuItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                          </TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            {item.ingredients.length > 0 
                              ? item.ingredients.join(", ") 
                              : <span className="text-gray-400">None</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MenuManagement;
