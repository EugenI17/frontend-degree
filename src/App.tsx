
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner"; // Renamed to avoid conflict
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MenuManagement from "./pages/MenuManagement";
import StaffManagement from "./pages/StaffManagement";
import NewOrder from "./pages/NewOrder";
import ActiveOrders from "./pages/ActiveOrders";
import CompletedOrders from "./pages/CompletedOrders"; // Import the new page
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <SonnerToaster duration={1500} /> {/* Changed duration from 800ms to 1500ms */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/menu" element={
              <ProtectedRoute requiredRole="admin">
                <MenuManagement />
              </ProtectedRoute>
            } />
            <Route path="/staff" element={
              <ProtectedRoute requiredRole="admin">
                <StaffManagement />
              </ProtectedRoute>
            } />
            <Route path="/new-order" element={
              <ProtectedRoute>
                <NewOrder />
              </ProtectedRoute>
            } />
            <Route path="/active-orders" element={
              <ProtectedRoute>
                <ActiveOrders />
              </ProtectedRoute>
            } />
            <Route path="/completed-orders" element={ // Add route for CompletedOrders
              <ProtectedRoute>
                <CompletedOrders />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
