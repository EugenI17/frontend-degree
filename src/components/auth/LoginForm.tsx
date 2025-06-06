
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { api, RestaurantInfo } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { login } = useAuth();

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      setIsLoading(true);
      try {
        // Fetch restaurant info (for name)
        const info = await api.getRestaurantInfo();
        setRestaurantInfo(info);
        
        // Fetch restaurant logo
        const logoBlob = await api.getRestaurantLogo();
        if (logoBlob) {
          const url = URL.createObjectURL(logoBlob);
          setLogoUrl(url);
        }
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRestaurantInfo();
    
    // Clean up object URL when component unmounts
    return () => {
      if (logoUrl) {
        URL.revokeObjectURL(logoUrl);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login({ username, password });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card className="auth-card">
        <CardHeader className="space-y-1 text-center">
          {isLoading ? (
            <>
              <div className="mx-auto mb-4">
                <Skeleton className="h-20 w-20 mx-auto rounded-full" />
              </div>
              <Skeleton className="h-8 w-40 mx-auto" />
            </>
          ) : (
            <>
              <div className="mx-auto mb-4">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt="Restaurant logo" 
                    className="h-20 w-auto mx-auto object-contain"
                  />
                ) : (
                  <div className="restaurant-name text-3xl">
                    {restaurantInfo?.restaurantName || "Restaurant"}
                  </div>
                )}
              </div>
              <CardTitle className="text-lg font-medium">
                {restaurantInfo?.restaurantName || "Restaurant"}
              </CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-restaurant-primary hover:bg-restaurant-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
            
            <div className="text-xs text-center text-muted-foreground pt-2">
              Powered by Tap2Serve
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
