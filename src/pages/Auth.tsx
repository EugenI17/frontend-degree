
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, SetupCheckResponse } from '@/services/api';
import LoginForm from '@/components/auth/LoginForm';
import SetupForm from '@/components/auth/SetupForm';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const Auth: React.FC = () => {
  const [setupStatus, setSetupStatus] = useState<SetupCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await api.checkInitialSetup();
        setSetupStatus(response);
        setApiError(false);
      } catch (error) {
        console.error('Error checking setup status:', error);
        setApiError(true);
      } finally {
        setLoading(false);
      }
    };
    
    checkSetup();
  }, []);
  
  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSetupComplete = () => {
    setSetupStatus({ initialSetupNeeded: false });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md p-6">
          <div className="mb-4 flex justify-center">
            <Skeleton className="h-12 w-40" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (apiError) {
    // API server seems to be offline or not responding correctly
    return (
      <div className="min-h-screen flex flex-col justify-center bg-background">
        <div className="py-8">
          <div className="w-full max-w-md mx-auto p-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Server Connection Issue</h2>
              <p className="text-red-600 mb-4">
                Unable to connect to the server. The backend API may be unavailable.
              </p>
              <p className="text-gray-600 mb-4">
                For development purposes, you can still login with any credentials.
              </p>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-background">
      <div className="py-8">
        {setupStatus?.initialSetupNeeded ? (
          <SetupForm onSetupComplete={handleSetupComplete} />
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
};

export default Auth;
