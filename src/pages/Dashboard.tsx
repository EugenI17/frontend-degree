
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react'; // Using FileText for completed orders icon

const Dashboard: React.FC = () => {
  const { userType } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold text-restaurant-primary">
          {userType === 'admin' ? 'Admin Dashboard' : 'Order Dashboard'}
        </h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userType === 'admin' && (
            <>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Manage Menu</CardTitle>
                  <CardDescription>Add, edit or remove menu items</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Organize your Tap2Serve offerings by categories and manage prices.</p>
                  <Link 
                    to="/menu" 
                    className="text-restaurant-primary hover:underline font-medium"
                  >
                    Open Menu Management →
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Staff Management</CardTitle>
                  <CardDescription>Manage employee accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Add new employees, update credentials or deactivate accounts.</p>
                  <Link 
                    to="/staff" 
                    className="text-restaurant-primary hover:underline font-medium"
                  >
                    Open Staff Management →
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Sales Reports</CardTitle>
                  <CardDescription>View product performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">See what products perform best and analyze purchasing patterns.</p>
                  <Link 
                    to="/sales-reports" 
                    className="text-restaurant-primary hover:underline font-medium"
                  >
                    View Sales Reports →
                  </Link>
                </CardContent>
              </Card>
            </>
          )}
          
          {userType === 'employee' && (
            <>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>New Order</CardTitle>
                  <CardDescription>Create customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Create and send new orders to the kitchen or bar.</p>
                  <Link 
                    to="/new-order" 
                    className="text-restaurant-primary hover:underline font-medium"
                  >
                    Create New Order →
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Active Orders</CardTitle>
                  <CardDescription>Manage ongoing orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">View and update status of orders currently in progress.</p>
                  <Link 
                    to="/active-orders" 
                    className="text-restaurant-primary hover:underline font-medium"
                  >
                    View Active Orders →
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-restaurant-primary" />
                    <CardTitle>Completed Orders</CardTitle>
                  </div>
                  <CardDescription>View all finalized orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Review orders that have been successfully completed and paid.</p>
                  <Link 
                    to="/completed-orders" 
                    className="text-restaurant-primary hover:underline font-medium"
                  >
                    View Completed Orders →
                  </Link>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
