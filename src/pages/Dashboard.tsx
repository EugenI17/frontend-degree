
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { userType } = useAuth();
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-display font-bold text-restaurant-primary">
          {userType === 'admin' ? 'Admin Dashboard' : 'Waiter Dashboard'}
        </h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userType === 'admin' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Manage Menu</CardTitle>
                  <CardDescription>Add, edit or remove menu items</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Organize your TapNServe offerings by categories and manage prices.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Staff Management</CardTitle>
                  <CardDescription>Manage waiter accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Add new waiters, update credentials or deactivate accounts.</p>
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
          
          {userType === 'waiter' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>New Order</CardTitle>
                  <CardDescription>Create customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Create and send new orders to the kitchen or bar.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Active Orders</CardTitle>
                  <CardDescription>Manage ongoing orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>View and update status of orders currently in progress.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Generate Bill</CardTitle>
                  <CardDescription>Finalize customer bills</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Create bills for completed orders and process payments.</p>
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
