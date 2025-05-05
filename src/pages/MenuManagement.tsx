
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
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProductForm from '@/components/menu/ProductForm';
import EditProductForm from '@/components/menu/EditProductForm';
import { menuService, CreateMenuItemDto, MenuItemType, MenuItem } from '@/services/menuService';
import { Plus, ArrowLeft, Trash2, Pencil } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

const MenuManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MenuItemType | "ALL">("ALL");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);
  const queryClient = useQueryClient();

  // Fetch menu items
  const { data: menuItems = [], isLoading, error } = useQuery({
    queryKey: ['menuItems'], 
    queryFn: menuService.getMenuItems
  });

  // Create menu item mutation
  const { mutate: createMenuItem, isPending: isCreating } = useMutation({
    mutationFn: menuService.createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      setIsDialogOpen(false);
    },
  });

  // Update menu item mutation
  const { mutate: updateMenuItem, isPending: isUpdating } = useMutation({
    mutationFn: menuService.updateMenuItem,
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['menuItems'] });
        setEditDialogOpen(false);
        setItemToEdit(null);
      }
    },
  });

  // Delete menu item mutation
  const { mutate: deleteMenuItem, isPending: isDeleting } = useMutation({
    mutationFn: menuService.deleteMenuItem,
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      }
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
  });

  // Ensure menuItems is always an array and then filter
  const filteredMenuItems = Array.isArray(menuItems) 
    ? (activeTab === "ALL" ? menuItems : menuItems.filter(item => item.type === activeTab))
    : [];

  // Handle form submission
  const handleAddProduct = (product: CreateMenuItemDto) => {
    createMenuItem(product);
  };

  // Handle edit form submission
  const handleUpdateProduct = (product: MenuItem) => {
    updateMenuItem(product);
  };

  // Handle edit button click
  const handleEditClick = (product: MenuItem) => {
    setItemToEdit(product);
    setEditDialogOpen(true);
  };

  // Handle delete confirmation
  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMenuItem(itemToDelete);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
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
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link to="/dashboard" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        
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
                isSubmitting={isCreating} 
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
                        <TableHead className="w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMenuItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                          </TableCell>
                          <TableCell>{item.price.toFixed(2)} Lei</TableCell>
                          <TableCell>
                            {item.ingredients.length > 0 
                              ? item.ingredients.join(", ") 
                              : <span className="text-gray-400">None</span>}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditClick(item)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteClick(item.id)}
                                disabled={isDeleting && itemToDelete === item.id}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {itemToEdit && (
            <EditProductForm 
              product={itemToEdit}
              onSubmit={handleUpdateProduct}
              isSubmitting={isUpdating}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default MenuManagement;
