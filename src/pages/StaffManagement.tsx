
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { userService } from '@/services/userService';
import { ArrowLeft, UserPlus } from 'lucide-react';
import AddEmployeeForm from '@/components/staff/AddEmployeeForm';
import EmployeeList from '@/components/staff/EmployeeList';
import DeleteEmployeeDialog from '@/components/staff/DeleteEmployeeDialog';

const StaffManagement: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Delete user mutation
  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Employee deleted successfully!');
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to delete employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsDeleteDialogOpen(false);
    }
  });

  // Open delete confirmation dialog
  const openDeleteDialog = (id: number) => {
    setEmployeeToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Handle user deletion confirmation
  const confirmDelete = () => {
    if (employeeToDelete !== null) {
      deleteUser(employeeToDelete);
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
            Staff Management
          </h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <AddEmployeeForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
            <CardDescription>
              Manage your restaurant's staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeList onDeleteClick={openDeleteDialog} />
          </CardContent>
        </Card>
      </div>

      <DeleteEmployeeDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </DashboardLayout>
  );
};

export default StaffManagement;
