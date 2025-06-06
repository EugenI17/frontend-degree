
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Menu, User } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    requiresAdmin: false,
  },
  {
    name: "New Order",
    href: "/new-order",
    requiresAdmin: false,
  },
  {
    name: "Menu Management",
    href: "/menu",
    requiresAdmin: true,
  },
  {
    name: "Staff Management",
    href: "/staff",
    requiresAdmin: true,
  },
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { logout, username, userType } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-restaurant-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Menu className="h-6 w-6 md:hidden" />
            <h1 className="font-bebas text-xl md:text-2xl tracking-wide">Tap2Serve</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center mr-4">
              <User className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">
                {username} ({userType})
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4">
        {children}
      </main>
      
      <footer className="bg-muted py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          Tap2Serve &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
