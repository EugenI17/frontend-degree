
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AdminSetupData, api } from '@/services/api';
import { toast } from "sonner";

const SetupForm: React.FC<{ onSetupComplete: () => void }> = ({ onSetupComplete }) => {
  const [formData, setFormData] = useState<AdminSetupData>({
    username: '',
    password: '',
    restaurantName: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'image/png') {
        toast.error('Please select a PNG image for your restaurant logo');
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await api.createAdminAccount(formData, logoFile);
      if (success) {
        onSetupComplete();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <Card className="auth-card">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-display text-restaurant-primary">Welcome!</CardTitle>
          <CardDescription>Set up your restaurant account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restaurantName">Restaurant Name</Label>
              <Input
                id="restaurantName"
                name="restaurantName"
                placeholder="Enter your restaurant name"
                value={formData.restaurantName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Restaurant Logo (PNG)</Label>
              <div className="flex items-center space-x-4">
                {logoPreview ? (
                  <div className="relative w-20 h-20 rounded-md overflow-hidden">
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center">
                    <span className="text-gray-400">No logo</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png"
                    onChange={handleLogoChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">PNG format recommended</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Admin Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Create admin username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-restaurant-primary hover:bg-restaurant-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Restaurant Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupForm;
