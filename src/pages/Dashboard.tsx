import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { userType } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold text-restaurant-primary">
          {userType === 'admin' ? 'Admin Dashboard' : 'Employee Dashboard'}
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
                  <p className="mb-4">Organize your TapNServe offerings by categories and manage prices.</p>
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
              
              <Card>
                <CardHeader>
                  <CardTitle>Sales Reports</CardTitle>
                  <CardDescription>View financial data</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Monitor daily, weekly and monthly sales performance.</p>
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
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
