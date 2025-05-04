
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
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await api.checkInitialSetup();
        setSetupStatus(response);
      } catch (error) {
        console.error('Error checking setup status:', error);
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
