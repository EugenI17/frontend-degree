
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Loader, ArrowLeft, BarChart3 } from 'lucide-react';
import { api } from '@/services/api';

interface Product {
  id: number;
  name: string;
  price: number;
  ingredients: string[];
  type: string;
}

interface ProductStatistic {
  id: number;
  product: Product;
  totalBought: number;
}

const SalesReports: React.FC = () => {
  const navigate = useNavigate();

  const { data: statistics, isLoading, error } = useQuery({
    queryKey: ['productStatistics'],
    queryFn: async (): Promise<ProductStatistic[]> => {
      const response = await api.fetchWithTokenRefresh('http://localhost:8081/api/statistics', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      
      return await response.json();
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <Loader className="animate-spin h-8 w-8 text-restaurant-primary" />
          <p className="ml-2">Loading sales statistics...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-red-500 p-4">
          Error loading statistics: {error instanceof Error ? error.message : String(error)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-restaurant-primary" />
            <h1 className="text-3xl font-display font-bold text-restaurant-primary">Sales Reports</h1>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Product Performance</CardTitle>
            <CardDescription>See which products are selling best</CardDescription>
          </CardHeader>
          <CardContent>
            {statistics && statistics.length > 0 ? (
              <div className="space-y-4">
                {statistics
                  .sort((a, b) => b.totalBought - a.totalBought)
                  .map((stat) => (
                    <div
                      key={stat.id}
                      className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-lg">{stat.product.name}</h3>
                        <p className="text-sm text-gray-600">
                          {stat.product.type} • {stat.product.price} RON
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-restaurant-primary">
                          {stat.totalBought}
                        </p>
                        <p className="text-sm text-gray-500">times bought</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No sales data available yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SalesReports;
